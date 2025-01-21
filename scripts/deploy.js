// scripts/deploy.js

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deploy ERC20 token
    const ERC20Token = await ethers.getContractFactory("ERC20Token"); // Use the actual contract name
    const token = await ERC20Token.deploy(); // No parameters needed for your constructor
    await token.deployed();
    console.log("ERC20 Token deployed to:", token.address);

    // Mint tokens to deployer for testing
    await token.mint(deployer.address, ethers.utils.parseUnits("1000", 18)); // Adjust minting if necessary

    // Deploy RockPaperScissors
    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    const game = await RockPaperScissors.deploy(token.address);
    await game.deployed();
    console.log("RockPaperScissors deployed to:", game.address);

    // Approve the RockPaperScissors contract to spend tokens
    await token.approve(game.address, ethers.utils.parseUnits("1000", 18));

    // Check balance (optional, for debugging)
    const balance = await token.balanceOf(deployer.address);
    console.log("Deployer balance:", balance.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
