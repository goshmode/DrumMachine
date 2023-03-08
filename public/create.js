
const saveBtn = document.querySelector('#save-btn');
const pullBtn = document.querySelector('#pull-btn');
const clearBtn = document.querySelector('#clear-btn');
const drumBtn = document.querySelectorAll('.drumbutton');


//sets up listeners for all drum button class elements
for (let i = 0; i < drumBtn.length; i++) {
	drumBtn[i].addEventListener("click", function() {
	  
	});
}

//drumbeat object holds the data for the drum machine. 
const drumbeat = {
		'beat' : [
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		],
		'drumPaths': ['78kick.wav','78snare.wav','78hat.wav','78open.wav'],
		'currentDrum' : 0,
		'bpm' : 120,
		'play': 0
}


//sets initially active drum button to drum0
window.onload = function() {

	//selects kick drum on load
	if (document.querySelector('#drum0')){
		togglebtn('drum0');
	}

	songPull();

	//sets bpm to whatever the song calls for
	if (document.querySelector('#bpm')){

		const title = document.querySelector('#song-title').textContent;
		document.querySelector('#title-input').value = title;
		drumbeat.bpm = document.querySelector('#bpm').textContent;
		document.querySelector('#bpm-form').value = drumbeat.bpm;

	}

	
};

//refreshes the drumbeat object bpm to reflect the view
function updateBPM(element) {
	drumbeat.bpm = element.value;
}

//playsound plays a sound from a file path
function playsound(file){
	
	const audio = new Audio(file);
	audio.play();
}

//adding event listeners for all 4 drumbuttons
for (let i = 0; i < drumBtn.length; i++) {
	drumBtn[i].addEventListener('click', function(event) {
	  	//console.log('pressed ' + event.target.id);
		num = event.target.id.charAt(4);
	  	drumpush(drumbeat.drumPaths[num], num, event.target.id)
	});
}

//actions for each drum push button
function drumpush(path,num,name){
	
	if (drumbeat.play === 0){
		playsound('../../sounds/' + path);
	}
	drumbeat.currentDrum = num;
	togglebtn(name);
	
}


//function for saving a beat. This makes an API call that is picked up by
//app.js, which will start a database connection and make the save

function saveTrack(){

		if (!document.querySelector('#title-input').value){
			saveMessage('You need to enter a title!');
			return;
		}

		if (!document.querySelector('#owner')) {
			fetch('http://localhost:3000/save', {
				method: 'POST',	
				headers: {
					'Content-type' : 'application/json'
				},
				body: JSON.stringify({
					drum0: drumbeat.drumPaths[0],
					drum1: drumbeat.drumPaths[1],
					drum2: drumbeat.drumPaths[2],
					drum3: drumbeat.drumPaths[3],
					body: beatString(drumbeat.beat),
					genre: document.querySelector('#genre-input').value,
					title: document.querySelector('#title-input').value,
					bpm: drumbeat.bpm
				})
			})
			.then(response => response.json())
			.then(response => saveMessage(response));
		}
		else {
			const id = document.querySelector('#songId').textContent;

			fetch('http://localhost:3000/save/' + id, {
				method: 'PATCH',	
				headers: {
					'Content-type' : 'application/json'
				},
				body: JSON.stringify({
					drum0: drumbeat.drumPaths[0],
					drum1: drumbeat.drumPaths[1],
					drum2: drumbeat.drumPaths[2],
					drum3: drumbeat.drumPaths[3],
					body: beatString(drumbeat.beat),
					genre: document.querySelector('#genre-input').value,
					title: document.querySelector('#title-input').value,
					bpm: drumbeat.bpm
				})
			})
			.then(response => response.json())
			.then(response => saveMessage(response));
		}
}

//clear button click function
function clearTrack(){
		drumbeat.beat = [
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		];
	populatebeat();
}



//shows a message below the track buttons for 2 seconds, then erases it.
async function saveMessage(words){

	//console.log('got to saveMessage ' + words);
	document.querySelector('#messages').textContent = words;
	await new Promise(r => setTimeout(r, 2000));
	document.querySelector('#messages').textContent = "";
}

//function for pulling a beat from the database. Uses a fetch call with getSong
//endpoint, and provides a songID from which to pull
function pullTrack(){

		const id = document.querySelector('#songId').textContent;
	
		fetch('http://localhost:3000/getSong/' + id, {
			method: 'GET',	
			headers: {
				'Content-type' : 'application/json'
			}
		})
		.then(response => response.json())
		.then(data => updateBeat(data['data']));

}

//takes the beat returned from the API and updates it in the client's drum tool
function updateBeat(data){

	//changes drumbeat.beat array to reflect pulled beatstring
	console.log(data);
	console.log(data[0]);
	const newBeat = data[0]['beat'];
	var count = 0;
	for(var i= 0; i < 4; i++){
		for(var j=0; j<16; j++){
			drumbeat.beat[i][j] = parseInt(newBeat.charAt(count));
			count++;
		}
	}
	//fill in the drum machine with the udpated beat
	populatebeat();

	//changes the selected value for each drumPath to updated value
	for(var x = 0; x < 4; x++){

		drumbeat.drumPaths[x] = data[0]['drum' + x];
		let element = document.getElementsByName("drum" + x + "select");
		element.value = drumbeat.drumPaths[x];

	}

	
}

//creates a string of the beat array to send to database
function beatString(array){
    var beatlist = "";
	for (var i = 0; i<4; i++){
		for (var j = 0; j<16; j++){
			beatlist += drumbeat.beat[i][j];
		}
	}
	console.log('got here and the string is ' + beatlist);
    return beatlist;
	
}


//toggles the current selected drum
function togglebtn(btnName) {
	
	clearbtns();
	btn = document.getElementById(btnName);
	btn.style.backgroundColor = "#2b4353";
	btn.style.color="white";
	
	//change the beat grid to match the settings for this particular drum
	populatebeat();
	
}



//clears all drum buttons to default since only one can be selected at a time
function clearbtns() {
	
	const btnlist = ["drum0","drum1","drum2","drum3"];
	
	for (const x of btnlist) {
		btn = document.getElementById(x);
		btn.style.backgroundColor ='#9cd3d3';
		btn.style.color = "#2b4353";
	};
	
}

//picks up changed in select tags for each drum sound, then assigns to the object
function updateDrum(choice){

	const num = choice.name.charAt(4);
	drumbeat.drumPaths[num] = choice.value;

}

//takes a step (0 thru 3) and a substep (also 0 thru 3), changes the style and modifies the array
function beatmap(step,substep){
	
	//generating id based on what was clicked
	id = "beat" + step + "_" + substep;
	//console.log("clicked on drum " + drum + " and beat " + ((step * 4) + substep))
	selected = document.getElementById(id);
	
	//if it hasn't been selected, change it
	if (drumbeat.beat[drumbeat.currentDrum][(step * 4) + substep] == 0) {
		drumbeat.beat[drumbeat.currentDrum][(step * 4) + substep] = 1;
		//console.log("button is off, setting to on");
		selected.style.backgroundColor = '#2b4353';
		selected.style.color = "white";
	}
	else {
		drumbeat.beat[drumbeat.currentDrum][(step * 4) + substep] = 0;
		//console.log("button is on, setting to off");
		selected.style.backgroundColor = '#9cd3d3'
		selected.style.color = '#2b4353';
	}
	
}

//refreshes the beat grid and refills according to the stored global array
function populatebeat() {
	
	for (var i = 0; i < 16; i++){
		
		//calculating the step + substep of the array index. step is integer division of index and substep is modulo 4
		id = "beat" + Math.floor(i / 4) + "_" + (i % 4) ;
		selected = document.getElementById(id);
		//console.log("drum = " + drum + "beat = " + i + " with value of " + beat[drum][i]);
		
		//if the array shows a beat here:
		if (drumbeat.beat[drumbeat.currentDrum][i] == 1) {

			selected.style.backgroundColor = '#2b4353';
			selected.style.color = "white";
		}
		else {

			selected.style.backgroundColor = '#9cd3d3';
			selected.style.color = '#2b4353';
		}
	}

}

//stops playback
function stoptrack() {
	drumbeat.play = 0;
}



//plays the correct drum samples for each step
async function playtrack() {

	if (drumbeat.play === 1){
		return;
	}

	drumbeat.play = 1;
	//formula converts 'beats per minute' to milliseconds per substep
	

	//constructing a file path for each sound
	const urlstart = '../../sounds/';

	//playback loops while play === 1. stop button will set this to 0.
	while (drumbeat.play === 1) {
		//setting bpm and file paths at start of each 'measure'
		const waitTime = 1000 / ((drumbeat.bpm * 4) / 60);
		dnames = [
			urlstart + drumbeat.drumPaths[0],
			urlstart + drumbeat.drumPaths[1],
			urlstart + drumbeat.drumPaths[2],
			urlstart + drumbeat.drumPaths[3]
		];

		//looping through beat array to play each note for each drum
		for (var i = 0; i<16; i++){
			for (var j = 0; j<4; j++){
				if ((drumbeat.beat[j][i] === 1) && (drumbeat.play === 1)) {
					playsound(dnames[j]);
				}
				//stop function if stop is pressed
				else if (drumbeat.play === 0 ){
					return;
				}
			}

			//hold for waitTime milliseconds for correct tempo
			await new Promise(r => setTimeout(r, waitTime));
		}
	}
	
}


//pulls the beat details on pageload for create pages related to a specific song
function songPull(){

	//checks for presence of a songId element
	if (document.getElementById('songId')){
		const song = document.getElementById('songId').textContent;
		console.log('got to index with songId: ' + song);

		//get beat details and then send them to updateBeat
		fetch('http://localhost:3000/getSong/' + song)
		.then(response => response.json())
		.then(data => updateBeat(data['data']));

		//get song details and send them to updateSong

	}
};


