const remote = require("electron").remote;

const closeBtn = document.getElementById("close");

const minimizeIcon = document.getElementById("minimize");

closeBtn.onclick = (e) => {
    let w = remote.getCurrentWindow();
    w.close();
};

minimizeIcon.onclick = (e) => {
    remote.BrowserWindow.getFocusedWindow().minimize();
};
