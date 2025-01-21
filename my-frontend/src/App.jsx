import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RockPaperScissorsABI from './RockPaperScissorsABI.json';
import ERC20TokenABI from './ERC20ABI.json';

const CONTRACT_ADDRESS = '';
//const TOKEN_ADDRESS = '';
const TOKEN_ADDRESS = '';

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState('');
  const [gameId, setGameId] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [signer, setSigner] = useState(null);
  const [mintAmount, setMintAmount] = useState(100); // Amount to mint

  useEffect(() => {
    const initialize = async () => {
      if (!window.ethereum) {
        console.error("Ethereum provider not found. Install MetaMask.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setSigner(signer);

      try {
        const rockPaperScissorsContract = new ethers.Contract(CONTRACT_ADDRESS, RockPaperScissorsABI, signer);
        const erc20Contract = new ethers.Contract(TOKEN_ADDRESS, ERC20TokenABI, signer);

        setProvider(provider);
        setContract(rockPaperScissorsContract);
        setTokenContract(erc20Contract);

        const accounts = await provider.send('eth_requestAccounts', []);
        const userAccount = accounts[0];
        setAccount(userAccount);
        console.log('Account set:', userAccount);

        await fetchBalance(userAccount, erc20Contract);
      } catch (error) {
        console.error("Error initializing contracts or fetching accounts", error);
      }
    };

    initialize();
  }, []);

  const fetchBalance = async (account, tokenContract) => {
    if (!tokenContract || !account) {
      console.error("Token contract not set");
      setResult('Token contract or account not set');
      return;
    }

    try {
      const balance = await tokenContract.balanceOf(account);
      setBalance(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setResult('Error fetching balance. Please check contract and account');
    }
  };

  const mintTokens = async () => {
    if (!tokenContract || !signer) return console.error("Token contract or signer not initialized");

    setLoading(true);
    try {
      const tx = await tokenContract.connect(signer).mint(account, ethers.utils.parseUnits(mintAmount.toString(), 18));
      await tx.wait(); // Wait for the transaction to be confirmed
      console.log("Tokens minted!");

      // Check the balance after minting
      await fetchBalance(account, tokenContract);
      setResult(`Minted ${mintAmount} tokens!`);
    } catch (error) {
      console.error("Error minting tokens:", error);
      setResult(`Error minting tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    if (!contract || !signer) {
      console.error("Contract or signer not initialized");
      return;
    }

    setLoading(true);
    try {
      const nonce = await provider.getTransactionCount(account);
      const tx = await contract.connect(signer).createGame({ gasLimit: 30000000, nonce });
      const receipt = await tx.wait();
      const gameCreatedEvent = receipt.events.find(event => event.event === "GameCreated");

      if (gameCreatedEvent) {
        const newGameId = gameCreatedEvent.args[0].toNumber();
        setGameId(newGameId);
        setResult('Game created! Waiting for opponent...');
      } else {
        setResult('Game created, but event not found.');
      }
    } catch (error) {
      console.error("Error creating game", error);
      setResult(`Error creating game: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (choice) => {
    if (!contract || gameId == null || !signer) {
      console.error("Contract not initialized, game ID is null, or signer not set");
      return;
    }

    setLoading(true);
    try {
      const nonce = await provider.getTransactionCount(account);
      const tx = await contract.connect(signer).joinGame(gameId, choice, { gasLimit: 100000, nonce });
      await tx.wait();
      setResult('Joined the game! Waiting for result...');
    } catch (error) {
      console.error("Error joining game", error);
      setResult(`Error joining game: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getGameOutcome = async () => {
    if (!contract || gameId == null) return;

    try {
      const outcome = await contract.getGameOutcome(gameId);
      setResult(`Game result: ${outcome}`);
    } catch (error) {
      console.error("Error fetching game outcome", error);
      setResult('Error fetching game outcome.');
    }
  };

  return (
    <div className="App">
      <h1>Rock Paper Scissors</h1>
      <p>Account: {account}</p>
      <p>Balance: {balance} tokens</p>

      <div>
        <h2>Mint Tokens</h2>
        <button onClick={mintTokens}>Mint {mintAmount} Tokens</button>
      </div>

      <div>
        <h2>Player Addresses</h2>
        <input
          type="text"
          placeholder="Player 1 Address"
          onChange={(e) => setPlayer1Address(e.target.value)}
        />
        <input
          type="text"
          placeholder="Player 2 Address"
          onChange={(e) => setPlayer2Address(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      <button onClick={createGame}>Create Game</button>
      {gameId && (
        <>
          <p>Game ID: {gameId}</p>
          <button onClick={() => joinGame(1)}>Rock</button>
          <button onClick={() => joinGame(2)}>Paper</button>
          <button onClick={() => joinGame(3)}>Scissors</button>
          <button onClick={getGameOutcome}>Get Outcome</button>
        </>
      )}
      <p>{result}</p>
    </div>
  );
};

export default App;
