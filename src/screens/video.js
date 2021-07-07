const remote = require("electron").remote;
const { ipcRenderer } = require("electron");

const getWindow = () => remote.BrowserWindow.getFocusedWindow();

const closeBtn = document.getElementById("close");
const video = document.querySelector("video");
const trigger = document.querySelector(".trigger");

let mProgress = 0;

video.addEventListener(
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

ipcRenderer.send("window:resize", video.videoHeight);

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
function toggleFullScreen() {
    if (video.requestFullScreen) {
        video.requestFullScreen();
    }
    if (video.webkitRequestFullScreen) {
        video.webkitRequestFullScreen();
    }
    if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
    }
}
//document.addEventListener("dblclick", toggleFullScreen);

const volumeProgressColumn = document.getElementById("volumeProgressColumn");
const volumeText = document.getElementById("volumeText");

volumeProgressColumn.style.height = "0px";

/**
 *
 * @param {int} progress
 */
function updateVolumeLevel(progress) {
    max = 112;
    if (progress <= 100 && progress >= 0) {
        if (progress == 95) {
            volumeProgressColumn.classList.remove("rounded-t-none");
        }
        volumeText.innerHTML = progress;
        volumeProgressColumn.style.height = `${Math.ceil(
            (progress * max) / 100
        )}px`;
    }
}

const videoProgressBar = document.getElementById("videoProgressBar");
videoProgressBar.style.width = "0px";

/**
 *
 * @param {int} progress
 */
function updateVideoProgess(progress) {
    max = 384;
    if (progress <= 100 && progress >= 0) {
        if (progress == 95) {
            videoProgressBar.classList.remove("rounded-r-none");
        }
        videoProgressBar.style.width = `${Math.ceil((progress * max) / 100)}px`;
    }
}

setInterval(() => {
    mProgress++;
    updateVideoProgess(mProgress);
    updateVolumeLevel(mProgress);
}, 100);

const modal = document.querySelector(".modal");

const closeButton = document.querySelector(".close-button");

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
