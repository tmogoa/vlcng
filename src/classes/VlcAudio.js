const VlcMediaContent =require('./VlcMediaContent');
class VlcAudio extends VlcMediaContent{

	AudioManager;//manager of the audio


	uiVideoProgressBar; //the progress bar
    uiTotalDurationText; //The text showing the total duration of the video
    uiCurrentTimeText; //The text showing the current time in the video
    uiPlayButton; //playbutton
    uiNameText; //The name of the song
	uiNextButton;//next button 
	uiPreviousButton;//previous button
	uiReplayButton;//replay button
	uiShuffleButton;//shuffle button 
	uiLikeButton;//like button
	uiArtistText;//artist name   

    
    currentPlaybackRateIndex = 3;

	//source of audio
	constructor (src){
		super("audio",src);
	}

	//method calls
	activate(){
	   this.isPlaying =true;

	   this.uiPlayButton.addEventListener('click', () => {
           this.playPause();
	   });

	   this.mediaObject.addEventListener('timeupdate', () =>{
		   this.AudioManager.updateTime();
		 
	   })

	   this.uiProgressBarInputRange.addEventListener('input', ()=>{
            let level = this.uiProgressBarInputRange.value / 100 * this.getTotalDuration(); 
            this.setCurrentTime(level);
            this.updateAudioProgess();
            this.updateDurationText();
            this.AudioManager.updateTime();
	    });
         this.addListener('source-set', ()=>{
            //The object is ready to be managed. Hence, signal the manager.
            this.AudioManager.emit('managed-object-ready');
            this.uiNameText.innerHTML = this.name;
        });

        this.uiBookmarkButton.addEventListener('click', ()=>{
            if(this.myManager){
                this.myManager.addBookmark();
            }
        });
	}

	   /**
     * Controls playing and pausing
     */
    playPause(){
        if(!this.isPlaying){ 
            this.play(this.currentPlaybackRateIndex); 
            //this.uiPlayButton.querySelector('img').src = "../assets/img/play_arrow_black_24dp.svg";
        }
        else{
            this.pause();
            //this.uiPlayButton.querySelector('img').src = "../assets/img/pause.svg";
        }
    }

    /**
     * Updates the current duration text
     */
    updateDurationText(){
        
        let formattedTime = this.formatTime();
        this.uiCurrentTimeText.innerHTML =  formattedTime[0];
        this.uiTotalDurationText.innerHTML = formattedTime[1];
    }
        
    updateAudioProgess(){

        let max = this.uiVideoProgressBar.parentElement.clientWidth;
        let ratio = this.getCurrentTime()/this.getTotalDuration();
        this.uiProgressBarInputRange.value = ratio * 100;

        this.uiVideoProgressBar.classList.add("rounded-r-none");
        if (this.uiProgressBarInputRange.value >= 95) {
            this.uiVideoProgressBar.classList.remove("rounded-r-none");
        }
        this.uiVideoProgressBar.style.width = `${Math.ceil(ratio * max)}px`;
    }

}
module.exports=VlcAudio;

