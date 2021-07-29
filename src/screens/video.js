const remote = require("electron").remote;
const { ipcRenderer } = require("electron");

// ########
// windows controls
// ########
const getWindow = () => remote.BrowserWindow.getFocusedWindow();
const closeBtn = document.getElementById("close");
const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const titleBar = document.getElementById("titleBar");

closeBtn.onclick = (e) => {
    getWindow().close();
    console.log("close clicked");
};

minimizeIcon.onclick = (e) => {
    getWindow().minimize();
    console.log("close clicked");
};

maximizeIcon.onclick = (e) => {
    maximize();
    console.log("close clicked");
};

function maximize() {
    const window = getWindow();
    if (window.isMaximized()) {
        window.unmaximize();
        titleBar.classList.toggle("hidden");
    } else {
        window.maximize();
        titleBar.classList.toggle("hidden");
    }
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
vlcVideo.uiProgressBarInputRange = document.querySelector(
    "#progress-bar-input-range"
);

vlcVideo.uiBookmarkButton = document.querySelector("#bookmarkBtn");
vlcVideo.uiProgressBarInputRange = document.querySelector(
    "#progress-bar-input-range"
);
vlcVideo.uiBookmarkCloseButton = document.querySelector(
    "#close-bookmark-button"
);

const trigger = document.querySelector(".trigger");
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");

console.log("Directory name is: " + Utility.path.resolve(__dirname));

//Just making the window size match the video's dimensions
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

function toggleFullScreen() {
    maximize();
}

document.addEventListener("dblclick", toggleFullScreen);

function toggleModal() {
    modal.classList.toggle("show-modal");
    modal.classList.add("trans-class");
    theManager.managedObject.playPause();
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

vlcVideo.activate(); //activates all event listeners for the video
theManager.manage(); //calls the manager to manage the videos

ipcRenderer.send("window:resize", vlcVideo.mediaObject.videoHeight);

let timeoutId;
const floatingMenu = document.getElementById("floatingMenu");

function listenForChanges() {
    floatingMenu.style.visibility = "visible";
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        floatingMenu.style.visibility = "hidden";
    }, 2000);
}

function autoShowMenu() {
    window.addEventListener("mousemove", listenForChanges);
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

ipcRenderer.invoke("receive-video-link", "").then((link) =>{
    let resolvedLink = Utility.path.resolve(link);

    console.log(`- The resolved link from the main process: ${resolvedLink}\n`);
    theManager.setSrc(link);
});

const volControlBtn = document.getElementById("volume-control-button");
const volProgressContainer = document.getElementById("vol-progress-container");
const tfButton = document.getElementById("toggle-fullscreen-button");

tfButton.onclick = toggleFullScreen;
volControlBtn.addEventListener("mouseover", function (e) {
    volProgressContainer.classList.remove("invisible");
});
volControlBtn.addEventListener("mouseleave", function (e) {
    volProgressContainer.classList.add("invisible");
});
