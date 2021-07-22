import Web3 from 'web3';

const isMetamaskEnabled = () => {
    return new Promise(async (resolve, reject) => {
        let isEnabled = false;
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            isEnabled = true;
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            isEnabled = true;
        }

        if (isEnabled) {
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('accountsChanged', accounts);
                window.location.reload();
            });
            window.ethereum.on('networkChanged', (networkId) => {
                console.log('networkId', networkId);
                window.location.reload();
            });

            resolve();
        } else {
            reject('Please install MetaMask!');
        }
    });
}

const isMetamaskInstalled = () => {
    return window.ethereum || window.web3;
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

const depositPromise = (amount) => {
    return new Promise(async (resolve, reject) => {
        const networkId = await loadUserNetworkId();
        if (networkId !== process.env.VUE_APP_NETWORK_ID) {
            const userAddress = await getUserAddress();

            web3.eth.sendTransaction({
                from: userAddress,
                // to: process.env.VUE_APP_ADMIN_ADDRESS,
                to: '0xCDcD72D2f6B94ACA363a8bda1D045F17F31157Ea',
                value: web3.utils.toWei(amount.toString()),
                chain: networkId
            }, function (err, transactionHash) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(transactionHash);
                }
            });
        } else {
            reject('Wrong Network selected!');
        }
    })
}

export {
    isMetamaskInstalled,
    isMetamaskEnabled,
    getUserAddress,
    loadUserNetworkId,
    loadContract,
    maxDigits,
    formatPrice,
    formatDate,
    formatTime,
    depositPromise,
}