import State from "../lib/state.js";
import { assert, expect } from "chai"; // CHOICE: use assert or expect
import { TableService, Player } from "../index.js";

// TODO: implement proper unit tests
describe("TableService", function () {
  let tableService = null;

  this.beforeEach(function () {
    tableService = new TableService(/* options */);
  });
  it("should return a static list of players", function () {
    const expectedPlayers = [
      new Player({ id: "al-capone", name: "Al Capone", cash: 95 }),
      new Player({ id: "pat-garret", name: "Pat Garret", cash: 95 }),
      new Player({ id: "wyatt-earp", name: "Wyatt Earp", cash: 95 }),
    ];
    const actualPlayers = tableService.players;
    for (let i = 0; i < actualPlayers.length; i++) {
      const {
        id: actualId,
        name: actualName,
        cash: actualCash,
      } = actualPlayers[i];
      const {
        id: expectedId,
        name: expectedName,
        cash: expectedCash,
      } = expectedPlayers[i];
      expect(actualId).to.eql(expectedId);
      expect(actualName).to.eql(expectedName);
      expect(actualCash).to.eql(expectedCash);
    }
  });
  it("should return table state as open when the table is create", () => {
    expect(tableService.state).to.equal(State.OPEN);
  });
  it("should return empty players list when the table is create", () => {
    expect(tableService.players).to.eqls([]);
  });
});
