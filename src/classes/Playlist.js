
/**
 * the playlist class
 */

const PlayListItem = require("./PlaylistItem");
const Utility = require("./Utility");
const VlcMediaContent = require("./VlcMediaContent");

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
     * @param {HTMLElement} container - The container to populate for the playlist. Make the playlist is empty
     */
    updateUiPlaylist(container, SQL){
      var db = Utility.openDatabase(SQL);

      items.forEach(item => {

        let result = db.exec(`SELECT * from ${type} id = ? `, [item.itemId]);

        if(result.length < 1){
          return;
        }

        let row = result[0].values[0];
        let playedTill = row[1];
        let itemName = row[2];
        let itemSource = row[3];

        let htmlItem = this.ItemHTMLFormat(item.itemId, itemName, "UNKNOWN ARTIST", VlcMediaContent.formatTime(playedTill)[0], itemSource, true);

        container.innerHTML += htmlItem;

      });


      Utility.closeDatabase(db);

    }

    ItemHTMLFormat(id, name, artistName, playTill, source, isFav){

      source = source.replace(/\\/g, "/");
        let listItem = `<tr
        class="bg-gray-50 
               dark:bg-gray-800 
               hover:bg-yellow-200 
               dark:hover:bg-gray-900 
               text-gray-700 
               dark:text-gray-400"
               >
      <td class="px-4 py-3">
        <div class="flex items-center text-sm">
          <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
            <img class="object-cover w-full h-full rounded-full" src="../assets/img/vlc-playing.png" alt="" loading="lazy" />
            <div class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></div>
          </div>
          <div onclick = "playItem(${source})">
            <p class="">${artistName}</p>
            <p class="text-xl font-semi-bold text-gray-600 dark:text-gray-400">${name}</p>
          </div>
        </div>
      </td>
      <td class="px-4 py-3 text-sm">${playTill}</td>
      <td class="px-4 py-3 text-xs">
        <span onclick="theManager.addToQueue(${id}, '${this.type}')" 
              class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-700"> + </span>
      </td>
      <td class="px-4 py-3 text-sm">
        <div id="like"
             class="text-${(isFav)?"red":"gray"}-500">
          <svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z"/></svg>
      </div>
      </td>`;

      return listItem;
    }

    /**
     * Only a manager can call this
     * @param {int} itemId - Id of the item to insert
     * @param {InitSqlJs} SQL - from SQL js 
     */
    addItem(itemId, SQL){

      let itemExist = false;
      
      for(i = 0; i < this.items.length; i++){
        if(items[i].itemId == itemId){
          itemExist = true;
          break;
        }
      }

      if(itemExist){
        return false;
      }

      var db = Utility.openDatabase(SQL);
      var result = db.exec(`INSERT into ${this.managedObject.type}PlaylistItem(playlistId, itemId) values (?, ?);
      SELECT id from ${this.managedObject.type}PlaylistItem where playlistId = ? and itemId = ?`, [this.id, itemId, this.id, itemId]);
      Utility.closeDatabase(db);

      if(result.length < 1){
        return false;
      }

      let id = result[0].values[0][0];
      //add to the playlist items array
      let item = new PlayListItem(id, this.id, itemId, this.type);
      this.items.push(item);

      return true;
    }

    /**
     * 
     * @param {int} id - item id to remove
     * @param {InitSqlJs} SQL - InitSQLjs from the
     */
    removeItem(id, SQL){

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
          <span class="hidden md:block px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-red-500 bg-red-50 rounded-full" onclick='theManager.addMedia(${this.id})'>+</span>
        </a>
      </li>`;

      return html;
    }

}