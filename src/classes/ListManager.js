
const Manager = require("./Manager");

class ListManager extends Manager{
    managedPlaylist;
    managedQueue;
    type;

    constructor(){
        super();
    }

}

module.exports = ListManager;