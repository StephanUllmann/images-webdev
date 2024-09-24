import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

// Change these paths relative to the directory you're running this script from
const sourceDirectory = '../img-src';
const targetDirectory = '../assets';

// Configure your sizes and formats
const sizes = [1920, 1280, 640, 320];
const formats = [
  { format: 'avif', quality: 75, effort: 9 },
  { format: 'webp', quality: 75, effort: 6, smartSubsample: true },
  { format: 'jpeg', quality: 75 },
];

// This is creating a configurations array - waaay less code than writing all by hand
const configurations = sizes.flatMap((size) => formats.map((format) => ({ ...format, size })));

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
