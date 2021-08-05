const remote = require("electron").remote;
const ipcRenderer = require("electron").ipcRenderer;
const fileType = require("file-type");
const fs = require("fs");
const initSqlJs = require("sql.js");
var SQL;
(async () =>{
    SQL = await initSqlJs();
})();
const getWindow = () => remote.BrowserWindow.getFocusedWindow();
const EventEmitter = require("events");

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

const Utility = require("./../classes/Utility");
const Manager = require("./../classes/Manager");
const VlcAudio = require("./../classes/VlcAudio");
const VlcVideo = require("./../classes/VlcVideo");
Utility.databasePath = remote.app.getPath("userData");

var recentVideos = [];
var recentAudios = [];

const videoLink = document.getElementById("video-link");
const cwButton = document.getElementById("cw-button"); //continue watching button
const cwName = document.getElementById("cw-video-name"); //continue watchin name
const cwProgressBar = document.getElementById("cw-progress-bar");
const cwTimeLeft = document.getElementById("cw-time-left");
const recentAudioItems = document.getElementById("audio-items");
const recentVideoItems = document.getElementById("video-items");



(async()=>{
    if(typeof SQL == 'undefined'){
        SQL = await initSqlJs();
    }

    let homescreenManager = new Manager();
    const db = Utility.openDatabase(SQL);
    let all = db.exec(`SELECT * from video, audio`);
    console.log("All from audio and videos ", all);

    recentVideos = db.exec(
        "SELECT video.id, video.playedTill, video.name, video.source, recentVideo.datePlayed from recentVideo inner join video on video.id = videoId order by datePlayed DESC"
    );

    recentAudios = db.exec(
        "SELECT audio.id, audio.playedTill, audio.name, audio.source, recentAudio.datePlayed from recentAudio inner join audio on audio.id = audioId order by datePlayed DESC"
    );

    console.log(recentVideos);
    let queue = new EventEmitter();
    let thumbnailQueue = [];

    if (recentVideos.length > 0 && recentVideos[0].values.length > 0) {
        let rows = recentVideos[0].values;
        let type = "video";
        queue.addListener("new-item", checkThumbnailQueue);
        rows.forEach((row, index) => {
            let videoId = row[0];
            let playedTill = row[1];
            let videoName = row[2];
            let videoSource = row[3];
            let lastPlayed = row[4];

            homescreenManager.managedObject = constructMediaObject(type);
            homescreenManager.managedObject.setManager(homescreenManager);
            recentVideoItems.innerHTML += `<div id='${type}-item-${videoId}'><div>`;

            listMedia(
                videoId,
                playedTill,
                videoName,
                videoSource,
                lastPlayed,
                type,
                index
            );
        });

        function checkThumbnailQueue() {
            console.log(` the queue length is ${thumbnailQueue.length}`);

            while (thumbnailQueue.length > 0) {
                let video = document.createElement("video");
                let currentVideo = thumbnailQueue.shift();
                video.src = currentVideo.src;
                video.addEventListener("loadedmetadata", function () {
                    setTimeout(() => {
                        console.log(video);
                        console.log("Attempting to make thumbnail");
                        let canvas = document.createElement("canvas");
                        let container = document.getElementById(
                            `video-thumbnail-container-${currentVideo.id}`
                        );
                        if (container) {
                            canvas.width = 400; // container.clientWidth;
                            canvas.height = 400; // container.clientHeight;
                            canvas
                                .getContext("2d")
                                .drawImage(
                                    video,
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height
                                );
                            console.log(canvas);
                            container.src = canvas.toDataURL();
                        }
                    }, 0);
                });
            }
        }
    } else {
        recentVideoItems.innerHTML += Utility.openMediaHtml("video"); //ask for a file
    }

    console.log("The recent audios are ");
    console.log(recentAudios);
    if (recentAudios.length > 0 && recentAudios[0].values.length > 0) {
        let rows = recentAudios[0].values;
        let type = 'audio';
        rows.forEach((row, index) => {
            let audioId = row[0];
            let playedTill = row[1];
            let audioName = row[2];
            let audioSource = row[3];
            let lastPlayed = row[4];

            homescreenManager.managedObject = constructMediaObject(type);
            homescreenManager.managedObject.setManager(homescreenManager);
            recentAudioItems.innerHTML += `<div id='${type}-item-${audioId}'><div>`;

            listMedia(
                audioId,
                playedTill,
                audioName,
                audioSource,
                lastPlayed,
                type,
                index
            );

            
        });
    }else{
        recentAudioItems.innerHTML += Utility.openMediaHtml("audio"); //ask for a file
    }
    

    //list the media objects
    function listMedia(id, playedTill, name, source, lastPlayed, type, index) {
        try {
            if (!homescreenManager.setSrc(source)) {
                Manager.removeMediaObject(SQL, id, type);
                return;
            }

            homescreenManager.managedObject.mediaObject.addEventListener(
                "loadedmetadata",
                function () {
                    let totalDuration = this.duration;
                    let timeLeft = homescreenManager.managedObject.formatTime(
                        totalDuration - playedTill
                    )[0];

                    let item = document.getElementById(`${type}-item-${id}`);
                    let directory = Utility.path.dirname(source);
                    item.innerHTML = constrouctObjectHTML(id, timeLeft, name, directory, lastPlayed, type);
                    let esSource = source.replace(/\\/g, "/");   
                    item.setAttribute("onclick", `send${type}Path("${esSource}")`);

                    let progressBar = document.getElementById(`${type}-progress-bar-${id}`);
                    if(progressBar){
                        let maxWidth = progressBar.parentElement.clientWidth;

                        let ratio = playedTill / totalDuration;
                        console.log(
                            `${type} playedTill ${playedTill} of ${totalDuration} and ratio is ${ratio} and maximum width is ${maxWidth} and progress with is `
                        );
                        progressBar.style.width = `${Math.ceil(
                            maxWidth * ratio
                        )}px`;
                    }

                    //recalculate date
                    let newDate = new Date(lastPlayed);
                    let options = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    };

                    document.getElementById(
                        type + "-last-date-played-" + id
                    ).innerHTML = newDate.toLocaleDateString("en-Us", options);

                    //push into the thumbnail queue to be handled assynchronously
                    thumbnailQueue.push({
                        source,
                        id,
                        type,
                    });

                    queue.emit("new-item");

                    //updating continue watching
                    if (index == 0 && type == "video") {
                        let maxWidth = cwProgressBar.parentElement.clientWidth;
                        let ratio = playedTill / totalDuration;
                        cwProgressBar.style.width = `${Math.ceil(
                            maxWidth * ratio
                        )}px`;

                        cwName.innerHTML = name;
                        cwTimeLeft.innerHTML = `${timeLeft} left`;

                        cwButton.onclick = ()=>{
                            sendvideoPath(esSource);
                        }
                    }
                }
            );
        } catch (err) {
            console.log("An error occurred why trying to display row. " + err);
            console.log(row);
            //delete from the database. The video no long exist
            Manager.removeMediaObject(SQL, id, type);
        }
    }
})();

//constructs the media object to get the duration
function constructMediaObject(type) {
    let mediaObject;
    switch (type) {
        case "video": {
            mediaObject = new VlcVideo();
            let video = document.createElement("video");
            mediaObject.mediaObject = video;
            break;
        }
        case "audio": {
            mediaObject = new VlcAudio();
            let audio = document.createElement("audio");
            mediaObject.mediaObject = audio;
            break;
        }
    }
    return mediaObject;
}

//makes the html list items
function constrouctObjectHTML(
    objectId,
    timeLeft,
    name,
    source,
    datePlayed,
    type = "video"
) {
    console.log(`the path source is ${source}`);
    let partialSource = source.split(/[\/\\]/);
    let pSource = partialSource.slice(partialSource.length - 3);
    let halfSource = Utility.path.join(pSource[0], pSource[1], pSource[2]);
    console.log(`The half source is ${halfSource}`);
    let listItem = `
    <input type="hidden" value="${objectId}" id="${type}-id" />
    <div class="bg-gray-800 rounded-lg flex flex-row h-28">
        <img
            id="${type}-thumbnail-container-${objectId}"
            src="https://picsum.photos/300/200"
            alt=""
            class="object-cover rounded-l-lg w-4/12"
        />
        <div
            class="
                flex flex-col
                p-4
                w-8/12
                text-white
                justify-between
            "
        >
            <div
                class="
                    flex flex-row
                    justify-between
                    items-center
                    gap-2
                "
            >
                <span class="font-medium overflow-ellipsis flex-grow truncate" id="${type}-name-${objectId}"
                    >${name}</span
                >
                <!--Duration-->
                <span class="text-xs flex-shrink-0 font-medium" id="${type}-time-left-${objectId}"
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
                        id="${type}-progress-bar-${objectId}"
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
                <span class="font-medium flex-grow truncate" id="${type}-path"
                    >${halfSource}</span
                >
                <span id="${type}-last-date-played-${objectId}" class="font-medium flex-shrink-0">${datePlayed}</span>
            </div>
        </div>
    </div>
`;

    return listItem;
}



/**
 * Checks for error in reading the file
 * @param {string} source - source of file
 * @param {string} type - audio | video
 */
function checkFile(source, type, destination = ""){
    let db = Utility.openDatabase(SQL);
    function deleteFile(){
        db.run(`DELETE FROM ${type} WHERE source = ?`, [source]);
        Utility.closeDatabase(db);
    }
    fs.access(source, fs.constants.F_OK, (err)=>{
        
        if(err){
            console.log(err);
            alert("An error occurrend while trying to access the file. The file might not exist, has errors, or has been relocated");
            //deleteFile();
            return;
        }
        fileType.fromFile(source).then((ft) => {
            console.log("Right here");
            if(typeof ft == 'undefined'){
                alert("The file is not of type media");
                deleteFile();
                return;
            }

            //console.log('The ft object is ft and path is ', ft, fullPath);
            let extname = ft.mime;

            switch(type){
                case "audio":
                    {
                        if(/audio\/*/.test(extname)){
                            let id = db.exec(`SELECT id from ${type} where source = ?`, [source]);
                            let name = Utility.path.basename(source, Utility.path.extname(source));

                            if(id.length < 1){
                                db.exec(`INSERT INTO ${type}(playedTill, name, source) values (?, ?, ?)`, [0, name, source]);

                                id = db.exec(`SELECT id from ${type} where source = ?`, [source]);
                            }
                            Utility.closeDatabase(db);
                            if(id.length < 1){
                                alert("An error occurred while trying to save the file for future look up");
                            }
                            if(destination != ""){
                                ipcRenderer.send(
                                    "save-audio-link",
                                    source
                                );
                                getWindow().loadFile(destination);
                            }
                            //console.log("found audio");
                        }else{
                            alert("The file is not an audio file");
                            deleteFile();
                        }
                        break;
                    }
                case "video":
                    {
                        if(/video\/*/.test(extname)){
                            let id = db.exec(`SELECT id from ${type} where source = ?`, [source]);
                            let name = Utility.path.basename(source, Utility.path.extname(source));
                            if(id.length < 1){
                                db.exec(`INSERT INTO ${type}(playedTill, name, source) values (?, ?, ?)`, [0, name, source]);

                                id = db.exec(`SELECT id from ${type} where source = ?`, [source]);
                            }
                            Utility.closeDatabase(db);
                            if(id.length < 1){
                                alert("An error occurred while trying to save the file for future look up");
                            }
                            if(destination != ""){
                                ipcRenderer.send(
                                    "save-video-link",
                                    source
                                );
                                getWindow().loadFile(destination);
                            }
                            
                        }else{
                            
                            deleteFile();
                            alert("The file is not a video.");
                        }
                        break;
                    }
                    
                default: 
                {
                    console.error("file type is not defined for the manage.html");
                }
            }
        });

        return;
    });
}

//send the audio file to the player
function sendvideoPath(itemSource){
    checkFile(itemSource, "video", "./src/screens/video.html");
}

//Send the video file to the player
function sendaudioPath(itemSource){
    checkFile(itemSource, "audio", "./src/screens/audio-play.html");
}

let isVideosList = true;

//sending files to be played
playNetVideoBtn.onclick = (e) => {
    if (videoLink.value.length < 1) {
        return;
    }
    if (isVideosList) {
        console.log(`Is video playlist`);
        sendvideoPath(videoLink.value);
        return;
    }

    console.log(`is audio playlist`);
    sendaudioPath(videoLink.value);
};

//opening media files
function openMedia(input, type){
    let files = input.files;
    if(files){
        let mediaFile = files[0].path;
        let src = mediaFile.replace(/\\+/g, "/");
        switch(type){
            case "audio":
                {
                    sendaudioPath(src);
                    break;
                }
            case "video":
                {
                    sendvideoPath(src);
                    break;
                }
            
        }
    }
}

musicBtn.onclick = (e) => {
    getWindow().loadFile("./src/screens/manage.html");
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
    recentVideoItems.style.display = "";
    recentAudioItems.style.display = "none";
    if (isVideosList) {
        console.log(`is audio playlist`);
        recentVideoItems.style.display = "none";
        recentAudioItems.style.display = "";
        videoLink.setAttribute("placeholder", "Paste a link to an audio");
    } else {
        console.log(`is video list`);
        videoLink.setAttribute("placeholder", "Paste a link to a  video");
    }

    isVideosList = !isVideosList;
}
videoTabBtn.onclick = showTab;
musicTabBtn.onclick = showTab;
//END OF TAB SWITCHERS
