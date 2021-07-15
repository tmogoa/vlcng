
/**
 * The VLC media content class
 * This class is the parent of the Vlc video and audio classes
 * You must set the static mediaObject first before calling the constructor
 */
const Utility = require('./Utility');
const EventEmitter = require('events');
const { timeStamp } = require('console');

 class VlcMediaContent extends EventEmitter{

    /**
     * Type of the Media content: Audio or Video
     */
    type;

    /**
     * The id of the Audio or Video in the database
     */
    id;

    /**
     * The src of the media content object
     * This is an object that has the directory, extension and basename field
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
     * 
     * @property {array} playbackSpeeds
     */
    playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    uiTotalDurationText; //The text showing the total duration of the video
    uiCurrentTimeText; //The text showing the current time in the video
    uiVolumeText; //the volume text of the volume
    uiVolumeButtonImg; //the volume button with the volume icon
    uiVolumeLevelBar; //the ui slider on the volume
    uiPlaySpeedButton; //the speed text
    uiPlayButton; //playbutton
    uiNameText; //The name of the media object
    uiVolumeInputRange;
    uiProgressBarInputRange;

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
     * Seek a certain time backward in the media
     * @param {int} numberOfSeconds 
     */
    backward(numberOfSeconds){

    }

    /**
     * moves forward a certain time in the media
     * @param {int} numberOfSeconds 
     */
    forward(numberOfSeconds){

    }

    /**
     * The Current time of the media object
     */
    getCurrentTime(){
        return this.mediaObject.currentTime;
    }

    /**
     * The time in H:m:s
     * @param {string} time 
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

    getTotalDuration(){
        return this.mediaObject.duration;
    }

    /**
     * Sets the source of the mediaObject which is either video or audio.
     * Never called the mediaObject.src directly because we need to set the srcObject of the VlcMediaContent
     * @param {string} src 
     */
    setSrc(src){
        if(src != ""){
            this.srcObject.extension = Utility.path.extname(src);
            this.srcObject.directory = Utility.path.dirname(src);
            this.srcObject.basename = Utility.path.basename(src);
            this.srcObject.name = Utility.path.basename(src, this.srcObject.extension);
            this.name = this.srcObject.name;
            this.mediaObject.src = src;
            this.emit('source-set'); //emit that the source is set.
            console.log(this.srcObject);
        }
       
        return;
    }

    getName(){
        return this.name;
    }

    setName(name){
        this.name = name;
    }

    getId(){
        return this.id;
    }

    setId(id){
        this.id = id;
    }

    /**
     * 
     * @returns {array} [currentDuration text, totalDuration text]
     */
     formatTime(){
        let durHours = Math.floor(this.getTotalDuration() / 3600);
        let durMins = Math.floor((this.getTotalDuration() - 3600 * durHours) / 60);
        let durSecs = Math.floor(this.getTotalDuration() % 60);

        let curHours = Math.floor(this.getCurrentTime() / 3600);
        let curMins = Math.floor((this.getCurrentTime() - 3600 * curHours) / 60);
        let curSecs = Math.floor(this.getCurrentTime() % 60);

        return [`${(curHours > 0) ?(curHours > 9 ? curHours : "0" + curHours + ":") : ""}${curMins > 9 ? curMins : "0" + curMins}:${curSecs > 9 ? curSecs : "0" + curSecs}`,
        
        `${(durHours > 0) ?(durHours > 9 ? durHours : "0" + durHours + ":"): ""}${durMins > 9 ? durMins : "0" + durMins}:${durSecs > 9 ? durSecs : "0" + durSecs}`];
    }

}

module.exports = VlcMediaContent;