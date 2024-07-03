import path from 'node:path';

import { app, BrowserWindow } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';

import { startNuxtServer, stopNuxtServer } from './server';
import { createStore, saveStoreToLocal } from './store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

// Quit the app if another instance is already running
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const { stores } = createStore();

Object.assign(global, { stores });

async function createWindow() {
  if (app.isPackaged) {
    // Start the Nuxt server
    await startNuxtServer();
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'main.preload.js'),
    },
  });

  // Hide the menu bar
  mainWindow.setMenu(null);
  mainWindow.menuBarVisible = false;

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
  stopNuxtServer();

  await saveStoreToLocal();
});
