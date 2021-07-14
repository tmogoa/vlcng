const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Manager = require("./classes/Manager");

/**
 * This is the manager object that will manage the entire video playing process
 */

const vlcManager = new Manager();

let mainWindow;

if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 700,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "/screens/video.html"));

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on("window:resize", (event, arg) => {
    mainWindow.setSize(800, Math.ceil(arg));
});

//Handling the link from the homescreen
ipcMain.on("save-video-link", (evt, link) => {
    vlcManager.currentlyPlayingMediaSrc = link;
    console.log(link);
});

ipcMain.on("send-video-link", (evt) => {
    evt.reply("receive-video-link", vlcManager.currentlyPlayingMediaSrc);
    console.log("sending video link");
});
