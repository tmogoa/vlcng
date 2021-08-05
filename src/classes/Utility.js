/**
 * This is the Utility Class.
 * It contains the mostly used imports
 * And other methods that will be used by other classes
 * This class will initialize the database and should be called for database operations.
 * 
 */
const path = require("path");
const initSqlJs = require("sql.js");
const fs = require('fs');


class Utility{
    static path = path;
    static dbFileName = 'VLCNG.sqlite';
    static numOfTrials = 0;
    static databasePath;
    /**
     * This method initializes the database if and create all the tables incase they are not on the user's system. Be aware that the database is created in the userData/VLCNG.sqlite file.
     * @param {string} appPath - the root of the application
     */
    

    static initDb(){
        if(Utility.numOfTrials == 3){
            console.log('couldnot create the database');
            return false;
        };
       console.log(Utility.databasePath);
       
       let dbPath = Utility.path.join(Utility.databasePath, Utility.dbFileName);
        fs.access(dbPath, fs.constants.F_OK, (err) => {
            console.log('\n> Checking if the database exists');
            
            if (err) {
            console.error('database does not exist');
            // Create the file
            console.log('\nCreating the database');
            fs.appendFileSync(dbPath, '');
            Utility.numOfTrials++;
            Utility.initDb();
            }
            else {
                let fileBuffer = fs.readFileSync(dbPath);

                initSqlJs().then(function(SQL){
                    const db = new SQL.Database(fileBuffer); 
                    let query = fs.readFileSync(Utility.path.join(__dirname, "../", "storage", "schema.sql"), 'utf-8');
                    let result = db.exec(query)
                    if (Object.keys(result).length === 0 &&
                    typeof result.constructor === 'function' &&
                    Utility.closeDatabase(db)) {
                    console.log('Created or reopened the database.')
                    } else {
                    console.log('model.initDb.createDb failed.')
                    }
                });
            }
        });
      
    }


    static closeDatabase(dbHandle){
        try {
            let data = dbHandle.export();
            let dbPath = Utility.path.join(Utility.databasePath, Utility.dbFileName);
            let buffer = Buffer.alloc(data.length, data);
            fs.writeFileSync(dbPath, buffer);
            dbHandle.close();
            return true;
        } catch (error) {
            console.log("Can't close database file.", error);
            return null;
        }
    }

    /**
     * This method produces placeholders in the form of ?, ?, ? ...
     * @param {int} length - how many placeholders should be concatenated. 
     * @returns 
     */
    static generatePlaceholders(length){
        let placeholders = '';
        for(i = 0; i < length; i++){
            placeholders += "?,";
        }
        return placeholders.replace(/(\?,)$/,"?");
    }

    /**
     * Always call const SQL = await initSqlJs(); and pass SQL to this function if SQL is not already defined.
     * @param {initSqlJs} SQL 
     * @returns {SQL.Database} Db
     */
    static openDatabase(SQL){
        let dbPath = Utility.path.join(Utility.databasePath, Utility.dbFileName);
        console.log("opening database");
        let fileBuffer = fs.readFileSync(dbPath);
        return new SQL.Database(fileBuffer);
    }

    static openMediaHtml(type){
        let html = `<!--No recent media view-->
        <div
            class="
                bg-gray-50
                flex flex-row
                justify-between
                p-4
                rounded-lg
                text-gray-600
                items-center
                gap-8
            "
        >
            <span class="flex flex-row items-center gap-2">
                <img
                    src="../assets/img/schedule_black_24dp.svg"
                    alt=""
                    class="w-10"
                />
                <span class="font-medium">No recent ${type}</span>
            </span>
            <input type="file" style="display: none;" id="open-${type}-file" oninput="openMedia(this, '${type}')" accept="${type}/*"/>
            <button
                class="
                    py-3
                    px-4
                    bg-yellow-500
                    rounded-md
                    text-xs text-white
                    font-bold
                    flex-grow
                    w-4/12
                "
                onclick="document.getElementById('open-${type}-file').click()"
            >
                Open ${type} file
            </button>
        </div>`;

    return html;
    }

}

module.exports = Utility;