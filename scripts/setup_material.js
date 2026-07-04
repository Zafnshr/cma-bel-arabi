const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '..', 'Scientific content', 'CMA Chapters');
const destDir = path.join(__dirname, '..', 'public', 'material');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

for (let i = 1; i <= 20; i++) {
  const sourceFile = path.join(sourceDir, `CMA_CMA1_BookOnline_SU${i}_Outline.pdf`);
  const destFile = path.join(destDir, `SU${i}.dat`);
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    console.log(`Copied SU${i} PDF to ${destFile}`);
  } else {
    console.error(`Source file not found: ${sourceFile}`);
  }
}
console.log('Setup finished!');
