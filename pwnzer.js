// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Scale canvas for mobile
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 640, window.innerHeight / 480);
    canvas.style.width = `${640 * scale}px`;
    canvas.style.height = `${480 * scale}px`;
    canvas.width = 640;
    canvas.height = 480;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game states
const STATES = { START: 'start', PLAYING: 'playing', GAME_OVER: 'game_over' };
let gameState = STATES.START;
let introMusicPlayed = false;
let outroMusicPlayed = false;

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50 - 40, // 400px from top
    width: 60,
    height: 80,
    facingRight: true
};

// Enemies (jeets)
let enemies = [];
const enemySpeedBase = 3;
let spawnRate = 60;
let frameCount = 0;

// Stats
let kills = 0;
let secondsPlayed = 0;
let lastTime = Date.now();
const popups = [];
let animationFrame = 0;

// Assets
const bgImage = new Image();
bgImage.src = 'assets/game_pwnzer/bg.png';
const pwnzerImage = new Image();
pwnzerImage.src = 'assets/game_pwnzer/pwnzer.png';
const logoImage = new Image();
logoImage.src = 'assets/game_pwnzer/logo.png';
const pwnSound = new Audio('assets/game_pwnzer/pwn.wav');
const introOutroMusic = new Audio('assets/game_pwnzer/intro.mp3');
const bgMusic = new Audio('assets/game_pwnzer/background.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

// Hash function
function generateHash(kills, seconds) {
    const str = `${kills}${seconds}xAI`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase();
}

// Spawn jeet
function spawnEnemy() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const enemy = {
        x: side === 'left' ? -32 : canvas.width,
        y: canvas.height - 64,
        width: 32,
        height: 32,
        speed: enemySpeedBase + Math.random() * 3,
        direction: side === 'left' ? 1 : -1,
        animFrame: 0
    };
    enemies.push(enemy);
}

// Input handler (mouse and touch)
function handleInput(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const adjustedX = (x - rect.left) * scaleX;
    const adjustedY = (y - rect.top) * scaleY;

    if (gameState === STATES.START) {
        gameState = STATES.PLAYING;
        lastTime = Date.now();
        introOutroMusic.pause();
        introOutroMusic.currentTime = 0;
        introMusicPlayed = false;
        bgMusic.play();
    } else if (gameState === STATES.PLAYING) {
        player.facingRight = adjustedX > player.x + player.width / 2;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (
                adjustedX >= enemy.x && adjustedX <= enemy.x + enemy.width &&
                adjustedY >= enemy.y && adjustedY <= enemy.y + enemy.height
            ) {
                enemies.splice(i, 1);
                kills++;
                popups.push({ x: enemy.x, y: enemy.y - 20, text: 'Pwned!', timer: 30 });
                pwnSound.currentTime = 0;
                pwnSound.play();
                break;
            }
        }
    } else if (gameState === STATES.GAME_OVER) {
        gameState = STATES.START;
        kills = 0;
        secondsPlayed = 0;
        enemies = [];
        spawnRate = 60;
        frameCount = 0;
        bgMusic.pause();
        bgMusic.currentTime = 0;
        introOutroMusic.currentTime = 0;
        introMusicPlayed = false;
        outroMusicPlayed = false;
    }
}

// Mouse events
canvas.addEventListener('mousemove', (e) => {
    if (canvas.style.display === 'none' || gameState !== STATES.PLAYING) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const adjustedX = (e.clientX - rect.left) * scaleX;
    player.facingRight = adjustedX > player.x + player.width / 2;
});
canvas.addEventListener('click', (e) => {
    if (canvas.style.display === 'none') return;
    handleInput(e.clientX, e.clientY);
});

// Touch events
canvas.addEventListener('touchstart', (e) => {
    if (canvas.style.display === 'none') return;
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY);
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    if (canvas.style.display === 'none' || gameState !== STATES.PLAYING) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const adjustedX = (touch.clientX - rect.left) * scaleX;
    player.facingRight = adjustedX > player.x + player.width / 2;
}, { passive: false });

// Game loop
function update() {
    // Don’t run the game if canvas is hidden
    if (canvas.style.display === 'none') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAY $PWN TO PLAY!', canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(update);
        return;
    }

    if (gameState === STATES.START) {
        ctx.fillStyle = '#7e01fd'; // Purple background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (logoImage.complete) {
            const logoWidth = 200;
            const logoHeight = 128;
            ctx.drawImage(logoImage, (canvas.width - logoWidth) / 2, 20, logoWidth, logoHeight);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('JEET SHREDDER', canvas.width / 2, 180);
        ctx.font = '16px monospace';
        ctx.fillText('MISSION 69420: PWN OR DIE', canvas.width / 2, 220);
        ctx.fillText('Jeets have sacked the world — only the arcade stands.', canvas.width / 2, 250);
        ctx.fillText('PWN the green monsters or humanity’s wiped out!', canvas.width / 2, 280);
        ctx.fillText('From #tonyhawkmaddengoldeneye69420 -> @pwnsolana', canvas.width / 2, 340);
        ctx.fillText('Made with Grok 3 - Music by AdhesiveWombat & Delsus', canvas.width / 2, 360);

        ctx.fillStyle = '#ffff00';
        ctx.fillRect(canvas.width / 2 - 200, 390, 400, 60);
        ctx.fillStyle = '#000000';
        ctx.font = '20px monospace';
        ctx.fillText('CLICK OR TAP JEETS', canvas.width / 2, 415);
        ctx.fillText('(GREEN MONSTERS) TO KILL!', canvas.width / 2, 440);

        if (!introMusicPlayed) {
            introOutroMusic.play();
            introMusicPlayed = true;
        }
    } else if (gameState === STATES.PLAYING) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        if (!bgImage.complete) {
            ctx.fillStyle = '#2e8b57';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (logoImage.complete) {
            const logoWidth = 200;
            const logoHeight = 128;
            ctx.drawImage(logoImage, canvas.width - logoWidth - 10, 10, logoWidth, logoHeight);
        }

        secondsPlayed += (Date.now() - lastTime) / 1000;
        lastTime = Date.now();

        animationFrame++;
        if (animationFrame % 10 === 0) {
            enemies.forEach(enemy => {
                enemy.animFrame = (enemy.animFrame + 1) % 2;
            });
        }

        frameCount++;
        if (frameCount % spawnRate === 0) {
            spawnEnemy();
            spawnRate = Math.max(15, spawnRate - 1);
        }

        enemies.forEach(enemy => {
            enemy.x += enemy.speed * enemy.direction;
            if (
                enemy.x + enemy.width > player.x &&
                enemy.x < player.x + player.width &&
                enemy.y + enemy.height > player.y
            ) {
                gameState = STATES.GAME_OVER;
            }
        });

        enemies.forEach(enemy => {
            ctx.fillStyle = '#556b2f';
            if (enemy.animFrame === 0) {
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.fillStyle = '#8b0000';
                ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
                ctx.fillRect(enemy.x + 20, enemy.y + 8, 4, 4);
            } else {
                ctx.fillRect(enemy.x + (enemy.direction === 1 ? 4 : -4), enemy.y, enemy.width - 8, enemy.height);
                ctx.fillRect(enemy.x, enemy.y, 8, 8);
                ctx.fillRect(enemy.x + enemy.width - 8, enemy.y, 8, 8);
                ctx.fillStyle = '#8b0000';
                ctx.fillRect(enemy.x + (enemy.direction === 1 ? 12 : 4), enemy.y + 8, 4, 4);
                ctx.fillRect(enemy.x + (enemy.direction === 1 ? 24 : 16), enemy.y + 8, 4, 4);
            }
        });

        if (player.facingRight) {
            ctx.drawImage(pwnzerImage, player.x, player.y, player.width, player.height);
        } else {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(pwnzerImage, -player.x - player.width, player.y, player.width, player.height);
            ctx.restore();
        }

        for (let i = popups.length - 1; i >= 0; i--) {
            const popup = popups[i];
            ctx.fillStyle = '#8b0000';
            ctx.font = '24px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(popup.text, popup.x, popup.y);
            popup.timer--;
            if (popup.timer <= 0) popups.splice(i, 1);
        }

        ctx.fillStyle = '#000000';
        ctx.font = '20px monospace';
        ctx.fillText(`Pwned: ${kills}`, 10, 30);
        ctx.fillText(`Time: ${Math.floor(secondsPlayed)}s`, 10, 50);
    } else if (gameState === STATES.GAME_OVER) {
        ctx.fillStyle = '#7e01fd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = '36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER, AGENT!', canvas.width / 2, 150);
        ctx.font = '24px monospace';
        ctx.fillText(`JEETS PWNED: ${kills}`, canvas.width / 2, 220);
        ctx.fillText(`SURVIVAL TIME: ${Math.floor(secondsPlayed)}s`, canvas.width / 2, 260);

        const hash = generateHash(kills, Math.floor(secondsPlayed));
        ctx.font = '16px monospace';
        ctx.fillText(`MISSION CODE: ${hash}`, canvas.width / 0, 300);
        ctx.fillText('SKATE BACK IN — TAP TO RETRY!', canvas.width / 2, 360);

        if (!outroMusicPlayed) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            introOutroMusic.play();
            outroMusicPlayed = true;
        }
    }

    ctx.imageSmoothingEnabled = false;
    ctx.textAlign = 'left';

    requestAnimationFrame(update);
}

// Initial check: only start if canvas is enabled, otherwise show a message
if (canvas.style.display !== 'none') {
    update();
} else {
    update(); // Still run update to show "PAY $PWN TO PLAY!" message
}