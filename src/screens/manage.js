const fs = require("fs");
const EventEmitter = require("events");
const Utility = require("../classes/Utility");

const getAudioWindow = () => remote.BrowserWindow.getFocusedWindow();
const closeBtn = document.getElementById("close");
const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const toHomescreen = document.getElementById("toHomescreen");
var type = "audio";
var activeTab = allMusicBtn;
 
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
    console.log(`New i and i = ${i}`);

    let checkFile = ()=>{
        if(files.length > i){
            let file = files[i];
            let fullPath = `${currentDir}${Utility.path.sep}${file.name}`;
            fullPath = fullPath.replace(/\\{1}/g, "/");

            if(file.isDirectory() && Utility.binSearch(dirsSearched, fullPath) == -1){
                console.log(`new directory called ${fullPath} is being searched`);
                dirsSearched.push(fullPath);

                findAllFiles(fullPath, 'video', foundfiles);
            }

            console.log(Utility.path.extname(file.name))
            if(Utility.path.extname(file.name) == ".mp3"){
                console.log("is music");
                foundAudioFiles.push(currentDir + "/" + file.name);
                fileFoundListener.emit("file");
            }
            else if((/\.mp4|\.m4v|\.wmv/).test(Utility.path.extname(file.name))){
                console.log("is video");
                foundVideoFiles.push(currentDir + "/" + file.name);
                fileFoundListener.emit("file");
            }
        }
        
        if(i == files.length){
            clearInterval(checkFile);
        }

        i++;
    }
    
    setInterval(checkFile, 0);
    
}

async function findAllFiles(directory, type, foundfiles){

    fs.readdir(directory, {withFileTypes: true},(err, files)=>{
        foundfiles(directory, err, files, type);
    });
}

fileFoundListener.on("file", ()=>{
    console.log(foundAudioFiles, foundVideoFiles);
});

//list all the media
allMusicBtn.addEventListener('click', ()=>{
    activeTab = allMusicBtn;
    dirsSearched = [];

    (async()=>{
        const SQL = await initSqlJs();
        let filesManager = new Manager();
        const db = Utility.openDatabase(SQL);
        
        
    })();

});

//constructs either a temporary vlc video or audio object
function constructMediaObject(type){
    let mediaObject;
    switch(type){
        case "video":
            {
                mediaObject = new VlcVideo();
                let video = document.createElement('video');
                mediaObject.mediaObject = video;
                break;
            }
        case "audio":
            {
                mediaObject = new VlcAudio();
                let audio = document.createElement('audio');
                mediaObject.mediaObject = audio;
                break;
            }
    }
    return mediaObject;
}

findAllFiles("C:/Users/Levi Kamara Zwannah/Videos", 'video', foundfiles);



