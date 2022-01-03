// General variable
let main = document.getElementById("main");

/////////////////////////////////////GAME/////////////////////////////////////

//Declare game variables/arrays
let rabbitAppearTimes = []; //Array for the times each rabbit appeared
let rabbitClickedTimes = []; //Array for the times each rabbit was clicked
let today = new Date();
let date = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear(); // Date of today styled
let finalTime = 0; // highscore final time
let avReactSpeed = 0; // average reaction time for clicked rabbits
let difficulty = "Easy"; // difficulty setting
let clicked = false; // bolean for clicked rabbit true or false
let missedRabbitPenalty = 0; // Sum of not clicked  rabbits
let misclickPenalty = 0; // Sum of wrong clicks
let numRabbits = 0; //Number of already uppeared rabbits

// User starts the game
function clickPlayButton() {
  resetVariables();
  rabbitAppear();
}

//Reset all the global variables
function resetVariables() {
  finalTime = 0;
  avReactSpeed = 0;
  clicked = false;
  rabbitAppearTimes = [];
  rabbitClickedTimes = [];
  missedRabbitPenalty = 0;
  misclickPenalty = 0;
  numRabbits = 0;
}

function rabbitAppear() {
  clicked = false; // reset the bolean clicked rabbit to false

  // Calculating the position of the rabbit randomly
  var bodyWidth = document.getElementById("main").clientWidth;
  var bodyHeight = document.getElementById("main").clientHeight;
  var randPosX = Math.floor(Math.random() * (bodyWidth - 100 - 100 + 1)) + 100;
  var randPosY = Math.floor(Math.random() * (bodyHeight - 100 - 100 + 1)) + 100;

  rabbitStructure(randPosX, randPosY); // calling the function to insert the html for the rabbit
  rabbitAppearTimes[numRabbits] = Date.now(); // saves the current time into the rabbitAppear array at position matching numRabbits
  rabbitOnscreenTimer(); // Calls the rabbit timer
  numRabbits++; // increases the number of rabbits appeared on screen
}

// Inserts the html with the rabbit at a random place
function rabbitStructure(randPosX, randPosY) {
  main.innerHTML = `
                  <div id="game-page" onclick="misclickPenaltyCounter(event)">
                      <img onclick="rabbitClicked(event)" style="left:${randPosX}px; top:${randPosY}px" src="./images/rabbitpic.png" alt="Rabbit">
                  </div>`;
}

// Sets a time-out depending on the difficulty level and calls then the rabbitGame
function rabbitOnscreenTimer() {
  setTimeout(function() {rabbitStatusChecker();}, timeAfterDifficulties());
}

// Milliseconds depending on difficulty for the rabbit to stay on screen
function timeAfterDifficulties() {
  if (difficulty == "Easy") {
    return 3000;
  } else if (difficulty == "Medium") {
    return 2000;
  } else {
    return 1000;
  }
}

/* looks if rabbit is clicked/disappeard or should disappear
   looks if number of rabbits already max (display summary) or not (calling a new rabbit)
   sets a randomly time-out for the next rabbit to appear */
function rabbitStatusChecker() {
  if (clicked == true && numRabbits < 10) {
    setTimeout(function() {rabbitAppear();}, Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000);
  } else if (clicked == true && numRabbits == 10) {
    calculateFinalTime();
    displaySummary();
  } else if (numRabbits < 10) {
    main.innerHTML = `
    <div id="game-page" onclick="misclickPenaltyCounter(event)">
    </div>`;
    missedRabbitPenalty += 1;
    setTimeout(function() {rabbitAppear();}, Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000);
  } else {
    main.innerHTML = `
    <div id="game-page" onclick="misclickPenaltyCounter(event)">
    </div>`;
    missedRabbitPenalty += 1;
    calculateFinalTime();
    displaySummary();
  }
}

// Calculates the highscore after the end of the game
function calculateFinalTime() {
  // Calculates the time between clicked rabbits and their appearance and adds it to finalTime
  for (let i = 0; i < rabbitAppearTimes.length; i++) {
    if (rabbitClickedTimes[i] != null) {
      finalTime += rabbitClickedTimes[i] - rabbitAppearTimes[i];
    }
  }

  // Calls the function to calculate the average reaction time and uppdate the variable with the result
  avReactSpeed = calculateAverageReaction(finalTime, rabbitAppearTimes.length - missedRabbitPenalty) / 1000;

  finalTime += missedRabbitPenalty * 4000; // adds the penalty-time for all the missed rabbits
  finalTime += misclickPenalty * 1000; // adds the penalty-time for all the missclicks on screen

  finalTime = finalTime / 1000; // sets final Highscore to seconds
  finalTime = finalTime.toFixed(2); // convertint to string and rounding to 2 decimals
  avReactSpeed = avReactSpeed.toFixed(2); // convertint to string and rounding to 2 decimals
  return finalTime; // returning finalTime
}

function penaltyNumber() {
  if (difficulty == "Easy") {
    return 2000;
  } else if (difficulty == "Medium") {
    return 1500;
  } else if (difficulty == "Hard") {
    return 1000;
  }
}

function calculateAverageReaction(sum, divisor) {
  average = sum / divisor;
  return average;
}

// Sets the difficulty when the user clicks on the difficulty-button
function setDifficulty(diff) {
  difficulty = diff;
  launchGamePage();
}

// Counts 1 up when user miscklicks on the screen
function misclickPenaltyCounter(event) {
  event.stopPropagation();
  misclickPenalty++;
}

// Saves one more clicked rabbit and a timestamp and takes the rabbit from the screen when user clicks on the rabbit
function rabbitClicked(event) {
  event.stopPropagation();
  clicked = true;
  main.innerHTML = `
  <div id="game-page" onclick="misclickPenaltyCounter(event)">
  </div>`;
  rabbitClickedTimes[numRabbits - 1] = Date.now(); //Insert time rabbit was clicked at position matching current rabbit count
}

///////////////////////////////////////////LOCAL STORAGE////////////////////////////////////////////

//If the localstorage is empty, create the gamesArray, strignify it, and save it to local
function checkLocalStorageDataExists() {
  if (localStorage.length == 0) {
    let gamesArray = [];
    localStorage.setItem("GameArray", JSON.stringify(gamesArray));
  }
}

function createGameObject(date, time, react, diff) {
  let scoreArray = JSON.parse(localStorage.getItem("GameArray")); //Retrieve the GameArray from local storage

  //Create an object for this game session
  let gameObject = {
    date: date,
    time: time,
    react: react,
    diff: diff,
  };

  scoreArray.push(gameObject); //Insert the new game into the retrieved array of games
  sortedScoreArray = sortArrayByKey(scoreArray, "time"); //Sort the game array by time property of each game
  localStorage.removeItem("GameArray"); //Remove existing game array
  localStorage.setItem("GameArray", JSON.stringify(sortedScoreArray)); //Insert the updated, sorted game array into local storage
}

//Sort an array based on a single property
function sortArrayByKey(array, key) {
  return array.sort(function (a, b) {
    let x = a[key];
    let y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

///////////////////////////////////////////LANDING PAGE////////////////////////////////////////////

document.getElementById("bodyId").onload = function() {createLandingPage();};
var video = document.getElementById('video');
var source = document.getElementById('source');

function createLandingPage() {
  checkLocalStorageDataExists();

  source.setAttribute('src', 'videos/backgroundvideo.mp4');
  video.load();
  video.play();
  
  main.innerHTML = `
  <div class = "card">
    <img id= "logo" onclick="createLandingPage()" src="./images/rabbitpic.png" alt="white-rabbit icon">
    <img id= "logo-back" onclick="createLandingPage()" src="./images/ce2c8850dec0b2027695c3e56bc25708-removebg-preview (1).png" alt="white-rabbit icon">
  </div>  
  <div id="wrapper_landingpage">
    <img id="gif_choose_score_play" src="./images/Start_game.gif" alt="reflection in sunglasses of two hands holding a blue and a red pill ">
    <button class="button_landingpage" id="button_play" onclick="openDifficultyPage()">play</button>
    <button class="button_landingpage" id="button_score" onclick="openHighscorePage()">score</button>
  </div>
  `;
}

///////////////////////////////////////////HIGHSCORE PAGE////////////////////////////////////////////

//Declare arrays for inserting high score data
let gameDates = [];
let gameTimes = [];
let gameReacts = [];
let gameDiffs = [];

function retrieveHighscores() {
  checkLocalStorageDataExists();
  let scoreArray = JSON.parse(localStorage.getItem("GameArray"));

  for (i = 0; i < 10; i++) {
    if (scoreArray[i]) {
      gameDates[i] = scoreArray[i].date;
      gameTimes[i] = scoreArray[i].time + "s";
      if (scoreArray[i].react == Infinity) {
        gameReacts[i] = "-";
      } else {
        gameReacts[i] = scoreArray[i].react + "s";
      }
      gameDiffs[i] = scoreArray[i].diff;
    } else {
      gameDates[i] = "-";
      gameTimes[i] = "-";
      gameReacts[i] = "-";
      gameDiffs[i] = "-";
    }
  }
}

function openHighscorePage() {
  retrieveHighscores();
  let tableData = "";

  for (i = 0; i < 10; i++) {
    tableData += `
        <tr>
            <td class="table-rank">${i + 1}</td>
            <td class="table-date">${gameDates[i]}</td>
            <td class="table-time">${gameTimes[i]}</td>
            <td class="table-react">${gameReacts[i]}</td>
            <td class="table-difficulty">${gameDiffs[i]}</td>
        </tr>
        `;
  }

  main.innerHTML = `
      <div class = "card">
        <img id= "logo" onclick="createLandingPage()" src="./images/rabbitpic.png" alt="white-rabbit icon">
        <img id= "logo-back" onclick="createLandingPage()" src="./images/ce2c8850dec0b2027695c3e56bc25708-removebg-preview (1).png" alt="white-rabbit icon">
      </div>
      <div id="box">
      </div>
      <section id="content"> 
      <h1>Highscores</h1>
        <table>
          <th class="table-rank table-header">Rank</th>
          <th class="table-date table-header">Date</th>
          <th class="table-time table-header">Time</th>
          <th class="table-react table-header">Av. Speed</th>
          <th class="table-difficulty table-header">Difficulty</th>
          </tr>
          ${tableData}
        </table>
        <div id="highscore-btns">
          <button type="button" onclick="createLandingPage()">Home</button>
          <button type="button" onclick="clearHighscores()">Reset Highscores</button>
        </div>
      </section>
      `;
}

function clearHighscores() {
  let prompt = confirm("Are you sure you want to clear your highscores?");
  if (prompt == true) {
    localStorage.clear();
    openHighscorePage();
  } else {
    openHighscorePage();
  }
}

///////////////////////////////////////////DIFFICULTY PAGE////////////////////////////////////////////

function openDifficultyPage() {
  source.setAttribute('src', 'videos/gamebackgroundvideo.mp4');
  video.load();
  video.play();

  let diffPage = `
    <div class="card">
      <img id="logo" onclick="createLandingPage()" src="./images/rabbitpic.png" alt="white-rabbit icon">
      <img id="logo-back" onclick="createLandingPage()" src="./images/ce2c8850dec0b2027695c3e56bc25708-removebg-preview (1).png" alt="white-rabbit icon">
    </div>
    <section id="content">
      <div id="content-box">
        <h1> CLICK THE RABBIT AS FAST AS POSSIBLE</h1>
        <h3>Be careful - missing a rabbit or clicking in empty space will both increase your final time!</h3>
        <div id="levelBtns">
          <button type="button" onclick="setDifficulty('Easy');">EASY</button>
          <button type="button" onclick="setDifficulty('Medium');">MEDIUM</button>
          <button type="button" onclick="setDifficulty('Hard');">HARD</button>
        </div>
        <img src="images/tumblr_myo2hr97No1skltbdo1_500.gif"/>
      </div>
    </section>`;
  main.innerHTML = "";
  main.innerHTML = diffPage;
}

function launchGamePage() {
  var gamePage = `<div id="game-page">
                    <button onclick="clickPlayButton()">PLAY</button>
                    <div id="rand_pos" class="rand"></div>
                  </div>`;
  main.innerHTML = "";
  main.innerHTML = gamePage;
}

///////////////////////////////////////////SUMMARY PAGE////////////////////////////////////////////

function displaySummary() {
  displayCharacter(finalTime); // Displays the scores with characters
  createGameObject(date, finalTime, avReactSpeed, difficulty); // Calling the function for localstorage
  let missedRabbitText = ""; // Set variable to null
  let misclickText = ""; // Set variable to null
  let avReactText = ""; // Set variable to null

  //Format strings based on penalty numbers
  if (missedRabbitPenalty == 0) {
    missedRabbitText = "didn't miss any rabbits and";
  } else if (missedRabbitPenalty == 1) {
    missedRabbitText = "missed " + missedRabbitPenalty + " rabbit and";
  } else {
    missedRabbitText = "missed " + missedRabbitPenalty + " rabbits and";
  }

  if (misclickPenalty == 0) {
    misclickText = "didn't misclick at all!";
  } else if (misclickPenalty == 1) {
    misclickText = "misclicked " + misclickPenalty + " time!";
  } else {
    misclickText = "misclicked " + misclickPenalty + " times!";
  }

  if (avReactSpeed == Infinity) {
    avReactText = "You didn't click any!";
  } else {
    avReactText = avReactSpeed + "s";
  }

  main.innerHTML = `
  <div class = "card">
      <img id= "logo" onclick="createLandingPage()" src="./images/rabbitpic.png" alt="white-rabbit icon">
      <img id= "logo-back" onclick="createLandingPage()" src="./images/ce2c8850dec0b2027695c3e56bc25708-removebg-preview (1).png" alt="white-rabbit icon">
      </div>
    <div id="box">
    </div>
    <section id="content">
    <div id="score-card">
      <div id="score">
        <h1>${gifText}</h1>
        <h2>Total Time: ${finalTime}s</h2>
        <h3>Average Reaction Time: ${avReactText}</h3>
        <h3>You ${missedRabbitText} ${misclickText}</h3>
      </div>
      <div>
        <embed src="${gifLink}"/></div>
      </div>
      <div id="play-again">
        <p>Would you like to play again?</p><br/>
        <button id="yes-button" onclick="openDifficultyPage()">YES!</button>
        <button id="no-button" onclick="createLandingPage()">NO!</button>
        <button id="highscores" onclick="openHighscorePage()">Highscores</button>
      </div>
    </section>`;
}

let displayGif = [
  "./images/look-neo.gif",
  "./images/Agent Smith.gif",
  "./images/Trinity-3.gif",
  "./images/Morpheus.gif",
  "./images/cypher.gif",
];

let displayGifText = [
  "You are the Chosen One!",
  "You're bad! But your score isn't!",
  "Holy F**king Trinity",
  "Morpheus? More like Morphe-yes!",
  "Um, you suck!",
];

function displayCharacter(finalTime) {
  if (finalTime < 20) {
    gifLink = displayGif[0];
    gifText = displayGifText[0];
  } else if (finalTime < 25) {
    gifLink = displayGif[1];
    gifText = displayGifText[1];
  } else if (finalTime < 30) {
    gifLink = displayGif[2];
    gifText = displayGifText[2];
  } else if (finalTime < 35) {
    gifLink = displayGif[3];
    gifText = displayGifText[3];
  } else {
    gifLink = displayGif[4];
    gifText = displayGifText[4];
  }
}
