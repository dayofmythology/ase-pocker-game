# Poker App

This is the starting point of the application.

## Getting started

Please run `npm install` and `npm start` to start the application.

You can then browse to <http://localhost:3000/>

## Code introduction

- `.www` folder contains the server and web application code

    There is no need to change anything in this folder.

- `lib` folder contains the code for the poker game

  - `lib/action.js` contains constants for game actions.

      Can be used as it is.

  - `lib/card.js` contains the code for the `Card` class

      Can be used as it is.

  - `lib/deck.js` contains the code for the `Deck` class

      Can be used as it is.

  - `lib/player.js` contains the code for the `Player` class

      Can be used as it is.

  - `lib/state.js` contains game state contants

      Can be used as it is.

  - `lib/table-service.js` contains the code for the `TableService` class

      This is the starting point for your code.

      You need to add your own code to this file to implement the full game logic.

      Look for any `// TODO: implement` comment.

      Also make sure to return the correct values and types for each method.
      
## Scripts

- `npm start`: starts the application server

- `npm test`: runs the tests

- `npm run lint`: runs static code checks

- `npm run watch`: starts and restarts the the application server on any code changes
