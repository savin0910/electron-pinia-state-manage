import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pinia', {
  on(callback: (data: any) => void) {
    ipcRenderer.on('pinia:main', (_, data) => callback(data));
  },
  send(data: any) {
    ipcRenderer.send('pinia:renderers', data);
  },
});
