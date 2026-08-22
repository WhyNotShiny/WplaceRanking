// data.js — country lookup table, repo/CSV config, snapshot state, and
// world-bounds/CRS setup. Pure data and config, no Leaflet map object yet.
// Load first: map-core.js needs MAP_MAX_BOUNDS and PaddedCRS from here.

// ── Country mapping (ID→name+ISO, alphabetical ISO 3166-1 order) ────────
const CM={1:{n:"Afghanistan",c:"AF"},2:{n:"Albania",c:"AL"},3:{n:"Algeria",c:"DZ"},4:{n:"American Samoa",c:"AS"},5:{n:"Andorra",c:"AD"},6:{n:"Angola",c:"AO"},7:{n:"Anguilla",c:"AI"},8:{n:"Antarctica",c:"AQ"},9:{n:"Antigua & Barbuda",c:"AG"},
10:{n:"Argentina",c:"AR"},11:{n:"Armenia",c:"AM"},12:{n:"Aruba",c:"AW"},13:{n:"Australia",c:"AU"},14:{n:"Austria",c:"AT"},15:{n:"Azerbaijan",c:"AZ"},16:{n:"Bahamas",c:"BS"},17:{n:"Bahrain",c:"BH"},18:{n:"Bangladesh",c:"BD"},19:{n:"Barbados",c:"BB"},
20:{n:"Belarus",c:"BY"},21:{n:"Belgium",c:"BE"},22:{n:"Belize",c:"BZ"},23:{n:"Benin",c:"BJ"},24:{n:"Bermuda",c:"BM"},25:{n:"Bhutan",c:"BT"},26:{n:"Bolivia",c:"BO"},27:{n:"Bonaire",c:"BQ"},28:{n:"Bosnia & Herzegovina",c:"BA"},29:{n:"Botswana",c:"BW"},
30:{n:"Bouvet Island",c:"BV"},31:{n:"Brazil",c:"BR"},32:{n:"British Indian Ocean Territory",c:"IO"},33:{n:"Brunei",c:"BN"},34:{n:"Bulgaria",c:"BG"},35:{n:"Burkina Faso",c:"BF"},36:{n:"Burundi",c:"BI"},37:{n:"Cabo Verde",c:"CV"},38:{n:"Cambodia",c:"KH"},39:{n:"Cameroon",c:"CM"},
40:{n:"Canada",c:"CA"},41:{n:"Cayman Islands",c:"KY"},42:{n:"Central African Republic",c:"CF"},43:{n:"Chad",c:"TD"},44:{n:"Chile",c:"CL"},45:{n:"China",c:"CN"},46:{n:"Christmas Island",c:"CX"},47:{n:"Cocos Islands",c:"CC"},48:{n:"Colombia",c:"CO"},49:{n:"Comoros",c:"KM"},
50:{n:"Congo",c:"CG"},51:{n:"Cook Islands",c:"CK"},52:{n:"Costa Rica",c:"CR"},53:{n:"Croatia",c:"HR"},54:{n:"Cuba",c:"CU"},55:{n:"Cura\u00e7ao",c:"CW"},56:{n:"Cyprus",c:"CY"},57:{n:"Czechia",c:"CZ"},58:{n:"C\u00f4te d'Ivoire",c:"CI"},59:{n:"Denmark",c:"DK"},
60:{n:"Djibouti",c:"DJ"},61:{n:"Dominica",c:"DM"},62:{n:"Dominican Republic",c:"DO"},63:{n:"Ecuador",c:"EC"},64:{n:"Egypt",c:"EG"},65:{n:"El Salvador",c:"SV"},66:{n:"Equatorial Guinea",c:"GQ"},67:{n:"Eritrea",c:"ER"},68:{n:"Estonia",c:"EE"},69:{n:"Eswatini",c:"SZ"},
70:{n:"Ethiopia",c:"ET"},71:{n:"Falkland Islands",c:"FK"},72:{n:"Faroe Islands",c:"FO"},73:{n:"Fiji",c:"FJ"},74:{n:"Finland",c:"FI"},75:{n:"France",c:"FR"},76:{n:"French Guiana",c:"GF"},77:{n:"French Polynesia",c:"PF"},78:{n:"French Southern Territories",c:"TF"},79:{n:"Gabon",c:"GA"},
80:{n:"Gambia",c:"GM"},81:{n:"Georgia",c:"GE"},82:{n:"Germany",c:"DE"},83:{n:"Ghana",c:"GH"},84:{n:"Gibraltar",c:"GI"},85:{n:"Greece",c:"GR"},86:{n:"Greenland",c:"GL"},87:{n:"Grenada",c:"GD"},88:{n:"Guadeloupe",c:"GP"},89:{n:"Guam",c:"GU"},
90:{n:"Guatemala",c:"GT"},91:{n:"Guernsey",c:"GG"},92:{n:"Guinea",c:"GN"},93:{n:"Guinea-Bissau",c:"GW"},94:{n:"Guyana",c:"GY"},95:{n:"Haiti",c:"HT"},96:{n:"Heard & McDonald Islands",c:"HM"},97:{n:"Honduras",c:"HN"},98:{n:"Hong Kong",c:"HK"},99:{n:"Hungary",c:"HU"},
100:{n:"Iceland",c:"IS"},101:{n:"India",c:"IN"},102:{n:"Indonesia",c:"ID"},103:{n:"Iran",c:"IR"},104:{n:"Iraq",c:"IQ"},105:{n:"Ireland",c:"IE"},106:{n:"Isle of Man",c:"IM"},107:{n:"Israel",c:"IL"},108:{n:"Italy",c:"IT"},109:{n:"Jamaica",c:"JM"},
110:{n:"Japan",c:"JP"},111:{n:"Jersey",c:"JE"},112:{n:"Jordan",c:"JO"},113:{n:"Kazakhstan",c:"KZ"},114:{n:"Kenya",c:"KE"},115:{n:"Kiribati",c:"KI"},116:{n:"Kosovo",c:"XK"},117:{n:"Kuwait",c:"KW"},118:{n:"Kyrgyzstan",c:"KG"},119:{n:"Laos",c:"LA"},
120:{n:"Latvia",c:"LV"},121:{n:"Lebanon",c:"LB"},122:{n:"Lesotho",c:"LS"},123:{n:"Liberia",c:"LR"},124:{n:"Libya",c:"LY"},125:{n:"Liechtenstein",c:"LI"},126:{n:"Lithuania",c:"LT"},127:{n:"Luxembourg",c:"LU"},128:{n:"Macau",c:"MO"},129:{n:"Madagascar",c:"MG"},
130:{n:"Malawi",c:"MW"},131:{n:"Malaysia",c:"MY"},132:{n:"Maldives",c:"MV"},133:{n:"Mali",c:"ML"},134:{n:"Malta",c:"MT"},135:{n:"Marshall Islands",c:"MH"},136:{n:"Martinique",c:"MQ"},137:{n:"Mauritania",c:"MR"},138:{n:"Mauritius",c:"MU"},139:{n:"Mayotte",c:"YT"},
140:{n:"Mexico",c:"MX"},141:{n:"Micronesia",c:"FM"},142:{n:"Moldova",c:"MD"},143:{n:"Monaco",c:"MC"},144:{n:"Mongolia",c:"MN"},145:{n:"Montenegro",c:"ME"},146:{n:"Montserrat",c:"MS"},147:{n:"Morocco",c:"MA"},148:{n:"Mozambique",c:"MZ"},149:{n:"Myanmar",c:"MM"},
150:{n:"Namibia",c:"NA"},151:{n:"Nauru",c:"NR"},152:{n:"Nepal",c:"NP"},153:{n:"Netherlands",c:"NL"},154:{n:"New Caledonia",c:"NC"},155:{n:"New Zealand",c:"NZ"},156:{n:"Nicaragua",c:"NI"},157:{n:"Niger",c:"NE"},158:{n:"Nigeria",c:"NG"},159:{n:"Niue",c:"NU"},
160:{n:"Norfolk Island",c:"NF"},161:{n:"North Korea",c:"KP"},162:{n:"North Macedonia",c:"MK"},163:{n:"Northern Mariana Islands",c:"MP"},164:{n:"Norway",c:"NO"},165:{n:"Oman",c:"OM"},166:{n:"Pakistan",c:"PK"},167:{n:"Palau",c:"PW"},168:{n:"Palestine",c:"PS"},169:{n:"Panama",c:"PA"},
170:{n:"Papua New Guinea",c:"PG"},171:{n:"Paraguay",c:"PY"},172:{n:"Peru",c:"PE"},173:{n:"Philippines",c:"PH"},174:{n:"Pitcairn Islands",c:"PN"},175:{n:"Poland",c:"PL"},176:{n:"Portugal",c:"PT"},177:{n:"Puerto Rico",c:"PR"},178:{n:"Qatar",c:"QA"},179:{n:"DR Congo",c:"CD"},
180:{n:"Romania",c:"RO"},181:{n:"Russia",c:"RU"},182:{n:"Rwanda",c:"RW"},183:{n:"R\u00e9union",c:"RE"},184:{n:"Saint Barth\u00e9lemy",c:"BL"},185:{n:"Saint Helena",c:"SH"},186:{n:"Saint Kitts & Nevis",c:"KN"},187:{n:"Saint Lucia",c:"LC"},188:{n:"Saint Martin",c:"MF"},189:{n:"Saint Pierre & Miquelon",c:"PM"},
190:{n:"Saint Vincent & Grenadines",c:"VC"},191:{n:"Samoa",c:"WS"},192:{n:"San Marino",c:"SM"},193:{n:"S\u00e3o Tom\u00e9 & Pr\u00edncipe",c:"ST"},194:{n:"Saudi Arabia",c:"SA"},195:{n:"Senegal",c:"SN"},196:{n:"Serbia",c:"RS"},197:{n:"Seychelles",c:"SC"},198:{n:"Sierra Leone",c:"SL"},199:{n:"Singapore",c:"SG"},
200:{n:"Sint Maarten",c:"SX"},201:{n:"Slovakia",c:"SK"},202:{n:"Slovenia",c:"SI"},203:{n:"Solomon Islands",c:"SB"},204:{n:"Somalia",c:"SO"},205:{n:"South Africa",c:"ZA"},206:{n:"South Georgia",c:"GS"},207:{n:"South Korea",c:"KR"},208:{n:"South Sudan",c:"SS"},209:{n:"Spain",c:"ES"},
210:{n:"Sri Lanka",c:"LK"},211:{n:"Sudan",c:"SD"},212:{n:"Suriname",c:"SR"},213:{n:"Svalbard",c:"SJ"},214:{n:"Sweden",c:"SE"},215:{n:"Switzerland",c:"CH"},216:{n:"Syria",c:"SY"},217:{n:"Taiwan",c:"TW"},218:{n:"Tajikistan",c:"TJ"},219:{n:"Tanzania",c:"TZ"},
220:{n:"Thailand",c:"TH"},221:{n:"Timor-Leste",c:"TL"},222:{n:"Togo",c:"TG"},223:{n:"Tokelau",c:"TK"},224:{n:"Tonga",c:"TO"},225:{n:"Trinidad & Tobago",c:"TT"},226:{n:"Tunisia",c:"TN"},227:{n:"Turkmenistan",c:"TM"},228:{n:"Turks & Caicos Islands",c:"TC"},229:{n:"Tuvalu",c:"TV"},
230:{n:"Turkey",c:"TR"},231:{n:"Uganda",c:"UG"},232:{n:"Ukraine",c:"UA"},233:{n:"United Arab Emirates",c:"AE"},234:{n:"United Kingdom",c:"GB"},235:{n:"United States",c:"US"},236:{n:"US Minor Outlying Islands",c:"UM"},237:{n:"Uruguay",c:"UY"},238:{n:"Uzbekistan",c:"UZ"},239:{n:"Vanuatu",c:"VU"},
240:{n:"Vatican City",c:"VA"},241:{n:"Venezuela",c:"VE"},242:{n:"Vietnam",c:"VN"},243:{n:"British Virgin Islands",c:"VG"},244:{n:"US Virgin Islands",c:"VI"},245:{n:"Wallis & Futuna",c:"WF"},246:{n:"Western Sahara",c:"EH"},247:{n:"Yemen",c:"YE"},248:{n:"Zambia",c:"ZM"},249:{n:"Zimbabwe",c:"ZW"},
250:{n:"\u00c5land Islands",c:"AX"}};
function cFlag(id){const e=CM[id];if(!e)return"";return[...e.c].map(ch=>String.fromCodePoint(0x1F1E6+ch.charCodeAt(0)-65)).join("");}
function cName(id){return CM[id]?.n||"";}

// ── Repo config ── only edit these if you fork or rename ────
const REPO_OWNER  = 'WhyNotShiny';
const REPO_NAME   = 'WplaceRanking';
const REPO_BRANCH = 'main';
const REPO_DIR    = 'Leaderboard_files';   // sub-folder the CSVs actually live in
// CSV files must be named exactly:  region_leaderboard_YYYY-MM-DD.csv
const CSV_PREFIX  = 'region_leaderboard_';

// Preferred discovery source — a plain JSON array of date strings
// (e.g. ["2026-06-22","2026-06-28"]) at this path in the repo, served over
// raw.githubusercontent.com's CDN like the CSVs themselves. Unlike the
// GitHub Contents API below, this has no per-hour rate limit. Whichever
// script generates the CSVs should also write/update this file.
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${REPO_DIR}/manifest.json`;

// Individual dated CSVs (region_leaderboard_YYYY-MM-DD.csv) are immutable
// once published — a given date's file never changes again — so they're
// safe to serve through jsDelivr's real CDN (Cloudflare + Fastly edge
// network) instead of GitHub's own raw-file serving. manifest.json stays
// on raw.githubusercontent.com above deliberately: it's rewritten in
// place every week, and jsDelivr caches branch-tracked files for up to
// 12 hours, which would delay new-snapshot discovery for the one file
// where that actually matters.
const CSV_CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${REPO_BRANCH}/${REPO_DIR}`;

// Last-resort fallback — used only if BOTH the manifest above and the
// GitHub API discovery call fail (e.g. manifest not created yet, or a
// rate limit hit before it exists), so the app doesn't get stuck on
// "Fetching…" forever. Confirmed present in REPO_DIR as of this writing.
const FALLBACK_DATES = [
  '2026-06-22',
  '2026-06-28',
];

// Populated automatically on load — no manual editing needed.
let SNAPSHOTS          = [];
let usingFallbackDates = false; // true when discovery failed and FALLBACK_DATES was used instead
const snapshotCache    = new Map(); // date → parsed rows (avoids re-fetching)
let currentSnapshotIdx = 0;
let loadingSnapshotIdx = -1;        // race-condition guard

// ── World bounds — needed before map init (maxBounds) and by
// the image overlay + the inverse-projection click lookup below.
const WORLD_LAT  =  85.0511287798066;
const WORLD_LAT2 = -85.0511287798066;
const WORLD_BOUNDS_MAIN = [[WORLD_LAT2, -180], [WORLD_LAT, 180]];

// A slightly padded copy used only as the map's maxBounds — flying to an
// edge region no longer snaps back the instant the viewport pokes past the
// true world edge; it has to drift further before the pull-back kicks in.
// WORLD_BOUNDS_MAIN itself stays exact since the overlays are pinned to it.
const MAP_MAX_BOUNDS = L.latLngBounds(WORLD_BOUNDS_MAIN).pad(0.2);

// Mercator's projection clamps latitude to WORLD_LAT internally, which
// made the padded maxBounds a no-op vertically (no clamp exists for
// longitude, which is why horizontal padding worked). This CRS just
// raises that clamp so the padding has vertical room to actually use.
const PaddedMercator = L.extend({}, L.Projection.SphericalMercator, { MAX_LATITUDE: 89.9 });
const PaddedCRS = L.extend({}, L.CRS.EPSG3857, { projection: PaddedMercator });