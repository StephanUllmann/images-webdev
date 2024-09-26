#! /usr/bin/env node

import readline from 'node:readline/promises';

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const allowedExt = ['avif', 'webp', 'jpeg'];
const defaultSizes = [1920, 1280, 640, 320];
const formats = [
  { format: 'avif', quality: 60, effort: 9, chromaSubsampling: '4:2:0', bitdepth: 12 },
  { format: 'webp', quality: 75, effort: 6, smartSubsample: true },
  { format: 'jpeg', quality: 75 },
];

const dirSep = path.sep;

// Needs improvement to navigate through file tree
const completer = async function (line) {
  try {
    if (line === '..') return [['..' + dirSep], line];
    const slicedLine = line.includes(dirSep) ? line.slice(0, line.lastIndexOf(dirSep) + 1) : '';
    const paths = await fs.readdir(path.join(process.cwd(), slicedLine), { withFileTypes: true });
    const hits = paths
      .filter((p) => p.name.startsWith(line.slice(line.lastIndexOf(dirSep) + 1)) && p.isDirectory())
      .map((h) => slicedLine + h.name + dirSep);
    return [hits.length ? hits : paths.map((p) => p.name), line];
  } catch (error) {
    console.error('Error in completer', error);
    return [[], line];
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer,
});

console.log('Your current working directory: ', process.cwd());
const source = await rl.question('Relative Path to source images: ');
const target = await rl.question('Relative Path to target directory: ');
let sizesInput = await rl.question(`Type in target sizes (defaults to ${defaultSizes.join(', ')}): `);
sizesInput = sizesInput
  .split(/ |,/)
  .filter((i) => i)
  .map((i) => {
    const result = parseInt(i);
    if (isNaN(result)) {
      console.log('Invalid input. Numbers requred.');
      rl.close();
      process.exit(1);
    }
    return result;
  });

let formatInput = await rl.question(`Choose formats - ${allowedExt.join(', ')} (defaults to all): `);
rl.close();

formatInput = formatInput
  .split(/ |,/)
  .filter((f) => f)
  .map((f) => f.toLowerCase());
if (formatInput.some((f) => !allowedExt.includes(f))) {
  console.log('Invalid format.');
  process.exit(1);
}
// Change these paths relative to the directory you're running this script from
const sourceDirectory = source || '../img-src';
const targetDirectory = target || '../assets';

// Configure your sizes and formats
const sizes = !sizesInput[0] ? defaultSizes : sizesInput;

const appliedFormats = formatInput.length === 0 ? formats : formats.filter((f) => formatInput.includes(f.format));
// This is creating a configurations array - waaay less code than writing all by hand
const configurations = sizes.flatMap((size) => appliedFormats.map((format) => ({ ...format, size })));
console.log('running with: ', JSON.stringify(configurations));

// Limiting concurrent processes - my laptop is hitting hte fan!
const limit = pLimit(5);

// 'last step' - apply one config to a file
async function processImageVariant(sharpInstance, config, targetDir, source) {
  const { format, quality, effort, smartSubsample, size } = config;

  const resizedImage = sharpInstance.clone().resize({ width: size });

  if (format === 'jpeg') {
    resizedImage.jpeg({ quality });
  } else if (format === 'avif') {
    resizedImage.avif({ quality, effort });
  } else if (format === 'webp') {
    resizedImage.webp({ quality, effort, smartSubsample });
  }

  const outputFilePath = path.join(targetDir, `${source.split('original.')[0]}${size}.${format}`);
  await resizedImage.toFile(outputFilePath);
  console.log(`Successfully processed: ${outputFilePath}`);
}

// processing one file from the sourceDirecory; creates a sharp instance and loops over all configurations that need to be applied, running them in parallel
async function processImage(imgBuffer, source, targetDir) {
  const sharpInstance = sharp(imgBuffer);

  return Promise.all(
    configurations.map((config) =>
      limit(() =>
        processImageVariant(sharpInstance, config, targetDir, source).catch((err) =>
          console.error(`Error processing ${source} with config ${JSON.stringify(config)}:`, err)
        )
      )
    )
  );
}

// get all files from the sourceDirectory, read them into buffers and hand them over to sharp concurrently
async function processImages(srcDir, targetDir) {
  const files = await fs.readdir(srcDir);
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));

  const imageBuffers = await Promise.all(
    imageFiles.map(async (file) => {
      const imgPath = path.join(srcDir, file);
      return { file, buffer: await fs.readFile(imgPath) };
    })
  );

  await Promise.all(imageBuffers.map(({ file, buffer }) => processImage(buffer, file, targetDir)));
}

// turning relative paths into absolute
const srcDir = path.join(process.cwd(), sourceDirectory);
const targetDir = path.join(process.cwd(), targetDirectory);

// run the fun
processImages(srcDir, targetDir)
  .then(() => console.log('Image processing completed successfully'))
  .catch((err) => console.error('An error occurred during image processing:', err));
