const remote = require("electron").remote;
const getWindow = () => remote.BrowserWindow.getFocusedWindow();

const closeBtn = document.getElementById("close");

const minimizeIcon = document.getElementById("minimize");

closeBtn.onclick = (e) => {
    getWindow().close();
};

minimizeIcon.onclick = (e) => {
    getWindow().minimize();
};
function maximize() {
    const window = getWindow();
    window.isMaximized() ? window.unmaximize() : window.maximize();
}
document.addEventListener("dblclick", maximize);
