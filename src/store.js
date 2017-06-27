import { observable } from 'mobx';
import ion from './sound';
import { STATES, RESULTS, FRUIT } from './consts';

const WAIT_TIME = 20;
const GAME_TIME = 1000;
const MAX_POINTS = 10;
const MIN_TIME = 1000 * 60;
const MAX_TIME = 1000 * 60 * 2;

const store = observable({
    state: STATES.START_SCREEN,
    secondsToGo: WAIT_TIME,
    yourScore: 0,
    monkeyScore: 0,
    timeLeft: GAME_TIME,
    result: RESULTS.WON,
    question: null,
    grid: [],
    intervals: []
});

function stopTimeouts() {
    store.intervals.forEach(intervals => clearInterval(intervals));
}

/**
 * A function to start the game
 */

function start(event) {
    event.preventDefault();
    ion.sound.play('wacht');
    // time to wait for the apes to accept the game
    store.state = STATES.WAIT_SCREEN;
    store.intervals.push(setInterval(() => {
        store.secondsToGo--;
        if(store.secondsToGo === 0) {
            stopTimeouts();
            store.state = STATES.GAME_SCREEN;
            store.secondsToGo = WAIT_TIME;
            // then start the actual game
            startGame();
        }
    }, 1000));
}

/**
 * a function to shuffle the images
 */

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
    return a;
}

/**
 * creates a new grid with fruit images
 */

function newGrid() {
    const fruits = Object.keys(FRUIT);
    // create random first (big) image)
    store.question = shuffle(fruits.filter(fruit => fruit !== store.question))[0];
    setTimeout(() => ion.sound.play(store.question), 1000);
    const otherFruits = fruits.filter(fruit => fruit !== store.question);
    // shuffle the images in the grid
    store.grid = shuffle([store.question, ...shuffle([...otherFruits, ...otherFruits, ...otherFruits]).slice(0, 15)]);
}
/**
 * check answer and give feedback (upgrade score and play sound)
 */

function giveAnswer(answer) {
    if(answer === store.question) {
        store.yourScore++;
        ion.sound.play('correct');
    }
    else ion.sound.play('wrong');
    if(store.yourScore === MAX_POINTS) {
        stopGame()
    }
    else {
        newGrid();
    }
}

function startGame() {
    newGrid();

    // Add random points to the apes (player 2) when they score the max. point then stop the game
    store.intervals.push(setInterval(() => {
        store.monkeyScore++;
        if(store.monkeyScore === MAX_POINTS) stopGame();
    }, ((MIN_TIME / MAX_POINTS) + (Math.random() * (MAX_TIME - MIN_TIME) / MAX_POINTS))));
}

function stopGame(result) {
    // check who wins the game and give feedback
    stopTimeouts();
    store.state = STATES.RESULT_SCREEN;
    store.timeLeft = GAME_TIME;

    if(typeof result !== 'undefined') {
        store.result = result;
    }
    else if (store.yourScore === store.monkeyScore) {
        store.result = RESULTS.DRAW;
    }
    else {
        store.result = (store.yourScore < store.monkeyScore) ? RESULTS.LOST : RESULTS.WON;
    }

    if(store.result === RESULTS.WON) ion.sound.play('gewonnen');
    if(store.result === RESULTS.DRAW) ion.sound.play('gelijk');
    if(store.result === RESULTS.LOST) ion.sound.play('verloren');

}

export default store;

export {
    STATES,
    start,
    RESULTS,
    FRUIT,
    giveAnswer,
};