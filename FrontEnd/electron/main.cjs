const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');

const isPacked = app.isPackaged;

function createWindow() {
  const iconPath = isPacked
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../build-resources/icon.png');

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: '留白',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false,
    },
    show: false,
  });

  if (isPacked) {
    win.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  return win;
}

ipcMain.handle('get-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('open-data-folder', () => {
  shell.openPath(app.getPath('userData'));
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
