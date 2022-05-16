const setupEvents = require('../installers/setupEvents');
const rage = require('rage-edit');

console.log(process.execPath);

if (process.platform === 'win32') {
  (async () => {
    // await rage.Registry.set(
    //   'HKCU\\Software\\ezeetel\\Capabilities',
    //   'ezeetel',
    //   `${process.execPath}`
    // );
    // await rage.Registry.set(
    //   'HKCU\\Software\\ezeetel\\Capabilities',
    //   'ezeetel',
    //   `${process.execPath}`
    // );

    // await rage.Registry.set(
    //   'HKCU\\Software\\ezeetel\\Capabilities\\URLAssociations',
    //   'tel',
    //   `${process.execPath}`
    // );

    // await rage.Registry.set(
    //   'HKCU\\Software\\Classes\\ezeetel.tel\\DefaultIcon',
    //   '',
    //   process.execPath
    // );

    // await rage.Registry.set(
    //   'HKCU\\Software\\Classes\\ezeetel.tel\\shell\\open\\command',
    //   '',
    //   `"${process.execPath}" "%1"`
    // );

    // await rage.Registry.set(
    //   'HKCU\\Software\\RegisteredApplications',
    //   'ezeetel',
    //   'Software\\ezeetel\\Capabilities'
    // );
    await rage.Registry.set('HKLM\\SOFTWARE\\Classes\\ezeetel', '', 'ezeetel');
    await rage.Registry.set(
      'HKLM\\SOFTWARE\\Classes\\ezeetel\\DefaultIcon',
      '',
      process.execPath
    );
    await rage.Registry.set(
      'HKLM\\SOFTWARE\\Classes\\ezeetel\\shell\\open\\command',
      '',
      `"${process.execPath}" "%1"`
    );
    await rage.Registry.set('HKLM\\SOFTWARE\\Classes\\tel', '', 'ezeetel');
    await rage.Registry.set(
      'HKLM\\SOFTWARE\\Classes\\tel\\DefaultIcon',
      '',
      process.execPath
    );
    await rage.Registry.set(
      'HKLM\\SOFTWARE\\Classes\\tel\\shell\\open\\command',
      '',
      `"${process.execPath}" "%1"`
    );
  })();
}

if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

const path = require('path');

const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
  const devTools = require('electron-devtools-installer');
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let win;
let deeplinkingUrl;
let secondDeepLinkingUrl;
let windows = new Set();

if (isDev && process.platform === 'win32') {
  // Set the path of electron.exe and your app.
  // These two additional parameters are only available on windows.
  // Setting this is required to get this working in dev mode.
  app.setAsDefaultProtocolClient('ezeetel', process.execPath, [
    path.resolve(process.argv[1]),
  ]);
  app.setAsDefaultProtocolClient('tel', process.execPath, [
    path.resolve(process.argv[1]),
  ]);
} else {
  app.setAsDefaultProtocolClient('ezeetel');
  app.setAsDefaultProtocolClient('tel');
}

logEverywhere('app.makeSingleInstance# 1' + deeplinkingUrl);

app.on('open-url', function (event, url) {
  event.preventDefault();
  console.log('Line 44');
  console.log(url);
  deeplinkingUrl = url;
});

// Force single application instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  return;
} else {
  app.on('second-instance', (e, argv) => {
    if (process.platform !== 'darwin') {
      // Find the arg that is our ezeetel protocol url and store it
      deeplinkingUrl = argv.find((arg) => arg.startsWith('ezeetel://'));
      console.log('Line 60');
      console.log(argv.find((arg) => arg.startsWith('ezeetel://')));

      secondDeepLinkingUrl = argv.find((arg) => arg.startsWith('tel://'));
      console.log('Line 64');
      console.log(argv.find((arg) => arg.startsWith('tel://')));
    }

    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      logEverywhere('app.makeSingleInstance# 2 ' + deeplinkingUrl);
      logEverywhereSecond(
        'app.makeSingleInstance# second deep 2 ' + secondDeepLinkingUrl
      );
    }
  });

  logEverywhere('app.makeSingleInstance# 3' + deeplinkingUrl);
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: '100%',
    height: '100%',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // creating menu bar
  const menuTemplate = [
    {
      label: 'App',
      submenu: [{ role: 'close' }],
    },
    {
      label: 'Refresh',
      role: 'reload',
      accelerator: 'CommandOrControl+R',
    },
    {
      label: 'DevTools',
      accelerator: 'CommandOrControl+Shift+I',
      click: () => BrowserWindow.getFocusedWindow().toggleDevTools(),
    },
    {
      label: 'Help',
      submenu: [
        { label: 'feedback', click: () => createNewWindow() },
        { label: 'more...', click: () => console.log('clicked') },
      ],
    },
    {
      label: 'Resize',
      click: () => win.setSize(400, 500),
    },
    {
      label: 'Maximize',
      click: () => {
        let { width, height } =
          require('electron').screen.getPrimaryDisplay().workAreaSize;
        win.setSize(width, height);
      },
    },
  ];
  // menu.append(
  //   new MenuItem()
  // );
  const menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Protocol handler for win32
  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1);
    console.log('Line 137');
    console.log(process.argv.slice(1));
  }

  logEverywhere('createWindow# ' + deeplinkingUrl);
  logEverywhereSecond('createWindow# ' + secondDeepLinkingUrl);

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// create new window
function createNewWindow() {
  let newWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  newWindow.loadURL(
    isDev
      ? 'file://' + __dirname + '/form.html'
      : `file://${path.join(__dirname, './form.html')}`
  );

  newWindow.webContents.on('did-finish-load', () => {
    if (!newWindow) {
      throw new Error('"newWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      newWindow.minimize();
    } else {
      newWindow.show();
      newWindow.focus();
    }
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    newWindow = null;
  });

  windows.add(newWindow);
  return newWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((error) => console.log(`An error occurred: , ${error}`));
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Log both at dev console and at running node console instance
function logEverywhere(s) {
  console.log(s);
  if (win && win.webContents) {
    win.webContents.executeJavaScript(`console.log("${s}")`);
    win.webContents.send('link', deeplinkingUrl);
  }
}

// Log both at dev console and at running node console instance
function logEverywhereSecond(s) {
  console.log(s);
  if (win && win.webContents) {
    win.webContents.executeJavaScript(`console.log("${s}")`);
    win.webContents.send('secondlink', secondDeepLinkingUrl);
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

module.exports.getLink = () => deeplinkingUrl;
