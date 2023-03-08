const mysql = require('mysql');
const dotenv = require('dotenv');
const { response } = require('express');
const bcrypt = require('bcryptjs');
const db = require('./connection')
let instance = null;
dotenv.config();


//database connection class definition with methods for MYSQL interactions
class DbTools {
    static getDbToolsInstance() {
        return instance ? instance : new DbTools();
    }

    //registers new user
    async registerNew(name,email,pass) {

        let hashedPassword = await bcrypt.hash(pass, 8);
        let day = new Date();
    
        try{
        const response = await new Promise((resolve, reject) => {
            //query inserts info into database after validation
            db. query('INSERT INTO users set?', {
                username:name,
                email:email,
                pass: hashedPassword,
                date_added: day
            }, (err, result) => {
                if (err) {
                    reject(new Error(err.message));
                }
                resolve(result);
                })
            });
            //console.log(response.affectedRows);
            return response.affectedRows === 1 ? true : false;

        } catch (error) {
            console.log(error);
        }
    }

    //patches user info depending on passed params
    async updateUser(field, value, username){

        try{
            const response = await new Promise((resolve, reject) => {
                //query updates a single value within the db for specific username
                db. query('UPDATE users SET ?? = ? WHERE username = ?',[field,value,username]
                , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                    })
                });
                //console.log(response.affectedRows);
                //return true or false
                return response.affectedRows === 1 ? true : false;
    
            } catch (error) {
                console.log(error);
            }

    }

    //deletes song info from beats and songs based on songID
    async deleteSong(songID) {
        try {
            
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE songs,beats FROM songs INNER JOIN beats ON songs.songID = beats.songID WHERE songs.songID = ?;";
                db.query(query, songID , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            //console.log('affected rows is ', response.affectedRows);
            return response.affectedRows === 1 ? true : false;
        }
        catch(error){
            console.log(error);
        }
        
    }

    //deletes song info from beats and songs based on songID
    async deleteUser(userID) {
        try {
            
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE users FROM users WHERE users.userID = ?;";
                db.query(query, userID , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            //console.log('affected rows is ', response.affectedRows);
            return response.affectedRows === 1 ? true : false;
        }
        catch(error){
            console.log(error);
        }
        
    }
    

    //returns the unique Id of a user based on their 
    async getUserId(username){
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE username = ? LIMIT 1";
                db.query(query, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    //console.log(result);
                    resolve(result);
                })
            });
            return response;

        } catch (error) {
            console.log(error);
        }

    }

        //pulls all rows from songs for a matching userId
        async getSongList(id, limit) {
            try {
                const response = await new Promise((resolve, reject) => {
                    if (arguments.length === 1){
                    const query = "SELECT * FROM songs INNER JOIN users ON songs.userID = users.userID WHERE songs.userID = ?;";
    
                    db.query(query,[id], (err, results) => {
                        if (err) reject(new Error(err.message));
                        resolve(results);
                    })
                    }
                    //if 2 args, build query from userID and limit (for homepage)
                    else if (arguments.length === 2){
                        const query = "SELECT * FROM songs INNER JOIN users ON songs.userID = users.userID WHERE songs.userID = ? ORDER BY published DESC LIMIT " + limit + ";";
    
                        db.query(query,[id], (err, results) => {
                            if (err) reject(new Error(err.message));
                            resolve(results);
                        })

                    }
                    //if no args, send 5 most recently published songs
                    else {
                        const query = "SELECT * FROM songs INNER JOIN users ON songs.userID = users.userID ORDER BY published DESC LIMIT 5;"
    
                        db.query(query, (err, results) => {
                            if (err) reject(new Error(err.message));
                            resolve(results);
                        })
                    }
                    
                });
                //console.log('got to sql return');
                return response;
            } catch (error) {
                console.log(error);
            }
        }
    

    //pulls all rows from songs for a passed list of constraints of length count
    async getSearch(search,count) {
        try {

            const response = await new Promise((resolve, reject) => {
                var query = "SELECT * FROM songs INNER JOIN users ON songs.userID = users.userID WHERE ";

                for (const property in search){
                    //fixed field name since table is joined
                    if (property === 'userID') {
                        query += `users.userID = '${search[property]}'`;
                    }
                    else{
                        query += `${property} = '${search[property]}'`;
                    }
                    count--;

                    if (count > 0){
                        query += " AND ";
                    }
                }

                //console.log(query);
                db.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            //console.log('got to sql return');
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    //all database query functions used this reference:
    //https://www.npmjs.com/package/mysql#performing-queries
    async insertNewBeat(drum0,drum1,drum2,drum3,beat,genre,userID,title,bpm) {
        try {
            const day = new Date();
            //inserting into songs to get unique insertId
            const response = await new Promise((resolve, reject) => {

                const query = "INSERT INTO songs (title, userID, genre, bpm, published) VALUES (?,?,?,?,?);";
                db.query(query, [title,userID,genre,bpm,day] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId);
                })
            });

            //use insertId for insert into beats to link the two
            const response2 = await new Promise((resolve, reject) => {
                const query = "INSERT INTO beats (songId,drum0,drum1,drum2,drum3,beat) VALUES (?,?,?,?,?,?);";
                db.query(query, [response,drum0, drum1, drum2, drum3, beat] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            console.log('affected rows is ', response2.affectedRows);
            return response2.affectedRows === 1 ? true : false;

        } catch (error) {
            console.log(error);
        }
    }

    async replaceBeat(drum0,drum1,drum2,drum3,beat,genre,songID,title,bpm) {
        try {
            const day = new Date();
            //inserting into songs to get unique insertId
            const response = await new Promise((resolve, reject) => {

                const query = "UPDATE songs SET title = ?, genre = ?, bpm = ? WHERE songID = ?;";
                db.query(query, [title,genre,bpm,songID] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
            //console.log(response);
            //use insertId for insert into beats to link the two
            const response2 = await new Promise((resolve, reject) => {
                const query = "UPDATE beats SET drum0 = ?,drum1 = ?,drum2 = ?,drum3 = ?,beat=? WHERE songID = ?";
                db.query(query, [drum0, drum1, drum2, drum3, beat, songID] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            //console.log('affected rows is ', response2.affectedRows);
            return response2.affectedRows === 1 ? true : false;

        } catch (error) {
            console.log(error);
        }
    }

    //returns all rows the match ths songId provided
    async findBeatById(songId) {
        try {

            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM ?? WHERE songID = ?";
                db.query(query, ['beats', songId] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    //console.log(result);
                    resolve(result);
                })
            });
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    async findSongById(songId) {
        try {

            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM ?? WHERE songID = ?";
                db.query(query, ['songs', songId] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    //patches user to give them admin privileges
    async makeAdmin(username){

        try{
            const response = await new Promise((resolve, reject) => {
                //query updates a single value within the db for specific username
                db. query('UPDATE users SET admin = 1 WHERE username = ?',[username]
                , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                    })
                });
                //console.log(response.affectedRows);
                //return true or false
                return response.affectedRows === 1 ? true : false;
    
            } catch (error) {
                console.log(error);
            }

    }




}


module.exports = DbTools;