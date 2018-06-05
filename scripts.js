/* 
{
	"gameData": {
		"startTime": 0,
		"letterBank": "asdf"
	},
	"players": {
		"PlayerOne": {"score": 0},
		"PlayerTwo": { ... },
		"PlayerThree": { ... }
	},
	"words": [ "word 1", ... ]
}
*/

//////////////
// Database //
//////////////
var database = firebase.database();
var letterBank;

////////////////
// Timer Data //
////////////////
var time = 0;
var timerInterval;

/////////////////
// Player Data //
/////////////////
var player;
var playerScore = 0;

//checks for existing user, displays error if exists
	//or populates user display and removes name input
function createUser() {
	player = document.getElementById("user").value;
	if(player === "" ) {
		announce("Invalid Username: Empty");
		return;
	}
	
	var playerRef = database.ref('players/' + player);

	playerRef.once("value", snapshot => {
		//if name 'player' already exists, error and don't continue
			//else, add player with score: 0, set stage for the game
		if (snapshot.val()){
			announce("Invalid Name: Already Exists");
			return;
		} else {
			playerRef.set({score : playerScore});
			document.getElementById("username").innerHTML = player;
			document.getElementById("start").disabled = false;
			toggle("username");
			toggle("nameInput");
		}
	});

}

//removes start button, shows game, calculates timer and letter bank, and begins timer
function startGame() {
	toggle("start");
	toggle("game");
	
	//time given in milliseconds, divide by 1000 to translate to seconds
		//and floor to remove insignificant digits
//database: check if game data exists
	
	gameRef = database.ref('gameData/');
	now = new Date().getTime();
	
	gameRef.once("value", snapshot => {
for(var content in snapshot) {
console.log("content: " + content);
}
		//if game has already started, retrieve data and join game
		if (snapshot.val()){
console.log("game already started");
			//calculate time from startTime and current time
		} else {
console.log("game not started");
//			time = 60;
//			letterBank = generateBank();
//			gameRef.set({startTime : now, letterBank: letterBank});
		}
	});
	
	//if no
	if(time <= 0) {
		time = 60;
		letterBank = generateBank();
//database: set start time, set bank
		gameRef.set({startTime : now, letterBank: letterBank});
	} else {
//database: get time, get Bank
	///////////////////////////////////	Temporary
		var startTime = now + 15000; //	 Testing
	///////////////////////////////////	  Value
		
	/////////////////////////////////	Temporary
		letterBank = "SOMETHING";  //	 Testing
	/////////////////////////////////	  Value
	
		time = Math.floor((startTime - now)/1000);
	}
	document.getElementById("letterBank").innerHTML = letterBank;
	timerInterval = setInterval("gameTimer()", 1000);
}

//generates a string of random characters with at least 2 vowels and 2 consonants
function generateBank() {
	var text;
	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var vowels = "AEIOU"
	var vowelCount = 0;
	
	while(vowelCount < 2 || vowelCount > 7) {
		text = "";
		vowelCount = 0;
		thing = [];
		for (var i = 0; i < 9; i++) {
			var letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
			text += letter;
			if(vowels.includes(letter))
				vowelCount++;
		}
	}
	return text;
}

//updates the remaining time and ends the game at 0
function gameTimer() {
	document.getElementById("timer").innerHTML = time--;
	if(time === -2) {
		clearInterval(timerInterval);
		endGame();
	}
}

//hides game, updates user data in database, gets user data, and displays outcome
function endGame() {
	toggle("gameContainer");
	database.ref('players/' + player).set({score : playerScore});
	getResults();
	toggle("outcome");
}

//fetches submitted word, adds points if it passes, or announces a failure
function submitWord() {
	var word = document.getElementById("word").value.toUpperCase();

	if (isValid(word) && isNew(word)) {
		playerScore += word.length;
		document.getElementById("score").innerHTML = playerScore;
		database.ref('words/').push().set(word);
var idkk = database.ref('words/').equalTo(word);
console.log("after word submit: " + idkk);
	} else {
		announce("Invalid word");
	}
}

//checks database and returns whether the word already exists or not
function isNew(word) {
	var idk = database.ref('words/').equalTo(word);
console.log("check for word return: " + idk);
//database: check for word
	//if it exists, return false
	//else add word, return true
	return true;
}

//checks if the word uses only letters from the letter bank, and each only once
function isValid(word) {
	var bank = letterBank;
	for(letter in word) {
		var index = bank.search(word[letter]);
		if(index >= 0) {
			bank = bank.substring(0,index) + bank.substring(index+1, bank.length);
			continue;
		} else {
			return false;
		}
	}
	return true;
}


//retrieves user data from the database and updates outcome display
function getResults() {
	document.getElementById("playerScore").innerHTML += playerScore;
//database: get user scores
	//display highest score and username
	//if same user, display success, else display failure
	///////////////////////////////////	Temporary
	announce("Win/Maybe next time"); //	 Testing
	///////////////////////////////////	  Value
}

//temporarily shows whatever phrase is passed
function announce(word) {
	document.getElementById("announce").innerHTML = word;
	toggle("announce");
	var test = setTimeout(toggle, 2000, "announce");
}

//toggles display to hide/show elements by id
function toggle(ID) {
	var e = document.getElementById(ID);
	var display = window.getComputedStyle(e).getPropertyValue('display');
	if(display === "none")
		e.style.display = "block";
	else
		e.style.display = "none";
}

function clearData(){
	database.ref('gameData' ).remove();
	database.ref('players' ).remove();
	database.ref('words' ).remove();
}
