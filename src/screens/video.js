const remote = require("electron").remote;
const { ipcRenderer } = require("electron");


// ########
// windows controls
// ########
const getWindow = () => remote.BrowserWindow.getFocusedWindow();
const closeBtn = document.getElementById("close");
const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");

closeBtn.onclick = (e) => {
    getWindow().close();
};

minimizeIcon.onclick = (e) => {
    getWindow().minimize();
};

maximizeIcon.onclick = (e) => {
    maximize();
};

function maximize() {
    const window = getWindow();
    window.isMaximized() ? window.unmaximize() : window.maximize();
}


// #########
// UI controls
// #########

//create the manager for this video
const Utility = require("./../classes/Utility");
const Manager = require("./../classes/Manager");

Utility.databasePath = remote.app.getPath("userData");

const theManager = new Manager();

//initial the vlcVideo object that will manage the played video
const VlcVideo = require("./../classes/VlcVideo");
const vlcVideo = new VlcVideo();

//set the manager ManagedObject property to this video.
theManager.managedObject = vlcVideo;
vlcVideo.myManager = theManager;

vlcVideo.id = document.getElementById("video-id");
vlcVideo.mediaObject = document.querySelector("video");
vlcVideo.uiVolumeLevelBar = document.getElementById("volume-level-indicator");
vlcVideo.uiVolumeText = document.getElementById("volumeText");
vlcVideo.uiVideoProgressBar = document.getElementById("progress-indicator");
vlcVideo.uiVolumeButtonImg = document.querySelector("#mute-volume");
vlcVideo.uiPlayButton = document.querySelector("#play-pause");
vlcVideo.uiCurrentTimeText = document.querySelector("#current-time");
vlcVideo.uiTotalDurationText = document.querySelector("#dur-time");
vlcVideo.uiNameText = document.querySelector("#media-name");
vlcVideo.uiPlaySpeedButton = document.querySelector("#play-speed");
vlcVideo.uiVolumeInputRange = document.querySelector("#volume-input-range");
vlcVideo.uiProgressBarInputRange = document.querySelector("#progress-bar-input-range");

const trigger = document.querySelector(".trigger");
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");

console.log( "Directory name is: " +Utility.path.resolve(__dirname));

vlcVideo.mediaObject.addEventListener(
    "loadedmetadata",
    function (e) {
        console.log("video " + this.videoWidth);
        ipcRenderer.send(
            "window:resize",
            (800 * this.videoHeight) / this.videoWidth
        );
    },
    false
);

vlcVideo.activate(); //activates all event listeners for the video
theManager.manage();//calls the manager to manage the videos

ipcRenderer.send("window:resize", vlcVideo.mediaObject.videoHeight);

function toggleFullScreen() {
    maximize();
}

document.addEventListener("dblclick", toggleFullScreen);

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

let timeoutId;
const floatingMenu = document.getElementById("floatingMenu");

function listenForChanges() {
    // floatingMenu.style.visibility = "visible";
    // if (timeoutId) {
    //     clearTimeout(timeoutId);
    // }

    // timeoutId = setTimeout(() => {
    //     //save article to db after 1s inactivity
    //     floatingMenu.style.visibility = "hidden";
    // }, 1000);
}

function autoShowMenu() {
    vlcVideo.mediaObject.addEventListener("mouseover", listenForChanges);
}

autoShowMenu();
/**
 * #####################################################
 * Logic below
 * #####################################################
 * please keep all ui rendering above this below is for logic only.
 */
/**
 * Gets the link from the homescreen.
 */


//change this to invoke later.
ipcRenderer.send("send-video-link", "");
ipcRenderer.on("receive-video-link", (evt, link) => {
    //the video manager than sets the source
    
    theManager.setSrc(Utility.path.resolve(__dirname,link));
});


