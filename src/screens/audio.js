//creates manager for audio
const Utility = require("./../classes/Utility");
const Manager = require("./../classes/Manager");

Utility.databasePath = remote.app.getPath("userData");

const Manager1 = new Manager();

//initial the vlcVideo object that will manage the played audio
const VlcAudio = require("./../classes/VlcAudio");
const vlcAudio = new VlcAudio();

//set the manager ManagedObject property to this audio.
Manager1.managedObject = vlcAudio;
vlcAudio.AudioManager = Manager1;


vlcAudio.mediaObject = document.querySelector("audio");
vlcAudio.uiVideoProgressBar = document.getElementById("progress-bar");
vlcAudio.uiPlayButton = document.querySelector("#play");
vlcAudio.uiCurrentTimeText = document.querySelector("#current_time");
vlcAudio.uiTotalDurationText = document.querySelector("#total_time");
vlcAudio.uiNameText = document.querySelector("#title");
vlcAudio.uiArtistText=document.querySelector("#artist");
vlcAudio.uiProgressBarInputRange = document.querySelector("#myRange");
vlcAudio.uiNextButton=document.querySelector("#next");
vlcAudio.uiPreviousButton=document.querySelector("#previous");
vlcAudio.uiReplayButton=document.querySelector("#replay");
vlcAudio.uiLikeButton=document.querySelector("#like");

vlcAudio.mediaObject.addEventListener(
  "loadedmetadata",
  function (e) {
      console.log("audio " + this.videoWidth);
      ipcRenderer.send(
          "window:resize",
          (800 * this.videoHeight) / this.videoWidth
      );
  },
  false
);

vlcAudio.activate(); //activates all event listeners for the audio
Manager1.manage(); //calls the manager to manage the audios

ipcRenderer.send("send-audio-link", "");
ipcRenderer.on("receive-audio-link", (evt, link) => {
    //the audio manager than sets the source

    Manager1.setSrc(Utility.path.resolve(__dirname, link));
});