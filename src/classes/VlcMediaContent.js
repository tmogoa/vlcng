
/**
 * The VLC media content class
 * This class is the parent of the Vlc video and audio classes
 * You must set the static mediaObject first before calling the constructor
 */
const Utility = require('./Utility');

 class VlcMediaContent{

    /**
     * Type of the Media content: Audio or Video
     */
    type;

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

    /**
     * The constructor
     * @param {string} type - 'video' or 'audio' 
     */
    constructor(type, src = ""){
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
     * @param {double} speed - the speed of the video (0.25x, 0.5x, 1x, 1.5x, 2x, 2.5x)
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

    }

    /**
     * The new volume of the media object
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
            this.mediaObject.src = src;
        }
       
        return;
    }

}

module.exports = VlcMediaContent;