import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = __dirname;  
const outputFile = path.join(__dirname, 'index.js');

const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

let exportLines = files.map(file => {
  const name = file.replace('.png', '');
  return `  ${name}: require('./${file}'),`;
});

const output = `// AUTO-GENERATED FILE — DO NOT EDIT

export default {
${exportLines.join('\n')}
};
`;

fs.writeFileSync(outputFile, output);
console.log("✔ index.js generato!");