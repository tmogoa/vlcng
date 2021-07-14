var menu,
    mymedia,
    myaudio,
    mysubtitles,
    mytools,
    myview,
    myhelp,
    show;

function initialize(){
    menu = document.getElementById("menu");
    mymedia = document.getElementById("mymedia");
    myaudio = document.getElementById("myaudio");
    mysubtitles = document.getElementById("mysubtitles");
    mytools = document.getElementById("mytools");
    myview = document.getElementById("myview");
    myhelp = document.getElementById("myhelp");
    mshow = document.getElementById("main_place");

    menu.addEventListener("click",showMenu,false);
    mymedia.addEventListener("click",showMedia,false);
    myaudio.addEventListener("click",showAudio,false);
    mysubtitles.addEventListener("click",showSub,false);
    mytools.addEventListener("click",showTools,false);
    myview.addEventListener("click",showView,false);
    myhelp.addEventListener("click",showHelp,false);
    mshow.addEventListener("click",show,false);
}
window.onload = initialize;

function showMenu() {
    var x = document.getElementById("menu");
    displayValue = "";
    if (x.style.display == "") displayValue = "none";

    x.style.display = displayValue;
    
}

// function showMedia() {
//     var a = document.getElementById("mymedia");
//     displayValue = "";
//     if (a.style.display == "") displayValue = "none";

//     a.style.display = displayValue;
//     // document.getElementById("myvideo").style.display="block";
// }

// function showVideo() {
//     var b = document.getElementById("myvideo");
//     displayValue = "";
//     if (b.style.display == "") displayValue = "none";

//     b.style.display = displayValue;
//     // document.getElementById("myaudio").style.display="block";
// }

// function showAudio() {
//     var c = document.getElementById("myaudio");
//     displayValue = "";
//     if (c.style.display == "") displayValue = "none";

//     c.style.display = displayValue;
//     // document.getElementById("mysubtitles").style.display="block";
// }

// function showSub() {
//     var d = document.getElementById("mysubtitles");
//     displayValue = "";
//     if (d.style.display == "") displayValue = "none";

//     d.style.display = displayValue;
//     // document.getElementById("mytools").style.display="block";
// }

// function showTools() {
//     var e = document.getElementById("mytools");
//     displayValue = "";
//     if (e.style.display == "") displayValue = "none";

//     e.style.display = displayValue;
//     // document.getElementById("myview").style.display="block";
// }

// function showView() {
//     var f = document.getElementById("myview");
//     displayValue = "";
//     if (f.style.display == "") displayValue = "none";

//     f.style.display = displayValue;
//     // document.getElementById("myhelp").style.display="block";
// }

// function showHelp() {
//     var g = document.getElementById("myhelp");
//     displayValue = "";
//     if (g.style.display == "") displayValue = "block";

//     g.style.display = displayValue;
//     // document.getElementById("mymedia").style.display="block";
// }

function show(param_div_id) {
    document.getElementById('main_place').innerHTML = document.getElementById(param_div_id).innerHTML;
    document.getElementById('menu').style.display = "block";
  }