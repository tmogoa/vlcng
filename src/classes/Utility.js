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
     * @param {Object} SQL 
     * @returns Object Db
     */
    static openDatabase(SQL){
        let dbPath = Utility.path.join(Utility.databasePath, Utility.dbFileName);
        console.log("opening database");
        let fileBuffer = fs.readFileSync(dbPath);
        return new SQL.Database(fileBuffer);
    }

    /**
     * 
     * @param {array} arr - sorted array
     * @param {*} needle 
     */
    static binSearch(arr, needle){
        let low = 0;
        let high = arr.length - 1;
        let index = Math.floor((low + high)/2);
        while(low <= high){

            index = Math.floor((low + high)/2);

            if(arr[index] == needle){
                return index;
            }
            else if(arr[index] > needle){
                high = index - 1;
            }
            else{
                low = index + 1;
            }

        }
        return -1;
    }

}

module.exports = Utility;