import Action from "./action.js";
import Card from "./card.js";
import Deck from "./deck.js";
import Player from "./player.js";
import State from "./state.js";
import { IllegalActionError, IllegalAmountError } from "./errors.js";

export default class TableService {
  static #instance = null;
  #state = null;
  #deck = null;
  #players = null;
  #currentPlayer = null;
  #drawCardsCount = 2;

  static getInstance() {
    if (!TableService.#instance) {
      TableService.#instance = new TableService(/* options */);
    }
    return TableService.#instance;
  }

  constructor(/* options */) {
    this.#deck = new Deck();
    this.#players = [];
    this.#state = State.OPEN;
  }

  get state() {
    return this.#state;
  }

  get players() {
    return this.#players;
  }

  getPlayerCards(playerId) {
    // TODO: implement
    // no player cards yet
    // return []
    return [
      new Card({ suit: "spades", rank: "ace" }),
      new Card({ suit: "hearts", rank: "ace" }),
    ];
  }

  get communityCards() {
    // TODO: implement
    // no community cards yet
    // return []
    return [
      new Card({ suit: "diamonds", rank: "ace" }),
      new Card({ suit: "clubs", rank: "ace" }),
      new Card({ suit: "spades", rank: "king" }),
      new Card({ suit: "hearts", rank: "king" }),
      new Card({ suit: "clubs", rank: "king" }),
    ];
  }

  get currentPlayer() {
    return this.#currentPlayer;
  }

  get bets() {
    // TODO: implement
    // no bets yet
    // return null
    return {
      "al-capone": 5,
      "pat-garret": 5,
      "wyatt-earp": 5,
    };
  }

  get pot() {
    // TODO: implement
    return 15;
  }

  get winner() {
    // TODO: implement
    // no winner yet
    // return null
    return new Player({ id: "al-capone", name: "Al Capone", cash: 95 });
  }

  get winnerHand() {
    // TODO: implement
    // no winner hand yet
    // return []
    return [
      new Card({ suit: "spades", rank: "ace" }),
      new Card({ suit: "hearts", rank: "ace" }),
      new Card({ suit: "diamonds", rank: "ace" }),
      new Card({ suit: "clubs", rank: "ace" }),
      new Card({ suit: "spades", rank: "king" }),
    ];
  }

  start() {
    if (this.#players.length < 2) {
      throw new Error(
        `Insufficent number of players present, current player count ${
          this.#players.length
        }`
      );
    }
    this.#state = State.PRE_FLOP;
    for (const player of this.#players) {
      if (this.#currentPlayer === null) {
        this.#currentPlayer = player;
      }
      const cards = this.#deck.draw(this.#drawCardsCount);
      for (const card of cards) {
        player.addCard(card);
      }
      player.setActive(true);
    }
  }

  addPlayer({ id, name }) {
    this.#players.push(new Player({ id, name, cash: 100 }));
  }

  performAction(action, ...args) {
    // TODO: implement
    console.log("performAction", { action, args });
  }
}
