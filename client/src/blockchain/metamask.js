import Web3 from 'web3';
import {Common} from 'web3-core';

const BankContract = require('./build/contracts/Bank.json');

const isMetamaskInstalled = async () => {
    let isEnabled = false;
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        isEnabled = true;
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        isEnabled = true;
    } else {
        console.log('Please install MetaMask!');
    }

    window.ethereum.on('accountsChanged', (accounts) => {
        console.log('accountsChanged', accounts);
        window.location.reload();
    });
    window.ethereum.on('networkChanged', (networkId) => {
        console.log('networkId', networkId);
        window.location.reload();
    });

    return isEnabled;
}

const getUserAddress = async () => {
    const accounts = await window.web3.eth.getAccounts();
    return accounts[0];
}

const loadUserNetworkId = async () => {
    return await window.web3.eth.net.getId();
}

const loadContract = async (token) => {
    const networkId = await loadUserNetworkId();
    const tokenData = token.networks[networkId];
    if (tokenData) {
        return new window.web3.eth.Contract(token.abi, tokenData.address);
    } else {
        alert('Contract not found');
    }
}

const maxDigits = (price) => {
    let digits = 2;
    if (price < 1) {
        digits = 6;
    } else if (price < 10) {
        digits = 5;
    } else if (price < 100) {
        digits = 4;
    } else if (price < 1000) {
        digits = 3;
    }

    return digits;
}

const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false
    }).format(Date.parse(date));
}

const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
    }).format(Date.parse(date));
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: maxDigits(price)
    }).format(price);
}

const deposit = async (amount) => {
    const networkId = await loadUserNetworkId();
    const tokenData = BankContract.networks[networkId];
    if (tokenData) {
        const userAddress = await getUserAddress();

        web3.eth.sendTransaction({
            from: userAddress,
            to: tokenData.address,
            value: web3.utils.toWei(amount.toString()),
            chain: networkId
        }, function (err, transactionHash) {
            if (err) {
                console.log(err);
            } else {
                console.log(transactionHash);
            }
        });
    }


}

export {
    isMetamaskInstalled,
    getUserAddress,
    loadUserNetworkId,
    loadContract,
    maxDigits,
    formatPrice,
    formatDate,
    formatTime,
    deposit
}