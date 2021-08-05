//const remote = require("electron").remote;
//const ipcRenderer = require("electron").ipcRenderer;

const fs = require("fs");
const EventEmitter = require("events");
const Utility = require("../classes/Utility");
const initSqlJs = require("sql.js");
const fileType = require("file-type");
const Manager = require("../classes/Manager");
const VlcMediaContent = require("../classes/VlcMediaContent");
const VlcAudio = require("../classes/VlcAudio");
const VlcVideo = require("../classes/VlcVideo");
const ListManager = require("../classes/ListManager");

Utility.databasePath = remote.app.getPath("userData");
var SQL; //global SQL from initJs to be used by all functions

const getAudioWindow = () => remote.BrowserWindow.getFocusedWindow();
const closeBtn = document.getElementById("close");
const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const toHomescreen = document.getElementById("toHomescreen");
var type = "audio";
var stopSearch = false; //tell main render to stop the search
var pendingSearch = false;
var rows = []; //rows from the database

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
const allMusicText = document.querySelector("#all-music-text");
var tableTitle = document.getElementById("table-header-title");

let isVideosList = false;

function showTab() {
    videoTabBtn.classList.toggle("active-tab");
    videoTabBtn.classList.toggle("text-gray-500");
    musicTabBtn.classList.toggle("active-tab");
    musicTabBtn.classList.toggle("text-gray-500");
    type = "audio";
    allMusicText.innerHTML = "ALL MUSIC";
    tableTitle.innerHTML = "Artist/Song";
    if (!isVideosList) {
        type = "video";
        isVideosList = !isVideosList;
        allMusicText.innerHTML = "ALL VIDEO";
        tableTitle.innerHTML = "Video";
    }
    stopSearch = true;
    pendingSearch = false;
    activeMenu.click();
    //ipcRenderer.send("stop-search", stopSearch);
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
var activeMenu = allMusicBtn;

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

/**
 * Update UI for the listing of all music or video
 *
 */
function updateUIForList() {
    if (activeMenu != allMusicBtn) {
        return;
    }

    while (
        type == "audio"
            ? foundAudioFiles.length > 0
            : foundVideoFiles.length > 0
    ) {
        let source;
        let id;
        if (type == "video") {
            source = foundVideoFiles[0].source;
            id = foundVideoFiles[0].id;
        } else {
            source = foundAudioFiles[0].source;
            id = foundAudioFiles[0].id;
        }

        if (document.getElementById(source) != null) {
            continue;
        }

        let media =
            type == "audio"
                ? document.createElement("audio")
                : document.createElement("video");
        media.src = source;
        media.addEventListener("loadedmetadata", function () {
            if (document.getElementById(source) != null) {
                return;
            }
            let mediaObject = new VlcMediaContent(type);
            mediaObject.mediaObject = media;
            let formatedDuration = mediaObject.formatTime()[1];
            let name = Utility.path.basename(
                source,
                Utility.path.extname(source)
            );
            let isFav = false;
            if (typeof SQL != "undefined") {
                let db = Utility.openDatabase(SQL);
                let isFavResult = db.exec(
                    `SELECT favorite from ${type} where source = ?`,
                    [source]
                );
                Utility.closeDatabase(db);
                if (isFavResult.length > 0) {
                    isFavResult = isFavResult[0].values[0][0];
                    isFav = isFavResult == 1;
                }
            }
            let item = itemHTMLFormat(
                id,
                name,
                "Unknown Artist",
                formatedDuration,
                source,
                isFav
            );

            resultHolder.innerHTML += item;
        });

        type == "audio" ? foundAudioFiles.shift() : foundVideoFiles.shift();
    }
}

/**
 * Make the list for the found item
 * @param {int} id
 * @param {string} name
 * @param {string} artistName
 * @param {string} duration
 * @param {string} source
 * @param {string} isFav
 * @returns
 */
function itemHTMLFormat(id, name, artistName, duration, source, isFav) {
    source = source.replace(/\\/g, "/");
    let listItem = `<tr id="${source}"
      class="bg-gray-50 
             dark:bg-gray-800 
             hover:bg-yellow-200 
             dark:hover:bg-gray-900 
             text-gray-700 
             dark:text-gray-400"
             
             >
    <td class="px-4 py-3" oncontextmenu="showContextMenu(event, 'test')">
      <div class="flex items-center text-sm">
        <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
          <img class="object-cover w-full h-full rounded-full" src="../assets/img/vlc-playing.png" alt="" loading="lazy" />
          <div class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></div>
        </div>
        <div onclick = "playItem(${source})">
          ${type == "audio" ? "<p class=''>" + artistName + "</p>" : ""}
          <p class="text-lg font-semi-bold text-gray-600 dark:text-gray-400 truncate overflow-ellipsis w-72 lg:w-96">${name}</p>
        </div>
      </div>
    </td>
    <td class="px-4 py-3 text-sm" oncontextmenu="showContextMenu(event, 'test')">${duration}</td>
    <td class="px-4 py-3 text-xs" oncontextmenu="showContextMenu(event, 'test')">
      <span onclick="listManager.addToQueue(${source}, '${this.type}')" 
            class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-700"> + </span>
    </td>
    <td class="px-4 py-3 text-sm" oncontextmenu="showContextMenu(event, 'test')">
      <div onclick="likeItem(${id}, ${isFav})"
           class="text-${isFav ? "red" : "gray"}-500">
        <svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z"/></svg>
    </div>
    </td>`;

    return listItem;
}

/**
 * Listing all the found files from the main process
 */
function listAllMedia() {
    resultHolder.innerHTML = "";

    (async () => {
        SQL = await initSqlJs();
        const db = Utility.openDatabase(SQL);

        let result = db.exec(`SELECT source, id, name, favorite from ${type}`);
        Utility.closeDatabase(db);

        if (result.length < 1) {
            resultHolder.innerHTML = Utility.openMediaHtml(type);
            return;
        }

        rows = result[0].values;
        if (rows.length < 1) {
            resultHolder.innerHTML = Utility.openMediaHtml(type);
        }

        //let j = 0;
        console.log(result);
        console.log(`The rows are: `);
        console.log(rows);
        searchDirectories([]);
    })();
}

/**
 *
 * @param {array} rows - result from the sql query
 * @param {array} dirSearched - directories searched
 */
function searchDirectories(dirSearched) {
    if (typeof rows[0] == "undefined") {
        return;
    }
    let dir1 = Utility.path.dirname(rows[0][0]).replace(/\\{1}/g, "/");
    //let dir2 = Utility.path.dirname(dir1);
    console.log("directory being searched " + dir1);
    let criteria = /.*/;
    if (dirSearched.indexOf(dir1) == -1) {
        ipcRenderer.send("start-search", {
            type: type,
            dir: dir1,
            criteria: criteria,
        });
    }
    rows.shift();
}

/**
 *
 * @param {*} event
 * @param {Array} fileObject - {id: id,source: fullPath, type: type}
 */
function searchResult(event, fileObject, dirSearched) {
    console.log("new search result", fileObject);
    if (fileObject.type != type) {
        ipcRenderer.send("stop-search", true);
        return;
    }

    switch (type) {
        case "audio": {
            foundAudioFiles.push(fileObject);
            break;
        }
        case "video": {
            foundVideoFiles.push(fileObject);
            break;
        }
        default: {
            console.log("no type is set");
        }
    }

    fileFoundListener.emit("file");
    searchDirectories(dirSearched);
}

ipcRenderer.on("search-stopped", function (event, decision) {
    searchStop = decision;

    if (pendingSearch && ipcRenderer.invoke("clear-directory-array")) {
        searchStop = false;
        listAllMedia();
    }
});

ipcRenderer.on("start-search-is-false", function (event, decision) {
    if (decision && pendingSearch) {
        ipcRenderer.send("stop-search", stopSearch);
        listAllMedia();
    }
});

ipcRenderer.on("search-result", searchResult);

function toggleActiveMenu(li) {
    activeMenu.classList.toggle("bg-yellow-500");
    activeMenu = li;
    activeMenu.classList.toggle("bg-yellow-500");
}

//update the ui when searching is done
fileFoundListener.addListener("file", updateUIForList);

//list all the media
allMusicBtn.addEventListener("click", () => {
    toggleActiveMenu(allMusicBtn);
    stopSearch = false;
    //the search is started when the main process notify us of search-stopped event
    ipcRenderer.send("stop-search", stopSearch);
    pendingSearch = true;
    console.log(`pending search is ${pendingSearch}`);
});

//click allMusicBtn initially
allMusicBtn.click();

// for the minimal player
// Assuming that the manage.js has been called already.
// If the manage.js is not called, this script will craft

let vlcAudio = new VlcAudio();
let vlcVideo = new VlcVideo();

let uiPlayButton = document.getElementById("play-button");
let uiNextButton = document.getElementById("next-button");
let uiPreviousButton = document.getElementById("previous-button");
let uiProgressInputRange = document.getElementById("progress-input-range");
let uiShuffleButton = document.getElementById("shuffle-button");
let uiLoopButton = document.getElementById("play-in-loop");
let uiArtistTitle = document.getElementById("artist-title");
let uiMediaTitle = document.getElementById("media-title");
let uiLikeButton = document.getElementById("like-button");
let currentAudio = document.getElementById("currently-playing-audio");
let currentVideo = document.getElementById("currently-playing-video");
let uiTotalDuration = document.getElementById("dur-time");
let uiCurrentTime = document.getElementById("cur-time");

//assigning the media objects
vlcVideo.mediaObject = currentVideo;
vlcAudio.mediaObject = currentAudio;
vlcAudio.uiNameText = uiMediaTitle;
vlcVideo.uiNameText = uiMediaTitle;
vlcVideo.uiCurrentTimeText = uiCurrentTime;
vlcAudio.uiCurrentTimeText = uiCurrentTime;
vlcVideo.uiTotalDurationText = uiTotalDuration;
vlcAudio.uiTotalDurationText = uiTotalDuration;

let audioManager = new Manager();
let videoManager = new Manager();

let listManager = new ListManager();

//assigning the managers
function assignManagers(){
    audioManager.managedObject = vlcAudio;
    vlcAudio.setManager(audioManager);

    videoManager.managedObject = vlcVideo;
    vlcVideo.setManager(videoManager);
}

//reassign managers when stuff change
function retireAndAssignManagers(){
    audioManager = new Manager();
    videoManager = new Manager();
    assignManagers();
}

//remanage objects when their link change
function reManage(src){
    switch(type)
    {
        case "audio":
            {
                audioManager.setSrc(src);
                audioManager.manage();
                break;
            }
        case "video":
            {
                videoManager.setSrc(src);
                videoManager.manage();
            }
    }
}

uiPlayButton.addEventListener("click", function(){
    switch(type){
        case "audio":
            {
                if(vlcAudio.isPlaying){
                    //change the icon
                }else{

                }
                vlcAudio.playPause();
                break;
            }
        case "video":
            {
                if(vlcVideo.isPlaying){
                    //change the icon
                }else{

                }
                vlcVideo.playPause();
                break;
            }
    }
});

//
currentAudio.addEventListener('timeupdate', function(){
    updateSlider(this);
});
currentVideo.addEventListener('timeupdate', function(){
    updateSlider(this);
});

function updateSlider(element){
    let ratio = element.currentTime/element.duration;
    uiProgressInputRange.value = ratio * 100;
    switch(type){
        case "video":
            {
                uiCurrentTime.innerHTML = vlcVideo.formatTime(element.currentTime)[0];
                uiTotalDuration.innerHTML = vlcAudio.formatTime()[1];
                break;
            }
        case "audio":
            {
                uiCurrentTime.innerHTML = vlcVideo.formatTime(element.currentTime)[0];
                uiTotalDuration.innerHTML = vlcAudio.formatTime()[1];
                break;
            }
    }
}

uiProgressInputRange.addEventListener("input", function(){
    switch(type){
        case "video":
            {
                vlcVideo.setCurrentTime(this.value/100 * vlcVideo.getTotalDuration());
                break;
            }
        case "audio":
            {
                vlcAudio.setCurrentTime(this.value/100 * vlcAudio.getTotalDuration());
                break;
            }
    }
});

//get the link of the audio from the main process
console.log("here");

ipcRenderer.invoke("receive-link", ""). then(link => {
    console.log("invoking link");
    
    _type = link.type;
    link = link.link;
    if(type !== _type){
        showTab();
    }
    if(link == ""){
        playRecentAudio();
        return;
    }
    retireAndAssignManagers();
    reManage(link);
    console.log("The link object is: ",link);
}); 

//get the most recent audio
function playRecentAudio(){
    if(type == "audio" && currentAudio.src == ""){

        let db = Utility.openDatabase(SQL);
        recentAudios = db.exec(
            "SELECT source from recentAudio inner join audio on audio.id = audioId order by datePlayed DESC"
        );
            
        console.log(recentAudios);

        if(recentAudios.length > 0 && recentAudios[0].values.length > 0){
            let ra = recentAudios[0].values[0];
            let audioSource = ra[0];
            retireAndAssignManagers();
            reManage(audioSource);
        }
    }
}

