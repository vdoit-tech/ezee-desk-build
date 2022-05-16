const { remote } = require("electron");
// const { ipcRenderer } = require("electron");

// document.getElementById("close").addEventListener("click", closeWindow);
// document.getElementById("minimize").addEventListener("click", minimizeWindow);
// document.getElementById("maximize").addEventListener("click", maximizeWindow);
// document.getElementById("refresh").addEventListener("click", refreshWindow);
// document.getElementById("app").addEventListener("click", appWindow);

/*
  getFocusedWindow() may return null.
  If a user uses global keyboard shortcut to trigger 
  minimizeWindow, there may not be any window that 
  is focused right now
*/
const getWindow = () => remote.BrowserWindow.getFocusedWindow();

function closeWindow() {
  getWindow().close();
}

function minimizeWindow() {
  const win = getWindow();

  win.resizable = true;
  win.setSize(300, 200);
  win.resizable = false;
}
function maximizeWindow() {
  const win = getWindow();
  // ipcRenderer.send("maximaize", "max");

  win.resizable = true;
  let { width, height } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;

  win.setSize(width, height);
  win.resizable = false;
}
function refreshWindow() {
  const window = getWindow();
  window.reload();
}

function appWindow() {
  const window = getWindow();
  window.toggleDevTools();
}
