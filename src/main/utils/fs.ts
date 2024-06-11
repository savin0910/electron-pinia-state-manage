import fs from 'node:fs/promises';

import type { PathLike } from 'node:original-fs';

export async function exists(path: PathLike) {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}
