const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('karakuriAPI', 
{
  incrementFrame: () => ipcRenderer.send('increment-frame'),
  decrementFrame: () => ipcRenderer.send('decrement-frame'),
  saveBoxes: (value) => ipcRenderer.send('save-boxes', value),
  frameValue: (value) => ipcRenderer.send('frame-value', value),
  onSendBoxes: (callback) => ipcRenderer.on('send-boxes', (_event) => callback()),
  onUpdateFrame: (callback) => ipcRenderer.on('update-frame', (_event, value) => callback(value)),
  onUpdateFrameCount: (callback) => ipcRenderer.on('update-frame-count', (_event, value) => callback(value)),
})