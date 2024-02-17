const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('karakuriAPI', {
  onUpdateFrame: (callback) => ipcRenderer.on('update-frame', (_event, value) => callback(value)),
  frameValue: (value) => ipcRenderer.send('frame-value', value)
})