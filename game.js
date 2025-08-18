// =================================================================
// CADETE DE LA VERIFICACIÓN - CÓDIGO COMPLETO
// =================================================================

// --- DATOS DE VALIDACIÓN (Texto completo) ---
const validationData = [
    {
        pregunta: "¿Cuál fue el fundamento jurídico principal utilizado por la Contraloría para determinar la responsabilidad administrativa?",
        respuesta: "La resolución argumenta que la conducta de González Quesada fue negligente e imprudente, demostrando falta de diligencia en el cumplimiento de sus obligaciones legales a pesar de las notificaciones recibidas y el plazo otorgado en la prevención (oficio No. 7453-2024). Se destaca la omisión reiterada a pesar de la advertencia explícita de las consecuencias de su incumplimiento. La resolución cita la definición de negligencia de Cabanellas para sustentar esta calificación. La sanción impuesta –separación del cargo sin responsabilidad patronal y prohibición de ingreso a cargos de la Hacienda Pública por dos años– se justifica bajo el principio de proporcionalidad y razonabilidad (artículo 4, inciso b), numeral 5, del Reglamento de Procedimientos Administrativos de la Contraloría General de la República), considerando la necesidad, idoneidad y proporcionalidad de la medida en relación con la gravedad de la falta y la necesidad de salvaguardar la Hacienda Pública. La resolución enfatiza la importancia de la declaración jurada de bienes como mecanismo preventivo contra la corrupción, citando jurisprudencia de la Sala Constitucional y la Convención de las Naciones Unidas contra la Corrupción.",
        majorityScores: { coherencia: 3, datosPersonales: "si", corresponde: 3 }
    },
    {
        pregunta: "¿Cuál es el objeto del procedimiento administrativo y qué se le reprocha al investigado?",
        respuesta: "El objeto del procedimiento administrativo resulta completamente desconocido, creo que podría ser CGR-PA-2024005695 es determinar la responsabilidad administrativa de Ana Victoria Prendas Garita por el presunto incumplimiento de su obligación de presentar la declaración jurada de bienes anual 2022 y la declaración jurada final. Se le reprocha a Prendas Garita, en su condición de exfuncionaria del Consejo Nacional de Personas con Discapacidad (CONAPDIS), haber omitido presentar dichas declaraciones juradas dentro de los plazos establecidos en el artículo 22 de la Ley contra la Corrupción y el Enriquecimiento Ilícito en la Función Pública, N° 8422, y el numeral 61 inciso 3) de su reglamento. El período involucrado abarca desde el vencimiento del plazo para la declaración anual 2022 (mayo de 2022) hasta la fecha de la resolución (noviembre de 2024), incluyendo el plazo para la declaración final (30 días hábiles tras el cese de funciones el 16 de agosto de 2022).",
        majorityScores: { coherencia: 1, datosPersonales: "si", corresponde: 2 }
    }
];

// --- ELEMENTOS DEL DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width =800;
canvas.height = 600;

const scoreEl = document.getElementById('score'),
      livesEl = document.getElementById('lives'),
      playerNameEl = document.getElementById('player-name'),
      gameInfoEl = document.getElementById('game-info');

const startModal = document.getElementById('start-modal'),
      validationModal = document.getElementById('validation-modal'),
      gameOverEl = document.getElementById('game-over'),
      feedbackModal = document.getElementById('feedback-modal');

const nicknameInput = document.getElementById('nickname-input'),
      startGameBtn = document.getElementById('start-game-btn'),
      submitBtn = document.getElementById('submit-validation'),
      restartBtn = document.getElementById('restart-game'),
      finalScoreEl = document.getElementById('final-score');

const music = document.getElementById('background-music'),
      shotSound = document.getElementById('shot-sound');

// --- ASSETS (IMÁGENES Y SONIDO) ---
const assets = {};
const assetNames = ['ship', 'asteroid', 'ufo', 'bullet', 'explosion'];
function loadAssets(callback) {
    let loaded = 0;
    assetNames.forEach(name => {
        assets[name] = new Image();
        assets[name].src = `assets/${name}.png`;
        assets[name].onload = () => {
            if (++loaded === assetNames.length) {
                callback();
            }
        };
        assets[name].onerror = () => {
            console.error(`Error al cargar la imagen: assets/${name}.png`);
        };
    });
}

// --- CONSTANTES DEL JUEGO ---
const SHIP_SIZE = 30, UFO_SIZE = 40, ASTEROID_SIZE = 50, BULLET_SIZE = 10;
const SHIP_THRUST = 0.1, SHIP_TURN_SPEED = 0.1, FRICTION = 0.99;
const BULLET_SPEED = 7, ASTEROID_NUM = 5, ASTEROID_SPEED = 1;
const UFO_SPEED = 2, UFO_SPAWN_TIME = 8000; // OVNIs aparecen cada 8 segundos

// --- ESTADO DEL JUEGO ---
let score, lives, playerName, ship, bullets, asteroids, ufo, explosions, keys, isGamePaused, ufoSpawnTimer;

// --- EVENTOS ---
startGameBtn.addEventListener('click', startGame);
if (submitBtn) { submitBtn.addEventListener('click', submitValidation); }
if (restartBtn) { restartBtn.addEventListener('click', init); }

function setupKeyListeners() {
    keys = {};
    document.addEventListener('keydown', (e) => keys[e.key] = true);
    document.addEventListener('keyup', (e) => keys[e.key] = false);
}

// --- LÓGICA DE AUDIO ---
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.error("Error al reproducir sonido:", e));
}

// --- LÓGICA PRINCIPAL DEL JUEGO ---
function startGame() {
    playerName = nicknameInput.value || 'PILOTO-01';
    playerNameEl.textContent = playerName.toUpperCase();
    
    startModal.classList.add('hidden');
    gameInfoEl.classList.remove('hidden');

    music.volume = 0.3;
    music.play().catch(e => console.log("El navegador bloqueó la reproducción automática. Se requiere interacción."));

    setupKeyListeners();
    init();
}

function init() {
    score = 0;
    lives = 4;
    ship = newShip();
    bullets = [];
    asteroids = [];
    explosions = [];
    createAsteroids();
    isGamePaused = false;
    ufo = { active: false };

    if(ufoSpawnTimer) clearTimeout(ufoSpawnTimer);
    ufoSpawnTimer = setTimeout(spawnUfo, UFO_SPAWN_TIME);

    updateUI();
    gameOverEl.classList.add('hidden');
    if (validationModal) validationModal.classList.add('hidden'); // Verificación por si el elemento no existe
    gameLoop();
}

function gameLoop() {
    if (isGamePaused) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    updateShip();
    updateBullets();
    updateAsteroids();
    updateUfo();
    updateExplosions();
    checkCollisions();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawAsset(assets.ship, ship.x, ship.y, SHIP_SIZE, ship.a);
    if (ship.thrusting) drawThruster();
    
    bullets.forEach(b => drawAsset(assets.bullet, b.x, b.y, BULLET_SIZE, b.a));
    asteroids.forEach(a => drawAsset(assets.asteroid, a.x, a.y, a.r * 2));
    if (ufo.active) drawAsset(assets.ufo, ufo.x, ufo.y, UFO_SIZE);
    
    explosions.forEach(drawExplosion);
}

function drawAsset(img, x, y, size, angle = 0) {
    if (!img || !img.complete || img.naturalHeight === 0) {
        // Dibuja un marcador de posición si la imagen no carga
        ctx.fillStyle = 'red';
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
}

function drawThruster() {
    const rearX = ship.x - (SHIP_SIZE / 2) * Math.cos(ship.a);
    const rearY = ship.y - (SHIP_SIZE / 2) * Math.sin(ship.a);
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(rearX, rearY, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawExplosion(exp) {
    ctx.globalAlpha = exp.life;
    drawAsset(assets.explosion, exp.x, exp.y, exp.size);
    ctx.globalAlpha = 1.0;
}

// --- OBJETOS Y MOVIMIENTO ---
function newShip() { return { x: canvas.width / 2, y: canvas.height / 2, r: SHIP_SIZE / 2, a: -Math.PI / 2, rot: 0, thrusting: false, vel: { x: 0, y: 0 } }; }
function createAsteroids() { for (let i = 0; i < ASTEROID_NUM; i++) asteroids.push(newAsteroid()); }
function newAsteroid() { return { x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 15 + 15, vel: { x: (Math.random() * 2 - 1) * ASTEROID_SPEED, y: (Math.random() * 2 - 1) * ASTEROID_SPEED } }; }
function spawnUfo() { ufo = { x: 0, y: Math.random() * canvas.height, r: UFO_SIZE / 2, vel: { x: UFO_SPEED, y: 0 }, active: true }; }

function updateShip() {
    if (!keys) return;
    if (keys['ArrowLeft']) ship.rot = -SHIP_TURN_SPEED;
    else if (keys['ArrowRight']) ship.rot = SHIP_TURN_SPEED;
    else ship.rot = 0;

    if (keys['ArrowUp']) {
        ship.thrusting = true;
        ship.vel.x += SHIP_THRUST * Math.cos(ship.a);
        ship.vel.y += SHIP_THRUST * Math.sin(ship.a);
    } else {
        ship.thrusting = false;
    }

    if (keys[' '] || keys['Spacebar']) {
        shoot();
        keys[' '] = keys['Spacebar'] = false;
    }

    ship.a += ship.rot;
    ship.x += ship.vel.x;
    ship.y += ship.vel.y;
    ship.vel.x *= FRICTION;
    ship.vel.y *= FRICTION;
    handleScreenWrap(ship);
}

function shoot() {
    playSound(shotSound);
    bullets.push({
        x: ship.x + (SHIP_SIZE / 2) * Math.cos(ship.a),
        y: ship.y + (SHIP_SIZE / 2) * Math.sin(ship.a),
        a: ship.a,
        vel: {
            x: BULLET_SPEED * Math.cos(ship.a),
            y: BULLET_SPEED * Math.sin(ship.a)
        }
    });
}

function updateBullets() { for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.x += b.vel.x; b.y += b.vel.y; if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1); } }
function updateAsteroids() { asteroids.forEach(a => { a.x += a.vel.x; a.y += a.vel.y; handleScreenWrap(a); }); }
function updateUfo() { if (ufo.active) { ufo.x += ufo.vel.x; if (ufo.x > canvas.width + ufo.r) { ufo.active = false; ufoSpawnTimer = setTimeout(spawnUfo, UFO_SPAWN_TIME); } } }
function updateExplosions() { for (let i = explosions.length - 1; i >= 0; i--) { explosions[i].life -= 0.02; if (explosions[i].life <= 0) explosions.splice(i, 1); } }
function createExplosion(x, y, size) { explosions.push({ x, y, size, life: 1.0 }); }

// --- COLISIONES Y VALIDACIÓN ---
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (dist(bullets[i].x, bullets[i].y, asteroids[j].x, asteroids[j].y) < asteroids[j].r) {
                createExplosion(asteroids[j].x, asteroids[j].y, asteroids[j].r * 2);
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                score += 100;
                updateUI();
                asteroids.push(newAsteroid());
                break;
            }
        }
    }
    if (ufo.active) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (dist(bullets[i].x, bullets[i].y, ufo.x, ufo.y) < ufo.r) {
                ufo.active = false;
                createExplosion(ufo.x, ufo.y, UFO_SIZE * 1.5);
                bullets.splice(i, 1);
                triggerValidation();
                return;
            }
        }
    }
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (dist(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
            loseLife();
            return;
        }
    }
}

function loseLife() {
    createExplosion(ship.x, ship.y, SHIP_SIZE * 2);
    lives--;
    updateUI();
    if (lives <= 0) {
        gameOver();
    } else {
        ship = newShip();
    }
}

function gameOver() {
    isGamePaused = true;
    clearTimeout(ufoSpawnTimer);
    finalScoreEl.textContent = score;
    gameOverEl.classList.remove('hidden');
}

let currentValidation;
function triggerValidation() {
    isGamePaused = true;
    clearTimeout(ufoSpawnTimer);
    const r = Math.floor(Math.random() * validationData.length);
    currentValidation = validationData[r];
    
    // Rellenar y mostrar el modal de validación (asumiendo que está en el HTML)
    document.getElementById('modal-pregunta').textContent = currentValidation.pregunta;
    document.getElementById('modal-respuesta').textContent = currentValidation.respuesta;
    validationModal.classList.remove('hidden');
}

function submitValidation() {
    const v = currentValidation.majorityScores;
    let pointsAwarded = 0;
    
    const coherenciaSelect = document.getElementById('coherencia-select');
    const datosPersonalesSelect = document.getElementById('datos-personales-select');
    const correspondenciaSelect = document.getElementById('correspondencia-select');

    if (parseInt(coherenciaSelect.value) === v.coherencia) pointsAwarded++;
    if (datosPersonalesSelect.value === v.datosPersonales) pointsAwarded++;
    if (parseInt(correspondenciaSelect.value) === v.corresponde) pointsAwarded++;

    const totalPoints = pointsAwarded * 500;
    score += totalPoints;
    updateUI();
    
    validationModal.classList.add('hidden');
    showFeedback(pointsAwarded, totalPoints);
}

function showFeedback(correctAnswers, points) {
    const titleEl = document.getElementById('feedback-title');
    const pointsEl = document.getElementById('feedback-points');

    if (correctAnswers === 3) {
        titleEl.textContent = "¡ANÁLISIS PERFECTO!";
    } else if (correctAnswers > 0) {
        titleEl.textContent = "¡ANÁLISIS PARCIALMENTE CORRECTO!";
    } else {
        titleEl.textContent = "ANÁLISIS INCORRECTO";
    }
    pointsEl.textContent = `+${points} PUNTOS`;

    feedbackModal.classList.remove('hidden');

    setTimeout(() => {
        feedbackModal.classList.add('hidden');
        isGamePaused = false;
        ufoSpawnTimer = setTimeout(spawnUfo, UFO_SPAWN_TIME);
        gameLoop();
    }, 2500);
}

// --- UTILIDADES ---
function handleScreenWrap(obj) { if (obj.x < 0) obj.x = canvas.width; if (obj.x > canvas.width) obj.x = 0; if (obj.y < 0) obj.y = canvas.height; if (obj.y > canvas.height) obj.y = 0; }
function dist(x1, y1, x2, y2) { return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); }
function updateUI() { scoreEl.textContent = score; livesEl.textContent = lives; }

// --- INICIO ---
window.onload = () => {
    loadAssets(() => {
        console.log("Assets cargados. Listo para iniciar.");
    });
};