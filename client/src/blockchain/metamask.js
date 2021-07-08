import detectEthereumProvider from '@metamask/detect-provider';


function handleAccountChanged(accounts) {
    window.location.reload();
}

function handleChainChanged(chainId) {
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

const loadUserAccount = async () => {
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

export {
    isMetamaskInstalled,
    loadUserAccount,
    loadUserNetworkId,
    loadContract,
}