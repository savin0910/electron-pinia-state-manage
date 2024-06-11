declare interface Window {
  electron: {
    on: (event: string, callback: (...data: any[]) => void) => void;
    send: (event: string, ...data: any[]) => void;
    invoke: <T = any>(event: string, ...data: any[]) => Promise<T>;
  };
}
