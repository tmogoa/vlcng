const fs = require("fs");
const EventEmitter = require("events");
const Utility = require("../classes/Utility");
const initSqlJs = require("sql.js");
const fileType = require("file-type");
const Manager = require("../classes/Manager");
const VlcMediaContent = require("../classes/VlcMediaContent");

//const { remote, ipcRenderer } = require("electron");
console.log(remote);

Utility.databasePath = remote.app.getPath("userData");

const getAudioWindow = () => remote.BrowserWindow.getFocusedWindow();
const closeBtn = document.getElementById("close");
const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const toHomescreen = document.getElementById("toHomescreen");
var type = "audio";

 
closeBtn.onclick = (e) => {
    getAudioWindow().close();
    console.log("close clicked");
};

minimizeIcon.onclick = (e) => {
    getAudioWindow().minimize();
    console.log("close clicked");
};

maximizeIcon.onclick = (e) => {
    maximize();
    console.log("close clicked");
};

toHomescreen.onclick = (e) => {
    routeToHomeScreen();
};

function maximize() {
    const window = getAudioWindow();
    window.isMaximized() ? window.unmaximize() : window.maximize();
}

function routeToHomeScreen() {
    getAudioWindow().loadFile("./src/screens/homescreen.html");
}

//START OF TAB SWITCHERS
const videoTabBtn = document.getElementById("videoTabBtn");
const musicTabBtn = document.getElementById("musicTabBtn");

let isVideosList = false;
let stop = false;

function showTab() {
    videoTabBtn.classList.toggle("active-tab");
    videoTabBtn.classList.toggle("text-gray-500");
    musicTabBtn.classList.toggle("active-tab");
    musicTabBtn.classList.toggle("text-gray-500");     
    type = "audio";
    if(!isVideosList){
        type = "video";
        isVideosList = !isVideosList;
    }
    stop = true;
}
videoTabBtn.onclick = showTab;
musicTabBtn.onclick = showTab;
//END OF TAB SWITCHERS

//Playlist form
const addPlaylistTrigger = document.querySelector("#add-playlist-trigger");
const closePlaylistForm = document.querySelector("#close-playlist-button");
const modal = document.querySelector(".modal");

addPlaylistTrigger.addEventListener("click", toggleModal); 

closePlaylistForm.addEventListener("click", toggleModal);

//for the menu
const allMusicBtn = document.querySelector("#all-music-button");
const queueBtn = document.querySelector("#queue-button");
const recentlyPlayedBtn = document.querySelector("#recently-played-button");
const settingBtn = document.querySelector("#settings-button");
const playlistList = document.querySelector("#playlist-list-ul");
const resultHolder = document.querySelector("#result-holder");
var activeTab = allMusicBtn;
var dirsSearched = [];



function toggleModal() {
    console.log("Toggling modal");
    modal.classList.toggle("show-modal");
    modal.classList.add("trans-class");

}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

//the file paths are placed in one of these arrays
var foundAudioFiles = [];
var foundVideoFiles = [];

let fileFoundListener = new EventEmitter();



//This function recursively searches the users computer for all the media items of specific type



/**
 * 
 * @param {error} err 
 * @param {string[]} files 
 * @returns 
 */
function foundfiles(currentDir, err, files, type){
    if(err){
        console.error(err);
        return;
    }

    let i = 0;
    let checkFile = async()=>{
        if(files.length > i){
            let file = files[i];
            if(typeof file == 'undefined'){
                return;
            }
            let fullPath = `${currentDir}${Utility.path.sep}${file.name}`;
            fullPath = fullPath.replace(/\\{1}/g, "/");
    
            console.log(`Directories searched`);
            console.log(dirsSearched);
    
            if(file.isDirectory() && dirsSearched.indexOf(fullPath) == -1){
                console.log(`new directory called ${fullPath} is being searched`);
                dirsSearched.push(fullPath);
                //dirsSearched.sort();
    
    
                console.log(`Directories searched ${dirsSearched.length}`);
                findAllFiles(fullPath, type, foundfiles);
            }
    
            if(file.isFile()){
    
                let ft = await fileType.fromFile(fullPath);
    
                if(typeof ft == 'undefined'){
                    return;
                }
    
                let extname = ft.mime;
    
                switch(type){
                    case "audio":
                        {
                            if(/audio\/*/.test(extname)){
                                foundAudioFiles.push(fullPath);
                                fileFoundListener.emit("file");
                                console.log("found audio");
                            }
                            break;
                        }
                    case "video":
                        {
                            if(/video\/*/.test(extname)){
                                foundVideoFiles.push(fullPath);
                                fileFoundListener.emit("file");
                                console.log("found video");
                            }
                            break;
                        }
                    default: 
                    {
                        console.error("file type is not defined for the manage.html");
                    }
                }
            }
            setTimeout(checkFile, 0);
        }
        i++;
    }

    setTimeout(checkFile, 0);
    
}

async function findAllFiles(directory, type, foundfiles){

    fs.readdir(directory, {withFileTypes: true},(err, files)=>{
        foundfiles(directory, err, files, type);
    });
}


/**
 * Update UI for the listing of all music or video
 * 
 */
function updateUI(){
    let currentArray = (type == "audio")?foundAudioFiles : foundVideoFiles;
    

    while((type == "audio")?foundAudioFiles.length > 0 : foundVideoFiles.length > 0){
        let source = foundAudioFiles[0];

        if(type == "video"){
            source = foundVideoFiles[0];
        }

        let media = (type == "audio")? document.createElement("audio") : document.createElement("video");
        media.src = source;
        media.addEventListener("loadedmetadata", function(){
            let mediaObject = new VlcMediaContent(type);
            mediaObject.mediaObject = media;
            let formatedDuration = mediaObject.formatTime()[1];
            let name = Utility.path.basename(source, Utility.path.extname(source));

            let item = itemHTMLFormat(name, "UNKNOWN", formatedDuration, source, true );
            resultHolder.innerHTML += item;
        });

        (type == "audio")?foundAudioFiles.shift():foundVideoFiles.shift();
    }
}

/**
 * Make the list for the found item
 * @param {string} name 
 * @param {string} artistName 
 * @param {string} duration
 * @param {string} source 
 * @param {string} isFav 
 * @returns
 */
function itemHTMLFormat(name, artistName, duration, source, isFav){

    source = source.replace(/\\/g, "/");
      let listItem = `<tr
      class="bg-gray-50 
             dark:bg-gray-800 
             hover:bg-yellow-200 
             dark:hover:bg-gray-900 
             text-gray-700 
             dark:text-gray-400"
             >
    <td class="px-4 py-3">
      <div class="flex items-center text-sm">
        <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
          <img class="object-cover w-full h-full rounded-full" src="../assets/img/vlc-playing.png" alt="" loading="lazy" />
          <div class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></div>
        </div>
        <div onclick = "playItem(${source})">
          <p class="">${artistName}</p>
          <p class="text-xl font-semi-bold text-gray-600 dark:text-gray-400">${name}</p>
        </div>
      </div>
    </td>
    <td class="px-4 py-3 text-sm">${duration}</td>
    <td class="px-4 py-3 text-xs">
      <span onclick="theManager.addToQueue(${source}, '${this.type}')" 
            class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-700"> + </span>
    </td>
    <td class="px-4 py-3 text-sm">
      <div id="like"
           class="text-${(isFav)?"red":"gray"}-500">
        <svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z"/></svg>
    </div>
    </td>`;

    return listItem;
  }

//list all the media
allMusicBtn.addEventListener('click', listAllMedia);

fileFoundListener.addListener("file", updateUI);

function listAllMedia(){
    activeTab = allMusicBtn;
    dirsSearched = [];
    stop = false;
    resultHolder.innerHTML = "";

    (async()=>{
        const SQL = await initSqlJs();
        const db = Utility.openDatabase(SQL);
        
        let result = db.exec(`SELECT source, id from ${type}`);
        Utility.closeDatabase(db);

        if(result.length < 1){
            return;
        }

        let rows = result[0].values;
        
        let j = 0;
        console.log(result);
        console.log(rows);

        let loopRows = ()=>{
            if(j < rows.length){
                let dir1 = Utility.path.dirname(rows[j][0]).replace(/\\{1}/g, "/");
                let dir2 = Utility.path.dirname(dir1);
                console.log("directory being searched "+ dir2);
                findAllFiles(dir2, type, foundfiles);
            }else{
                clearTimeout(loopRows);
            }
            j++
        }

        setInterval(loopRows, 0);
        
    })();

}




