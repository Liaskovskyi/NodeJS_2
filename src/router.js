import { readdir } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = new Map();
const baseDir = path.join(__dirname, '/Routes');

async function loadRoutesDir(dirname, base) {
  const relativePath = path.join(base, dirname);
  const workdir = path.join(baseDir, relativePath);

  try {
    console.log("trying")
    const dir = await readdir(workdir, { withFileTypes: true });
    for (const dirent of dir) {
      console.log("dirent.isFile(): ",dirent.isFile(), "path.extname(dirent.name): ",path.extname(dirent.name), "path.basename(dirent.name,'.js')",path.basename(dirent.name,'.js'))
      if (dirent.isDirectory()) {
        console.log("isDirectory - true")
        await loadRoutesDir(dirent.name, path.join(base, dirname));
      } else if (
        dirent.isFile() &&
        path.extname(dirent.name) === '.js' &&
        path.basename(dirent.name, '.js') === 'index'
      ) {
        console.log("index.js = true")
        let modulePath = pathToFileURL(path.join(workdir, dirent.name));
        let module = await import(modulePath);
        console.log("relativepath: ",relativePath, "module: ", module)
        router.set(relativePath.replaceAll(path.sep, '/'), { ...module });
      }
    }
  } catch (error) {
    console.error(`Error loading routes from ${relativePath}:`, error);
  }
}


await loadRoutesDir('', path.sep);

export default router;