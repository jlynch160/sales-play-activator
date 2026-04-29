const fs = require('fs');
const path = require('path');

const CSV_PATH = 'C:/Users/jlynch/OneDrive - MKT HM/Desktop/sharepoint_tags_v3.csv';
const OUT_PATH = './assets.json';
const SITE = 'https://columnit.sharepoint.com/sites/salesplayactivator';
const LIBRARY = 'Shared Documents';
// Local content directory used to read file sizes
const LOCAL_CONTENT_DIR = './content';
// SharePoint folder name -> local folder name mapping
const FOLDER_LOCAL_MAP = {
  pdfs: 'pdfs',
  blogs: 'blogs',
  'success-stories': 'success-stories',
  webinar_texts: 'webinars',
};

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

function getFileSizeMB(folder, fileName) {
  const localFolder = FOLDER_LOCAL_MAP[folder] || folder;
  const localPath = path.join(LOCAL_CONTENT_DIR, localFolder, fileName);
  try {
    const stats = fs.statSync(localPath);
    return Math.round((stats.size / (1024 * 1024)) * 100) / 100; // 2 decimals
  } catch (e) {
    return null; // file not found locally — leave size missing
  }
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
    const sizeMB = getFileSizeMB(folder, fileName);
    return {
      name: fileName,
      type: TYPE_LABELS[folder] || 'doc',
      folder,
      offerings: offerings.split(';').map((s) => s.trim()).filter(Boolean),
      sizeMB: sizeMB,
      url: spUrl(folder, fileName),
    };
  })
  .filter(Boolean);

// Stats on size capture
const withSize = assets.filter((a) => a.sizeMB !== null).length;
const totalMB = assets.reduce((sum, a) => sum + (a.sizeMB || 0), 0);
console.log(`Captured size for ${withSize}/${assets.length} files. Total library: ${totalMB.toFixed(1)} MB`);

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
