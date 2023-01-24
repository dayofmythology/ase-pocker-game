import Action from '../lib/action.js';
import State from '../lib/state.js';
import { assert, expect } from 'chai'; // CHOICE: use assert or expect
import { TableService, Player } from '../index.js';
import { IllegalActionError, IllegalAmountError } from '../lib/errors.js';

// TODO: implement proper unit tests
describe('TableService', function () {
  let tableService = null;

  this.beforeEach(function () {
    tableService = new TableService(/* options */);
  });
  it('should return a static list of players', function () {
    const expectedPlayers = [
      new Player({ id: 'al-capone', name: 'Al Capone', cash: 95 }),
      new Player({ id: 'pat-garret', name: 'Pat Garret', cash: 95 }),
      new Player({ id: 'wyatt-earp', name: 'Wyatt Earp', cash: 95 })
    ];
    const actualPlayers = tableService.players;
    for (let i = 0; i < actualPlayers.length; i++) {
      const { id: actualId, name: actualName, cash: actualCash } = actualPlayers[i];
      const { id: expectedId, name: expectedName, cash: expectedCash } = expectedPlayers[i];
      expect(actualId).to.eql(expectedId);
      expect(actualName).to.eql(expectedName);
      expect(actualCash).to.eql(expectedCash);
    }
  });
  it('should return table state as open when the table is create', () => {
    expect(tableService.state).to.equal(State.OPEN);
  });
  it('should return empty players list when the table is create', () => {
    expect(tableService.players).to.eqls([]);
  });
  it('should add player to the table and set player to inactive', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    const player = tableService.players[0];
    expect(tableService.players).to.have.lengthOf(1);
    expect(player.cash).to.equal(100);
    expect(player.id).to.equal('player1');
    expect(player.name).to.equal('Messi');
    expect(player.is_active).to.equal(false);
  });
  it('should switch table state to PRE_FLOP when the game starts', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    expect(tableService.state).to.equal(State.PRE_FLOP);
  });
  it('should throw error when the game starts with less than 2 players', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    expect(() => tableService.start()).to.throws(
      Error,
      'Insufficent number of players present, current player count 1'
    );
  });
  it('should successfully start the game by distributing the cards and setting current player', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    expect(tableService.state).to.equal(State.PRE_FLOP);
    expect(tableService.players).to.have.lengthOf(3);
    for (const player of tableService.players) {
      expect(player.is_active).to.equal(true);
      expect(player.cash).to.equal(100);
      expect(player.cards).to.have.lengthOf(2);
    }
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
  });
  it('should return current player as null if the game has not started', () => {
    expect(tableService.currentPlayer).to.equal(null);
  });
  it('should return current player whose turn is to play', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
  });
  it('should return empty array of cards if the cards are not dealt', () => {
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    expect(tableService.getPlayerCards('player2')).to.eql([]);
  });
  it('should return list of cards present with a player once the cards are dealt', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    for (const player of tableService.players) {
      const cards = tableService.getPlayerCards(player.id);
      expect(cards).to.have.lengthOf(2);
      for (const card of cards) {
        expect(typeof card).to.equal('object');
      }
    }
  });
  it('should return empty community cards when the game is in OPEN state', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    expect(tableService.communityCards).to.eqls([]);
  });
  it('should return empty community cards when the game is in PRE FLOP state', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    expect(tableService.communityCards).to.eqls([]);
  });
  it('should set current player to next player when action is performed', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
    tableService.performAction(Action.CHECK);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[1].id);
    tableService.performAction(Action.CHECK);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
  });
  it('should initialize bets to 0 when the game start', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    const bets = tableService.bets;
    for (const val of Object.values(bets)) {
      expect(val).to.equal(0);
    }
  });
  it('should draw three community cards when all players have checked', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.start();
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
    tableService.performAction(Action.CHECK);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[1].id);
    tableService.performAction(Action.CHECK);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
    expect(tableService.communityCards).to.have.lengthOf(3);
    expect(tableService.state).to.equal(State.FLOP);
  });
  it('should ignore inactive players while determining next current player', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.players[1].setActive(false);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
    tableService.performAction(Action.CHECK);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[2].id);
    tableService.performAction(Action.CHECK);
    expect(tableService.currentPlayer.id).to.equal(tableService.players[0].id);
  });
  it('should perform fold action successfully for the current player', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.FOLD);
    expect(tableService.players[0].is_active).to.equal(false);
  });
  it('should detemine winner when all but one player has folded and stata has ENDED', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.CHECK);
    tableService.performAction(Action.FOLD);
    tableService.performAction(Action.FOLD);
    expect(tableService.winner.id).to.equal('player1');
    expect(tableService.state).to.equal(State.ENDED);
  });
  it('should add the rasied amount to the bet', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.RAISE, 10);
    expect(tableService.bets[tableService.players[0].id]).to.equal(10);
    expect(tableService.players[0].cash).to.equal(100 - 10);
  });
  it('should throw error if the bet amount is less than the current bet', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.RAISE, 10);
    tableService.performAction(Action.RAISE, 20);
    expect(() => tableService.performAction(Action.RAISE, 10)).to.throws(IllegalAmountError);
  });
  it("should throw error if the bet amount is greater than player's cash", () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    expect(() => tableService.performAction(Action.RAISE, 110)).to.throws(IllegalAmountError);
  });
  it("should throw error if the bet amount is greater than any player's remaining cash", () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.RAISE, 50);
    expect(() => tableService.performAction(Action.RAISE, 60)).to.throws(IllegalAmountError);
  });
});
