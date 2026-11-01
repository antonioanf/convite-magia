import { access, mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxBackgroundBytes = 250 * 1024;
const maxObjectBytes = 150 * 1024;

const backgrounds = [
  ['imagens-originais/castelo-original.jpe', 'public/cenas/01-castelo/castelo.webp'],
  ['imagens-originais/biblioteca-original.jpe', 'public/cenas/02-livro/fundo.webp'],
  ['imagens-originais/pergaminho-original.jpe', 'public/cenas/04-pergaminho/pergaminho.webp'],
];

const objects = [
  'public/cenas/02-livro/livro.png',
  'public/cenas/03-carta/envelope.png',
  'public/cenas/05-varinha/varinha.png',
  'public/cenas/07-chapeu/chapeu.png',
];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeAtomic(file, buffer) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, buffer);
  await rename(temporary, file);
}

async function optimizeBackground(source, destination) {
  if (!(await exists(source))) {
    throw new Error(`Imagem original não encontrada: ${path.relative(root, source)}`);
  }

  for (const quality of [82, 78, 74, 70, 66, 62, 58, 54]) {
    const output = await sharp(source)
      .rotate()
      .resize(1080, 1920, { fit: 'cover', position: 'centre' })
      .webp({ quality, effort: 6 })
      .toBuffer();

    if (output.byteLength <= maxBackgroundBytes) {
      await writeAtomic(destination, output);
      console.info(`${path.relative(root, destination)}: ${(output.byteLength / 1024).toFixed(1)} KB, WebP 1080x1920, qualidade ${quality}`);
      return;
    }
  }

  throw new Error(`Não foi possível manter ${path.relative(root, destination)} abaixo de 250 KB.`);
}

async function optimizeObject(file) {
  if (!(await exists(file))) {
    throw new Error(`Recorte PNG não encontrado: ${path.relative(root, file)}`);
  }

  const metadata = await sharp(file).metadata();
  if (!metadata.hasAlpha) {
    throw new Error(`O recorte precisa ter transparência: ${path.relative(root, file)}`);
  }

  for (const maxSide of [1200, 1080, 960, 840, 720, 640, 560, 480]) {
    for (const colours of [192, 128, 96]) {
      const output = await sharp(file)
        .ensureAlpha()
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
        .resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true })
        .png({ palette: true, quality: 90, effort: 10, colours, dither: 1 })
        .toBuffer();

      if (output.byteLength <= maxObjectBytes) {
        await writeAtomic(file, output);
        const result = await sharp(output).metadata();
        console.info(`${path.relative(root, file)}: ${(output.byteLength / 1024).toFixed(1)} KB, PNG alpha ${result.width}x${result.height}, ${colours} cores`);
        return;
      }
    }
  }

  throw new Error(`Não foi possível manter ${path.relative(root, file)} abaixo de 150 KB com alpha.`);
}

for (const [sourcePath, destinationPath] of backgrounds) {
  await optimizeBackground(path.join(root, sourcePath), path.join(root, destinationPath));
}

for (const objectPath of objects) {
  await optimizeObject(path.join(root, objectPath));
}
