import { ethers } from './ethers-5.2.esm.min.js';
import { ABI, ADDRESS } from './constants.js';

const walletConnect = document.getElementById('wallet-connect');
const fundForm = document.getElementById('fund-form');
const getBalanceBtn = document.getElementById('fund-balance');
const withdrawButton = document.getElementById('fund-withdraw');

async function connect() {
  let accounts;
  try {
    await ethereum.request({
      method: 'eth_requestAccounts',
    });
  } catch (error) {
    console.error(error);
  }

  accounts = await ethereum.request({ method: 'eth_accounts' });

  document.getElementById('wallet-address').innerHTML = accounts[0];
  walletConnect.innerHTML = 'Connected';
}

// Listen for transaction to be mined
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining transaction: ${transactionResponse.hash}...`);
  // Listen for the transaction to be mined, using ethers event such as once, on, etc
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`,
        );
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Withdraw function
async function withdraw() {
  if (ethereum !== 'undefined') {
    const balance = await getBalance();
    if (balance === 0) {
      alert('You have no funds to withdraw');
      return;
    }
    console.log('Withdrawing...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ADDRESS, ABI, signer);

    try {
      const txResponse = await contract.withdraw();
      await listenForTransactionMine(txResponse, provider);
      console.log('Done!');
    } catch (error) {
      console.error(error);
    }
  }
}

// Fund function

async function fund(e) {
  e.preventDefault();
  const ethAmount = e.target.querySelector('#ethAmount').value;

  if (ethereum !== 'undefined') {
    if (ethAmount === 0 || ethAmount === '') {
      alert('Please enter the amount');
      return;
    }

    // provider | connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer | wallet | someone with some gas

    const signer = provider.getSigner();

    // contract that we want to interact with
    // we need to use ABI and Address
    const contract = new ethers.Contract(ADDRESS, ABI, signer);

    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(txResponse, provider);
      console.log('Done!');
      e.target.reset();
    } catch (error) {
      console.error(error);
    }
  }
}

// Get Balance

async function getBalance() {
  let balance;
  if (ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    balance = await provider.getBalance(ADDRESS);
    console.log('Balance: ', ethers.utils.formatEther(balance));
  }

  return parseInt(balance.toString()) / 1000000000000000000;
}

const checkConfig = () => {
  if (typeof ethereum !== 'undefined') {
    walletConnect.addEventListener('click', connect);
  } else {
    walletConnect.innerHTML = 'Please install MetaMask';
  }
};

const checkAccounts = (accounts) => {
  const walletAddress = document.getElementById('wallet-address');
  if (accounts.length === 1) {
    walletAddress.innerHTML = accounts[0];
    walletAddress.style.opacity = 1;
  } else {
    walletAddress.style.opacity = 0;
    walletConnect.innerHTML = 'Connect Wallet';
  }

  walletAddress.innerHTML = accounts[0];
};

ethereum.on('accountsChanged', (accounts) => checkAccounts(accounts));
fundForm.addEventListener('submit', (e) => fund(e));
getBalanceBtn.addEventListener('click', getBalance);
withdrawButton.addEventListener('click', withdraw);

checkConfig();
