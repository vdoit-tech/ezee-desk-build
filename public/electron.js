const setupEvents = require("../installers/setupEvents");

const rage = require("rage-edit");
// const logger = require("./logger");
const fs = require("fs");
const path = require("path");

// const sqlite3 = require("sqlite3");
// logger.logInfo("Working Logger");
console.log(process.execPath);
const detailsLogger = (text) => {
  fs.appendFile(
    path.join(path.resolve("./"), "/src/logger.log"),
    `\n[${new Date().toLocaleString()}] [info] :${text}`,
    (err) => {
      if (err) {
        console.log("An error ocurred creating the file " + err.message);
      }

      console.log("The file has been succesfully saved");
    }
  );
};

if (process.platform === "win32") {
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
    await rage.Registry.set("HKLM\\SOFTWARE\\Classes\\ezeetel", "", "ezeetel");
    await rage.Registry.set(
      "HKLM\\SOFTWARE\\Classes\\ezeetel\\DefaultIcon",
      "",
      process.execPath
    );
    await rage.Registry.set(
      "HKLM\\SOFTWARE\\Classes\\ezeetel\\shell\\open\\command",
      "",
      `"${process.execPath}" "%1"`
    );
    await rage.Registry.set("HKLM\\SOFTWARE\\Classes\\tel", "", "tel");
    await rage.Registry.set(
      "HKLM\\SOFTWARE\\Classes\\tel\\DefaultIcon",
      "",
      process.execPath
    );
    await rage.Registry.set(
      "HKLM\\SOFTWARE\\Classes\\tel\\shell\\open\\command",
      "",
      `"${process.execPath}" "%1"`
    );

    await rage.Registry.set("HKLM\\SOFTWARE\\Classes\\callto", "", "callto");
    await rage.Registry.set(
      "HKLM\\SOFTWARE\\Classes\\callto\\DefaultIcon",
      "",
      process.execPath
    );
    await rage.Registry.set(
      "HKLM\\SOFTWARE\\Classes\\callto\\shell\\open\\command",
      "",
      `"${process.execPath}" "%1"`
    );
  })();
}

if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// require('@electron/remote/main').initialize()

const { setup: setupPushReceiver } = require("electron-push-receiver");

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  MenuItem,
  ipcMain,
  Notification,
  dialog,
  nativeTheme,
 
} = require("electron");
//auto updater
const { autoUpdater } = require('electron-updater');
const { ElectronChromeExtensions } = require("electron-chrome-extensions");
const isDev = require("electron-is-dev");

let windows = new Set();
let deeplinkingUrl;

let tray = null;
let win;
let frameView = true;

// var db = new DataBase({
//   filename: path.join(__dirname, "/nedb.db"),
//   autoload: true,
// });

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS; // NEW!
const { session, powerMonitor } = require("electron");

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}
if (require("electron-squirrel-startup")) {
  app.quit();
} // NEW!

if (isDev && process.platform === "win32") {
  // Set the path of electron.exe and your app.
  // These two additional parameters are only available on windows.
  // Setting this is required to get this working in dev mode.
  app.setAsDefaultProtocolClient("ezeetel", process.execPath, [
    path.resolve(process.argv[1]),
  ]);
} else {
  app.setAsDefaultProtocolClient("ezeetel");
}

logEverywhere("app.makeSingleInstance# " + deeplinkingUrl);
// require('update-electron-app')()

app.on("open-url", function (event, url) {
  event.preventDefault();
  dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
  deeplinkingUrl = url;
});

// Force single application instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  return;
} else {
  app.on("second-instance", (e, argv) => {
    if (process.platform !== "darwin") {
      // Find the arg that is our ezeetel protocol url and store it
      deeplinkingUrl = argv.find((arg) => arg.startsWith("ezeetel://"));
    }

    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      logEverywhere("app.makeSingleInstance# " + deeplinkingUrl);
    }
  });

  logEverywhere("app.makeSingleInstance# " + deeplinkingUrl);
}

function createWindow() {
  if (!tray) {
    // if tray hasn't been created already.
    createTray();
  }
  // Create the browser window.

  win = new BrowserWindow({
    width: require("electron").screen.getPrimaryDisplay().workAreaSize.width,
    height: require("electron").screen.getPrimaryDisplay().workAreaSize.height,
    maxWidth: require("electron").screen.getPrimaryDisplay().workAreaSize.width,
    maxHeight:
      require("electron").screen.getPrimaryDisplay().workAreaSize.height,
    minWidth: 300,
    minHeight: 250,
    icon: __dirname + "/icon.ico",

    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
      nativeWindowOpen: true,
      // devTools: false,
    },
    // resizable: false,
    maximizable: false,
    minimizable: true,
  });
  nativeTheme.themeSource = "light";

  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "quit",
          click: () => {
            //detailsLogger("quitting the app");
            win.webContents.send("quitApp", true);
            // app.isQuiting = true;
            // app.quit();
          },
        },
      ],
    },

    {
      label: "DevTools",
      accelerator: "CommandOrControl+Shift+I",
      click: () => BrowserWindow.getFocusedWindow().toggleDevTools(),
    },
    {
      label: "Refresh",
      accelerator: "CommandOrControl+R",
      role: "reload",
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Feedback",
          click: () => {
            //detailsLogger("clicked feedback");
            win.webContents.send("feedback", "feedback");
          },
        },
        {
          label: "Contact Us",
          click: () => {
            // detailsLogger("clicked for contact us");
            require("electron").shell.openExternal(
              "https://ezeetel.com/contact-us"
            );
          },
        },
      ],
    },
    {
      label: "test2",
      click: () => {
      console.log(app.getVersion())
       console.log("test123")
        
      },
    },
    {
      label: "Window",
      submenu: [
        {
          label: "fullscreen",
          click: () => {
            win.webContents.send("changeScreen", false);
            win.webContents.send("changeBg", true);
            win.resizable = true;
            // win.maximize();
            // win.setFullScreen(true);
            // win.setMenuBarVisibility(true);

            let { width, height } =
              require("electron").screen.getPrimaryDisplay().workAreaSize;

            win.setSize(width, height);
            win.resizable = false;
            setTimeout(() => {
              win.webContents.send("changeBg", false);
            }, 700);
            // detailsLogger("clicked for full screen");
          },
        },
        {
          label: "mid size",
          click: () => {
            win.webContents.send("changeScreen", true);
            win.webContents.send("changeBg", true);
            win.resizable = true;
            win.setFullScreen(false);

            win.setSize(
              575,
              require("electron").screen.getPrimaryDisplay().workAreaSize.height
            );
            win.resizable = false;
            setTimeout(() => {
              win.webContents.send("changeBg", false);
            }, 700);
            // detailsLogger("clicked for mid size");
          },
        },
        {
          label: "floating",
          click: () => {
            win.webContents.send("changeBg", true);
            win.resizable = true;
            win.setFullScreen(false);
            win.setSize(300, 200);
            win.resizable = false;
            setTimeout(() => {
              win.webContents.send("changeBg", false);
            }, 700);
            // detailsLogger("clicked for floating screen");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  win.once("ready-to-show", () => {
    win.show();
  });

  setupPushReceiver(win.webContents);
  win.webContents.on("new-window", function (event, urlToOpen) {
    event.defaultPrevented = true;
  });
  win.on("maximize", function (event) {
    event.preventDefault();

    let { width, height } =
      require("electron").screen.getPrimaryDisplay().workAreaSize;

    win.setSize(width, height);
  });

  win.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      console.log("hide");
      // detailsLogger("hiding app");
      win.webContents.send("hide", true);
      win.hide();
    }

    return false;
  });

  win.on("minimize", function (event) {
    event.preventDefault();
    console.log("hide");
    // detailsLogger("minimizing app");
    win.resizable = true;
    // win.setFullScreen(false);
    // win.setSize(
    //   575,
    //   require("electron").screen.getPrimaryDisplay().workAreaSize.height
    // );
    win.resizable = false;
  });
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });
  ipcMain.on("payload", function (event, url) {
    if (win && win.webContents) {
      win.webContents.executeJavaScript(`console.log("${url}")`);
      win.webContents.send("notification", url);
    }
  });
  ipcMain.on("ShowScreen", function (event, url) {
    console.log("Show Screen : Electron");
    if (win && win.webContents && url === true) {
      win.webContents.send("hide", false);
      win.show();
    }
  });
  ipcMain.on("quitApp", function (event, url) {
    if (url == true) {
      app.isQuiting = true;
      app.quit();
    }
  });
  ipcMain.on("logOut", function (event, url) {
    const find = require("find-process");

    find("name", "electron.exe").then(
      function (list) {
        console.log(list[0].pid);
        process.exit(list[0].pid);
      },
      function (err) {
        console.log(err.stack || err);
      }
    );
  });

  win.on("focus", () => {
    win.webContents.send("hide", false);
  });

  ipcMain.on("maximize", function (event, url) {
    win.resizable = true;
    win.setFullScreen(true);
    // let { width, height } =
    //   require("electron").screen.getPrimaryDisplay().workAreaSize;

    // win.setSize(width, height);
    win.resizable = false;
  });

  tray.on("click", () => {
    console.log("clicked");
    // detailsLogger("showing app from tray");
    win.show();
  });

  powerMonitor.addListener("unlock-screen", () => {
    console.log("screen unlocked");
    win.webContents.send("unlocked", true);
  });
}

//create Tray...
function createTray() {
  tray = new Tray(path.join(__dirname, "../src/assets/imgs/e-logo.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        // detailsLogger("showing app from tray");
        win.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        // detailsLogger("quitting app from tray");
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Ezeetel");
  tray.setContextMenu(contextMenu);
}

app.on("activate", () => {
  if (windows.size === 0) createWindow();
});

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  // fs.writeFile(
  //   path.join(path.resolve("./"), "/src/logger.txt"),
  //   "log file created",
  //   (err) => {
  //     if (err) {
  //       console.log("An error ocurred creating the file " + err.message);
  //     }

  //     console.log("The file has been succesfully saved");
  //   }
  // );

  const extensions = new ElectronChromeExtensions();
  extensions.addTab(win.webContents, win);
});
app.on("add-window", createWindow);

// Log both at dev console and at running node console instance
function logEverywhere(s) {
  console.log(s);
  if (win && win.webContents) {
    win.webContents.executeJavaScript(`console.log("${s}")`);
    win.webContents.send("link", deeplinkingUrl);
  }
}

autoUpdater.on('update-available', () => {
  console.log('update_available')
  win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  console.log('update_downloaded')
  win.webContents.send('update_downloaded');
});
ipcMain.on('restart_app', () => {
  
  autoUpdater.quitAndInstall();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// const database = new sqlite3.Database("./ezeelinkdesk.db", (err) => {
//   if (err) console.error("Database opening error: ", err);
// });

// ipcMain.on("asynchronous-message", (event, arg) => {
//   const sql = arg;
//   database.all(sql, (err, rows) => {
//     event.reply("asynchronous-reply", (err && err.message) || rows);
//   });
// });
// module.exports.getLink = () => deeplinkingUrl;
