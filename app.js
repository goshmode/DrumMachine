const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const dbTools = require('./dbTools');
const connection = require('./connection');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const db = require('./connection');
const port = 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(cors());

//to make css and js available
app.use(express.static('public'));
app.use(express.urlencoded({extended: 'false'}));
app.use(express.json());

//express session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

var sess;

//READING all songs for a specific user
app.get('/getSongList/:un', async (request, response) => {

    //get username from params and then find associated userID
    const {un} = request.params;
    const db = dbTools.getDbToolsInstance();
    var id;

    const info = await new Promise((resolve, reject) => {
        const result = db.getUserId(un);

        result
        .then(data => resolve(data[0].userID))
        .catch(err => console.log(err));
    })
    //console.log(info);
    id = info;
    //console.log(id);

    //then get songs for that userID
    const result = db.getSongList(id);
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

//READING specific number of songs for a specific user, ordered DESC
app.get('/getHomeList', async (request, response) => {

    //get username from params and then find associated userID
    const un = request.session.username;
    const limit = 5;
    const db = dbTools.getDbToolsInstance();
    var id;

    const info = await new Promise((resolve, reject) => {
        const result = db.getUserId(un);

        result
        .then(data => resolve(data[0].userID))
        .catch(err => console.log(err));
    })
    //console.log(info);
    id = info;

    //then get songs for that userID
    const result = db.getSongList(id,limit);
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

//READING 5 songs for anon user, ordered DESC by date published
app.get('/getAnonList', async (request, response) => {

    //get username from params and then find associated userID
    const db = dbTools.getDbToolsInstance();

    //then get songs for that userID
    const result = db.getSongList();
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})


//creating account from register page
app.post('/auth/register', async (req, res) => {

    const db = dbTools.getDbToolsInstance();

    //checking for valid entries and matching passwords
    const {name, email, pass, confirmpass} = req.body;
    //console.log(name, email, pass);
    if ((!name) || (!email || (!pass) || (!confirmpass))){
        return res.render('register', {title:'Register', login:false, message: 'Missing Something!' });
    }
    if (pass !== confirmpass) {
        return res.render('register', {title:'Register', login:false, message: 'Password Must Match!!' });
    }

    //username check to see if someone already registered this un
    const check = await new Promise((resolve, reject) => {
        const result = db.getUserId(name);

        result
        .then(data => resolve(data[0]))
        .catch(err => console.log(err));
    })
    //undefined return for check means the username is good to go, otherwise reload page with message
    if (typeof check !== 'undefined'){
        return res.render('register', {title:'Register', login:false, message: 'That username is already in use :(' });
    }

    //registerNew returns fulfilled promise resolution on attempt to register to database
    const result = db.registerNew(name,email,pass);
    //console.log('registered successfully');
    result
    .then(data => res.render('login', {title:'Log In', login:false, message: 'You are now registered! Log in!' }))
    .catch(err => console.log('Caught Error: ',err));
})

//creating account from register page
app.patch('/userupdate/:field', async (req, res) => {

    const db = dbTools.getDbToolsInstance();
    //console.log(req);
    //getting values from params and also POST JSON
    const {field} = req.params;
    const input = req.body.data;
    const username = req.session.username;
    var data;

    if (field === 'pass'){
        data = await bcrypt.hash(input, 8);
    }
    else{
        data = input;
    }
    //console.log(data);
    //updateUser patches the necessary field
    const result = db.updateUser(field, data, username);

    result
    //.then(data => res.render('profile', { title: username, owner:true, un: username, login: req.session.loggedin, message: field + ' Updated!'}))
    .then(data => console.log({Success:true}))
    .catch(err => console.log('Caught Error: ',err));
    
})

//hashes a password
async function hashCompare(pass,hashPass){

    //console.log('got to bcrypt compare');
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.compare(pass, hashPass, (err, res) => {
          if (err){ 
            console.log(err);
          };
          resolve(res);
        });
      })
      return hashedPassword;
}


//search function determines how many fields in search query have been filled out and runs a query on songs db
app.get('/search:title?&:genre?&:userID?', async function(request, response) {
    const db = dbTools.getDbToolsInstance();

    //determining what variables to send to query maker
    const field = [];
    var count = 0;
    if (request.params['title']){

        count +=1;
        field.push('title');
    }
    if (request.params['genre']){

        count += 1;
        field.push('genre');
    }
    if (request.params['userID']){

        count += 1;

        //need to get userID from username if this query is here
        const info = await new Promise((resolve, reject) => {
            const result = db.getUserId(request.params['userID']);

            result
            .then(data => {
                if (data[0]){
                    resolve(data[0].userID);
                }
                else{
                    resolve('');
                }
            })
            .catch(err => console.log(err));
        })
        //console.log(info);
        request.params['userID'] = info;

        field.push('userID');
    }
    const search = {};
    for (var i = 0; i < count; i++) { 
        //console.log(field[i]);
        search[field[i]] = request.params[field[i]];
     }
    //console.log(search);

    //then get songs for that query
    const result = db.getSearch(search,count);
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));

});


//login check from login page
app.post('/auth/check', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
    let password = request.body.password;
    
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT username,pass,admin FROM users WHERE username = ?', [username], async function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) {
                return console.log(error);
            }
            //if there is a matching username...
			if (results.length > 0)  {

                //pass the result of query to compare hash function
                const recordedPassword = results[0].pass;
                const recordedUsername = results[0].username;


                //compare pass with hashed pass. if true, redirect to home page with message. else back to login.
                //bcrypt.compare(password,recordedPassword, function(err, res) 
                const check = await hashCompare(password,recordedPassword);

                //if those checks pass, set up login session details
                if(check) {
                    
                    request.session.loggedin = true;
                    //request.session.username = username;
                    request.session.username = recordedUsername;
                    request.session.admin = 0;

                    //if user has admin privileges
                    if (results[0].admin === 1){
                        request.session.admin = 1;
                    }

                    // Redirect to home page
                    //console.log('login success');
                    return response.render('index', {title: 'Home', login:true, un:request.session.username, admin:request.session.admin, message: 'User Logged In!'});

                    }
                //render login with incorrect pw message if failed 
                else {
                    //console.log('passwords do not match');
                    return response.render('login', { title: 'Login',login: false, message:'Incorrect Username and/or Password!'});

			    } 

            }
            //render login if username not found
            //console.log('username doesnt exist');
            response.render('login', { title: 'Login', login:false, message:'Incorrect Username and/or Password!'});
            response.end();
        })
	//catch for missing un or pw
    } else {
        //console.log('didnt enter both user and pass');
        response.render('login', { title: 'Login', login:false, message:'Please enter Username and Password!'});
        response.end();
	}
});


// CREATE row in beats and songs database
// code snippets from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
app.post('/save', async (request, response) => {
    //console.log('made it to app.js post function');
    const db = dbTools.getDbToolsInstance();
    sess = request.session;

    const info = await new Promise((resolve, reject) => {
        const result = db.getUserId(sess.username);

        result
        //.then(data => response.json({data : data}))
        .then(data => resolve(data))
        .catch(err => console.log(err));
    })

    const userID = info[0].userID;
    const beat = request.body.body;
    const drum0 = request.body.drum0;
    const drum1 = request.body.drum1;
    const drum2 = request.body.drum2;
    const drum3 = request.body.drum3;
    const genre = request.body.genre;
    const title = request.body.title;
    const bpm = request.body.bpm;

    const result = db.insertNewBeat(drum0,drum1,drum2,drum3,beat,genre,userID,title,bpm);

    result
    .then(data => {console.log('Success:', data)})
    .then(data => () =>{

    })
    .catch(err => console.log(err));

});

// UPDATE beat/song if it's already been created
app.patch('/save/:id', async (request, response) => {
    //console.log('made it to app.js post function');
    const db = dbTools.getDbToolsInstance();
    sess = request.session;
    const {id} = request.params;
    
    const userID = id;
    const beat = request.body.body;
    const drum0 = request.body.drum0;
    const drum1 = request.body.drum1;
    const drum2 = request.body.drum2;
    const drum3 = request.body.drum3;
    const genre = request.body.genre;
    const title = request.body.title;
    const bpm = request.body.bpm;

    const result = db.replaceBeat(drum0,drum1,drum2,drum3,beat,genre,userID,title,bpm);

    result
    .then(data => {console.log('Success:', data)})
    .then(data => () =>{

    })
    .catch(err => console.log(err));

});

//READ endpoint handling - used to query the db by songId to return a saved track
app.get('/getSong/:id', (request, response) => {
	const {id} = request.params;
    //console.log('making call to dbTools with id ' + id);
    const db = dbTools.getDbToolsInstance();

    const result = db.findBeatById(id);

    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));

});


//delete
app.delete('/deleteSong/:id', (req,res)=> {
    const {id} = req.params;
    const db = dbTools.getDbToolsInstance();

    const result = db.deleteSong(id);
    
    result
    .then(data => res.json({success:true}))
    .catch(err => console.log(err));

})

//delete
app.delete('/deleteAcct/:un', async (request, response)=> {
    const {un} = request.params;
    const db = dbTools.getDbToolsInstance();

    //start off by getting userID from passed username
    var id;
    const info = await new Promise((resolve, reject) => {
        const result = db.getUserId(un);

        result
        .then(data => resolve(data[0].userID))
        .catch(err => console.log(err));
    })
    //console.log(info);
    id = info;
    //console.log(id  + ' is the userID to be deleted');

    //then get songs for that userID
    const list = await new Promise((resolve, reject) => {
        const result = db.getSongList(id);
        result
        .then(data => resolve(data))
        .catch(err => console.log(err));
    })
    //console.log('list of songs to be deleted');
    //console.log(list);

    //remove all songs in that list
    list.forEach(async function ({songID}) {
        const list = await new Promise((resolve, reject) => {
            const remove = db.deleteSong(`${songID}`);

            remove
            .then(data => resolve(true))
            .catch(err => console.log(err));
        });
    });

    response.end();

    
})

app.patch('/makeAdmin/:un', (req,res)=>{
    const {un} = req.params;
    const db = dbTools.getDbToolsInstance();

    const result = db.makeAdmin(un);
    
    result
    .then(data => res.json({success:true}))
    .catch(err => console.log(err));

})


//////////////////////ROUTING//////////////////////////
///////////////////////////////////////////////////////


//both / and /index route to the homepage. two options for each
app.get('/', (req, res) => {
    sess = req.session;

    if (sess.loggedin){
        return res.render('index', { title: 'Home', un: sess.username, login:sess.loggedin, admin:sess.admin});
    }
    else{
        res.render('index', { title: 'Home', login:false});
    }

})

app.get('/index', (req, res) => {
    sess = req.session;
    if (sess.loggedin){
        return res.render('index', { title: 'Home', un: sess.username, login:sess.loggedin, admin:sess.admin});
    }
    else {
        res.render('index', { title: 'Home', login:false});
    }

})

//profile has 3 paths depending on whether someone is logged in and also the account owner
app.get('/profile/:id', async (req, res) => {

    const db = dbTools.getDbToolsInstance();
    const {id} = req.params;
    sess = req.session;
    //console.log('admin status is: ' + sess.admin);

    const info = await new Promise((resolve, reject) => {
        const result = db.getUserId(id);

        result
        //.then(data => response.json({data : data}))
        .then(data => resolve(data))
        .catch(err => console.log(err));
    })
    
    if ((id === sess.username) || (sess.admin === true)){
        return res.render('profile', { 
            title: id,
            owner:true,
            un: sess.username,
            login:sess.loggedin,
            admin:sess.admin,
            message:'',
            email:info[0].email,
            bio: info[0].bio,
            date: new Date(info[0].date_added).toLocaleString()
        });
    }
    else if (sess.loggedin){
        return res.render('profile', { 
            title: id,
            owner:false, 
            un: sess.username,
            login:sess.loggedin,
            admin:sess.admin,
            message:'',
            email:'',
            bio: info[0].bio,
            date: new Date(info[0].date_added).toLocaleString()
            });
    }
    else {
        res.render('profile', {
            title: id,
            un:id,
            login:false,
            owner: false,
            admin: false,
            message:'',
            bio: info[0].bio,
            date: new Date(info[0].date_added).toLocaleString()
        });
    }

});

//create page attached to a specific song
app.get('/create/:name&:id', async (req, res) => {
    const db = dbTools.getDbToolsInstance();
    const {name} = req.params;
    const {id} = req.params;
    sess = req.session;

    //finding the matching userID for the username param
    const info = await new Promise((resolve, reject) => {
        const result = db.findSongById(id);

        result
        .then(data => resolve(data))
        .catch(err => console.log(err));
    })
    console.log(info[0].title);
    if (name === sess.username){
        return res.render('create', { 
            title: 'Create',
            owner:true,
            un: name,
            songId: id,
            login:sess.loggedin,
            admin:sess.admin,
            message:'',
            bpm:info[0].bpm,
            songtitle: info[0].title,
            genre: info[0].genre
        });

    }
    else if (sess.loggedin){
        return res.render('create', { 
            title: 'Create',
            owner:false,
            un: name,
            songId: id,
            login:sess.loggedin,
            admin:sess.admin,
            message:'',
            bpm:info[0].bpm,
            songtitle: info[0].title,
            genre: info[0].genre
        });
    }
    else {
        return res.render('create', { 
            title: 'Create',
            owner:false,
            un: name,
            songId: id,
            login: sess.loggedin,
            admin:sess.admin,
            message: '',
            bpm:info[0].bpm,
            songtitle: info[0].title,
            genre: info[0].genre
        });
    }

});

//create page for starting a new song
app.get('/create', (req, res) => {
    sess = req.session;

    //create a saveable song
    if (sess.loggedin){
        return res.render('create', { title: 'Create', un: sess.username, login:sess.loggedin, admin:sess.admin, songId:false, owner:true, bpm:120});
    }
    //else anonymous view
    else {
        res.render('create', { title: 'Create', login:false, songId:false, owner:false});
    }

});

//search page. only difference between the two is sending login details for nav
app.get('/explore', (req, res) => {
    sess = req.session;
    if (sess.loggedin){
        return res.render('explore', { title: 'Explore', un: sess.username, login:sess.loggedin, admin:sess.admin});
    }
    else {
        res.render('explore', { title: 'Explore', login:false});
    }

})

//learn page. basically static, but sends login details for nav
app.get('/learn', (req, res) => {
    sess = req.session;
    if (sess.loggedin){
        return res.render('learn', { title: 'Learn', un: sess.username, login:sess.loggedin, admin:sess.admin});
    }
    else{ 
        res.render('learn', { title: 'Learn', login:false});
    }

})

//login page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Log in', message:'', login:false});

})

//register page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', message:'', login:false});

})

//privacy policy page
app.get('/privacy', (req, res) => {
    res.render('privacy', { title: 'Privacy Policy', login:false});

})

//forgot password page. doesn't really do anything yet.
app.get('/forgot', (req, res) => {
    res.render('forgot', { title: 'Forgot Password', login:false});

})

//logout endpoint
app.get('/logout', (req, res) => {
    //console.log('logging out');
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
})

//404 file not found endpoint
app.use((req,res) =>{
    sess = req.session;
    if (sess.loggedin){
        return res.status(404).render('404', { title: '404', un: sess.username, login:sess.loggedin, admin:sess.admin});
    }
    else{
        res.status(404).render('404', { title: '404', login:false});
    }
});


//listen function
app.listen(port, function(error) {
    if (error) {
        console.log('Something went wrong', error)
    }
    else {
        console.log(`Server is listening on port ${port}`)
    }
})
