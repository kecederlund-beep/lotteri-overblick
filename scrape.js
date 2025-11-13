import fs from 'fs';
import fetch from 'node-fetch';

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

async function extractAmount(html) {
  // Matchar t.ex. "Aktuell vinstsumma 12 345 kr"
  const match = html.match(/Aktuell vinstsumma\s*([\d\s]+) ?kr/i);
  if (match) {
    const cleaned = match[1].replace(/\s+/g, '');
    return parseInt(cleaned, 10);
  }
  return null;
}

async function fetchClub(club) {
  const url = `https://clubs.clubmate.se/${club.slug}/`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const amount = await extractAmount(html);

    return {
      club: club.name,
      amount: amount ?? null,
      currency: "SEK",
      url,
      fetched_at: new Date().toISOString(),
      debug: {
        strategy: "regex",
        raw: html.match(/Aktuell vinstsumma.*?kr/i)?.[0] || "(not found)"
      }
    };
  } catch (err) {
    return {
      club: club.name,
      amount: null,
      currency: "SEK",
      url,
      fetched_at: new Date().toISOString(),
      error: err.message
    };
  }
}

async function run() {
  const all = await Promise.all(CLUBS.map(fetchClub));
  fs.writeFileSync("data.json", JSON.stringify(all, null, 2));
}

run();
