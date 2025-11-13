// scrape.js
const fs = require('fs');
const fetch = require('node-fetch');

const CLUBS = [
  { name: "Luleå HF",        slug: "luleahockey" },
  { name: "Brynäs IF",       slug: "brynas" },
  { name: "Djurgårdens IF",  slug: "difhockey" },
  { name: "Färjestad BK",    slug: "farjestadbk" },
  { name: "Frölunda HC",     slug: "frolundahockey" },
  { name: "HV 71",           slug: "hv71" },
  { name: "Leksands IF",     slug: "leksandsif" },
  { name: "Linköping HC",    slug: "lhc" },
  { name: "IF Malmö Redhawks", slug: "malmoredhawks" },
  { name: "Örebro HK",       slug: "orebrohockey" },
  { name: "Rögle BK",        slug: "roglebk" },
  { name: "Skellefteå AIK",  slug: "skellefteaaik" },
  { name: "Timrå IK",        slug: "timraik" },
  { name: "Växjö Lakers HC", slug: "vaxjolakers" }
];

async function getAmountFromHTML(html) {
  const match = html.match(/Aktuell vinstsumma\s*([\d\s]+) ?kr/i);
  if (match) {
    return parseInt(match[1].replace(/\s+/g, ''));
  }
  return null;
}

async function fetchClubData(club) {
  const url = `https://clubs.clubmate.se/${club.slug}/`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const amount = await getAmountFromHTML(html);
    return {
      club: club.name,
      amount,
      currency: "SEK",
      url,
      fetched_at: new Date().toISOString(),
      debug: {
        strategy: "regex-match",
        raw: html.match(/Aktuell vinstsumma.*?kr/i)?.[0] || "(not found)"
      }
    };
  } catch (error) {
    return {
      club: club.name,
      amount: null,
      currency: "SEK",
      url,
      fetched_at: new Date().toISOString(),
      error: error.message
    };
  }
}

async function run() {
  const results = await Promise.all(CLUBS.map(fetchClubData));
  fs.writeFileSync("data.json", JSON.stringify(results, null, 2));
}

run();