
/**
 * the playlist class
 */

const PlayListItem = require("./PlaylistItem");
const Utility = require("./Utility");

class PlayList{
    /**
     * A playlist can be of type audio, or video
     */
    type;

    /**
     * Array of playlist items
     */

    items = [];

    /**
     * id of the playlist item
     */

    id;

    /**
     * Playlist name
     */
    name;
    
    /**
     * Playlist description
     */
    description;

    /**
     * 
     * @param {int} id - the id of the item in the database
     * @param {string} type - `audio` or `video` 
     * @param {initSqlJs} SQL - Sql from init SQL JS;
     * Only a manager can call the playlist and as it to init itself;
     */
    constructor(id, type, SQL){
        this.id = id;
        this.type = type;
        this.initItem(SQL);
    }

    /**
     * put the items of the playlist in the items array
     * @param {initSqlJs} SQL - The Sql from initSqlJs
     */
    initItem(SQL){

        const db = Utility.openDatabase(SQL);
        let result = db.exec(`SELECT * from ${this.type}PlaylistItem WHERE id = ?`, [this.id]);
        Utility.closeDatabase(db);

        if(result.length < 1){
            return;
        }

        let result = result[0].values;
        result.forEach(item => {
            let playListItem = new PlayListItem(item[0], item[1], item[2], this.type);
            this.items.push(playListItem);
        });
    }


    /**
     * Updates the ui and list the items in a playlist
     * @param {HTMLElement} container - The container to populate for the playlist
     */
    updateUiPlaylist(container){

    }


    /**
     * Only a manager can call this
     * @param {int} id 
     * @param {InitSqlJs} SQL - from SQL js 
     */
    addItem(id, SQL){

    }

    /**
     * 
     * @param {int} id - item id to remove
     * @param {InitSqlJs} SQL - InitSQLjs from the
     */
    removeItem(id, SQL){

    }

    /**
     * 
     * @param {PlayListItem} playlistItem - The item to return an HTML string for
     */
    htmlPlayListItem(playlistItem){
        //let play
    }

    htmlFormat(){
        let html = `
        <li id="${this.type}-playlist-${this.id}" onclick="theManager.loadPlaylist(${this.id})">
        <a href="#" class="relative flex flex-row items-center h-11 focus:outline-none hover:bg-yellow-500 dark:hover:bg-gray-600 text-white-600 hover:text-white-800 border-l-4 border-transparent hover:border-blue-500 dark:hover:border-gray-800 pr-6">
          <span class="inline-flex justify-center items-center ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </span>
          <span class="ml-2 text-sm tracking-wide truncate">${this.name}</span>
          <span class="hidden md:block px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-red-500 bg-red-50 rounded-full">+</span>
        </a>
      </li>`;
    }

}