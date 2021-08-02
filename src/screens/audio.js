//creates manager for audio
const Utility = require("./../classes/Utility");
const Manager = require("./../classes/Manager");

Utility.databasePath = remote.app.getPath("userData");

const theManager = new Manager();

//initial the vlcVideo object that will manage the played audio
const VlcAudio = require("./../classes/VlcAudio");
const vlcAudio = new VlcAudio();

//set the manager ManagedObject property to this audio.
theManager.managedObject = vlcAudio;
vlcAudio.myManager = theManager;

vlcAudio.mediaObject = document.querySelector("audio");
vlcAudio.uiAudioProgressBar = document.getElementById("progress-bar");
vlcAudio.uiPlayButton = document.querySelector("#play");
vlcAudio.uiCurrentTimeText = document.querySelector("#current_time");
vlcAudio.uiTotalDurationText = document.querySelector("#total_time");
vlcAudio.uiNameText = document.querySelector("#title");
vlcAudio.uiArtistText = document.querySelector("#artist");
vlcAudio.uiProgressBarInputRange = document.querySelector("#audio-input-range");
vlcAudio.uiNextButton = document.querySelector("#next");
vlcAudio.uiPreviousButton = document.querySelector("#previous");
vlcAudio.uiReplayButton = document.querySelector("#replay");
vlcAudio.uiLikeButton = document.querySelector("#like");

//vlcAudio.activate(); //activates all event listeners for the audio
theManager.manage(); //calls the manager to manage the audios

function setPath(link) {
    console.log(`table row was clicked`);
    theManager.setSrc(Utility.path.resolve(__dirname, link));
    console.log(`Successfully set the link of the audio`);
}
// ipcRenderer.send("send-audio-link", "");
// ipcRenderer.on("receive-audio-link", (evt, link) => {
//     //the audio manager than sets the source

//     theManager.setSrc(Utility.path.resolve(__dirname, link));
// });

const getAudioWindow = () => remote.BrowserWindow.getFocusedWindow();
const closeBtn = document.getElementById("close");
const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const toHomescreen = document.getElementById("toHomescreen");

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
