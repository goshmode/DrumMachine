const regBtn  = document.querySelector('#submit-reg');
const searchBtn = document.querySelector('#search-button');

window.onload = function() {
    
    homePull();
    listPull();
}

function homePull(){

	if (document.getElementById('homelogged')){

		fetch('http://localhost:3000/getHomeList')
		.then(response => response.json())
		.then(data => loadSongTable(data['data']));
	}
	else if (document.getElementById('homeactive')){

		fetch('http://localhost:3000/getAnonList')
		.then(response => response.json())
		.then(data => loadSongTable(data['data']));
	}
};

//generates a table based on the data pulled from songs database for a user.
//this code is partially based on a tutorial https://github.com/npatel023/ExpressMySQL
function loadSongTable(data,owner) {
    const table = document.querySelector('table tbody');

	//tells table whether or not to draw delete buttons on each track
	var admin= false;
	if (owner === 1){
		admin = true;
	}

    if (typeof data[0] === 'undefined') {
		if (owner === 2){
			table.innerHTML = "<tr><td class='no-data' colspan='6'>No results found!</td></tr>";
		}
		else{
        	table.innerHTML += "<tr><td class='no-data' colspan='6'>This user hasn't created any beats yet!</td></tr>";
		}
        return;
    }

    let tableHtml = '';
	tableHtml += '<tr class = "tableField"><th>songId</th><th>Title</th><th>Creator</th><th>Genre</th><th>BPM</th><th>Published</th>'
	if (admin){
		tableHtml += '<th>Delete</th>';
	}

	tableHtml += '</tr>'

    data.forEach(function ({songID, title, bpm, genre, published, username}) {
		//originally pulled username from app request but not getting it thru sql
		//console.log(songID, title, bpm, genre, published, username);
		tableHtml += '<tr>';
        tableHtml += `<td>${songID}</td>`;
		//generates link to create page for this songID
		//This will check if user has privilege to edit song or not.
        tableHtml += `<td><a href='/create/` + username + `&${songID}'>${title}</a></td>`;
		tableHtml += `<td><a href = '/profile/` + username + `'> ${username}</a></td>`;
		tableHtml += `<td>${genre}</td>`;
		tableHtml += `<td>${bpm}</td>`;
        tableHtml += `<td>${new Date(published).toLocaleString()}</td>`;
        //add delete button if the person is an admin
		if (admin){

        	tableHtml += `<td><button class="submit" id="delete-button" data-id=${songID}>Delete</td>`;
		}
        tableHtml += '</tr>';
    });

    table.innerHTML = tableHtml;
}


//handling button presses for delete button
document.querySelector('table tbody').addEventListener('click', function(event) {
    if(event.target.id === "delete-button"){
		console.log('hit delete on song ' + event.target.dataset.id);
		fetch('http://localhost:3000/deleteSong/' + event.target.dataset.id, {
			method: 'DELETE'
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				location.reload();
			}
		});
    }
});

//handling button presses for delete button
if (document.querySelector('#delete-account')){
	document.querySelector('#delete-account').addEventListener('click', function(event) {


			console.log('hit delete acct on user ' + event.target.dataset.id);

			fetch('http://localhost:3000/deleteAcct/' + event.target.dataset.id, {
				method: 'DELETE'
			})
			.then(response => {success:true})
			.catch((err)=>console.log(err));
			
	});
}

//handling button presses for make admin
if(document.querySelector("#make-admin")){
	document.querySelector('#make-admin').addEventListener('click', function(event) {


			console.log('hit make admin on ' + event.target.dataset.id);

			fetch('http://localhost:3000/makeAdmin/' + event.target.dataset.id, {
				method: 'PATCH'
			})
			.then(response => {success:true})
			.catch((err)=>console.log(err));
			
	});
}


//button action to change user info on profile page
function userBtn(field) {

	const element = document.getElementById(field).value;
	//console.log(element + " and also " + field);

	fetch('http://localhost:3000/userupdate/' + field, {
		method: 'PATCH',	
		headers: {
			'Content-type' : 'application/json'
		},
		body: JSON.stringify({
			data: element})}
	)
	//.then(response => response.json())
	.then(data => {
        if (data.success) {
            location.reload();
        }
    })
	.catch(err => console.log(err))
	
}

//shows a message below the track buttons for 2 seconds, then erases it.
async function saveMessage(words){

	//console.log('got to saveMessage ' + words);
	document.querySelector('#messages').textContent = words;
	await new Promise(r => setTimeout(r, 2000));
	document.querySelector('#messages').textContent = "";
}

function listPull(home){

	if (document.getElementById('user')){
		const username = document.getElementById('user').textContent;

		//if user is admin or owner of the page, place delete buttons in table
		if (document.getElementById('admin')){

			fetch('http://localhost:3000/getSongList/' + username)
			.then(response => response.json())
			.then(data => loadSongTable(data['data'], 1));
		}
		else{
			fetch('http://localhost:3000/getSongList/' + username)
			.then(response => response.json())
			.then(data => loadSongTable(data['data']));
		}

	}
};

if(searchBtn){
	searchBtn.onclick = function(){
			
			const title = document.querySelector('#title-search').value;
			const genre = document.querySelector('#genre-search').value;
			const user = document.querySelector('#user-search').value;
			console.log(title,genre,user);

			fetch('http://localhost:3000/search' + title + '&' + genre + '&' + user)
			.then(response => response.json())
			.then(data => loadSongTable(data['data'], 2));
		}
}
