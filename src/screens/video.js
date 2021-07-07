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

const VlcVideo = require('./../classes/VlcVideo');
const vlcVideo = new VlcVideo();
vlcVideo.mediaObject = document.querySelector("video");
vlcVideo.uiVolumeProgressColumn = document.getElementById("volumeProgressColumn");
vlcVideo.uiVolumeText = document.getElementById("volumeText");
vlcVideo.uiVideoProgressBar = document.getElementById("videoProgressBar");
vlcVideo.uiVolumeButtonImg = document.querySelector('#mute-volume');
vlcVideo.uiPlayButton = document.querySelector("#play-pause");
vlcVideo.uiCurrentTimeText = document.querySelector('#current-time');
vlcVideo.uiTotalDurationText = document.querySelector('#dur-time');
vlcVideo.uiNameText = document.querySelector('#media-name');
vlcVideo.uiPlaySpeedButton = document.querySelector('#play-speed');

const trigger = document.querySelector(".trigger");
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");


// playButton.addEventListener('click', function() {
//    if(!vlcVideo.isPlaying){
//        vlcVideo.play(); 
//        this.querySelector('img').src = "../assets/img/play_arrow_black_24dp.svg";
//    }
//    else{
//        vlcVideo.pause();
//        this.querySelector('img').src = "../assets/img/pause.svg";
//    }
// });

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

vlcVideo.activate();

ipcRenderer.send("window:resize", vlcVideo.mediaObject.videoHeight);

function toggleFullScreen() {
    maximize();
}

document.addEventListener("dblclick", toggleFullScreen);



/**
 *
 * @param {int} progress
 */
// function updateVolumeLevel(progress) {
//     max = 112; //maximum height of the bar
//     if (progress <= 100 && progress >= 0) {
//         if (progress == 95) {
//             volumeProgressColumn.classList.remove("rounded-t-none");
//         }
//         volumeText.innerHTML = progress;
//         volumeProgressColumn.style.height = `${Math.ceil(
//             (progress * max) / 100
//         )}px`;
//     }
// }

// volumeProgressColumn.style.height = "0px";
// videoProgressBar.style.width = "0px";

/**
 *
 * @param {int} progress
 */
// function updateVideoProgess(progress, totalDuration) {
//     max = videoProgressBar.parentElement.clientWidth;
//     let ratio = progress/totalDuration;
//     if (ratio * 100 >= 95) {
//         videoProgressBar.classList.remove("rounded-r-none");
//     }
//     videoProgressBar.style.width = `${Math.ceil(ratio * max)}px`;
// }

// //updating the seekbar
// vlcVideo.mediaObject.addEventListener('timeupdate', () =>{
//     updateVideoProgess(vlcVideo.getCurrentTime(), vlcVideo.getTotalDuration());
// });


// setInterval(() => {
//     mProgress++; 
//     updateVolumeLevel(mProgress);
// }, 100);


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

/**
 * #####################################################
 * Logic below
 * #####################################################
 * please keep all ui rendering above this below is for logic only.
 */
/**
 * Gets the link from the homescreen.
 */

 ipcRenderer.send('send-video-link', '');
 ipcRenderer.on('receive-video-link', (evt, link)=>{
     vlcVideo.setSrc(link);
 });



