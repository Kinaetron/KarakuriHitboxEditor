const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('karakuriAPI', 
{
  incrementFrame: () => ipcRenderer.send('increment-frame'),
  decrementFrame: () => ipcRenderer.send('decrement-frame'),
  saveBoxes: (value) => ipcRenderer.send('save-boxes', value),
  frameValue: (value) => ipcRenderer.send('frame-value', value),
  onSendBoxes: (callback) => ipcRenderer.on('send-boxes', (_event) => callback()),
  onUpdateFrame: (callback) => ipcRenderer.on('update-frame', (_event, value) => callback(value)),
  onOpenBoxes: (callback) => ipcRenderer.on('open-boxes', (_event, value) => callback(value)),
})