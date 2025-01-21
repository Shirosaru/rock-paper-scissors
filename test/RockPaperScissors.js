// test/RockPaperScissors.js

const { expect } = require("chai");

describe("RockPaperScissors", function () {
    let Token, token, Game, game;
    let owner, player1, player2;

    beforeEach(async function () {
        [owner, player1, player2] = await ethers.getSigners();

        Token = await ethers.getContractFactory("ERC20Token");
        token = await Token.deploy();
        await token.deployed();
        console.log("ERC20 Token deployed to:", token.address);

        Game = await ethers.getContractFactory("RockPaperScissors");
        game = await Game.deploy(token.address);
        await game.deployed();
        console.log("RockPaperScissors deployed to:", game.address);
        
        // Mint tokens for testing
        await token.transfer(player1.address, ethers.utils.parseUnits("100", 18));
        await token.transfer(player2.address, ethers.utils.parseUnits("100", 18));
    });

    it("Should create a game", async function () {
        await game.connect(player1).createGame();
        const gameId = 1; // Assuming this is the first game ID
        const gameDetails = await game.games(gameId);
        expect(gameDetails.player1).to.equal(player1.address);
    });

    it("Should join a game", async function () {
        const tx = await game.connect(player1).createGame();
        const receipt = await tx.wait();
        const gameId = receipt.events[0].args[0]; // Get the created game ID

        await game.connect(player2).joinGame(gameId, 2); // Assuming 2 is a valid choice (Paper)
        const gameDetails = await game.games(gameId);
        expect(gameDetails.player2).to.equal(player2.address);
        expect(gameDetails.choice2).to.equal(2); // Ensure the choice matches
    });
    
    it("Should determine the winner correctly", async function () {
        const tx = await game.connect(player1).createGame();
        const receipt = await tx.wait();
        const gameId = receipt.events[0].args[0];

        await game.connect(player2).joinGame(gameId, 3); // Assuming 3 is a valid choice (Scissors)
        // Assume player1's choice is set in the joinGame function
        await game.connect(player1).joinGame(gameId, 1); // 1 is Rock

        const gameOutcome = await game.getGameOutcome(gameId); // Assuming getGameOutcome is implemented
        expect(gameOutcome).to.equal(1); // Assuming 1 means player1 won
    });
});
