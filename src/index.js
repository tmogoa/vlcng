const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Manager = require("./classes/Manager");
const Utility = require("./classes/Utility");
const initSqlJs = require("sql.js");
const fileType = require("file-type");
const fs = require('fs');
const find = require('findit');
const { X_OK, F_OK } = require("constants");
var dirSearched = [];
var SQL;
var stopSearch = false;


async function initSQL(){
    SQL = await initSqlJs();
}

initSQL();
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
    vlcManager.currentlyPlayingMediaSrc = link.replace(/\\/g, "/");
    console.log(` - Saving the link is ${link} \n`);
});

ipcMain.on("save-audio-link", (evt, link) => {
    vlcManager.currentlyPlayingMediaSrc = link.replace(/\\/g, "/");
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
//clean the directory array
ipcMain.handle("clear-directory-array", (event)=>{
    dirSearched = [];
    return true;
});

ipcMain.on('start-search', search);

ipcMain.on('stop-search', function(event, decision){
    console.log(`Search stopped`);
    stopSearch = decision;
    if(decision){
        dirSearched = [];
    }
    event.reply("search-stopped", decision);
});

/**
 * Searches for files as per the renderer process instructions
 * @param {event} event 
 * @param {Array} args - Object {type: audio|video, dir: directory path, criteria: filter, stop: false}
 */
async function search(event, args){
    let type = args.type;
    let dir = args.dir;
    let filter = args.criteria;
    if(dirSearched.indexOf(dir) != -1){
        return;
    }

    let finder = find(dir);

    if(stopSearch){
        event.reply("start-search-is-false", true);
        return;
    }

    finder.on("file", sendFile);

    finder.on("directory", function(dir, stat, stop){
        dirSearched.push(dir);
        if(stopSearch)stop();
    });

    /**
     * 
     * @param {string} file 
     * @param {*} stat 
     */
    async function sendFile(file, stat){
        if(filter.test(file)){
            fs.access(file, F_OK, (err)=>{

                if(err){
                    return;
                }

                let fullPath = file.replace(/\\/g, "/");
                let db = Utility.openDatabase(SQL);
                //console.log(file);
                function sendFile(ft, fullPath){
                    
                    if(typeof ft == 'undefined'){
                        db.run(`DELETE FROM ${type} WHERE source = ?`, [fullPath]);
                        Utility.closeDatabase(db);
                        return;
                    }
        
                    console.log('The ft object is ft and path is ', ft, fullPath);
                    let extname = ft.mime;
    
                    switch(type){
                        case "audio":
                            {
                                if(/audio\/*/.test(extname)){
                                    let id = db.exec(`SELECT id from ${type} where source = ?`, [fullPath]);
                                    let name = Utility.path.basename(fullPath, Utility.path.extname(fullPath));
    
                                    if(id.length < 1){
                                        db.exec(`INSERT INTO ${type}(playedTill, name, source) values (?, ?, ?)`, [0, name, fullPath]);
    
                                        id = db.exec(`SELECT id from ${type} where source = ?`, [fullPath]);
                                    }
                                    Utility.closeDatabase(db);
                                    if(id.length < 1){
                                        break;
                                    }
                                    console.log("sending reply");
                                    event.reply("search-result", {id: id[0].values[0][0],source: fullPath, type: type}, dirSearched);
                                    //console.log("found audio");
                                }
                                break;
                            }
                        case "video":
                            {
                                if(/video\/*/.test(extname)){
                                    let id = db.exec(`SELECT id from ${type} where source = ?`, [fullPath]);
                                    let name = Utility.path.basename(fullPath, Utility.path.extname(fullPath));
                                    if(id.length < 1){
                                        db.exec(`INSERT INTO ${type}(playedTill, name, source) values (?, ?, ?)`, [0, name, fullPath]);
    
                                        id = db.exec(`SELECT id from ${type} where source = ?`, [fullPath]);
                                    }
                                    Utility.closeDatabase(db);
                                    if(id.length < 1){
                                        break;
                                    }
                                    console.log("sending reply");
                                    event.reply("search-result",{id: id[0].values[0][0],source: fullPath, type: type}, dirSearched);
                                    
                                    //console.log("found video");
                                }
                                break;
                            }
                        default: 
                        {
                            console.error("file type is not defined for the manage.html");
                        }
                    }
                }
                
                fileType.fromFile(fullPath).then((ft)=>{
                    sendFile(ft, fullPath);
                })
                .catch(e =>{
                    console.log(`An error occured`,e);
                    if(typeof ft == 'undefined'){
                        db.run(`DELETE FROM ${type} WHERE source = ?`, [fullPath]);
                        Utility.closeDatabase(db);
                        return;
                    }
                });
            })
        }
    }
}

