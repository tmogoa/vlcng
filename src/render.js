const remote = require("electron").remote;
const { ipcRenderer } = require("electron");

const getWindow = () => remote.BrowserWindow.getFocusedWindow();

const closeBtn = document.getElementById("close");
const video = document.querySelector("video");
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
document.addEventListener("dblclick", toggleFullScreen);
