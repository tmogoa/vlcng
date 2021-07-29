const { remote, ipcRenderer } = require("electron");

const getWindow = () => remote.BrowserWindow.getFocusedWindow();

const closeBtn = document.getElementById("close");

const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const playNetVideoBtn = document.getElementById("playNetVideoBtn");
//This is provisional
const musicBtn = document.getElementById("musicBtn");

//Suppose the list recent videos and audio?

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

/// ### PLEASE IGNORE
// Only for UI testing and iteration
//const content = document.getElementById("item");
const listView = document.getElementById("listView");

//getting the recent videos and audios
const initSqlJs = require("sql.js");
const Utility = require("./../classes/Utility");
const Manager = require("./../classes/Manager");
//const VlcAudio = require("./../classes/VlcAudio");
const VlcVideo = require("./../classes/VlcVideo");
Utility.databasePath = remote.app.getPath("userData");

var recentVideos = [];
var recentAudios = [];

(async()=>{
    const SQL = await initSqlJs();
    let homescreenManager = new Manager();
    const db = Utility.openDatabase(SQL);

    recentVideos = db.exec("SELECT video.id, video.playedTill, video.name, video.source, recentVideo.datePlayed from recentVideo inner join video on video.id = videoId order by datePlayed DESC");

    recentAudios = db.exec("SELECT audio.id, audio.playedTill, audio.name, audio.source, recentAudio.datePlayed from recentAudio inner join audio on audio.id = audioId order by datePlayed DESC");


    if(recentVideos.length > 0){
        let rows = recentVideos[0].values;
        rows.forEach(row => {
            let videoId =  row[0];
            let playedTill = row[1];
            let videoName = row[2];
            let videoSource = row[3];
            let lastPlayed = row[4];
            
            homescreenManager.managedObject = constructMediaObject("video");

            try{
                homescreenManager.setSrc(videoSource);
                //get the thumbnail
                let totalDuration = homescreenManager.managedObject.getTotalDuration();
                timeLeft = homescreenManager.managedObject.formatTime(totalDuration - timeLeft)[0];

                listView.innerHTML += constrouctObjectHTML(videoId, timeLeft, videoName, videoSource, lastPlayed);

                //calculate played till
                let progressBar = document.getElementById("video-progress-bar-"+videoId);
                if(progressBar){
                    let maxWidth = progressBar.parentElement.clientWidth;
                    let ratio = playedTill/totalDuration;
                    progressBar.style.width = `${Math.ceil(maxWidth * ratio)}px`;
                }
                //get thumbnail
                homescreenManager.makeThumbnail(document.getElementById(`video-thumbnail-container-${videoId}`));

                //recalculate date
                let newDate = new Date(lastPlayed);
                let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

                document.getElementById("last-date-played-"+videoId).innerHTML = newDate.toLocaleDateString("en-Us", options);


            }
            catch{
                console.log(row);
                //delete from the database. The video no long exist
               // Manager.removeMediaObject(SQL, videoId, "video");
            }
        });
        
    }

    if(recentAudios.length > 0){
        let rows = recentAudios[0].values;
    }

})();

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
                // mediaObject = new VlcAudio();
                // let audio = document.createElement('audio');
                // mediaObject.mediaObject = audio;
                // break;
            }
    }
    return mediaObject;
}

function constrouctObjectHTML(objectId, timeLeft, name, source, datePlayed){

    let listItem = `<div id="item">
    <input type="hidden" value="" id="video-id" />
    <div class="bg-gray-800 rounded-lg flex flex-row h-20">
        <img
            id="video-thumbnail-container-${objectId}"
            src="https://picsum.photos/300/200"
            alt=""
            class="object-cover rounded-l-lg w-4/12"
        />
        <div
            class="
                flex flex-col
                p-2
                flex-grow
                text-white
                justify-between
            "
        >
            <div
                class="
                    flex flex-row
                    justify-between
                    items-center
                "
            >
                <span class="font-semibold" id="video-name-${objectId}"
                    >${name}</span
                >
                <!--Duration-->
                <span class="text-xs" id="watch-time-left-${objectId}"
                    >${timeLeft} left</span
                >
            </div>

            <div class="">
                <div
                    class="
                        flex
                        bg-black
                        rounded-lg
                        w-full
                        h-1
                        bg-clip-padding
                    "
                >
                    <div
                        id="video-progress-bar-${objectId}"
                        class="
                            flex
                            bg-yellow-500
                            rounded-lg rounded-r-none
                            w-4/12
                            h-1
                            bg-clip-padding
                        "
                    ></div>
                </div>
            </div>

            <div class="flex flex-row justify-between text-xs">
                <span class="font-semibold" id="video-path"
                    >${source}</span
                >
                <span id="last-date-played">${datePlayed}</span>
            </div>
        </div>
    </div>
</div>`;

return listItem;
}

//

//Listing recently watched videos
// for (let index = 0; index < 20; index++) {
//     let div = document.createElement("div");
//     div.innerHTML = content.innerHTML;
//     listView.appendChild(div);
// }

const continuePlayingBtn = document.getElementById("continue-watching-button");

continuePlayingBtn.addEventListener("click", (e) => {
    //send the video link
    ipcRenderer.send(
        "save-video-link",
        "../assets/video/Cars 3 Rivalry Official Trailer.mp4"
    );
    console.log("sent video link");
    getWindow().loadFile("./src/screens/video.html");
});

playNetVideoBtn.onclick = (e) => {
    //send the video link
    ipcRenderer.send(
        "save-video-link",
        "../assets/video/Cars 3 Rivalry Official Trailer.mp4"
    );
    console.log("sent video link");
    getWindow().loadFile("./src/screens/video.html");
};

musicBtn.onclick = (e) => {
    getWindow().loadFile("./src/screens/audio.html");
};
//end of UI testing

//START OF TAB SWITCHERS
const videoTabBtn = document.getElementById("videoTabBtn");
const musicTabBtn = document.getElementById("musicTabBtn");

function showTab() {
    videoTabBtn.classList.toggle("active-tab");
    videoTabBtn.classList.toggle("text-gray-500");
    musicTabBtn.classList.toggle("active-tab");
    musicTabBtn.classList.toggle("text-gray-500");
}
videoTabBtn.onclick = showTab;
musicTabBtn.onclick = showTab;
//END OF TAB SWITCHERS
