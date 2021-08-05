const remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const Wave = require("@foobar404/wave");

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

toHomescreen.onclick = (e) => {
    routeToHomeScreen();
};

function routeToHomeScreen() {
    getWindow().loadFile("./src/screens/homescreen.html");
}

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

//create the manager for this audio
const Utility = require("../classes/Utility");
const Manager = require("../classes/Manager");

Utility.databasePath = remote.app.getPath("userData");

const theManager = new Manager();

//initial the vlcAudio object that will manage the played audio
const VlcAudio = require("../classes/VlcAudio");
const vlcAudio = new VlcAudio();

//set the manager ManagedObject property to this audio.
theManager.managedObject = vlcAudio;
vlcAudio.myManager = theManager;

vlcAudio.id = document.getElementById("audio-id");
vlcAudio.mediaObject = document.querySelector("audio");
vlcAudio.uiVolumeLevelBar = document.getElementById("volume-level-indicator");
vlcAudio.uiVolumeText = document.getElementById("volumeText");
vlcAudio.uiAudioProgressBar = document.getElementById("progress-indicator");
vlcAudio.uiVolumeButtonImg = document.querySelector("#mute-volume");
vlcAudio.uiPlayButton = document.querySelector("#play-pause");
vlcAudio.uiCurrentTimeText = document.querySelector("#current-time");
vlcAudio.uiTotalDurationText = document.querySelector("#dur-time");
vlcAudio.uiNameText = document.querySelector("#media-name");
vlcAudio.uiPlaySpeedButton = document.querySelector("#play-speed");
vlcAudio.uiVolumeInputRange = document.querySelector("#volume-input-range");
vlcAudio.uiProgressBarInputRange = document.querySelector(
    "#progress-bar-input-range"
);

vlcAudio.uiBookmarkButton = document.querySelector("#bookmarkBtn");
vlcAudio.uiProgressBarInputRange = document.querySelector(
    "#progress-bar-input-range"
);
vlcAudio.uiBookmarkCloseButton = document.querySelector(
    "#close-bookmark-button"
);

const trigger = document.querySelector(".trigger");
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");

console.log("Directory name is: " + Utility.path.resolve(__dirname));

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

vlcAudio.activate(); //activates all event listeners for the audio
theManager.manage(); //calls the manager to manage the audios

ipcRenderer.send("window:resize", vlcAudio.mediaObject.audioHeight);

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

ipcRenderer.invoke("receive-audio-link", "").then((link) => {
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
//trying sth
var canv = document.getElementById('output');
var ctx = canv.getContext('2d');
window.devicePixelRatio = 1;
var size = 1100;
canv.style.width = size + "px";
canv.style.height = size + "px";
  
var scale = window.devicePixelRatio; 
            
canv.width = Math.floor(size * scale);
canv.height = Math.floor(size * scale);
  
        //CSS pixels for coordinate systems
ctx.scale(scale, scale);
        //ctx.font = '10px Arial';
       // ctx.textAlign = 'center';
       // ctx.textBaseline = 'middle';
  
var x = size / 2;
var y = size / 2;
  
       
        // ctx.fillText(textString, x, y);

let wave = new Wave();
wave.fromElement("audio-elem", "output", {
    type: "static",
    colors: ["pink", "green", "blue"],
});

console.log(navigator);

// navigator.mediaDevices
//     .getUserMedia({
//         audio: true,
//     })
//     .then(function (stream) {
//         wave.fromStream(stream, "output", {
//             type: "shine",
//             colors: ["red", "white", "blue"],
//         });
//         console.log(stream);
//     })
//     .catch(function (err) {
//         console.log(err.message);
//         console.log("test log.");
//     });
