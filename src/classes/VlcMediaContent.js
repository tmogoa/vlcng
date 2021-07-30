
/**
 * The VLC media content class
 * This class is the parent of the Vlc video and audio classes
 */
const Utility = require('./Utility');
const EventEmitter = require('events');

 class VlcMediaContent extends EventEmitter{

    /**
     * The manager of this VlcMediaContent
     */
    myManager;
    /**
     * Type of the Media content: audio or video
     */
    type;

    /**
     * The id of the Audio or Video in the database
     */
    id;

    /**
     * The src of the media content object
     * This is an object that has a `directory`, `extension`, name and `basename` fields
     * e.g. file source = "directory/file.mp4"
     * directory = /directory
     * extenstion = .mp4
     * basename = file.mp4
     * name = file
     */
    srcObject = {};
    

    /**
     * Name of the content
     */
    name;

    /**
     * Is the mediaObject playing or not
     * @property {bool} isPlaying;
     */
    isPlaying = false;

    /**
     * @property {object} mediaObject - The actual media object. Either video or Audio
     */
    mediaObject;

    /**
     * This is the array of playback speeds. 
     * @property {array} playbackSpeeds
     */
    playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    /**
     * General UI components for both video and audios
     */
    uiTotalDurationText; //The text showing the total duration of the video
    uiCurrentTimeText; //The text showing the current time in the video
    uiVolumeText; //the volume text of the volume
    uiVolumeButtonImg; //the volume button with the volume icon
    uiVolumeLevelBar; //the ui slider on the volume
    uiPlaySpeedButton; //the speed text
    uiPlayButton; //playbutton
    uiNameText; //The name of the media object
    uiVolumeInputRange; //The range input of the volume
    uiProgressBarInputRange; //The range input of the video or progress bar
    uiBookmarkButton; //The bookmark button for both the audio and videos
    uiBookmarkCloseButton; //close the book mark form
    
    /**
     * The constructor
     * @param {string} type - 'video' or 'audio' 
     */
    constructor(type, src = ""){
        super();
        this.type = type;

        /**
         * Constructing the srcObject
         */
        this.setSrc(src);
        /**
         * Things specific to the two types of contents should be placed in here.
         */
        switch (type) {
            case "video":
                {
                    break;
                }
            case "audio":
                {
                    break;
                }
            default:
                {
                    throw "The type wasn't specified";
                }
        }
    }

    /**
     * Plays a VLCMedia content: audio or video
     * @param {double} speed - the speedIndex of the video from this array [0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x]
     */
    play(speedIndex = 3){
        this.mediaObject.playbackRate = this.playbackSpeeds[speedIndex];
        this.mediaObject.play();
        this.isPlaying = true;
    }

    /**
     * pauses a VLCMedia content: audio or video
     */
    pause(){
        this.mediaObject.pause();
        this.isPlaying = false;
    }

   
    /**
     * 
     * @param {int} numberOfSeconds seek the mediaObject to a particular play time
     */
    seek(numberOfSeconds) {
        let time = this.getCurrentTime() + numberOfSeconds;
        this.setCurrentTime((time > 0)?time:0);
    }
      
    forward() {
     this.seek(10);
    }
    
    rewind() {
     this.seek(-10);
    }

    /**
     * The Current time of the media object
     */
    getCurrentTime(){
        return this.mediaObject.currentTime;
    }

    /**
     * The time in seconds
     * @param {int} time 
     */
    setCurrentTime(time){
        this.mediaObject.currentTime = time;
    }

    /**
     * The new volume of the media object b/w 0,1
     * @param {double} volume 
     */
    setVolume(volume){
        this.mediaObject.volume = volume;
    }

    getVolume(){
        return this.mediaObject.volume;
    }

    /**
     * Returns the total duration of the mediaObject currently attached to the VlcMediaContent.
     * This object could be a video or an audio
     * @returns int
     */
    getTotalDuration(){
        return this.mediaObject.duration;
    }

    /**
     * Sets the source of the mediaObject which is either video or audio.
     * Never called the `mediaObject.src` directly to set it. This is because we need to set the `srcObject` of the VlcMediaContent which will be used in other methods. Always call the `VlcMediaContent.setSrc(src)` to se the source.
     * @param {string} src 
     */
    setSrc(src){
        if(src != ""){
            console.log(`The source object ${src}`);
            if(!Utility.path.isAbsolute(src)){
                console.log(`The path is not absolute ${src}`);
                src = Utility.path.resolve(__dirname, src);
            }
            this.srcObject.extension = Utility.path.extname(src);
            this.srcObject.directory = Utility.path.dirname(src);
            this.srcObject.basename = Utility.path.basename(src);
            this.srcObject.name = Utility.path.basename(src, this.srcObject.extension);
            this.name = this.srcObject.name;
            try{
                this.mediaObject.src = src;
            }
            catch(err){
                return false;
            }
            this.emit('source-set'); //emit that the source is set.
            console.log(this.srcObject);
            return true;
        }
       
        return false;
    }

    getSrc(){
        if(this.srcObject.directory){
            let pathString = Utility.path.join(this.srcObject.directory, this.srcObject.basename);
            return pathString;
        }
    }

    getName(){
        this.name = decodeURI(this.name);
        return this.name;
    }

    setName(name){
        this.name = name;
    }

    /**
     * The Id of the object in the database.
     * @returns int
     */
    getId(){
        return this.id;
    }

    /**
     * Only call this method if the id you want to set is from the database.
     * That means, you created the object and then saved it. After insertion into the database
     * the id will be returned and you can go ahead to set it here.
     * @param {int} id 
     */
    setId(id){
        this.id = id;
    }

    /**
     * This method formats the time given to it. By default, the time is the current
     * time of the mediaObject. It takes the time in seconds and formats it into H:mm:ss. (string)
     * @param {int} passedTime - if you want a specific time to be formated you can pass it here. Remeber,
     * it's in seconds. e.g. 3600 will return ["1:00:00", "3:05:47"] assuming that the 3:05:47 is the total duration of the mediaObject attached to the vlcMediaContent object.
     * @returns {array} [currentDuration text, totalDuration text]
     * This method is used on the progress bar where there is a current time and the total time.
     * It is also used in the bookmark timing.
     */
     formatTime(passedTime = -1){
         if(passedTime == -1){
             passedTime = this.getCurrentTime();
         }
        let durHours = Math.floor(this.getTotalDuration() / 3600);
        let durMins = Math.floor((this.getTotalDuration() - 3600 * durHours) / 60);
        let durSecs = Math.floor(this.getTotalDuration() % 60);

        let curHours = Math.floor(passedTime / 3600);
        let curMins = Math.floor((passedTime - 3600 * curHours) / 60);
        let curSecs = Math.floor(passedTime % 60);

        return [`${(curHours > 0) ?(curHours > 9 ? curHours : "0" + curHours + ":") : ""}${curMins > 9 ? curMins : "0" + curMins}:${curSecs > 9 ? curSecs : "0" + curSecs}`,
        
        `${(durHours > 0) ?(durHours > 9 ? durHours : "0" + durHours + ":"): ""}${durMins > 9 ? durMins : "0" + durMins}:${durSecs > 9 ? durSecs : "0" + durSecs}`];
    }

    /**
     * Sets the manager of the VlcMedia content
     * @param {Manager} manager 
     */

    setManager(manager){
        this.myManager = manager;
    }

    /**
     * Get the manager of this object.
     * @returns Manager
     */
    getManager(){
        return this.myManager;
    }

}

module.exports = VlcMediaContent;