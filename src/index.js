const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Manager = require("./classes/Manager");
const Utility = require("./classes/Utility");

/**
 * This is the manager object that will manage the entire video playing process
 */

/**
 * Always set the database path before calling the Utility#initdb method.
 */
Utility.databasePath = app.getPath("userData");

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
    mainWindow.loadFile(path.join(__dirname, "/screens/homescreen.html"));

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

//Handling the link from the homescreen
ipcMain.on("save-video-link", (evt, link) => {
    vlcManager.currentlyPlayingMediaSrc = link;
    console.log(` - Saving the link is ${link} \n`);
});

ipcMain.on("save-audio-link", (evt, link) => {
    vlcManager.currentlyPlayingMediaSrc = link;
    console.log(` - Saving the link is ${link} \n`);
});

ipcMain.handle("receive-video-link", async (event, args) => {
    console.log(
        ` - Sent the video link successfully. The video link was ${vlcManager.currentlyPlayingMediaSrc}\n`
    );
    return vlcManager.currentlyPlayingMediaSrc;
});

ipcMain.handle("receive-audio-link", async(event, args) =>{
    console.log(` - Sent the video link successfully. The video link was ${vlcManager.currentlyPlayingMediaSrc}\n`);
    return vlcManager.currentlyPlayingMediaSrc;
});