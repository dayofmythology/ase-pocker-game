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
  #players = null;
  #communityCards = null;
  #currentPlayerIndex = null;
  #drawCardsCount = 2;
  #startPlayerIndex = 0;

  static getInstance() {
    if (!TableService.#instance) {
      TableService.#instance = new TableService(/* options */);
    }
    return TableService.#instance;
  }

  constructor(/* options */) {
    this.#deck = new Deck();
    this.#players = [];
    this.#bets = {};
    this.#communityCards = [];
    this.#state = State.OPEN;
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
    // TODO: implement
    // no winner yet
    // return null
    return new Player({ id: 'al-capone', name: 'Al Capone', cash: 95 });
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
      this.initializeBet(player.id);
    }
  }

  addPlayer({ id, name }) {
    this.#players.push(new Player({ id, name, cash: 100 }));
  }
  updateState() {
    switch (this.#state) {
      case State.PRE_FLOP:
        this.#state = State.FLOP;
        break;
    }
  }
  performAction(action, ...args) {
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) % this.#players.length;
    if (this.#currentPlayerIndex === this.#startPlayerIndex) {
      this.#communityCards = this.#deck.draw(3);
      this.updateState();
    }
  }
}
