import detectEthereumProvider from '@metamask/detect-provider';


function handleAccountChanged(accounts) {
    console.log('handleAccountChanged');
    window.location.reload();
}

function handleChainChanged(chainId) {
    console.log('handleChainChanged');
    window.location.reload();
}

const isMetamaskInstalled = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
        if (provider !== window.ethereum) {
            console.error('Do you have multiple wallets installed?');
            window.ethereum = provider;
        }

        ethereum.on('accountsChanged', handleAccountChanged);
        ethereum.on('chainChanged', handleChainChanged);

        return true;
    } else {
        console.log('Please install MetaMask!');
        return false;
    }
}

const getUserAddress = async () => {
    return ethereum
        .request({method: 'eth_requestAccounts'})
        .then((accounts) => {
            return accounts[0];
        })
        .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        });
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
    }).format(price)
}

const deposit = (amount) => {
    // window.web3.
    console.log(amount);
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