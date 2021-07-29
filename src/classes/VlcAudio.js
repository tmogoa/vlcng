const Utility = require('./Utility');
const VlcMediaContent =require('./VlcMediaContent');
class VlcAudio extends VlcMediaContent{

	uiAudioProgressBar; //the progress bar
    uiTotalDurationText; //The text showing the total duration of the audio
    uiCurrentTimeText; //The text showing the current time in the audio
    uiPlayButton; //playbutton
    uiNameText; //The name of the song
	uiNextButton;//next button 
	uiPreviousButton;//previous button
	uiReplayButton;//replay button
	uiShuffleButton;//shuffle button 
	uiLikeButton;//like button
	uiArtistText;//artist name   



    autoplay = 0;
    index_no = 0;
    Playing_song = false;

    //creating an audio element
    track = document.createElement('audio');

    //audio-array
    All_song = [
   {
     name: "Atemlos durch die Nacht",
     path: "../assets/audio/song1.mp3",
     singer: "Helene Fischer"
   },
   {
     name: "song2",
     path: "../assets/audio/song2.mp3",
     singer: "2"
   },
   {
     name: "song3",
     path: "../assets/audio/song3.mp3",
     singer: "3"
   },
   ];

   load_track(index_no){
    track.src = All_song[index_no].path;
	title.innerHTML = All_song[index_no].name;	
    artist.innerHTML = All_song[index_no].singer;
    track.load();
    }

    playaudio(){
        track.play();
        Playing_song = true
    }
    pauseaudio(){
        track.pause();
	    Playing_song = false;
    }
    
 

    
    
    currentPlaybackRateIndex = 3;

	//source of audio
	constructor (src){
		super("audio",src);
	}

	//method calls
	activate(){
	   this.isPlaying =false;

	   this.uiPlayButton.addEventListener('click', () => {
           this.playPause();
	   });

	   this.mediaObject.addEventListener('timeupdate', () =>{
		   this.myManager.updateTime();
		 
	   });

	   this.uiProgressBarInputRange.addEventListener('input', ()=>{
            let level = this.uiProgressBarInputRange.value / 100 * this.getTotalDuration(); 
            this.setCurrentTime(level);
            this.updateAudioProgess();
            this.updateDurationText();
            this.myManager.updateTime();
	    });

        this.addListener('source-set', ()=>{
            //The object is ready to be managed. Hence, signal the manager.
            this.myManager.emit('managed-object-ready');
            //this.uiNameText.innerHTML = this.name;
        });

        // this.uiBookmarkButton.addEventListener('click', ()=>{
        //     if(this.myManager){
        //         this.myManager.addBookmark();
        //     }
        // });
        

	}

	   /**
     * Controls playing and pausing
     */
    playPause(){
        if(!this.isPlaying){ 
            console.log('play');
            this.play(); 
           // this.uiPlayButton.querySelector('img').src = "../assets/img/play_arrow_black_24dp.svg";
        }
        else{
            console.log('paused');
            this.pause();
            //this.uiPlayButton.querySelector('img').src = "../assets/img/pause.svg";
        }
    }

    next(){

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
        let max = this.uiAudioProgressBar.parentElement.clientWidth;
        let ratio = this.getCurrentTime()/this.getTotalDuration();
        this.uiProgressBarInputRange.value = ratio * 100;

        this.uiAudioProgressBar.classList.add("rounded-r-none");
        if (this.uiProgressBarInputRange.value >= 95) {
            this.uiAudioProgressBar.classList.remove("rounded-r-none");
        }
        this.uiAudioProgressBar.style.width = `${Math.ceil(ratio * max)}px`;
    }
}
module.exports=VlcAudio;

