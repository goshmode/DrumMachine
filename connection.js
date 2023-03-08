const mysql = require('mysql');
const dotenv = require('dotenv');
const { response } = require('express');
const bcrypt = require('bcryptjs');
dotenv.config();

//creating db connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'drumsaves',
    port: process.env.DB_PORT
})

//connecting to db
db.connect(err => {
    if(err) {
        throw err
    }
    console.log("MySql Connected");
})

module.exports = db;
