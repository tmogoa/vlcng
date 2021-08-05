const Utility = require('./Utility');
const VlcMediaContent = require('./VlcMediaContent');

/**
 * This  class mostly manipulates the UI of the video playing interface
 */ 
class VlcVideo extends VlcMediaContent{


    /**
     * The UI components that are specific to a video.
     */
    uiVideoProgressBar; //the progress bar
    uiTotalDurationText; //The text showing the total duration of the video
    uiCurrentTimeText; //The text showing the current time in the video
    uiVolumeText; //the volume text of the volume
    uiVolumeButtonImg; //the volume button with the volume icon
    uiVolumeProgressColumn; //the ui slider on the volume
    uiPlaySpeedButton; //the speed text
    uiPlayButton; //playbutton
    uiNameText; //The name of the video
    //implement foward and rewing buttons

    

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
    //call methods for btns heregit
    activate(){
        this.isPlaying = true;

        this.updateVolumeSlider();
        this.updateVideoProgess();

        if(this.uiPlayButton){
            this.uiPlayButton.addEventListener('click', () => {
                this.playPause();
            });
        }
        

        if(this.uiVolumeButtonImg){
            this.uiVolumeButtonImg.addEventListener('click', ()=>{
                this.muteVideo();
            });
        }
        

        this.mediaObject.addEventListener('timeupdate', () =>{
            this.updateVideoProgess();
            this.updateVolumeSlider();
            this.updateDurationText();
            this.myManager.updateTime();
            if(this.getCurrentTime() == this.getTotalDuration()){
                this.isPlaying = false;
                if(this.uiPlayButton)this.uiPlayButton.querySelector('img').src = "../assets/img/replay_white_24dp.svg";
            }
        });

        /**
         * Will implement animation later
         */
        if(this.uiVolumeInputRange){
            this.uiVolumeInputRange.addEventListener('input', (evt)=>{
                this.updateVolumeSlider();
            });
        }
        
        if(this.uiPlaySpeedButton){
            this.uiPlaySpeedButton.addEventListener('click', ()=>{
                this.changePlaybackRate();
            });
        }
        
        if(this.uiProgressBarInputRange){
            this.uiProgressBarInputRange.addEventListener('input', ()=>{
                let level = this.uiProgressBarInputRange.value / 100 * this.getTotalDuration(); 
                this.setCurrentTime(level);
                this.updateVideoProgess();
                this.updateDurationText();
                this.myManager.updateTime();
            });
        }
        
        this.addListener('source-set', ()=>{
            //The object is ready to be managed. Hence, signal the manager.
            this.myManager.emit('managed-object-ready');
            this.uiNameText.innerHTML = this.name;
        });

        if(this.uiBookmarkButton){
            this.uiBookmarkButton.addEventListener('click', ()=>{
                if(this.myManager){
                    this.myManager.addBookmark();
                }
            });
        }
        

    }

    /**
     * Controls playing and pausing
     */
    playPause(){
        if(!this.isPlaying){ 
            this.play(this.currentPlaybackRateIndex); 
            if(this.uiPlayButton)this.uiPlayButton.querySelector('img').src = "../assets/img/pause.svg";
        }
        else{
            this.pause();
            if(this.uiPlayButton)this.uiPlayButton.querySelector('img').src = "../assets/img/play_arrow_black_24dp.svg";
        }
    }

    /**
     * Updates the current duration text
     */
    updateDurationText(){
        if(!this.uiCurrentTimeText){
            return;
        }
        let formattedTime = this.formatTime();
        this.uiCurrentTimeText.innerHTML =  formattedTime[0];
        this.uiTotalDurationText.innerHTML = formattedTime[1];
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
        if(!this.uiVolumeInputRange){
            return;
        }
        let level = this.uiVolumeInputRange.value;
        this.updateVolumeLevel(level);
    }

    /**
     * Updating the volume level
     * @param {int} level - value from the range 
     */
    updateVolumeLevel(level) {
        if(!this.uiVolumeLevelBar){
            return;
        }

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
    
    /**
     * Updates the progress bar
     */
    updateVideoProgess(){
        if(!this.uiVideoProgressBar){
            return;
        }
        let max = this.uiVideoProgressBar.parentElement.clientWidth;
        let ratio = this.getCurrentTime()/this.getTotalDuration();
        this.uiProgressBarInputRange.value = ratio * 100;

        this.uiVideoProgressBar.classList.add("rounded-r-none");
        if (this.uiProgressBarInputRange.value >= 95) {
            this.uiVideoProgressBar.classList.remove("rounded-r-none");
        }
        this.uiVideoProgressBar.style.width = `${Math.ceil(ratio * max)}px`;
    }

    /**
     * changes the playback rates.
     * Remember the playback speeds from the parent class (VlcMediaContent)? Yes, we use it here.
     * We just increase the speed to the next level in the playbackSpeeds array in a circular form.
     * When we get at the highest, we circle back to the lowest on the next click.
     */
    changePlaybackRate(){
        this.currentPlaybackRateIndex += 1
        this.currentPlaybackRateIndex %= this.playbackSpeeds.length;
        if(this.uiPlaySpeedButton){
            this.uiPlaySpeedButton.innerHTML = this.playbackSpeeds[this.currentPlaybackRateIndex] + "x";
        }
        this.pause();
        this.play(this.currentPlaybackRateIndex);
    }

}

module.exports = VlcVideo;