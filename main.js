const electron = require('electron')
const config = require('./config.json')
// Module to control application life.
const app = electron.app
const Menu = electron.Menu;
const dialog = electron.dialog;
const globalShortcut = electron.globalShortcut
const ipcMain = electron.ipcMain;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const fs = require('fs');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow
var loadingWindow
function createWindow() {
  // Create the browser window.
  loadingWindow = new BrowserWindow({ show: true, transparent: true, frame: false, width: 200, hasShadow: true,  height: 150, skipTaskbar: true, resizable: false, title: config.title, autoHideMenuBar: true, webPreferences: { nodeIntegration: true } });
  loadingWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow = new BrowserWindow({ show: false, width: 1000, height: 700, title: config.title, autoHideMenuBar: config.autoHideMenuBar, webPreferences: { nodeIntegration: true } }) //, webPreferences :{nodeIntegration:false}
  mainWindow.maximize()
  mainWindow.hide()
  // and load the index.html of the app.
  mainWindow.loadURL(config.url) //'http://mlc.crowell.com/Console/#/inbox/' //http://localhost:3000/#/group/571e513b0c726a3268db766e/sheet/572a11f30c726a17a0cd5ca5

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
      var filePath = item.getSavePath()
      if (filePath.indexOf('.xlsx') > -1) openExcel(filePath)
    })
  })


  creartePopupWindow()
}

var popupWindow;
function creartePopupWindow(){
  let screen = electron.screen
  popupWindow = new BrowserWindow({ show: false, transparent: true, alwaysOnTop:true, frame: false, width: 1000, hasShadow:true, minWidth: 300, height: 700, skipTaskbar:true, minHeight:200, resizable:true, title: config.title, autoHideMenuBar: true, webPreferences: { nodeIntegration: true } });
  popupWindow.loadURL(config.popup01Url);
  const shortcut1 = globalShortcut.register('Control+Space', () => {
    let mousePosistion = screen.getCursorScreenPoint()
    popupWindow.show();
    popupWindow.setPosition(mousePosistion.x, mousePosistion.y,true)
  });
  const shortcut2 = globalShortcut.register('Control+Space+T', () => {
    popupWindow.hide();
  });
  // popupWindow.on("blur",()=>{
  //   console.log('blur')
  //   popupWindow.hide();
  // })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

exports.test = function(_Val){
  console.log(_Val)
}

exports.closeLoading = function (_Val) {
  try {
    console.log('closeLoading')
    loadingWindow.hide()
    loadingWindow.close()
    mainWindow.show()
  } catch (error) {
    console.log('error')
  }
  

}

exports.openExcel = openExcel;


function openExcel (_file){
  const exec = require('child_process').exec;
  //exec("open 'C:\\Users\gracea\Desktop\Tracking Chart.xlsx'").unref(); //C:\Program Files (x86)\Microsoft Office\Office14\EXCEL.EXE" //C:/Users/gracea/Desktop/Tracking Chart.xlsx
  if (_file) require('child_process').spawn('C://Program Files (x86)/Microsoft Office/Office14/EXCEL.EXE', [_file])
  console.log('openExcel')
}

//exports.openExcel()

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
      {
        label: 'Save to PDF',
        accelerator: 'CmdOrCtrl+P',
        role: 'saveToPDF',
        click(item, focusedWindow) {
          //focusedWindow.webContents.print({printBackground:true})
          dialog.showSaveDialog(focusedWindow, {
            filters: [
              { name: 'PDF', extensions: ['pdf'] }
            ]
          }, function (filePath) {
            focusedWindow.webContents.printToPDF({ printBackground: true }, (error, data) => {
              if (error) throw error;
              fs.writeFile(filePath, data, (error) => {
                if (error)
                  throw error;
              });
            });
          })

        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() { require('electron').shell.openExternal('http://electron.atom.io'); }
      },
    ]
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);