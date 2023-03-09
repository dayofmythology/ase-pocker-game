import { BestHand, Handscore } from '../index.js';

export default class Winners {
  #players = [];
  #playerCards = [];
  #communityCards = [];

  constructor(players, playerCards, communityCards) {
    this.#players = players;
    this.#playerCards = playerCards;
    this.#communityCards = communityCards;
  }

  determine() {
    const sortedPlayersWithScores = this.#sortedPlayersWithScores();

    return this.#winnersWithSameScores(sortedPlayersWithScores);
  }

  #sortedPlayersWithScores() {
    return this.#playerCards
      .map((playerCards, idx) => {
        return {
          player: this.#players[idx],
          bestHand: new BestHand(playerCards, this.#communityCards).determine()
        };
      })
      .map(({ player, bestHand }) => {
        const score = new Handscore().calculate(bestHand);
        return {
          player,
          bestHand,
          score
        };
      })
      .sort(({ score: score1 }, { score: score2 }) => {
        return score2 - score1;
      });
  }

  #winnersWithSameScores(sortedPlayersWithScores) {
    const highestScore = sortedPlayersWithScores[0].score;
    return sortedPlayersWithScores
      .filter((winner) => winner.score === highestScore)
      .map(({ player, bestHand }) => {
        return {
          winner: player,
          winningHand: bestHand.hand
        };
      });
  }
}
