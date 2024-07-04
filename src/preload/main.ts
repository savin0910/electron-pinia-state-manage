import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  on(event: string, callback: (...data: any[]) => void) {
    ipcRenderer.on(event, (_, ...data) => callback(...data));
  },
  send(event: string, ...data: any[]) {
    ipcRenderer.send(event, ...data);
  },
  sendSync(event: string, ...data: any[]) {
    return ipcRenderer.sendSync(event, ...data);
  },
  invoke(event: string, ...data: any[]) {
    return ipcRenderer.invoke(event, ...data);
  },
});
