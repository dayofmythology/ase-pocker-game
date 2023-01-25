import Action from '../lib/action.js';
import State from '../lib/state.js';
import { assert, expect } from 'chai'; // CHOICE: use assert or expect
import { TableService, Card, Deck } from '../index.js';
import { IllegalActionError, IllegalAmountError } from '../lib/errors.js';

// TODO: implement proper unit tests
describe('TableService', function () {
  let tableService = null;
  this.beforeEach(function () {
    tableService = new TableService(new Deck());
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
    expect(player.active).to.equal(false);
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
      expect(player.active).to.equal(true);
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
        expect(card).to.be.instanceOf(Card);
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
    expect(tableService.players[0].active).to.equal(false);
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
  it('should throw error if call action is performed before raise', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    expect(() => tableService.performAction(Action.CALL)).to.throws(
      IllegalActionError,
      'CALL action cannot be performed before RAISE'
    );
  });
  it('should deduct the bet amount when CALL is performed', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.RAISE, 20);
    tableService.performAction(Action.RAISE, 30);
    tableService.performAction(Action.CALL);
    expect(tableService.players[0].cash).to.equal(100 - 20);
    expect(tableService.players[1].cash).to.equal(100 - 30);
    expect(tableService.players[2].cash).to.equal(100 - 30);
  });
  it('should deduct the difference amount between currnet max bet and previous raised amount by the current player when CALL is performed', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.RAISE, 20);
    tableService.performAction(Action.RAISE, 30);
    tableService.performAction(Action.CALL);
    tableService.performAction(Action.CALL);
    expect(tableService.players[0].cash).to.equal(100 - 30);
    expect(tableService.players[1].cash).to.equal(100 - 30);
    expect(tableService.players[2].cash).to.equal(100 - 30);
  });
  it('should throw error if a player performs CHECK when non CHECK actions are performed in the same round', () => {
    tableService.addPlayer({ id: 'player1', name: 'Messi' });
    tableService.addPlayer({ id: 'player2', name: 'Ronaldo' });
    tableService.addPlayer({ id: 'player3', name: 'Kane' });
    tableService.start();
    tableService.performAction(Action.RAISE, 10);
    expect(() => tableService.performAction(Action.CHECK)).to.throws(
      IllegalActionError,
      'Cannot perform CHECK when previous players have not performed CHECK'
    );
  });
});
