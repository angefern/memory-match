/* 
Description: This file contains JavaScript code for a memory matching game. 
It uses DOM interactions and manipulation to control the state of the game. 
There are EventListeners for buttons which move on to the next round, 
restart the game, etc. There are also identical EventListeners for each 
card, to control what happens when a user clicks on it. This is where the 
bulk of the gameplay is found. These EventListeners determine whether a guess 
is valid, whether a card can be clicked, keep track of score, etc.
*/

window.addEventListener("load", function (event) {
    let firstName = document.getElementById("firstName");
    let lastName = document.getElementById("lastName");
    let age = document.getElementById("age");
    let colour1 = document.getElementById("colour1")
    let colour2 = document.getElementById("colour2");
    let startBtn = document.getElementById("startBtn");
    let form = document.getElementById("form");
    let message = document.getElementById("message");
    let guessElem = document.getElementById("guess");
    let scoreElem = document.getElementById("score");
    let cardContainer = document.getElementById("card-container");
    let nameElem = document.getElementById("name");
    let ageElem = document.getElementById("displayAge");
    let game = document.getElementById("game");
    let playerInfo = document.getElementById("player-info");
    let nextRoundBtn = document.getElementById("nextRound");
    let helpBtn = document.getElementById("helpBtn");
    let help = document.getElementById("help");
    let returnBtn = document.getElementById("returnBtn");
    let playAgainBtn = document.getElementById("playAgain");
    let result = document.getElementById("result");
    let errorMsg = document.getElementById("errorMsg");

    let cardVals = [];
    let flipped = [];
    let matched = [];
    let numFlipped = 0;
    let flippedInd = [];
    let canClick = true;
    let score = 0, guesses = 0;
    let round = 1;
    let numCards = 6;
    let r1score = 0;

    let cards = [
        document.getElementById("card1"),
        document.getElementById("card2"),
        document.getElementById("card3"),
        document.getElementById("card4"),
        document.getElementById("card5"),
        document.getElementById("card6"),
    ];

    nextRoundBtn.style.visibility = "hidden";
    playAgainBtn.style.visibility = "hidden";
    game.style.visibility = "hidden";

    /*
        This eventListener ensures valid input into the fields on the front page, 
        then sets up the game using those values. It then removes the front page 
        and allows the game to become visible.  
    */
    startBtn.addEventListener("click", function (event) {
        if (firstName.value && lastName.value && age.value && colour1.value && colour2.value) {
            if (age.value <= 0) {
                errorMsg.innerHTML = "Age must be greater than 0!";
            }
            else if (colour1.value == "#000000") {
                errorMsg.innerHTML = "Please choose another LIGHT colour!";
            }
            else if (colour2.value == "#ffffff") {
                errorMsg.innerHTML = "Please choose another DARK colour!";
            }
            else {
                form.remove();
                nameElem.innerHTML = "Player: " + firstName.value + " " + lastName.value;
                ageElem.innerHTML = "Age: " + age.value + "yo";
                game.style.backgroundColor = colour1.value;
                help.style.backgroundColor = colour1.value;
                playerInfo.style.backgroundColor = colour2.value;
                game.style.visibility = "visible";
            }
        }
        else {
            errorMsg.innerHTML = "Form is incomplete!"
        }
    });

    /*
        This event listener hides the game to show the help page when the user 
        clicks on the help button.  
    */
    helpBtn.addEventListener("click", function (event) {
        game.style.display = "none";
        help.style.display = "block";
    });

    /*
        This event listener hides the help page to show the game when the user 
        clicks on the return button.  
    */
    returnBtn.addEventListener("click", function (event) {
        help.style.display = "none";
        game.style.display = "block";
    });

    /*
        This event listener sets up round 2: updates score/guesses, updates the
        layout, increases the number of cards to 8, and re-initializes variables 
        when the user clicks on the next round button. 
    */
    nextRoundBtn.addEventListener("click", function (event) {
        // update score and guesses 
        r1score = score;
        score = 0;
        scoreElem.innerHTML = "Score: " + score;
        guesses = 0;
        guessElem.innerHTML = "Guesses: " + guesses;

        // update display for next screen
        message.innerHTML = "";
        message.style.visibility = "visible";
        result.style.visibility = "hidden";
        nextRoundBtn.style.visibility = "hidden";
        stats.style.display = "flex";
        game.appendChild(cardContainer);
        game.appendChild(message);

        // increase number of cards to 8
        numCards = 8;
        cards.push(document.getElementById("card7"));
        cards.push(document.getElementById("card8"));
        cards[6].style.display = "block";
        cards[7].style.display = "block";
        cardContainer.style.grid = "auto / auto auto auto auto";

        // re-initialize variables and start the round 
        flipped = [];
        matched = [];
        flippedInd = [];
        cardVals = [];
        numFlipped = 0;
        canClick = true;
        runRound();
    });

    /*
        This event listener sets up round 1 again: updates score/guesses, updates the
        layout, decreases the number of cards to 6, and re-initializes variables 
        when the user clicks on the play again button. 
    */
    playAgainBtn.addEventListener("click", function (event) {
        // update score and guesses 
        round = 1;
        score = 0;
        scoreElem.innerHTML = "Score: " + score;
        guesses = 0;
        guessElem.innerHTML = "Guesses: " + guesses;

        // update display for next screen
        message.innerHTML = "";
        message.style.visibility = "visible";
        result.style.visibility = "hidden";
        playAgainBtn.style.visibility = "hidden";
        stats.style.display = "flex";
        game.appendChild(cardContainer);
        game.appendChild(message);

        // reduce number of cards to 6
        numCards = 6;
        cardContainer.style.grid = "auto / auto auto auto";
        cards[7].style.display = "none";
        cards[6].style.display = "none";
        cards.pop();
        cards.pop();

        // re-initialize variables and start the round 
        flipped = [];
        matched = [];
        flippedInd = [];
        cardVals = [];
        numFlipped = 0;
        canClick = true;
        runRound();
    });


    /*
     * Contains the gameplay for each round. Sets up the round by randomly assigning
     * card images. Also adds the "click" event listener to each card to handle 
     * determining whether a guess is a match/mistmatch, keep track of score.
     * 
     * @returns {void}
     */

    function runRound() {
        // randomly assign card images to each card and set to back image
        let chosen = [];

        for (let i = 0; i < numCards; i++) {
            let rand = Math.floor(Math.random() * numCards);

            if (!chosen.includes(rand)) {
                chosen.push(rand);
                let ind = Math.floor(rand / 2).toString(); // ensures 2 cards are randomly assigned the same image
                cardVals[i] = "images/card" + ind + ".jpg";
                flipped.push(false);
                matched.push(false);
                cards[i].src = "images/cardBack.jpg";
            }
            else {
                i--;
            }
        }

        for (let i = 0; i < numCards; i++) {
            /*
                This event listener controls what happens when card[i] is clicked. It flips
                the card when permitted and checks for a match if another card is also flipped.
                It also keeps track of the score as well as the number of guesses. It checks for
                when the round is over (all matches are found) and displays the score, along 
                with a button to start the next round or play again.
            */
            cards[i].addEventListener("click", function () {
                message.innerHTML = "";
                if (!flipped[i] && numFlipped < 2 && !matched[i] && canClick) {
                    if (!flipped[i]) {
                        // flip the card
                        this.src = cardVals[i];
                        flipped[i] = true;
                        numFlipped++;
                        flippedInd.push(i);

                        // check guess (two cards flipped)
                        if (numFlipped === 2) {
                            guesses++;
                            guessElem.innerHTML = "Guesses: " + guesses;
                            canClick = false;

                            // check if its a match
                            if (cardVals[flippedInd[0]] === cardVals[flippedInd[1]]) {
                                setTimeout(function () {
                                    message.innerHTML = "Match 🎉";
                                }, 1000);

                                // make it so they stay flipped and the user can continue flipping other cards   
                                matched[flippedInd[0]] = true;
                                matched[flippedInd[1]] = true;

                                // reset the flipping stuff so other cards can be flipped
                                numFlipped = 0;
                                flippedInd = [];
                                canClick = true;

                                // update the score 
                                score += 10;
                                scoreElem.innerHTML = "Score: " + score;

                                // check if all pairs have been found  
                                if (!matched.includes(false)) {
                                    // set-up summary screen
                                    stats.style.display = "block";
                                    cardContainer.remove();

                                    if (round == 1) {
                                        result.innerHTML = "Round 1 complete! 🏆"
                                        result.style.visibility = "visible";
                                        message.style.visibility = "hidden";
                                        nextRoundBtn.style.visibility = "visible";
                                        round = 2;
                                    }
                                    else {
                                        guessElem.innerHTML = "Round 1 Score: " + r1score;
                                        scoreElem.innerHTML = "Round 2 Score: " + score;
                                        result.innerHTML = "Game over! 🏆";
                                        result.style.visibility = "visible";
                                        message.style.visibility = "hidden";
                                        playAgainBtn.style.visibility = "visible";
                                    }
                                }
                            }
                            // if it is NOT a match
                            else {
                                // flip both cards back after a delay (delay is so user can see the cards before they are flipped back)
                                setTimeout(function () {
                                    message.innerHTML = "Mismatch 💥";
                                    cards[flippedInd[0]].src = "images/cardBack.jpg";
                                    cards[flippedInd[1]].src = "images/cardBack.jpg";
                                    flipped[flippedInd[0]] = false;
                                    flipped[flippedInd[1]] = false;
                                    numFlipped = 0;
                                    flippedInd = [];
                                    canClick = true;
                                }, 1000);

                                // update the score 
                                score -= 5;
                                scoreElem.innerHTML = "Score: " + score;
                            }
                        }
                    }
                }
            });
        }
    }

    runRound();
});