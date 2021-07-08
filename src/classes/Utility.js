/**
 * This is the Utility Class.
 * It contains the mostly used imports
 * And other methods that will be used by other classes
 * This class will initialize the database and should be called for database operations.
 * 
 */
const path = require("path");
const SQL = require("sql.js");

class Utility{
    static path = path;
    static dbFileName = 'VLCNG.db';
    /**
     * This method initializes the database if and create all the tables incase they are not on the user's system.
     */
    static initDb(appPath){
        let dbPath = path.join(appPath, Utility.dbFileName);
        let createDb = function (dbPath) {
            // Create a database.
            let db = new SQL.Database();
            let query = fs.readFileSync(
            path.join(__dirname, '../','storage', 'schema.sql'), 'utf8');
            let result = db.exec(query);
            if (Object.keys(result).length === 0 &&
            typeof result.constructor === 'function' &&
            SQL.dbClose(db, dbPath)) {
            console.log('Created a new database.')
            } else {
            console.log('model.initDb.createDb failed.')
            }
        }
        let db = SQL.dbOpen(dbPath)
        if (db === null) {
            /* The file doesn't exist so create a new database. */
            createDb(dbPath)
        } else {
            /*
            The file is a valid sqlite3 database. This simple query will demonstrate
            whether it's in good health or not.
            */
            let query = 'SELECT count(*) as `count` FROM `sqlite_master`'
            let row = db.exec(query)
            let tableCount = parseInt(row[0].values)
            if (tableCount === 0) {
            console.log('The file is an empty SQLite3 database.')
            createDb(dbPath)
            } else {
            console.log('The database has', tableCount, 'tables.')
            }
            if (typeof callback === 'function') {
            callback()
            }
        }
    }

    /**
     * This function synchronous inserts into the database
     * @param {string} tableName - the name of the table in which the data should be inserted 
     * @param {array} columnsSpecificationArray - the column specification array. e.g. inserting into the videos table will have columnSpecificationArray be ['playedTill', 'name', 'source'] 
     * @param {array} values - the values to insert for example [14.5, 'Car 3', 'c:/videos/car 3.mp4']
     */
    static insertIntoTable(tableName, columnsSpecificationArray, values){

    }

    /**
     * Selects data from a table
     * @param {string} tableName - the name of the table to select from 
     * @param {array} columnSpecificationArray - array of columns to be selected form the table 
     * @param {array} conditionColumns - the columns the on which the condition should be specified
     * @param {array} conditionValues - the values for the conditions in the condition array. The order matters. 
     * @param {string} logicalOperator - the operator used to join the conditions. default is `and`.
     */
    static queryTable(tableName, columnSpecificationArray, conditionColumns, conditionValues, logicalOperator = 'and'){

    }

    /**
     * Updates the values of a particular table.
     * @param {string} tableName - the table name 
     * @param {array}columnSpecificationArray - columns to update
     * @param {array} valuesSpecificationArray - new values for the column. The order matters
     * @param {array} conditionColumns - columns on which condition will be for the update
     * @param {array} conditionValues - values for the condition column
     * @param {string} logicalOperator - logical operator to join the columns. default is `and`
     */
    static updateTable(tableName, columnSpecificationArray, valuesSpecificationArray, conditionColumns, conditionValues, logicalOperator = 'and'){

    }

    /**
     * Deletes from a particular table. 
     * @param {string} tableName 
     * @param {array} columnSpecificationArray 
     * @param {array} conditionColumns 
     * @param {array} conditionValues 
     * @param {string} logicalOperator 
     */
    static deleteFromTable(tableName, columnSpecificationArray, conditionColumns, conditionValues, logicalOperator){

    }

    /**
     * Performs a raw SQL query on the database.
     * @param {string} sql - The raw SQL query your want to run.
     */
    static performRawQuery(sql){

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
}

module.exports = Utility;