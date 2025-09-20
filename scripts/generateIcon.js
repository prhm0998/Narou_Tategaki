import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

const sizes = [16, 32, 64, 96, 128];
const inputSvgPath = './ext_image/extension.svg';
const outputDir = './src/public/icon/';
const wxtSvgPath = './src/public/wxt.svg'; // 追加: wxt.svg のパス

async function generateIcons() {
  await fs.ensureDir(outputDir); // 出力ディレクトリを作成

  // inputSvgPath を wxt.svg としてコピー
  await fs.copy(inputSvgPath, wxtSvgPath, { overwrite: true }); // overwrite: true で上書き

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${size}.png`);
    await sharp(inputSvgPath)
      .resize(size, size)
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }
}

await generateIcons()