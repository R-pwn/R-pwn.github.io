// wallet.js
import { Connection, PublicKey } from '@solana/web3.js';
import { payFee } from './transactions.js';

// Ensure Connection is only declared once
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function connectWallet() {
    console.log('Attempting to connect wallet...');
    if ('solana' in window && window.solana.isPhantom) {
        try {
            if (window.solana.isConnected) {
                const publicKey = window.solana.publicKey.toString();
                localStorage.setItem('phantomPublicKey', publicKey);
                return publicKey;
            }
            const resp = await window.solana.connect();
            const publicKey = resp.publicKey.toString();
            localStorage.setItem('phantomPublicKey', publicKey);
            console.log('Connected to Phantom:', publicKey);
            return publicKey;
        } catch (err) {
            console.error('Wallet connection failed:', err);
            throw err;
        }
    } else {
        alert('Please install the Phantom wallet extension!');
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom wallet not detected');
    }
}

function getConnectedWallet() {
    const publicKey = localStorage.getItem('phantomPublicKey');
    if (publicKey && window.solana && window.solana.isConnected) {
        return publicKey;
    }
    return null;
}

const connectButton = document.getElementById('connectWallet');
const playButton = document.getElementById('playGame');
const walletStatus = document.getElementById('walletStatus');
const gameCanvas = document.getElementById('gameCanvas');

if (!connectButton || !playButton || !walletStatus || !gameCanvas) {
    console.error('DOM elements not found.');
} else {
    window.onload = () => {
        const publicKey = getConnectedWallet();
        if (publicKey) {
            walletStatus.textContent = `Connected: ${publicKey.slice(0, 6)}...`;
            playButton.disabled = false;
        }
    };

    connectButton.addEventListener('click', async () => {
        try {
            const publicKey = await connectWallet();
            walletStatus.textContent = `Connected: ${publicKey.slice(0, 6)}...`;
            playButton.disabled = false;
        } catch (err) {
            walletStatus.textContent = 'Failed to connect wallet';
        }
    });

    playButton.addEventListener('click', async () => {
        const publicKey = getConnectedWallet();
        if (!publicKey) {
            alert('Please connect your wallet first!');
            return;
        }
        try {
            walletStatus.textContent = 'Processing fee...';
            await payFee(publicKey);
            walletStatus.textContent = 'Fee paid! Game starting...';
            gameCanvas.style.display = 'block';
        } catch (err) {
            console.error('Fee payment failed:', err);
            walletStatus.textContent = 'Failed to pay the fee';
            alert('Failed to pay the fee: ' + err.message);
        }
    });
}

export { connectWallet, getConnectedWallet, connection };