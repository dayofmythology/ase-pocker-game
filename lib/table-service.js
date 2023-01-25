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
  #highestBet = null;
  #players = null;
  #winner = null;
  #numActivePlayers = 0;
  #communityCards = null;
  #currentPlayerIndex = null;
  #drawCardsCount = 2;
  #startPlayerIndex = 0;
  #isRaisedPerformed = false;

  static resetInstance() {
    TableService.#instance = null;
  }

  static getInstance() {
    if (!TableService.#instance) {
      const deck = new Deck();
      TableService.#instance = new TableService({ deck });
    }
    return TableService.#instance;
  }

  constructor(options) {
    this.#deck = options.deck;
    this.#players = [];
    this.#bets = {};
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
    // TODO: implement
    return 15;
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
  initializeBet(playerId) {
    this.#bets[playerId] = 0;
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
      this.initializeBet(player.id);
    }
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
        this.#players[this.#currentPlayerIndex].deductCash(deductAmount);
      }
    }
    this.updateCurrentPlayerIndex();
    if (this.#currentPlayerIndex === this.#startPlayerIndex) {
      this.updateState();
    }
  }
}
