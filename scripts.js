//database: store starting time, players(name + score), letterBank, used words

////////////////
// Timer Data //
////////////////
var time;
var timerInterval;

/////////////////
// Player Data //
/////////////////
var player;
var playerScore = 0;
var letterBank;

//checks for existing user, displays error if exists
	//or populates user display and removes name input
function createUser() {
	player = document.getElementById("user").value;
//database: if username taken: announce; else add
	document.getElementById("username").innerHTML = player;
	toggle("username");
	document.getElementById("start").disabled = false;
	toggle("nameInput");
}

//removes start button, shows game, calculates timer and letter bank, and begins timer
function startGame() {
	toggle("start");
	toggle("game");

	///////////////////////////////////////////////	Temporary
	var startTime = new Date().getTime() + 15000;//	 Testing
	///////////////////////////////////////////////	  Value
	
	//time given in milliseconds, divide by 1000 to translate to seconds
		//and floor to remove insignificant digits
//database: get start time
	time = Math.floor((startTime - new Date().getTime())/1000);
	
	//if not started
	if(time <= 0) {
		letterBank = generateBank();
//database: set start time, set bank
	} else {
//database: get Bank
	////////////////////////////////////////////	Temporary
		letterBank = "SOMETHING";			  //	 Testing
	////////////////////////////////////////////	  Value
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
	sendResults();
	getResults();
	toggle("outcome");
}

//fetches submitted word, adds points if it passes, or announces a failure
function submitWord() {
	var word = document.getElementById("word").value.toUpperCase();

	if (isValid(word) && isNew(word)) {
		playerScore += word.length;
		document.getElementById("score").innerHTML = playerScore;
	} else {
		announce("Invalid word");
	}
}

//checks database and returns whether the word already exists or not
function isNew(word) {
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

//updates user data in the database
function sendResults() {
//database: send player name and score
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
