import path from 'node:path';

import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import squirrelStartup from 'electron-squirrel-startup';

import { userStore } from '@/shared/store';

import { handleAppProtocol } from './net';
import { saveStoreToLocal } from './store';
import { loadURL } from './windows';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

// Quit the app if another instance is already running
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

log.initialize({
  preload: true,
});

userStore.$user.listen((user) => {
  console.log(`user name's: ${user.name}`);
});

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'main.preload.js'),
    },
  });

  // Hide the menu bar
  win.setMenu(null);
  win.menuBarVisible = false;

  // and load the index.html of the app.
  loadURL(win, '/');

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

async function createMainWindow() {
  createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  handleAppProtocol();

  createMainWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.on('will-quit', async () => {
  saveStoreToLocal();
});
