import { app } from 'electron';

import type {
  BrowserWindow, LoadFileOptions, WebContents,
} from 'electron';

const DEV_SERVER = 'http://localhost:4321';
const RENDERER_ROOT = '.vite/www';

function fixPathname(pathname: string): string {
  pathname.trim();

  if (!pathname.startsWith('/')) {
    // Ensure pathname starts with a slash
    pathname = `/${pathname}`;
  }

  if (!pathname.endsWith('/')) {
    // Ensure pathname ends with a slash
    pathname += '/';
  }

  return pathname;
}

function getEndpoint(pathname: string): string {
  pathname = fixPathname(pathname);

  if (app.isPackaged) {
    return `${RENDERER_ROOT}${pathname}index.html`;
  }

  return `${DEV_SERVER}${pathname}`;
}

function fillURL(baseURL: string, options?: LoadFileOptions): string {
  const url = new URL(baseURL);

  url.search = options?.search || url.search;
  url.hash = options?.hash || url.hash;

  if (options?.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

export function loadURL(
  webContents: BrowserWindow | WebContents,
  pathname: string,
  options?: LoadFileOptions,
): void {
  const url = getEndpoint(pathname);

  if (app.isPackaged) {
    webContents.loadFile(url, options);
  } else {
    webContents.loadURL(fillURL(url, options));
  }
}
