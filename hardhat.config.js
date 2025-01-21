require('@nomiclabs/hardhat-ethers');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config(); // If you use environment variables

module.exports = {
    solidity: "0.8.20", // Replace with your Solidity version
    networks: {
        hardhat: {
            // Hardhat Network configuration (default settings are usually sufficient)
        }
    },
    paths: {
        artifacts: "./src/artifacts" // Optional: Customize paths
    },
    mocha: {
        timeout: 20000 // Optional: Adjust timeout for tests
    }
};
