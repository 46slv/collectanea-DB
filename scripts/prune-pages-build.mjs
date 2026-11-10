import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.resolve(process.argv[2] ?? 'build');
const reportPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const captureRoot = path.join(buildDir, 'img', 'fusion', 'captures');
const entryPoint = path.join(buildDir, 'index.html');

if (!fs.existsSync(entryPoint) || !fs.existsSync(captureRoot)) {
  console.error(`Refusing to prune: expected Docusaurus build at ${buildDir}`);
  process.exit(2);
}

const walk = (root) => {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
};

const files = walk(buildDir);
const totalBefore = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const textExtensions = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt']);
const textFiles = files.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));

const referencedScreens = new Set();
const referencedSourceImages = new Set();
const absolutePattern = /(?<![A-Za-z0-9._-])(?:https?:\/\/[^\/"'\s]+)?(?:\/collectanea-DB)?\/img\/fusion\/captures\/([^?#"'\x60<>\s]+\/screen\.png)/g;
const relativePattern = /(?<![A-Za-z0-9._\/-])img\/fusion\/captures\/([^?#"'\x60<>\s]+\/screen\.png)/g;
const absoluteSourcePattern = /(?<![A-Za-z0-9._-])(?:https?:\/\/[^\/"'\s]+)?(?:\/collectanea-DB)?\/img\/fusion\/captures\/([^?#"'\x60<>\s]+\/[^\/?#"'\x60<>\s]+-source\.png)/g;
const relativeSourcePattern = /(?<![A-Za-z0-9._\/-])img\/fusion\/captures\/([^?#"'\x60<>\s]+\/[^\/?#"'\x60<>\s]+-source\.png)/g;

for (const file of textFiles) {
  const body = fs.readFileSync(file, 'utf8');
  for (const [pattern, references] of [
    [absolutePattern, referencedScreens],
    [relativePattern, referencedScreens],
    [absoluteSourcePattern, referencedSourceImages],
    [relativeSourcePattern, referencedSourceImages],
  ]) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(body)) !== null) {
      references.add(match[1]);
    }
  }
}

const screenFiles = files.filter(
  (file) =>
    file.startsWith(captureRoot + path.sep) &&
    path.basename(file) === 'screen.png'
);
// Full-size provenance images are retained in Git, but copied to the
// published build only when explicitly linked by generated site content.
const sourceFiles = files.filter(
  (file) =>
    file.startsWith(captureRoot + path.sep) &&
    path.basename(file).endsWith('-source.png')
);

let removedBytes = 0;
let removedCount = 0;
const kept = [];

for (const file of screenFiles) {
  const relative = path.relative(captureRoot, file).split(path.sep).join('/');
  if (referencedScreens.has(relative)) {
    kept.push(relative);
    continue;
  }
  removedBytes += fs.statSync(file).size;
  fs.unlinkSync(file);
  removedCount += 1;
}

let removedSourceCount = 0;
let removedSourceBytes = 0;
const keptSourceImages = [];
for (const file of sourceFiles) {
  const relative = path.relative(captureRoot, file).split(path.sep).join('/');
  if (referencedSourceImages.has(relative)) {
    keptSourceImages.push(relative);
    continue;
  }
  const size = fs.statSync(file).size;
  removedSourceBytes += size;
  fs.unlinkSync(file);
  removedSourceCount += 1;
}
removedBytes += removedSourceBytes;

const report = {
  buildDir,
  screenCountBefore: screenFiles.length,
  referencedScreenCount: referencedScreens.size,
  removedScreenCount: removedCount,
  keptScreenCount: kept.length,
  sourceCountBefore: sourceFiles.length,
  referencedSourceCount: referencedSourceImages.size,
  removedSourceCount,
  keptSourceCount: keptSourceImages.length,
  removedSourceBytes,
  removedBytes,
  totalBytesBefore: totalBefore,
  totalBytesAfter: totalBefore - removedBytes,
  keptScreens: kept.sort(),
  keptSources: keptSourceImages.sort(),
};

if (reportPath) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}

console.log(JSON.stringify(report, null, 2));
