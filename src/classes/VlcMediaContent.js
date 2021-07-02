
/**
 * The VLC media content class
 * This class is the parent of the Vlc video and audio classes
 * You must set the static mediaObject first before calling the constructor
 */

export default class VlcMediaContent{

    /**
     * Type of the Media content: Audio or Video
     */
    type;

    /**
     * The src of the media content object
     * This is an object that has the directory and src field
     */
    srcObject;

    /**
     * Name of the content
     */
    name;

    /**
     * @property {object} mediaObject - The actual media object. Either video or Audio
     */
    static mediaObject;


    /**
     * The constructor
     * @param {string} type - 'video' or 'audio' 
     */
    constructor(type, src = ""){
        this.type = type;
        this.src = src;
        VlcMediaContent.mediaObject.src = this.src;

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
     * @param {int} speed - the speed of the video (5x, 10x)
     */
    play(speed){

    }

    /**
     * pauses a VLCMedia content: audio or video
     */
    pause(){

    }

    stop(){

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

    }

    getVolume(){

    }

    

}

