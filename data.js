/* TTB Data Dashboard: all figures verbatim from TTB published statistical releases.
   Tax collections are in THOUSANDS of dollars exactly as printed in TTB S 5630
   ("In Thousands of Dollars"). Multiply by 1,000 for dollars. */

const TAX = {
  sourceName: "TTB Statistical Release TTB S 5630, Tax Collections, final annual cumulative summaries",
  sourceUrl: "https://www.ttb.gov/taxes/tax-audit/tax-collections",
  unit: "thousands of dollars",
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  /* TOTAL TAX COLLECTIONS: excise total plus special occupational tax,
     including import excise collected by U.S. Customs and Border Protection. */
  totalTaxCollections: [25462258, 25524650, 25309067, 24205478, 23552030, 23810479, 24833859, 23969662, 22355874, 21213424, 20572545],
  /* TOTAL TTB TAX COLLECTIONS: the domestic portion TTB itself administers
     (total minus import excise collected by CBP). */
  totalTTBCollections: [22259527, 22101545, 21823417, 20552534, 19830062, 19999752, 20249744, 19565610, 18103171, 16779077, 15396821],
  importsCBP: [3202731, 3423105, 3485650, 3652944, 3721968, 3810727, 4584115, 4404052, 4252703, 4434347, 5175724],
  byCommodity: {
    distilledSpirits: [5713860, 5906425, 6031431, 6010460, 6158100, 6360585, 6891266, 7009763, 6768640, 6727264, 6773735],
    wine:             [1072767, 1123479, 1161623, 1129745, 1073310, 1058027, 1131225, 1089782, 1065161, 1001560, 1012056],
    beer:             [3580027, 3640068, 3547755, 3476725, 3382231, 3371496, 3571981, 3450726, 3278590, 3211756, 3034286],
    tobacco:          [14452889, 14103236, 13804085, 12959742, 12370871, 12353574, 12136440, 11258996, 10299261, 9378126, 8944447],
    firearms:         [638518, 749812, 761605, 620419, 567258, 665253, 1102708, 1150842, 943960, 892842, 807506]
  },
  commodityMeta: [
    { key: "distilledSpirits", label: "Distilled spirits", color: "#b3702d" },
    { key: "wine",             label: "Wine",              color: "#8e3b55" },
    { key: "beer",             label: "Beer",              color: "#dfa32b" },
    { key: "tobacco",          label: "Tobacco",           color: "#6f5844" },
    { key: "firearms",         label: "Firearms and ammunition", color: "#5b7285" }
  ]
};

const BEER = {
  sourceName: "TTB National Statistical Report, Beer (TTB S 5130), yearly open data",
  sourceUrl: "https://www.ttb.gov/regulated-commodities/beverage-alcohol/beer/statistics",
  years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  productionBarrels: [196174279, 192130392, 192879663, 192636536, 190656458, 186579540, 183793289, 180421831, 181842473, 181862204, 174810472, 165484106, 158164059, 149138279],
  taxableRemovalsBarrels: [180403067, 178091476, 177448226, 177164772, 174605112, 171113949, 167700910, 167889868, 170440148, 170131707, 162853482, 152535302, 147839727, 139219800],
  breweriesReporting: [2782, 3287, 3904, 4594, 5335, 6169, 6856, 7335, 7606, 7888, 8199, 8189, 7888, 7228],
  permitCounts: {
    sourceName: "TTB National Revenue Center, Brewery Count by State, 2010 to December 31, 2024 (registered brewery premises, continental United States)",
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    counts: [2343, 2725, 3312, 3934, 4938, 6080, 7190, 8863, 10115, 11584, 12532, 13380, 14112, 14597, 15166]
  }
};

const WINE = {
  sourceName: "TTB National Statistical Report, Wine (TTB S 5120), yearly open data",
  sourceUrl: "https://www.ttb.gov/regulated-commodities/beverage-alcohol/wine/wine-statistics",
  years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  productionGallons: [809245129, 882720615, 882042698, 815078472, 857211492, 890044037, 872020875, 854159556, 769556297, 774013245, 775199754, 770912591, 654582735, 558686431],
  taxableWithdrawalsGallons: [619667409, 649424836, 683744603, 701484678, 711336462, 708878977, 738179871, 725322265, 743031765, 714701724, 670183200, 631060938, 595405056, 554428785],
  wineriesReporting: [6498, 6847, 7271, 7580, 7920, 8297, 8370, 8779, 9028, 9414, 9664, 9703, 9449, 8785],
  permitCounts: {
    sourceName: "TTB National Revenue Center, Bonded Wine Producers by State, 1999 to March 31, 2024 (bonded wine producer premises, continental United States)",
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    counts: [8798, 9636, 10397, 10736, 11496, 12335, 13513, 14209, 15159, 15906, 16874, 17502]
  }
};

const SPIRITS = {
  sourceName: "TTB National Statistical Report, Distilled Spirits (TTB S 5110), yearly open data",
  sourceUrl: "https://www.ttb.gov/regulated-commodities/beverage-alcohol/distilled-spirits/statistics",
  years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  /* Total production is dominated by industrial and fuel alcohol; beverage context
     comes from the whisky/brandy/rum-gin-vodka lines and taxable withdrawals. */
  productionTotalProofGallons: [11344820135, 11919243667, 13223640503, 14932515296, 17278471481, 19211871182, 19985587566, 19993124739, 18864643527, 21412867854, 21723292938, 22301391118, 23703618387, 24409829331],
  productionWhiskyProofGallons: [112480760, 123123722, 136760963, 147936654, 166698053, 176938657, 209004119, 217941511, 221720631, 242205861, 278450592, 299744966, 286670768, 206917926],
  taxableWithdrawalsProofGallons: [296384059, 300455513, 317377946, 323581763, 347396568, 358667799, 414397261, 360518832, 393807538, 402832508, 401520445, 391501710, 375057071, null],
  dspsReporting: [1068, 1283, 1570, 1865, 2130, 2409, 2592, 2823, 3084, 3282, 3511, 3669, 3756, 3723],
  permitCounts: {
    sourceName: "TTB Statistical Report, Distilled Spirits Permit Counts and Average Removals by Year (TTB S DSP, data as of June 13, 2025; beverage alcohol permits active at end of calendar year)",
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    counts: [896, 1195, 1510, 1852, 2162, 2607, 2951, 3252, 3689, 4036, 4435, 4781, 5069]
  }
};

const TOBACCO = {
  sourceName: "TTB National Statistical Report, Tobacco (yearly open data), taxable removals including from Puerto Rico",
  sourceUrl: "https://www.ttb.gov/regulated-commodities/tobacco/tobacco-statistics",
  years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  cigaretteSticks: [280160143382, 266089949153, 254542044503, 259720555991, 249824743796, 239288959204, 226917393638, 213401171495, 215873208107, 203599277654, 187111570807, 170832734676, 156648590196, 134231886768],
  /* chewing, pipe, roll-your-own, and snuff tobacco combined */
  smokelessAndPipePounds: [172139281, 179715780, 175841932, 176006897, 175022549, 173639276, 166959432, 161320480, 163425828, 150140035, 141552538, 133116204, 124851358, 113093810],
  manufacturersReporting: [222, 228, 235, 230, 220, 212, 208, 197, 193, 197, 186, 175, 171, 160]
};

/* Agency-level figures from TTB Annual Reports (FY2019 to FY2023) and the
   FY 2025 TTB Annual Financial Report. TTB published no FY2024 annual report. */
const AGENCY = {
  sourceName: "TTB Annual Reports and FY 2025 TTB Annual Financial Report",
  sourceUrl: "https://www.ttb.gov/node/902851",
  fy2025: {
    authorizedIndustryMembers: "more than 132,000",
    labelApplications: "nearly 163,000",
    permitApplications: "nearly 7,200",
    employeesFTE: 502,
    budgetAuthority: "$157.8 million",
    revenuePerProgramDollar: 199
  },
  labelProcessingMedianDays2026: { malt: 3, wine: 6, spirits: 8 }
};

/* Historical federal excise rates, from TTB's Historical Tax Rates page
   (tables through 2017, page last updated March 2024) and the TTB Tax Rates
   page (calendar years 2018 to present). Each point is [decimal year a new
   rate took effect, rate]; the final point extends the current rate. Exact
   effective dates appear in the page text. Spirits use the beverage-use rate
   where the historical table lists one; general rates only (small producer
   and CBMA reduced rates are described in prose, not plotted). */
const RATES = {
  sourceName: "TTB Historical Tax Rates page and TTB Tax Rates page",
  sourceUrl: "https://www.ttb.gov/taxes/tax-audit/historical-tax-rates",
  prohibition: { start: 1920.05, end: 1933.93 },
  beer: {
    label: "Beer", unit: "per barrel", color: "#c2922a", yMax: 20,
    points: [[1910, 1.00], [1914.81, 1.50], [1917.76, 3.00], [1919.15, 6.00], [1934.03, 5.00], [1940.50, 6.00], [1942.84, 7.00], [1944.25, 8.00], [1951.84, 9.00], [1991, 18.00], [2026.5, 18.00]]
  },
  spirits: {
    label: "Distilled spirits", unit: "per proof gallon", color: "#96551b", yMax: 15,
    points: [[1910, 1.10], [1917.76, 3.20], [1919.15, 6.40], [1934.03, 2.00], [1938.50, 2.25], [1940.50, 3.00], [1941.75, 4.00], [1942.84, 6.00], [1944.25, 9.00], [1951.84, 10.50], [1985.75, 12.50], [1991, 13.50], [2026.5, 13.50]]
  },
  wine: {
    label: "Wine (still, lower tax class)", unit: "per wine gallon", color: "#71303f", yMax: 1.2,
    points: [[1916.69, 0.04], [1919.15, 0.16], [1928.49, 0.04], [1934.03, 0.10], [1936.49, 0.05], [1940.50, 0.06], [1941.75, 0.08], [1942.84, 0.10], [1944.25, 0.15], [1951.84, 0.17], [1991, 1.07], [2026.5, 1.07]]
  }
};

/* Firearms and ammunition excise tax (FAET) by fiscal quarter, thousands of
   dollars, from the same TTB S 5630 final annual releases as TAX above.
   Q1 = Oct-Dec ... Q4 = Jul-Sep. FY2020 Q3/Q4 reflect COVID-era filing
   postponements that shifted collections into the fourth quarter. */
const FAET_Q = {
  sourceName: "TTB Statistical Release TTB S 5630, Tax Collections, final annual cumulative summaries",
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  quarters: [
    [158582, 150106, 165564, 164266],
    [163028, 182689, 204702, 199393],
    [223922, 205933, 178143, 153607],
    [143794, 149634, 170281, 156710],
    [144756, 137118, 146918, 138467],
    [150346, 149480, 50346, 315080],
    [234483, 258711, 295616, 313898],
    [298371, 283027, 290614, 278831],
    [256281, 220272, 237076, 230331],
    [202142, 224720, 239146, 226834],
    [215589, 209227, 199775, 182915]
  ]
};

/* Active federal basic permits by state, aggregated from the TTB FOIA List of
   Permittees (April 2025 publication). Each state is [importers, wholesalers,
   spirits producers and bottlers, wine producers and blenders]; Puerto Rico
   counts come from the separate Puerto Rico basic permit list. Brewery
   premises are registered rather than permitted and are not in these files. */
const PERMITTEES = {
  sourceName: "TTB FOIA List of Permittees, April 2025 publication",
  sourceUrl: "https://www.ttb.gov/public-information/foia/list-of-permittees",
  asOf: "April 2025",
  typeLabels: ["Alcohol importers", "Alcohol wholesalers", "Spirits producers and bottlers", "Wine producers and blenders"],
  states: {
    AK: [31, 73, 24, 30],
    AL: [79, 144, 58, 76],
    AR: [42, 269, 23, 46],
    AZ: [309, 390, 71, 169],
    CA: [4662, 9315, 565, 6396],
    CO: [457, 792, 174, 275],
    CT: [352, 429, 43, 113],
    DC: [168, 163, 14, 11],
    DE: [150, 176, 7, 16],
    FL: [2791, 2676, 198, 212],
    GA: [461, 684, 146, 204],
    HI: [108, 134, 29, 23],
    IA: [71, 927, 55, 182],
    ID: [69, 173, 35, 125],
    IL: [856, 1139, 116, 204],
    IN: [122, 262, 121, 174],
    KS: [72, 896, 43, 86],
    KY: [150, 429, 205, 151],
    LA: [126, 194, 55, 24],
    MA: [434, 577, 102, 201],
    MD: [367, 528, 87, 216],
    ME: [55, 423, 56, 88],
    MI: [336, 471, 312, 750],
    MN: [198, 318, 84, 165],
    MO: [201, 503, 134, 360],
    MS: [31, 492, 11, 13],
    MT: [52, 128, 42, 48],
    NC: [427, 988, 185, 308],
    ND: [24, 60, 5, 30],
    NE: [30, 86, 32, 42],
    NH: [62, 82, 34, 84],
    NJ: [689, 748, 72, 104],
    NM: [66, 161, 55, 132],
    NV: [317, 409, 40, 18],
    NY: [1957, 2707, 345, 845],
    OH: [358, 581, 180, 555],
    OK: [47, 123, 24, 124],
    OR: [351, 1454, 155, 994],
    PA: [492, 1002, 323, 620],
    PR: [247, 455, 123, 32],
    RI: [98, 134, 21, 34],
    SC: [209, 911, 62, 64],
    SD: [13, 38, 19, 47],
    TN: [171, 410, 143, 128],
    TX: [1651, 2127, 326, 1010],
    UT: [54, 88, 33, 39],
    VA: [501, 713, 155, 638],
    VT: [54, 135, 53, 104],
    WA: [558, 1904, 239, 1424],
    WI: [176, 434, 123, 252],
    WV: [26, 188, 38, 46],
    WY: [44, 90, 21, 20]
  }
};
