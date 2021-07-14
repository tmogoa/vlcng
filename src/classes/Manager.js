/**
 * This is the Manager class
 */

const Utility = require("./Utility");
const EventEmitter = require('events');

class Manager extends EventEmitter{
    currentlyPlayingMediaSrc = "";
    /**
     * the managed object of the manager
     */
    managedObject;

    /**
     * The time at which the currently playing object stopped
     */
    currentlyStoppedAt;

    /**
     * Contains all the bookmark ids for the managedObject
     */
    bookmarks = [];

    constructor(){
        super();
        Utility.initDb();
    }

    /**
     * 
     * @param {string} src - the source of the vlcMediaObject which is the managedObject 
     */
    setSrc(src){
        this.managedObject.setSrc(src);
    }

    /**
     * Updates the time of the managedObject
     */
    updateTime(){
        this.managedObject.mediaObject.addEventListener('timeupdate', ()=>{
            this.currentlyStoppedAt = this.managedObject.getCurrentTime();
        });
    }

    /**
     * The manager registers its onclose method with the window so that when the window is closed, it will automatically updated the database if the need exist.
     */
    saveAllDataOnClose(){

    }

    /**
     * Telling the manager to perform his management function
     */
    manage(){
        this.addListener('managed-object-ready', ()=>{

            console.log('managing the object');

        });
    }

}

module.exports = Manager;
