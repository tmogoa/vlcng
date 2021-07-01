const { remote } = require("electron");

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

for (let index = 0; index < 20; index++) {
    let div = document.createElement("div");
    div.innerHTML = content.innerHTML;
    listView.appendChild(div);
}
playNetVideoBtn.onclick = (e) => {
    getWindow().loadFile("./src/screens/video.html");
};
//end of UI testing
