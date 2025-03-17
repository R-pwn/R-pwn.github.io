import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './play_pwnzer.html',
            },
        },
    },
    server: {
        port: 5173,
        open: '/play_pwnzer.html',
    },
    optimizeDeps: {
        include: ['@solana/web3.js'], // Pre-bundle this dependency
    },
    resolve: {
        alias: {
            '@solana/web3.js': '/node_modules/@solana/web3.js/dist/index.esm.js', // Explicit path
        },
    },
});