import Action from './action.js';
import Card from './card.js';
import Deck from './deck.js';
import Player from './player.js';
import State from './state.js';
import { IllegalActionError, IllegalAmountError } from './errors.js';

export default class TableService {
  static #instance = null;
  #state = null;
  #deck = null;
  #bets = null;
  #potAmount = null;
  #highestBet = null;
  #players = null;
  #winner = null;
  #numActivePlayers = 0;
  #communityCards = null;
  #hasAllPlayersPerformedAction = false;
  #currentPlayerIndex = null;
  #drawCardsCount = 2;
  #startPlayerIndex = 0;
  #isRaisedPerformed = false;

  static getInstance() {
    if (!TableService.#instance) {
      TableService.#instance = new TableService(new Deck());
    }
    return TableService.#instance;
  }

  constructor(deck) {
    this.#deck = deck;
    this.#players = [];
    this.#bets = {};
    this.#potAmount = 0;
    this.#communityCards = [];
    this.#state = State.OPEN;
    this.#highestBet = 0;
  }

  get state() {
    return this.#state;
  }

  get players() {
    return this.#players;
  }

  getPlayerCards(playerId) {
    for (const player of this.#players) {
      if (player.id === playerId) {
        return player.cards;
      }
    }
  }

  get communityCards() {
    return this.#communityCards;
  }

  get currentPlayer() {
    return this.#currentPlayerIndex === null ? null : this.#players[this.#currentPlayerIndex];
  }

  get bets() {
    return this.#bets;
  }

  get pot() {
    return this.#potAmount;
  }

  get winner() {
    return this.#winner;
  }

  get winnerHand() {
    // TODO: implement
    // no winner hand yet
    // return []

    return [
      new Card({ suit: 'spades', rank: 'ace' }),
      new Card({ suit: 'hearts', rank: 'ace' }),
      new Card({ suit: 'diamonds', rank: 'ace' }),
      new Card({ suit: 'clubs', rank: 'ace' }),
      new Card({ suit: 'spades', rank: 'king' })
    ];
  }
  #initializeBet() {
    for (const player of this.#players) {
      this.#bets[player.id] = 0;
    }
  }
  #addBetToPots() {
    let betSum = 0;
    for (const betAmount of Object.values(this.#bets)) {
      betSum += betAmount;
    }
    this.#potAmount += betSum;
  }

  #minimumBetAmount() {
    let minBet = Number.MAX_SAFE_INTEGER;
    for (const betAmount of Object.values(this.#bets)) {
      minBet = Math.min(minBet, betAmount);
    }
    return minBet;
  }
  #maximumBetAmount() {
    let maxBet = Number.MIN_SAFE_INTEGER;
    for (const betAmount of Object.values(this.#bets)) {
      maxBet = Math.max(maxBet, betAmount);
    }
    return maxBet;
  }
  start() {
    if (this.#players.length < 2) {
      throw new Error(`Insufficent number of players present, current player count ${this.#players.length}`);
    }
    this.#state = State.PRE_FLOP;
    this.#currentPlayerIndex = this.#startPlayerIndex;
    for (const player of this.#players) {
      const cards = this.#deck.draw(this.#drawCardsCount);
      for (const card of cards) {
        player.addCard(card);
      }
      player.setActive(true);
      this.#numActivePlayers++;
    }
    this.#initializeBet();
  }

  addPlayer({ id, name }) {
    this.#players.push(new Player({ id, name, cash: 100 }));
  }
  updateState() {
    switch (this.#state) {
      case State.PRE_FLOP:
        this.#communityCards = this.#deck.draw(3);
        this.#state = State.FLOP;
        break;
      case State.FLOP:
        this.#communityCards.push(...this.#deck.draw(1));
        this.#state = State.TURN;
        break;
      case State.TURN:
        this.#communityCards.push(...this.#deck.draw(1));
        this.#state = State.RIVER;
        break;
      case State.RIVER:
        this.#state = State.ENDED;
    }
  }
  updateCurrentPlayerIndex() {
    let index = (this.#currentPlayerIndex + 1) % this.#players.length;
    while (index !== this.#currentPlayerIndex && this.#players[index].active === false) {
      index = (index + 1) % this.#players.length;
    }
    this.#currentPlayerIndex = index;
  }
  getAcitvePlayer() {
    for (const player of this.#players) {
      if (player.active) {
        return player;
      }
    }
  }
  getMinRemaninigCash() {
    let minRemainingCash = Number.MAX_SAFE_INTEGER;
    for (const player of this.#players) {
      minRemainingCash = Math.min(minRemainingCash, player.cash);
    }
    return minRemainingCash;
  }
  performAction(action, ...args) {
    switch (action) {
      case Action.FOLD: {
        this.#numActivePlayers--;
        this.#players[this.#currentPlayerIndex].setActive(false);
        if (this.#numActivePlayers === 1) {
          this.#winner = this.getAcitvePlayer();
          this.#state = State.ENDED;
        }
        break;
      }
      case Action.RAISE: {
        this.#isRaisedPerformed = true;
        const [bet] = args;
        if (
          bet <= this.#highestBet ||
          this.#players[this.#currentPlayerIndex].cash < bet ||
          this.getMinRemaninigCash() < bet
        ) {
          throw new IllegalAmountError();
        }
        this.#highestBet = bet;
        this.#players[this.#currentPlayerIndex].deductCash(bet);
        this.#bets[this.#players[this.#currentPlayerIndex].id] += bet;
        break;
      }
      case Action.CALL: {
        if (!this.#isRaisedPerformed) {
          throw new IllegalActionError('CALL action cannot be performed before RAISE');
        }
        const deductAmount = this.#highestBet - this.#bets[this.#players[this.#currentPlayerIndex].id];
        this.#bets[this.#players[this.#currentPlayerIndex].id] += deductAmount;
        this.#players[this.#currentPlayerIndex].deductCash(deductAmount);
        break;
      }
      case Action.CHECK: {
        for (const betAmount of Object.values(this.#bets)) {
          if (betAmount > 0) {
            throw new IllegalActionError('Cannot perform CHECK when previous players have not performed CHECK');
          }
        }
        break;
      }
    }
    this.updateCurrentPlayerIndex();
    if (this.#currentPlayerIndex === this.#startPlayerIndex) {
      this.#hasAllPlayersPerformedAction = true;
    }
    if (this.#hasAllPlayersPerformedAction && this.#minimumBetAmount() === this.#maximumBetAmount()) {
      this.updateState();
      this.#addBetToPots();
      this.#initializeBet();
      this.#highestBet = 0;
      this.#isRaisedPerformed = false;
      this.#hasAllPlayersPerformedAction = false;
      this.#currentPlayerIndex = this.#startPlayerIndex;
    }
  }
}
