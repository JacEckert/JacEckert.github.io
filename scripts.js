////////////////////
//    Scramble    //
//      Race      //
////////////////////


////////////////////////
// Database Structure //
////////////////////////
/*
{
	"gameData": {
		"startTime": 0,
		"letterBank": "asdf"
	},
	"players": {
		"PlayerOne": {"score": 0, "isDone": false},
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
var time = 60;
var timerInterval;
var wordInterval;
var endInterval;

/////////////////
// Player Data //
/////////////////
var player;
var playerScore = 0;

///////////////
// Word Data //
///////////////
var wordDone;
var wordIsNew;


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
		if(snapshot.val()){
			announce("Invalid Name: Already Exists");
			return;
		} else {
			playerRef.set({score : playerScore, isDone: false});
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
	
	gameRef = database.ref('gameData/');
	var now = new Date().getTime();
	
	gameRef.once("value", snapshot => {

		//if game has already started, retrieve data
			//else set default time and generate letter bank
		if(snapshot.val()){
			//date time given in milliseconds, divide the difference of now and the
				//start time by 1000 to convert to seconds for interval tracking
			time = Math.floor(time-((now - snapshot.child("startTime").val())/1000));
			letterBank = snapshot.child("letterBank").val();
		} else {
			letterBank = generateBank();
			gameRef.set({startTime : now, letterBank: letterBank});
		}
		document.getElementById("letterBank").innerHTML = letterBank;
		timerInterval = setInterval("gameTimer()", 1000);
	});
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

//updates the remaining time and ends the game after displaying time = 0
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
	
	database.ref('players/' + player).set({score : playerScore, isDone : true});
	endInterval = setInterval("getResults()", 250);
	
	toggle("outcome");
}

//fetches submitted word, adds points if it passes, or announces a failure
function submitWord() {
	wordDone = false;
	var word = document.getElementById("word").value.toUpperCase();
	isNew(word);
	//attempts to verify word until wordDone returns as true
		//this signals that wordIsNew has been updated within isNew to be accurate
	wordInterval = setInterval(function() {
		if(wordDone) {
			clearInterval(wordInterval);
			if(isValid(word) && wordIsNew) {
				playerScore += word.length;
				document.getElementById("score").innerHTML = playerScore;
				database.ref('words/').push().set(word);
			} else {
				announce("Invalid word");
			}
		}
	}, 250);
}

//checks database and returns whether the word already exists or not
function isNew(word) {
	wordIsNew = true;
	var wordRef = database.ref('words/');
	
	wordRef.once("value", snapshot => {
		//if words list exists, check for submitted word
			//else list is empty, word clearly not used
		if(snapshot.val()){
			for(var key in snapshot.val()) {
				var newWord = snapshot.val()[key];
				//if any newWord in the list matches the submitted word, result is false
					//else, default result is true
				if(word == newWord) {
					wordIsNew = false;
				}
			}
		}
		//marks word check as complete
		wordDone = true;
	});
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
	database.ref('players/').once("value", snapshot => {
		var max = 0;
		var maxCount = "";
		
		//checks that each user has submitted their final score
			//holds the name and score of whoever has the highest score
		for(var user in snapshot.val()) {
			if(!snapshot.val()[user].isDone) {
				return;
			}
			var userScore = snapshot.val()[user].score;
			if(userScore > max) {
				max = userScore;
				maxCount = user;
			}
		}
		clearInterval(endInterval);
		
		document.getElementById("winScore").innerHTML += max;
		document.getElementById("playerScore").innerHTML += playerScore;
		
		if(max === playerScore) {
			announce("You Win!");
		} else {
			announce(maxCount + " Wins!");
		}
	});
}

//removes all content from the database
function clearData(){
	database.ref('gameData' ).remove();
	database.ref('players' ).remove();
	database.ref('words' ).remove();
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
