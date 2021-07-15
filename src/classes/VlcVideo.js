const Utility = require('./Utility');
const VlcMediaContent = require('./VlcMediaContent');

/**
 * This  class mostly manipulates the UI of the video playing interface
 */ 
class VlcVideo extends VlcMediaContent{

    //The manager of this vlcVideo
    myManager;

    uiVideoProgressBar; //the progress bar
    

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
        this.isPlaying = true;

        this.updateVolumeSlider();
        this.updateVideoProgess();

        this.uiPlayButton.addEventListener('click', () => {
            this.playPause();
        });

        this.uiVolumeButtonImg.addEventListener('click', ()=>{
            this.muteVideo();
        });

        this.mediaObject.addEventListener('timeupdate', () =>{
            this.updateVideoProgess();
            this.updateVolumeSlider();
            this.updateDurationText();
            this.myManager.updateTime();
        });

        /**
         * Will implement animation later
         */
        this.uiVolumeInputRange.addEventListener('input', (evt)=>{
            this.updateVolumeSlider();
        });

        this.uiPlaySpeedButton.addEventListener('click', ()=>{
            this.changePlaybackRate();
        });

        this.uiProgressBarInputRange.addEventListener('input', ()=>{
            let level = this.uiProgressBarInputRange.value / 100 * this.getTotalDuration(); 
            this.setCurrentTime(level);
            this.updateVideoProgess();
            this.updateDurationText();
            this.myManager.updateTime();
        });
        
        this.addListener('source-set', ()=>{
            //The object is ready to be managed. Hence, signal the manager.
            this.myManager.emit('managed-object-ready');
            this.uiNameText.innerHTML = this.name;
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
        let level = this.uiVolumeInputRange.value;
        this.updateVolumeLevel(level);
    }

    /**
     * 
     * @param {int} level - value from the range 
     */
    updateVolumeLevel(level) {
        let max = this.uiVolumeLevelBar.parentElement.clientHeight; //maximum height of the bar
        let ratio = (level/100);
       
        this.setVolume(ratio);

            this.uiVolumeLevelBar.classList.add("rounded-t-none");
        if (level >= 95) {
            this.uiVolumeLevelBar.classList.remove("rounded-t-none");
        }

        this.uiVolumeText.innerHTML = level;
        this.uiVolumeLevelBar.style.height = `${Math.ceil(
            ratio * max
        )}px`;

    }
    
    updateVideoProgess(){

        let max = this.uiVideoProgressBar.parentElement.clientWidth;
        let ratio = this.getCurrentTime()/this.getTotalDuration();
        this.uiProgressBarInputRange.value = ratio * 100;

        this.uiVideoProgressBar.classList.add("rounded-r-none");
        if (this.uiProgressBarInputRange.value >= 95) {
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