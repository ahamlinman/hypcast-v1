import * as Tmp from 'tmp';
import * as fs from 'fs';
import { promisify } from 'util';

// Helper function to create a temporary directory using promises. This is
// required because the function has a non-standard callback with multiple
// "success" arguments, which we need both of. As a result, we construct a
// custom object to resolve the promise.
export function createTmpDir(): Promise<{ dirPath: string, clean: () => void }> {
  return new Promise((resolve, reject) => {
    Tmp.dir({ unsafeCleanup: true }, (err, dirPath, clean) => {
      if (err) {
        reject(err);
      }

      resolve({ dirPath, clean });
    });
  });
}

// Helper function to create a new file. This simply helps create the playlist
// file before watching it. We require the path to be exclusive as a safety
// measure. Hypcast shouldn't have a problem with this since a new temp dir is
// created for every stream.
export async function createNewFile(filePath: string) {
  const fd = await promisify(fs.open)(filePath, 'wx');
  await promisify(fs.close)(fd);
}

