import { BrowserWindow, ipcMain } from 'electron';

ipcMain.on('window:show', ({ sender }) => {
  const win = BrowserWindow.fromWebContents(sender);

  if (win && !win.isDestroyed()) {
    win.show();
  }
});
