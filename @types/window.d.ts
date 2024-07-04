declare interface Window {
  electron: {
    on: (event: string, callback: (...data: any[]) => void) => void;
    send: (event: string, ...data: any[]) => void;
    sendSync: <T = any>(event: string, ...data: any[]) => T;
    invoke: <T = any>(event: string, ...data: any[]) => Promise<T>;
  };
}
