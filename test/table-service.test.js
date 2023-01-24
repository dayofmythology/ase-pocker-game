import State from '../lib/state.js';
import { assert, expect } from 'chai'; // CHOICE: use assert or expect
import { TableService, Player } from '../index.js';

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
});
