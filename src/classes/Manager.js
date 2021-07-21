const initSqlJs = require("sql.js");
const Utility = require("./Utility");
const Bookmark = require("./Bookmark");
const EventEmitter = require('events');

/**
 * This is the Manager class extents EventEmitter. Hence can emit and listen for events.
 * It is responsible to save the media content data to the database.
 * for example, adding a video or audio to the recently played videos or audio.
 * Managing the bookmarks, and updating last the last played time.
 * It will handle the management of playlists however, there must be a general manager to do that
 * since every video or audio has its own manager.
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
        //we initialize the database here.
        Utility.initDb();
    }

    /**
     * So, most often, the manager will set the source of the vlcVideo or VlcAudio.
     * @param {string} src - the source of the vlcMediaObject which is the managedObject 
     */
    setSrc(src){
        this.managedObject.setSrc(src);
    }

    /**
     * Updates the time of the managedObject
     */
    updateTime(){
        this.currentlyStoppedAt = this.managedObject.getCurrentTime();
    }

    /**
     * The manager registers its onclose method with the window so that when the window is closed, it will automatically updated the database if the need exist.
     */
    saveAllDataOnClose(){

    }

    /**
     * Telling the manager to perform her management functions
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
        this.initBookmarksList(SQL, db);
        this.listBookmarks();
        Utility.closeDatabase(db);
        
    }

    /**
     * To list the bookmarks
     */
    listBookmarks(){
        var bookmarksList = document.querySelector("#bookmarkList");
        bookmarksList.innerHTML = "";
        this.bookmarks.forEach(bookmark => {
            bookmarksList.innerHTML += this.returnedFormatedBookmark(bookmark);
        });
    }

    /**
     * This updates the time the media content was played upto and 
     * the recent played date.
     * 
     * @param {SQL} SQL - SQL from {initSqlJs}.SQL
     */
    updatePlayedTime(SQL){
        if(this.managedObject.isPlaying){
            const db = Utility.openDatabase(SQL);
            this.currentlyStoppedAt = this.managedObject.getCurrentTime();
            if(this.managedObject.id !== 'undefined'){
                db.run(`UPDATE ${this.managedObject.type} set playedTill = ? where id = ?`, [this.currentlyStoppedAt, this.managedObject.getId()]);
    
                db.run(`UPDATE recent${this.managedObject.type.charAt(0).toUpperCase() + this.managedObject.type.slice(1)} set datePlayed = CURRENT_TIMESTAMP where  ${this.managedObject.type}Id = ?`, [this.managedObject.getId()]);
            }
            Utility.closeDatabase(db);
            console.log("updated successfully");
        }
        
    }

    /**
     * Get's all the current bookmarks for the object
     * @param {Object} SQL - from {initSqlJs}.SQL 
     * @param {SQLiteDatabase} db - the database to deal with. If null, the function
     * creates its own. So if you already have a database opened, just pass it here. 
     */
    initBookmarksList(SQL, db = null){
        this.bookmarks = [];
        let wasPassed = true;
        if(db == null){
            db = Utility.openDatabase(SQL);
            wasPassed = false;
        }
        
        let result = db.exec(`SELECT * from ${this.managedObject.type}Bookmark where ${this.managedObject.type}Id = ?`, [this.managedObject.getId()]);
        if(result.length > 0){
            let values = result[0].values;
            values.forEach(row => {
                let bookmark = new Bookmark();
                bookmark.id = row[0];
                bookmark.currentTime = row[2];
                bookmark.description = row[3];
                bookmark.dateAdded = row[4];
                bookmark.type = this.managedObject.type;
                this.bookmarks.push(bookmark);
            });   
        }

        if(!wasPassed){
            Utility.closeDatabase(db);
        }
    }

    /**
     * This function adds bookmarks to the database for the currently managedObject.
     * The bookmark form must be opend in order to make this work. However, it can still work in the
     * background.
     */
    addBookmark(){

        let bookmarkTime = this.managedObject.getCurrentTime();
        let uiBookmarkTime = document.querySelector("#bookmark-added-time");
        uiBookmarkTime.innerHTML = this.managedObject.formatTime(bookmarkTime)[0];
        //remember to remove the event listner from the button
        let save = ()=>{
            let description = document.querySelector("#bookmark-description").value;
            if(this.managedObject.getId() !== 'undefined'){
                (async()=>{
                    const SQL = await initSqlJs();
                    let db = Utility.openDatabase(SQL);
                    db.run(`INSERT INTO ${this.managedObject.type}Bookmark(${this.managedObject.type}Id, markedTime, description) values (?, ?, ?)`, [this.managedObject.getId(), bookmarkTime, description]);
                    this.initBookmarksList(SQL, db);
                    this.listBookmarks();
                    Utility.closeDatabase(db);
                    //alert("Successfully added the bookmark");
                })();
            }
        }
        uiBookmarkSaveButton.addEventListener("click", save); 
        
        let keyDown = (evt)=>{
            console.log("keydown");
            if(evt.key == "Enter"){
                save();
            }
        }
        window.addEventListener('keydown', keyDown);

    }
  
    /**
     * Returns the sql to list a bookmark item in the bookmark list.
     * @param {Bookmark} bookmarkObject 
     * @returns string
     */
    returnedFormatedBookmark(bookmarkObject){
        let bookmark = `<div
        class="
            flex flex-row
            border
            rounded-md
            p-2
            items-center
            hover:bg-gray-100
            mb-2
        "
    >
        <div class="flex-grow flex flex-col" onclick='theManager.setCurrentTime(${bookmarkObject.currentTime})'>
            <span class="mb-2" >${this.managedObject.formatTime(bookmarkObject.currentTime)[0]}</span>
            <span class="text-xs"
                >${bookmarkObject.description}</span
            >
        </div>
        <div>
            <!--Close btn-->
            <button
                class="
                    p-2
                    rounded-full
                    focus:outline-none
                    hover:bg-yellow-500
                "
                onclick="theManager.deleteBookmark(${bookmarkObject.id})"
            >
                <img
                    src="../assets/img/close_black_24dp.svg"
                    alt=""
                />
            </button>
        </div>`;
        return bookmark;
    }

    /**
     * Deletes a bookmark from the database. It is called from the frontend. But if you have access
     * to the bookmark id from the backend, you can just call it incase you need to delete the bookmark.
     * @param {int} bookmarkId 
     */
    deleteBookmark(bookmarkId){
        (async()=>{
            const SQL = await initSqlJs();
            let db = Utility.openDatabase(SQL);
            db.run(`DELETE FROM ${this.managedObject.type}Bookmark where id = ?`, [bookmarkId]);
            this.initBookmarksList(SQL, db);
            this.listBookmarks();
            Utility.closeDatabase(db);
        })();
    }

        /**
         * create thumbnail of a video
         * @param {HTMLElement} imageObject 
         * @returns {HTMLElemet} image
         */
        makeThumbnail(imageObject) {

        var canvas = document.createElement("canvas");
        var container = document.getElementById(`video-thumbnail-container-${this.managedObject.getId()}`);
        if(container){
            var width = container.clientWidth;
            var height = container.clientHeight;
            canvas.width = (width / 3);
            canvas.height = height;
            canvas.getContext("2d").drawImage(this.managedObject.mediaObject, 0, 0, canvas.width, canvas.height);
            imageObject.src = canvas.toDataURL();
        }
        }

        setCurrentTime(currentTime){
            this.managedObject.setCurrentTime(currentTime);
        }

        /**
         * Remove the media object from the database
         * @param {initSQLJs.SQL} SQL 
         * @param {string} type - "video | audio"
         */
        static removeMediaObject(SQL, id, type = "video"){
            let db = Utility.openDatabase(SQL);
            //playlistItems
            db.run(`DELETE from ${type}PlaylistItem where itemId = ?`, [id]);
            //bookmark
            db.run(`DELETE from ${type}Bookmark where ${type}Id = ?`, [id]);
            //recent
            db.run(`DELETE from recent${type.charAt(0).toUpperCase() + type.slice(1)} were ${type}Id = ?`, [id]);
            //mediaContent
            db.run(`DELETE from ${type} where id = ?`, [id]);
            Utility.closeDatabase(db);
        }
}

module.exports = Manager;
