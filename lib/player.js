export default class Player {
  #id = "";
  #name = "";
  #cash = 0;
  #active = null;
  #playerCards = [];

  constructor({ id, name, cash }) {
    this.#id = id;
    this.#name = name;
    this.#cash = cash;
    this.#active = false;
  }

  get id() {
    return this.#id;
  }

  get is_active() {
    return this.#active;
  }

  get name() {
    return this.#name;
  }

  get cash() {
    return this.#cash;
  }

  get cards() {
    return this.#playerCards;
  }

  setActive(flag) {
    this.#active = flag;
  }

  addCard(card) {
    this.#playerCards = [...this.#playerCards, card];
  }

  addCash(amount) {
    this.#cash += amount;
  }

  deductCash(amount) {
    this.#cash -= amount;
  }
}
