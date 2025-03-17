// wallet.js
const { Connection, PublicKey } = solanaWeb3;

// Solana network (use 'mainnet-beta' for production, 'devnet' for testing)
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Check if Phantom is installed and connect
async function connectWallet() {
    if ('solana' in window && window.solana.isPhantom) {
        try {
            const resp = await window.solana.connect();
            const publicKey = resp.publicKey.toString();
            // Store the public key in localStorage to persist across pages
            localStorage.setItem('phantomPublicKey', publicKey);
            console.log('Connected to Phantom:', publicKey);

            return publicKey;

        } catch (err) {
            console.error('Connection failed:', err);
            throw new Error('User rejected the request or an error occurred');
        }
    } else {
        alert('Please install the Phantom wallet extension!');
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom not detected');
    }
}

// Check if wallet is already connected (e.g., on page load)
function getConnectedWallet() {
    const publicKey = localStorage.getItem('phantomPublicKey');
    if (publicKey && window.solana && window.solana.isConnected) {
        return publicKey;
    }
    return null;
}

// Disconnect wallet (optional)
function disconnectWallet() {
    if (window.solana) {
        window.solana.disconnect();
        localStorage.removeItem('phantomPublicKey');
        console.log('Disconnected from Phantom');
    }
}

// Export functions for use in other scripts
export { connectWallet, getConnectedWallet, disconnectWallet, connection };