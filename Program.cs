// wplace_leaderboard_builder.cs
//
// Phase 1 — fetches player leaderboard per region (lower-bound sum, top-50).
// Phase 2 — fetches /leaderboard/region/all-time/{countryId} for every country
//           and overwrites Phase 1 values with authoritative exact totals.
//
// All API IDs are 0-based; scanner regionId is 1-based (zid = regionId - 1).

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const string USER_AGENT   = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const string REGIONS_JSON = "regions.json";   // ← path to the regions lookup file

const int  SLOT_COUNT     = 20;    // independent HTTP clients / rate-limit buckets

const int  MAX_CONCURRENCY      = 60;
const int  INITIAL_MS_PER_TOKEN = 350;
const int  MIN_MS_PER_TOKEN     = 350;
const int  MAX_MS_PER_TOKEN     = 5_000;
const int  DEFAULT_COOLDOWN_MS  = 60_000;
const int  MAX_NETWORK_RETRIES  = 4;
const int  MAX_RATE_LIMIT_HITS  = 15;
const int  PROGRESS_INTERVAL    = 20;
const int  CHECKPOINT_INTERVAL  = 200;

const string API = "https://backend.wplace.live";

// regions.json: [{"id":0,"name":"Anchorage","number":1,"countryId":235,...}, ...]
// id is 0-based (= zid). Builds "Anchorage #1" display strings + country list for Phase 2.

var regionNames   = new Dictionary<int, string>();  // 0-based id → "Name #Number"
var regionCountry = new Dictionary<int, int>();     // 0-based id → countryId (for CSV)
var allCountryIds = new SortedSet<int>();           // unique countryIds for Phase 2

if (File.Exists(REGIONS_JSON))
{
    try
    {
        using var rjDoc = JsonDocument.Parse(File.ReadAllText(REGIONS_JSON));
        foreach (var el in rjDoc.RootElement.EnumerateArray())
        {
            bool hasId = el.TryGetProperty("id", out var idProp);

            if (hasId &&
                el.TryGetProperty("name",   out var nameProp) &&
                el.TryGetProperty("number", out var numProp))
            {
                regionNames[idProp.GetInt32()] =
                    $"{nameProp.GetString()?.Trim()} #{numProp.GetInt32()}";
            }
            if (el.TryGetProperty("countryId", out var cidProp))
            {
                int cid = cidProp.GetInt32();
                allCountryIds.Add(cid);
                if (hasId) regionCountry[idProp.GetInt32()] = cid;
            }
        }
        Console.WriteLine($"  → {regionNames.Count:N0} region names loaded from {REGIONS_JSON}.");
        Console.WriteLine($"  → {allCountryIds.Count} countries found (Phase 2 will fetch all).");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[!] Failed to load {REGIONS_JSON}: {ex.Message}");
        Console.WriteLine($"    Region labels will fall back to \"#regionId\". Phase 2 will use 1–235.");
    }
}
else
{
    Console.WriteLine($"[!] {REGIONS_JSON} not found — labels fall back to \"#regionId\". Phase 2 uses 1–235.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT — load charted region IDs from the scanner's checkpoint, or enter a range
// ═══════════════════════════════════════════════════════════════════════════════

// --auto (or a redirected stdin, which is what CI runners always have) skips
// both prompts below: always sweep the full range, and always resume from
// leaderboard_checkpoint.txt if one exists — that file exists purely to
// survive a crash mid-run, so there's never a reason to ask about it.
bool auto = args.Contains("--auto") || Console.IsInputRedirected;

string? src = null;
if (!auto)
{
    Console.Write("Scanner checkpoint file (blank = full range 1–262144): ");
    src = Console.ReadLine()?.Trim();
}

List<int> allRegions;

if (!string.IsNullOrEmpty(src) && File.Exists(src))
{
    var done         = new HashSet<int>();
    var unchartedSet = new HashSet<int>();

    foreach (var raw in File.ReadAllLines(src))
    {
        var entry = raw.Trim();
        bool isU  = entry.EndsWith(":U", StringComparison.Ordinal);
        if (int.TryParse(isU ? entry[..^2] : entry, out int id))
        {
            done.Add(id);
            if (isU) unchartedSet.Add(id);
        }
    }

    allRegions = done.Except(unchartedSet).OrderBy(x => x).ToList();
    Console.WriteLine($"  → {allRegions.Count:N0} charted regions loaded from scanner checkpoint.");
}
else
{
    allRegions = Enumerable.Range(1, 262144).ToList();
    Console.WriteLine($"  → Full range: regions 1–262144.");
}

const string OWN_CKP      = "leaderboard_checkpoint.txt"; // stays at repo root — working file, not committed
const string OUTPUT_DIR   = "Leaderboard_files";          // ← CSVs + manifest.json both live here
string       snapshotDate = DateTime.UtcNow.ToString("yyyy-MM-dd");
string       OUTPUT_CSV   = Path.Combine(OUTPUT_DIR, $"region_leaderboard_{snapshotDate}.csv");
string       MANIFEST_JSON = Path.Combine(OUTPUT_DIR, "manifest.json");

Directory.CreateDirectory(OUTPUT_DIR); // no-op if it already exists

// ═══════════════════════════════════════════════════════════════════════════════
// OWN CHECKPOINT — format: "regionId|pixelCount|regionName"
// ═══════════════════════════════════════════════════════════════════════════════

var results  = new ConcurrentDictionary<int, (long pixels, string name)>();

if (File.Exists(OWN_CKP))
{
    foreach (var line in File.ReadAllLines(OWN_CKP))
    {
        var parts = line.Split('|', 3);
        if (parts.Length >= 2 &&
            int.TryParse(parts[0], out int rid) &&
            long.TryParse(parts[1], out long px))
        {
            results[rid] = (px, parts.Length == 3 ? parts[2] : "");
        }
    }

    bool resume;
    if (auto)
    {
        resume = true;
        Console.WriteLine($"[auto] Resuming from checkpoint ({results.Count:N0} already done).");
    }
    else
    {
        Console.Write($"Resume from checkpoint? ({results.Count:N0} already done) [y/n]: ");
        resume = string.Equals(Console.ReadLine()?.Trim(), "y", StringComparison.OrdinalIgnoreCase);
    }
    if (!resume) results.Clear();
}

var pending  = allRegions.Where(r => !results.ContainsKey(r)).ToList();
var newQueue = new ConcurrentQueue<(int id, long px, string name)>();
var ckpLock  = new object();

// ═══════════════════════════════════════════════════════════════════════════════
// COOKIE SLOTS
// ═══════════════════════════════════════════════════════════════════════════════

var slots = Enumerable.Range(0, SLOT_COUNT)
    .Select(i => new Slot(i, USER_AGENT, INITIAL_MS_PER_TOKEN))
    .ToArray();

var tokenCh = Channel.CreateUnbounded<int>(
    new UnboundedChannelOptions { SingleWriter = false, SingleReader = false });

var cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    cts.Cancel();
    Console.WriteLine("\n[!] Interrupted — checkpointing…");
};

foreach (var slot in slots)
{
    var s = slot;
    _ = Task.Run(async () =>
    {
        bool prevInCd = false;
        while (!cts.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Volatile.Read(ref s.MsPerToken), cts.Token);
                if (!s.Alive) break;

                bool inCd = DateTime.UtcNow.Ticks < Volatile.Read(ref s.CooldownUntilTicks);
                if (inCd) { prevInCd = true; continue; }

                if (prevInCd)
                {
                    prevInCd = false;
                    Interlocked.Exchange(ref s.RequestsSinceCooldown, 0);
                    Console.WriteLine($"\n[{s.Label} →] Cooldown lifted, resuming at {1000.0 / Volatile.Read(ref s.MsPerToken):F1} req/s.");
                }

                await tokenCh.Writer.WriteAsync(s.Id, cts.Token);
            }
            catch (OperationCanceledException) { break; }
        }
    });
}

foreach (var slot in slots)
{
    var s = slot;
    _ = Task.Run(async () =>
    {
        while (!cts.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(30_000, cts.Token);
                if (!s.Alive) break;
                if (DateTime.UtcNow.Ticks < Volatile.Read(ref s.CooldownUntilTicks)) continue;

                int cur = Volatile.Read(ref s.MsPerToken);
                if (cur <= MIN_MS_PER_TOKEN) continue;

                int rec = Math.Max(MIN_MS_PER_TOKEN, cur - Math.Max(25, cur / 10));
                if (Interlocked.CompareExchange(ref s.MsPerToken, rec, cur) == cur)
                    Console.WriteLine($"\n[{s.Label} ~] Recovery: {1000.0/cur:F1} → {1000.0/rec:F1} req/s");
            }
            catch (OperationCanceledException) { break; }
        }
    });
}

// ── Phase 2 first: exact top-50 per country, covers the busiest regions ───────
var countryList = allCountryIds.Count > 0
    ? allCountryIds.ToList()
    : Enumerable.Range(1, 235).ToList();

try { Console.Clear(); } catch { } // throws when stdout is redirected (always true in CI)
Console.WriteLine($"Slots     : {slots.Length}");
Console.WriteLine($"Pending   : {pending.Count:N0} regions  ({results.Count:N0} in checkpoint)");
Console.WriteLine($"Names     : {(regionNames.Count > 0 ? $"{regionNames.Count:N0} loaded from {REGIONS_JSON}" : $"{REGIONS_JSON} not found — falling back to #id")}");
Console.WriteLine($"Output    : {OUTPUT_CSV}");
Console.WriteLine($"Checkpoint: {OWN_CKP}");
Console.WriteLine();
Console.WriteLine($"Phase 2 — {countryList.Count} country leaderboards…");
try { Console.Title = "Phase 2 — country leaderboards"; } catch { }

int p2Done    = 0;
int p2Updated = 0;
int p2Added   = 0;

try
{
    await Parallel.ForEachAsync(
        countryList,
        new ParallelOptions { MaxDegreeOfParallelism = MAX_CONCURRENCY, CancellationToken = cts.Token },
        async (countryId, ct) =>
        {
            var rows = await Fetch<Dictionary<int, long>>(
                countryId,
                $"{API}/leaderboard/region/all-time/{countryId}",
                ParseCountryLeaderboard,
                new Dictionary<int, long>(),
                ct);

            foreach (var (zid, exactPx) in rows)
            {
                int    rid   = zid + 1;
                string label = regionNames.TryGetValue(zid, out var rn) ? rn : "";

                if (results.TryGetValue(rid, out var existing))
                {
                    string keepName = string.IsNullOrWhiteSpace(existing.name) ? label : existing.name;
                    results[rid] = (exactPx, keepName);
                    if (exactPx != existing.pixels) Interlocked.Increment(ref p2Updated);
                }
                else if (exactPx > 0)
                {
                    results.TryAdd(rid, (exactPx, label));
                    Interlocked.Increment(ref p2Added);
                }
            }

            int n = Interlocked.Increment(ref p2Done);
            if (n % 25 == 0 || n == countryList.Count)
            {
                Console.WriteLine($"  [P2 {n,3}/{countryList.Count}] {p2Updated} updated · {p2Added} new");
                try { Console.Title = $"P2 {n}/{countryList.Count} | {p2Updated} updated · {p2Added} new"; } catch { }
            }
        });
}
catch (OperationCanceledException) { }

Console.WriteLine($"Phase 2 done — {p2Updated} updated, {p2Added} new regions.");

// Flush Phase 2 to checkpoint so Phase 1 resumes skip covered regions.
{
    var allLines = results.Select(kv => $"{kv.Key}|{kv.Value.pixels}|{kv.Value.name}").ToList();
    lock (ckpLock) File.WriteAllLines(OWN_CKP, allLines);
}

// ── Phase 1: player leaderboard for regions Phase 2 didn't cover ──────────────
int pendingBeforeP2 = pending.Count;
pending = pending.Where(r => !results.ContainsKey(r)).ToList();
int p1Skipped = pendingBeforeP2 - pending.Count;

int total     = pending.Count;
int processed = 0;
var startTime = DateTime.UtcNow;

Console.WriteLine($"\nPhase 1 — {total:N0} regions ({p1Skipped:N0} skipped, already covered by Phase 2)…");
try { Console.Title = $"Phase 1 — {total:N0} regions"; } catch { }
Console.WriteLine();

try
{
    await Parallel.ForEachAsync(
        pending,
        new ParallelOptions { MaxDegreeOfParallelism = MAX_CONCURRENCY, CancellationToken = cts.Token },
        async (regionId, ct) =>
        {
            int    zid        = regionId - 1;
            string regionName = regionNames.TryGetValue(zid, out var rn) ? rn : "";

            long best = await Fetch(regionId, $"{API}/leaderboard/region/players/{zid}/all-time", SumPixels, 0L, ct);

            results[regionId] = (best, regionName);
            newQueue.Enqueue((regionId, best, regionName));

            int cur = Interlocked.Increment(ref processed);

            if (cur % PROGRESS_INTERVAL == 0)
            {
                double sec = (DateTime.UtcNow - startTime).TotalSeconds;
                double rps = sec > 0 ? cur / sec : 0;
                double eta = rps > 0 ? (total - cur) / rps : 0;
                Console.WriteLine($"[P1 {cur * 100.0 / total:F1}%] {cur:N0}/{total:N0} | {rps:F1} r/s | ETA {TimeSpan.FromSeconds(eta):hh\\:mm\\:ss}");
                try { Console.Title = $"P1 {cur*100.0/total:F1}% | {rps:F1} r/s | ETA {TimeSpan.FromSeconds(eta):hh\\:mm\\:ss}"; }
                catch { }
            }

            if (cur % CHECKPOINT_INTERVAL == 0)
                FlushCheckpoint();
        });
}
catch (OperationCanceledException) { }

FlushCheckpoint();
Console.WriteLine($"\nPhase 1 done — {results.Count:N0} total regions.");

// Final checkpoint rewrite captures Phase 1 appends cleanly.
{
    var allLines = results.Select(kv => $"{kv.Key}|{kv.Value.pixels}|{kv.Value.name}").ToList();
    lock (ckpLock) File.WriteAllLines(OWN_CKP, allLines);
}

var sorted = results
    .OrderByDescending(kv => kv.Value.pixels)
    .ToList();

var csvLines = new List<string> { "rank,regionId,name,pixels,countryId" };
csvLines.AddRange(sorted.Select((kv, i) =>
{
    string safeName  = kv.Value.name.Replace(",", " ").Replace("\"", "");
    string countryId = regionCountry.TryGetValue(kv.Key - 1, out var cid) ? cid.ToString() : "";
    return $"{i + 1},{kv.Key},{safeName},{kv.Value.pixels},{countryId}";
}));

File.WriteAllLines(OUTPUT_CSV, csvLines);

UpdateManifest(MANIFEST_JSON, snapshotDate);
Console.WriteLine($"Manifest updated → {MANIFEST_JSON}");

Console.WriteLine();
Console.WriteLine($"Done — {sorted.Count:N0} regions → {OUTPUT_CSV}");

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

void FlushCheckpoint()
{
    var buf = new List<string>();
    while (newQueue.TryDequeue(out var e))
        buf.Add($"{e.id}|{e.px}|{e.name}");
    if (buf.Count == 0) return;
    lock (ckpLock)
        File.AppendAllLines(OWN_CKP, buf);
}

async Task<T> Fetch<T>(int logId, string url, Func<string, T> parse, T fallback, CancellationToken ct)
{
    int rlHits   = 0;
    int netTries = 0;

    while (true)
    {
        int  slotId = await tokenCh.Reader.ReadAsync(ct);
        Slot s      = slots[slotId];

        if (!s.Alive) continue;

        long cdTicks = Volatile.Read(ref s.CooldownUntilTicks);
        if (DateTime.UtcNow.Ticks < cdTicks)
            await Task.Delay(new DateTime(cdTicks, DateTimeKind.Utc) - DateTime.UtcNow, ct);

        Interlocked.Increment(ref s.RequestsSinceCooldown);

        try
        {
            using var resp = await s.Http.GetAsync(url, HttpCompletionOption.ResponseContentRead, ct);

            if (resp.StatusCode == HttpStatusCode.TooManyRequests)
            {
                if (++rlHits >= MAX_RATE_LIMIT_HITS)
                {
                    Console.WriteLine($"\n[!!] #{logId}: {MAX_RATE_LIMIT_HITS}× consecutive 429 on {url} — skipping URL.");
                    return fallback;
                }

                int waitMs = resp.Headers.RetryAfter?.Delta is TimeSpan ra
                    ? Math.Max((int)ra.TotalMilliseconds, 1_000)
                    : DEFAULT_COOLDOWN_MS;

                long newCd = (DateTime.UtcNow + TimeSpan.FromMilliseconds(waitMs)).Ticks;
                long oldCd = Volatile.Read(ref s.CooldownUntilTicks);

                if (newCd > oldCd && Interlocked.CompareExchange(ref s.CooldownUntilTicks, newCd, oldCd) == oldCd)
                {
                    int burst = Interlocked.Exchange(ref s.RequestsSinceCooldown, 0);
                    int cycle = Interlocked.Increment(ref s.CooldownCount);
                    int tuned = burst > 0
                        ? Math.Clamp((int)(waitMs / (double)burst * 1.2), MIN_MS_PER_TOKEN, MAX_MS_PER_TOKEN)
                        : INITIAL_MS_PER_TOKEN;
                    Interlocked.Exchange(ref s.MsPerToken, tuned);
                    Console.WriteLine(
                        $"\n[{s.Label}!] 429 burst #{cycle} at #{logId}. " +
                        $"~{burst} reqs in window, auto-tuned → {1000.0/tuned:F1} req/s. " +
                        $"Resuming {DateTime.Now.AddMilliseconds(waitMs):HH:mm:ss}.");
                }
                continue;
            }

            rlHits = 0;

            if (resp.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.ServiceUnavailable)
            {
                s.Alive = false;
                Console.WriteLine($"\n[{s.Label}!!!] HTTP {(int)resp.StatusCode} — slot permanently disabled.");
                if (slots.All(x => !x.Alive)) { cts.Cancel(); return fallback; }
                continue;
            }

            if (!resp.IsSuccessStatusCode) return fallback;

            string body = await resp.Content.ReadAsStringAsync(ct);
            return parse(body);
        }
        catch (OperationCanceledException) when (cts.Token.IsCancellationRequested) { throw; }
        catch (Exception ex)
        {
            if (++netTries >= MAX_NETWORK_RETRIES)
            {
                Console.WriteLine($"\n[!] Gave up on {url}: {ex.GetType().Name} — {ex.Message}");
                return fallback;
            }
            await Task.Delay(Math.Min(1_000 * netTries, 8_000), CancellationToken.None);
        }
    }
}

// Sums all "pixelsPainted" values in a JSON array.
static long SumPixels(string json)
{
    if (string.IsNullOrWhiteSpace(json)) return 0;
    var t = json.Trim();
    if (t is "[]" or "null" or "") return 0;
    try
    {
        using var doc = JsonDocument.Parse(t);
        if (doc.RootElement.ValueKind != JsonValueKind.Array) return 0;
        long total = 0;
        foreach (var el in doc.RootElement.EnumerateArray())
            if (el.TryGetProperty("pixelsPainted", out var v))
                total += v.GetInt64();
        return total;
    }
    catch { return 0; }
}

// Parse the country leaderboard response (Phase 2).
// Returns a map of 0-based region id → exact pixelsPainted.
// Response format: [{"id":<0-based-regionId>,"pixelsPainted":<long>,...}, ...]
static Dictionary<int, long> ParseCountryLeaderboard(string json)
{
    var result = new Dictionary<int, long>();
    if (string.IsNullOrWhiteSpace(json)) return result;
    var t = json.Trim();
    if (t is "[]" or "null" or "") return result;
    try
    {
        using var doc = JsonDocument.Parse(t);
        if (doc.RootElement.ValueKind != JsonValueKind.Array) return result;
        foreach (var el in doc.RootElement.EnumerateArray())
            if (el.TryGetProperty("id",           out var idProp) &&
                el.TryGetProperty("pixelsPainted", out var pxProp))
                result[idProp.GetInt32()] = pxProp.GetInt64();
    }
    catch { }
    return result;
}

// Reads manifest.json (a plain JSON array of "YYYY-MM-DD" strings), adds
// today's date if not already present, and rewrites it sorted + deduped.
// SortedSet<string> with ordinal comparison sorts "YYYY-MM-DD" strings
// chronologically for free, same as the dashboard's own string sort.
static void UpdateManifest(string manifestPath, string date)
{
    var dates = new SortedSet<string>(StringComparer.Ordinal);

    if (File.Exists(manifestPath))
    {
        try
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(manifestPath));
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
                foreach (var el in doc.RootElement.EnumerateArray())
                    if (el.ValueKind == JsonValueKind.String)
                        dates.Add(el.GetString()!);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[!] Failed to parse existing {manifestPath}: {ex.Message} — starting fresh.");
        }
    }

    dates.Add(date);

    // Manual JSON write — avoids JsonSerializer.Serialize<T>, which needs
    // reflection and warns under AOT/trimming. Dates are always plain
    // "YYYY-MM-DD" strings, so no escaping is needed.
    string json = "[" + string.Join(",", dates.Select(d => $"\"{d}\"")) + "]";
    File.WriteAllText(manifestPath, json);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLOT
// ═══════════════════════════════════════════════════════════════════════════════
sealed class Slot
{
    public readonly int        Id;
    public readonly string     Label;
    public readonly HttpClient Http;
    public volatile bool       Alive = true;

    public int  MsPerToken;
    public long CooldownUntilTicks;
    public int  RequestsSinceCooldown;
    public int  CooldownCount;

    public Slot(int id, string userAgent, int initialMs)
    {
        Id         = id;
        Label      = $"S{id + 1}";
        MsPerToken = initialMs;

        var handler = new SocketsHttpHandler
        {
            PooledConnectionLifetime       = TimeSpan.FromMinutes(5),
            MaxConnectionsPerServer        = 16,
            EnableMultipleHttp2Connections = true,
        };

        Http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(20) };
        Http.DefaultRequestHeaders.Add("User-Agent",      userAgent);
        Http.DefaultRequestHeaders.Add("Accept",          "application/json");
        Http.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
    }
}