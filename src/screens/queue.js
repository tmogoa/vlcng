// // let artists = [];
// // let titles = [];
// // let durations = [];


// // function getArtist() {
    
// //     // artists.push(artistOne);
// // }

// // function getTitle() {
    
// //     // artists.push(titleOne);
// // }

// // function getDuration() {
    
// //     // durations.push(durationOne);
// // }


const { remote, ipcRenderer } = require("electron");

const getWindow = () => remote.BrowserWindow.getFocusedWindow();
const button = document.getElementById('queue');

    //send the video link
    if(button){
        button.addEventListener("click", (e) => {
            getWindow().loadFile("src/screens/queue.html");
            var artistOne = document.getElementById("artistOne").innerHTML;
            console.log(artistOne);
            var titleOne = document.getElementById("titleOne").innerHTML;
            console.log(titleOne);
            var durationOne = document.getElementById("durationOne").innerHTML;
            console.log(durationOne);
            document.getElementById('artist').innerHTML = artistOne;
            document.getElementById('title').innerHTML = titleOne;
            document.getElementById('duration').innerHTML = durationOne;
        });
    }else{
        console.log("No event");
    }
    



    
