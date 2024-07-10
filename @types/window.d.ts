class IPCRendererCommon {
  on(event: 'store:update', callback: (payload: import('../src/shared/types').PersistentPayload) => void): void;

  send(event: 'modal:close'): void;

  send(event: 'modal:click', index: number): void;

  send(event: 'window:show'): void;

  send(event: 'store:update', payload: import('../src/shared/types').PersistentPayload): void;

  sendSync(event: 'store:read', payload: Pick<import('../src/shared/types').PersistentPayload, 'key'>): T;

  invoke(event: 'modal:show', config: import('../src/shared/types').ModalConfig): Promise<number>;
}

declare interface Window {
  electron: IPCRendererCommon;
}
