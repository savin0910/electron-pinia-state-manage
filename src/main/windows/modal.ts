import path from 'node:path';

import { BrowserWindow, ipcMain } from 'electron';

import {
  MODAL_CLOSE_CODE,
  MODAL_DEFAULT_WIDTH,
  MODAL_DEFAULT_HEIGHT,
} from '@/shared/config';

import { loadURL } from './utils';

import type { ModalConfig } from '@/shared/types';

function stringifyModalConfig(config: Omit<ModalConfig, 'width' | 'height'>) {
  const encode = (value: string | string[]) => (
    Array.isArray(value) ? value.map(encodeURIComponent).join(',') : encodeURIComponent(value)
  );

  return Object.entries(config)
    .map(([key, value]) => `${key}=${encode(value)}`)
    .join('&');
}

function showModalWindow(parent: BrowserWindow, {
  width = MODAL_DEFAULT_WIDTH,
  height = MODAL_DEFAULT_HEIGHT,
  ...config
}: ModalConfig) {
  return new Promise((resolve) => {
    const search = stringifyModalConfig(config);
    const modalWindow = new BrowserWindow({
      width,
      height,
      frame: false,
      modal: true,
      parent,
      resizable: false,
      fullscreenable: false,
      maximizable: false,
      center: true,
      webPreferences: {
        preload: path.join(__dirname, 'main.preload.js'),
      },
    });
    const handler = (code = MODAL_CLOSE_CODE) => {
      // Focus on the parent window to prevent lose focus
      parent.focus();
      modalWindow.close();
      resolve(code);
    };

    modalWindow.webContents.ipc
      .once('modal:close', () => handler())
      .once('modal:click', (_, index: number) => handler(index));

    loadURL(modalWindow, 'modal', { search });
  });
}

ipcMain.handle('modal:show', async ({ sender }, config: ModalConfig) => {
  const parent = BrowserWindow.fromWebContents(sender);
  const response = await showModalWindow(parent!, config);

  return response;
});
