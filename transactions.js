// transactions.js
import { Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction } from '@solana/spl-token';
import { connection } from './wallet.js';

// $PWN token mint address (replace with actual mint address)
const PWN_MINT = new PublicKey('HUUaBZFjgPdDqgXLgbo4b83TGuJNrapBQsaR8awHpump');
// Burn wallet address (black hole address)
const BURN_WALLET = new PublicKey('11111111111111111111111111111111');
// Fee amount in $PWN (e.g., 1 $PWN, adjust decimals based on token)
const FEE_AMOUNT = 1_000_000; // Assuming 6 decimals (1 $PWN = 1,000,000 lamports)

async function payFee(playerPublicKey) {
    const playerPubkey = new PublicKey(playerPublicKey);

    // Find the player's associated token account for $PWN
    const playerTokenAccount = await connection.getTokenAccountsByOwner(playerPubkey, {
        mint: PWN_MINT,
    }).then(accounts => accounts.value[0]?.pubkey);

    if (!playerTokenAccount) {
        throw new Error('Player does not have a $PWN token account');
    }

    // Find or assume the burn wallet's token account (for simplicity, use burn address directly)
    const burnTokenAccount = await connection.getTokenAccountsByOwner(BURN_WALLET, {
        mint: PWN_MINT,
    }).then(accounts => accounts.value[0]?.pubkey) || BURN_WALLET;

    // Create transaction
    const transaction = new Transaction().add(
        createTransferInstruction(
            playerTokenAccount, // Source
            burnTokenAccount,   // Destination (burn address)
            playerPubkey,       // Owner
            FEE_AMOUNT,         // Amount
            [],                 // Signers (none needed, Phantom handles this)
            TOKEN_PROGRAM_ID    // Token program ID
        )
    );

    // Set recent blockhash and fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = playerPubkey;

    // Sign and send transaction via Phantom
    const signedTx = await window.solana.signTransaction(transaction);
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txId);

    console.log(`Fee paid and burned: ${txId}`);
    return txId;
}

export { payFee };