const fs = require('fs');
const path = require('path');

const CSV_PATH = 'C:/Users/jlynch/OneDrive - MKT HM/Desktop/sharepoint_tags_v3.csv';
const OUT_PATH = './assets.json';
const SITE = 'https://columnit.sharepoint.com/sites/salesplayactivator';
const LIBRARY = 'Shared Documents';

const TYPE_LABELS = {
  pdfs: 'pdf',
  blogs: 'blog',
  'success-stories': 'case-study',
  webinar_texts: 'webinar',
};

function spUrl(folder, fileName) {
  const encodedFolder = encodeURIComponent(folder);
  const encodedFile = encodeURIComponent(fileName);
  return `${SITE}/${encodeURIComponent(LIBRARY)}/${encodedFolder}/${encodedFile}`;
}

const csv = fs.readFileSync(CSV_PATH, 'utf8');
const lines = csv.split(/\r?\n/).filter(Boolean);
const header = lines.shift();

const assets = lines
  .map((line) => {
    const parts = line.split(',');
    if (parts.length < 3) return null;
    const fileName = parts[0].trim();
    const folder = parts[1].trim();
    const offerings = (parts[2] || '').trim();
    if (!offerings) return null;
    return {
      name: fileName,
      type: TYPE_LABELS[folder] || 'doc',
      folder,
      offerings: offerings.split(';').map((s) => s.trim()).filter(Boolean),
      url: spUrl(folder, fileName),
    };
  })
  .filter(Boolean);

const out = {
  generated: new Date().toISOString(),
  source: 'sharepoint:salesplayactivator',
  count: assets.length,
  assets,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
console.log(`Wrote ${assets.length} assets to ${OUT_PATH}`);

const byOffering = {};
assets.forEach((a) => {
  a.offerings.forEach((o) => {
    byOffering[o] = (byOffering[o] || 0) + 1;
  });
});
console.log('\nAssets per offering:');
Object.keys(byOffering).sort().forEach((o) => {
  console.log(`  ${o.padEnd(20)} ${byOffering[o]}`);
});
