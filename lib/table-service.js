import State from "./state.js";
import Player from "./player.js";
import Card from "./card.js";
import Action from "./action.js";
import { IllegalActionError, IllegalAmountError } from "./errors.js";

export default class TableService {
  static #instance = null;
  #state = null;

  static getInstance() {
    if (!TableService.#instance) {
      TableService.#instance = new TableService(/* options */);
    }
    return TableService.#instance;
  }

  constructor(/* options */) {
    this.#state = State.OPEN;
  }

  get state() {
    return this.#state;
  }

  get players() {
    // TODO: implement
    // no players yet
    // return []
    return [
      new Player({ id: "al-capone", name: "Al Capone", cash: 95 }),
      new Player({ id: "pat-garret", name: "Pat Garret", cash: 95 }),
      new Player({ id: "wyatt-earp", name: "Wyatt Earp", cash: 95 }),
    ];
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
    // TODO: implement
    // no current player yet
    // return null
    return new Player({ id: "al-capone", name: "Al Capone", cash: 95 });
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
    // TODO: implement
  }

  addPlayer({ id, name }) {
    // TODO: implement
    console.log("addPlayer", { id, name });
  }

  performAction(action, ...args) {
    // TODO: implement
    console.log("performAction", { action, args });
  }
}
