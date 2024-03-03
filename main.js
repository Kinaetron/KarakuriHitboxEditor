const fs = require('fs');
const sharp = require('sharp');
const path = require('node:path');
const Aseprite = require('ase-parser');
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron/main');

let menu;
let mainWindow;

let frameCount;
let frameArray = [];
let frameIndex = 0;

let filepath;

function FrameInformation(width, height, source, frameIndex) {
  this.width = width;
  this.height = height;
  this.source = source;
  this.frameIndex = frameIndex;
}

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const template = [{
    label: 'File',
    submenu: [{
        label: 'Create',
        click: ()=> {
          const animationFile = dialog.showOpenDialogSync({
            properties: ['openFile'],
            filters:[
              { name: 'Aseprite', extensions:['ase', 'aseprite'] }
            ],
            multiSelection: false
          })

          if(animationFile && animationFile.length > 0) 
          {
            filepath = animationFile[0];
            const filename = path.basename(filepath);
            const buffer = fs.readFileSync(filepath);
            const aseFile = new Aseprite(buffer, filename);

            getAnimationFrames(aseFile);
          }
        }
      },
      {
        label: 'Open',
        click: ()=> {
          console.log('open a file nerd');
        }
      },
      {
        label: 'Save',
        click: ()=> {
          mainWindow.webContents.send('send-boxes');
        }
      }
    ]
    }]

  menu = Menu.buildFromTemplate(template);
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

async function getAnimationFrames(aseFile)
{
  aseFile.parse();

  // Create a blank png image buffer that's the same size as the Aseprite sprite (only make the promise because we'll use Promise.all a little later)
  const bgPromise = sharp({create: {
    width: aseFile.width,
    height: aseFile.height,
    channels: 4,
    background: {r: 0, g: 0, b: 0, alpha: 0}
  }}).png().toBuffer();

  frameCount = aseFile.numFrames;

  for (let i = 0; i < frameCount; i++) {
      // Get the cels for the first frame
      const cels = aseFile.frames[i].cels
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
      frameInformation = new FrameInformation(aseFile.width, aseFile.height, imageData, i);
      
      frameArray.push(frameInformation);
  }
    mainWindow.webContents.send('update-frame-count', frameCount);
    mainWindow.webContents.send('update-frame', frameArray[0]);
}

function handleDecrementFrame() {
  frameIndex = frameIndex <= 0 ? 0 : frameIndex - 1;
  mainWindow.webContents.send('update-frame', frameArray[frameIndex]);
}

function handleIncrementFrame() {
  frameIndex = frameIndex >= frameCount - 1 ? frameCount - 1 : frameIndex + 1;
  mainWindow.webContents.send('update-frame', frameArray[frameIndex]);
}

function handleSaveBoxes(_event, value) {

   const saveFilePath = dialog.showSaveDialogSync({
    title: 'Save collider information',
    defaultPath: path.join(app.getPath('documents'), 'data.json'),
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
   });

   if(saveFilePath) {
    const saveData = {
      animationFilePath: filepath,
      colliderBoxes: value
    };

    fs.writeFile(saveFilePath, JSON.stringify(saveData), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('JSON file saved successfully:', saveFilePath);
      }
    });
   }
}

app.whenReady().then(() => {
  ipcMain.on('frame-value', (_event, value) => {
})

  ipcMain.on('save-boxes', handleSaveBoxes);
  ipcMain.on('decrement-frame', handleDecrementFrame);
  ipcMain.on('increment-frame', handleIncrementFrame);

  createWindow();
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