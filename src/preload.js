const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  translate: (text, targetLang) => ipcRenderer.invoke('translate', text, targetLang),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  onTranslateClipboard: (callback) => ipcRenderer.on('translate-clipboard', (event, text) => callback(text))
});
