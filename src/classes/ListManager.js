
const Manager = require("./Manager");

class ListManager extends Manager{
    managedPlaylist;
    managedQueue;
    /**
     * Array of media objects
     */
    currentlyPlaying = [];
    type;

    constructor(){
        super();
    }


}

module.exports = ListManager;