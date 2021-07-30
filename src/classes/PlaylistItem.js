/**
 * Represents and Item in a playlist
 * basically, it is a data object
 */

class PlayListItem{
    id; //the id of the playlist from the database
    playListId; //the playlist the playlist is part of
    itemId; //the id of the audio or video that is part of this list
    type; //audio or video

    constructor(id, playListId, itemId, type){
        this.id = id;
        this.playListId = playListId;
        this.itemId = itemId;
        this.type = type;
    }

}

module.exports = PlayListItem;