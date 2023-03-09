import express from 'express';

const playerToObject = (player) => {
  if (!player) {
    return null;
  }
  const { id, name, cash } = player;
  return { id, name, cash };
};
const cardToObject = ({ suit, rank }) => ({ suit, rank });

export default ({ tableService }) => {
  const router = express.Router();

  // get game details
  router.get('/', ({ user: { id } }, res, next) => {
    const { state, players, currentPlayer, communityCards, bets, pot, winner, winnerHand } = tableService;
    const playerCards = tableService.getPlayerCards(id);
    const snapshot = {
      state,
      players: players.map(playerToObject),
      currentPlayer: playerToObject(currentPlayer),
      communityCards: communityCards.map(cardToObject),
      playerCards: playerCards.map(cardToObject),
      bets,
      pot,
      winner: playerToObject(winner),
      winnerHand: winnerHand.map(cardToObject)
    };
    res.status(200).json(snapshot);
  });

  // join game
  router.post('/players', ({ user: { id, name } }, res, next) => {
    tableService.addPlayer({ id, name });
    res.status(204).end();
  });

  // start game
  router.post('/start', (req, res, next) => {
    tableService.start();
    res.status(204).end();
  });

  // actions
  router.post('/actions', express.json(), ({ body: { type: action, args = [] } }, res, next) => {
    tableService.performAction(action, ...args);
    res.status(204).end();
  });

  return router;
};
