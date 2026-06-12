const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('liubaiAPI', {
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  openDataFolder: () => ipcRenderer.invoke('open-data-folder'),
  getVersion: () => ipcRenderer.invoke('get-version'),
});
