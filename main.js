const fs = require('fs');
const sharp = require('sharp');
const path = require('node:path');
const Aseprite = require('ase-parser');
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron/main');

let menu;
let mainWindow;

async function makePNG(aseFile)
{
  aseFile.parse();
  
   // Create a blank png image buffer that's the same size as the Aseprite sprite (only make the promise because we'll use Promise.all a little later)
   const bgPromise = sharp({create: {
    width: aseFile.width,
    height: aseFile.height,
    channels: 4,
    background: {r: 0, g: 0, b: 0, alpha: 0}
  }}).png().toBuffer();

  // Get the cels for the first frame
  const cels = aseFile.frames[0].cels
  // copy the array
  .map(a => a)
  .sort((a, b) => {
    const orderA = a.layerIndex + a.zIndex;
    const orderB = b.layerIndex + b.zIndex;
    // sort by order, then by zIndex
    return orderA - orderB || a.zIndex - b.zIndex;
  });

    // Create png image buffers per cel to create an image of the first frame (creating the Promises to be used)
    const otherPromises = cels.map(cel => {
      return sharp(cel.rawCelData, {raw: {width: cel.w, height: cel.h, channels: 4}}).png().toBuffer();
    });

     // Run the promises all at once to get the buffers for the base image and the cels to combine
    const [ bg, ...others ] = await Promise.all([bgPromise, ...otherPromises]).catch(console.log);

      // take the first image and add on the png buffers on top of it (the cels should be in order from bottom to top from the parse)
      const finalBuff = await sharp(bg)
      .composite(others.map((img, index) => ({
        input: img,
        top: cels[index].ypos,
        left: cels[index].xpos
      })))
      .png()
      .toBuffer();

    const imageData = `data:image/png;base64,${finalBuff.toString('base64')}`;
    mainWindow.webContents.send('update-frame', imageData)
}

function createWindow () {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const template = [{
    label: 'File',
    submenu: [{
        label: 'Create',
        click: ()=> 
        {
          const animationFile = dialog.showOpenDialogSync({
            properties: ['openFile'],
            filters:[
              { name: 'Aseprite', extensions:['ase', 'aseprite'] }
            ],
            multiSelection: false
          })

          if(animationFile && animationFile.length > 0) 
          {
            const selectedFilePath = animationFile[0];
            const filename = path.basename(selectedFilePath);
            const buffer = fs.readFileSync(selectedFilePath);
            const aseFile = new Aseprite(buffer, filename);

            makePNG(aseFile);
          }
        }
      }]
    }]

  menu = Menu.buildFromTemplate(template);
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.on('frame-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  createWindow()
  Menu.setApplicationMenu(menu);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0)
    {
      createWindow();
      Menu.setApplicationMenu(menu);
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})