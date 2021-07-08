const VlcMediaContent = require('./VlcMediaContent');

/**
 * This  class mostly manipulates the UI of the video playing interface
 */ 
class VlcVideo extends VlcMediaContent{

    //The manager of this vlcVideo
    myManager;

    uiVideoProgressBar; //the progress bar
    uiTotalDurationText; //The text showing the total duration of the video
    uiCurrentTimeText; //The text showing the current time in the video
    uiVolumeText; //the volume text of the volume
    uiVolumeButtonImg; //the volume button with the volume icon
    uiVolumeProgressColumn; //the ui slider on the volume
    uiPlaySpeedButton; //the speed text
    uiPlayButton; //playbutton
    uiNameText; //The name of the video

    /**
     * @property {index} currentPlaybackRateIndex the current playback index
     * in the playbackSpeeds array in the VlcMediaContent class.
     */
    currentPlaybackRateIndex = 3;
    /**
     * 
     * @param {string} src 
     * The source of the video
     */
    constructor(src){
        super("video", src);
    }
    /**
     * After you have set everything for the ui, call the this method.
     */
    activate(){

        this.updateVolumeLevel(this.getVolume() * 100);
        this.updateVideoProgess();

        this.uiPlayButton.addEventListener('click', () => {
            this.playPause();
        });

        this.uiVolumeButtonImg.addEventListener('click', ()=>{
            this.muteVideo();
        });

        this.mediaObject.addEventListener('timeupdate', () =>{
            this.updateVideoProgess();
            this.updateDurationText();
            myManager.updateTime();
        });

        /**
         * Will implement animation later
         */
        this.uiVolumeProgressColumn.parentElement.addEventListener('click', (evt)=>{
            this.updateVolumeSlider(evt);
            console.log('volume progress column clicked');
        });

        this.uiPlaySpeedButton.addEventListener('click', ()=>{
            this.changePlaybackRate();
        });
    }

    /**
     * Controls playing and pausing
     */
    playPause(){
        if(!this.isPlaying){ 
            this.play(this.currentPlaybackRateIndex); 
            this.uiPlayButton.querySelector('img').src = "../assets/img/play_arrow_black_24dp.svg";
        }
        else{
            this.pause();
            this.uiPlayButton.querySelector('img').src = "../assets/img/pause.svg";
        }
    }

    /**
     * Updates the current duration text
     */
    updateDurationText(){
        
        let durHours = Math.floor(this.getTotalDuration() / 3600);
        let durMins = Math.floor((this.getTotalDuration() - 3600 * durHours) / 60);
        let durSecs = Math.floor(this.getTotalDuration() % 60);

        let curHours = Math.floor(this.getCurrentTime() / 3600);
        let curMins = Math.floor((this.getCurrentTime() - 3600 * curHours) / 60);
        let curSecs = Math.floor(this.getCurrentTime() % 60);

        this.uiCurrentTimeText.innerHTML = `${(curHours > 0) ?(curHours > 9 ? curHours : "0" + curHours + ":") : ""}${curMins > 9 ? curMins : "0" + curMins}:${curSecs > 9 ? curSecs : "0" + curSecs}`
        
        this.uiTotalDurationText.innerHTML = `${(durHours > 0) ?(durHours > 9 ? durHours : "0" + durHours + ":"): ""}${durMins > 9 ? durMins : "0" + durMins}:${durSecs > 9 ? durSecs : "0" + durSecs}`
    }

    muteVideo(){
        if (this.mediaObject.muted) {
            this.mediaObject.muted = false;
            this.uiVolumeButtonImg.src = "../assets/img/volume_up_black_24dp.svg";
        } else {
            this.mediaObject.muted = true;
            this.uiVolumeButtonImg.src = "../assets/img/volumemute.svg";
        }
    }

    /**
     * Update the height of the slider to tell the volume
     */
    updateVolumeSlider(evt){
        let columnY1 = evt.pageY - this.uiVolumeProgressColumn.parentElement.offsetTop;
        let columnY2 = this.uiVolumeProgressColumn.parentElement.clientHeight + columnY1;

        //get the mouse top position
        let mouseY = evt.clientX;

        let volumeLevel = Math.ceil(columnY2 - mouseY);
        if(volumeLevel < 0){
            volumeLevel = 0;
        }
        this.updateVolumeLevel(volumeLevel);
        console.log(`The mouse Y pos is ${mouseY}, level is ${volumeLevel} and columnY2 is ${columnY2} and columnY1 is ${columnY1} the height of the client is ${this.uiVolumeProgressColumn.parentElement.clientHeight}`);
    }

    updateVolumeLevel(level) {
        let max = this.uiVolumeProgressColumn.parentElement.clientHeight; //maximum height of the bar
        let ratio = level/max;
        if(ratio > 1){
            ratio = 1;
        }
        this.setVolume(ratio);

        if (level >= 95) {
            this.uiVolumeProgressColumn.classList.remove("rounded-t-none");
        }

        this.uiVolumeText.innerHTML = level;
        this.uiVolumeProgressColumn.style.height = `${Math.ceil(
            ratio * max
        )}px`;
    }
    
    updateVideoProgess(){
        let max = this.uiVideoProgressBar.parentElement.clientWidth;
        let ratio = this.getCurrentTime()/this.getTotalDuration();
        if ((ratio * 100) >= 95) {
            this.uiVideoProgressBar.classList.remove("rounded-r-none");
        }
        this.uiVideoProgressBar.style.width = `${Math.ceil(ratio * max)}px`;
    }

    changePlaybackRate(){
        this.currentPlaybackRateIndex += 1
        this.currentPlaybackRateIndex %= this.playbackSpeeds.length;
        this.uiPlaySpeedButton.innerHTML = this.playbackSpeeds[this.currentPlaybackRateIndex] + "x";
        this.pause();
        this.play(this.currentPlaybackRateIndex);
    }

}

module.exports = VlcVideo;