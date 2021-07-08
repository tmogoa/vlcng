const { remote, ipcRenderer } = require("electron");

const getWindow = () => remote.BrowserWindow.getFocusedWindow();

const closeBtn = document.getElementById("close");

const minimizeIcon = document.getElementById("minimize");
const maximizeIcon = document.getElementById("maximize");
const playNetVideoBtn = document.getElementById("playNetVideoBtn");

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
const content = document.getElementById("item");
const listView = document.getElementById("listView");

//Listing recently watched videos
for (let index = 0; index < 20; index++) {
    let div = document.createElement("div");
    div.innerHTML = content.innerHTML;
    listView.appendChild(div);
}

const continuePlayingBtn = document.getElementById('continue-watching-button');

continuePlayingBtn.addEventListener('click', (e)=>{
    //send the video link
    ipcRenderer.send('save-video-link', "../assets/video/Cars 3 Rivalry Official Trailer.mp4");
    console.log("sent video link");
    getWindow().loadFile("./src/screens/video.html");
});

playNetVideoBtn.onclick = (e) => {
    //send the video link
    ipcRenderer.send('save-video-link', "../assets/video/Cars 3 Rivalry Official Trailer.mp4");
    console.log("sent video link");
    getWindow().loadFile("./src/screens/video.html");
};
//end of UI testing
