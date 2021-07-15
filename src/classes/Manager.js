const initSqlJs = require("sql.js");
const Utility = require("./Utility");
const EventEmitter = require('events');

/**
 * This is the Manager class.
 * It is responsible to save the media content data to the database.
 * for example, adding a video or audio to the recently played videos or audio.
 * Managing the bookmarks, and updating last the last played time.
 */

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

            //check if the object exist in the database, if not, add it with its current data.
            (async()=>{
                const SQL = await initSqlJs();
                
                
                //adding the object
                this.checkObjectPersistence(SQL);
                
                setInterval(() => {
                    this.updatePlayedTime(SQL);
                }, 5000);


            })();

        });
    }

    /**
     * Checks if an object exist in the database else, adds it.
     * 
     */
    checkObjectPersistence(SQL){
        const db = Utility.openDatabase(SQL);
        let result = db.exec(`SELECT id from ${this.managedObject.type} where name = ? and source = ?`, [this.managedObject.getName(), this.managedObject.mediaObject.src]);
        
        if(result.length < 1){
            //add
            db.run(`INSERT into ${this.managedObject.type}(playedTill, name, source) values (?, ?, ?)`, [this.managedObject.getCurrentTime(), this.managedObject.getName(), this.managedObject.mediaObject.src]);
            
            result = db.exec(`SELECT id from ${this.managedObject.type} where name = ? and source = ?`, [this.managedObject.getName(), this.managedObject.mediaObject.src]);

            //insert into recent video
            db.run(`INSERT into recent${this.managedObject.type.charAt(0).toUpperCase() + this.managedObject.type.slice(1)}(${this.managedObject.type}Id) values (?)`, [result[0].values[0][0]]);

        }

        this.managedObject.setId(result[0].values[0][0]);
        console.log(db.exec("SELECT * from " + this.managedObject.type));
        Utility.closeDatabase(db);
        
    }

    /**
     * This updates the time the media content was played upto and 
     * the recent played date.
     * SQL from {initSqlJs}.SQL
     * @param {SQL} SQL 
     */
    updatePlayedTime(SQL){
        const db = Utility.openDatabase(SQL);
        this.currentlyStoppedAt = this.managedObject.getCurrentTime();
        if(this.managedObject.id !== 'undefined'){
            db.run(`UPDATE ${this.managedObject.type} set playedTill = ? where id = ?`, [this.currentlyStoppedAt, this.managedObject.getId()]);

            db.run(`UPDATE recent${this.managedObject.type.charAt(0).toUpperCase() + this.managedObject.type.slice(1)} set datePlayed = CURRENT_TIMESTAMP where  ${this.managedObject.type}Id = ?`, [this.managedObject.getId()]);
        }
        Utility.closeDatabase(db);
        console.log("updated successfully");
    }
    addBookmark(SQL){
        this.managedObject.pause();
    
        let bookmarkTime = this.managedObject.getCurrentTime();
        this.showBookmarkForm();
        

    }
    showBookmarkForm(){
        let bookmarkForm = document.querySelector("#bookmardId");
        bookmarkForm.style.visibility = "visible"
    }




}

module.exports = Manager;
