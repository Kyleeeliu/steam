// Flappy Bird Game - Enhanced Visuals
const canvas = document.getElementById('flappy-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.55;
const FLAP = -7;
const PIPE_WIDTH = 54;
const PIPE_GAP = 120;
const PIPE_SPEED = 3.5;
const BIRD_SIZE = 38;
const BIRD_EMOJI = '🍗';
const GROUND_HEIGHT = 60;
const BG_TOP = '#90caf9';
const BG_BOTTOM = '#e3f2fd';
const GROUND_COLOR = '#ffe082';
const GROUND_SHADOW = '#ffd54f';
const SCORE_COLOR = '#2e7d32';
const CHARACTER_IMAGES = [
  'flappy-bird-character-illustration-ye37mwhxjqsct8zr.png',
  'flappy-bird-character-artwork-u3uhvs4cwrwrndie.png'
];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 900;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const QUIZ_INTERVAL = 5; // Every 5 pipes, show a quiz
const QUIZ_GAP_Y_POSITIONS = [CANVAS_HEIGHT/3, CANVAS_HEIGHT*2/3]; // two positions for quiz answers
const QUIZ_GAP_SIZE = 140;
const QUIZ_PIPE_WIDTH = 140;
const QUIZ_QUESTIONS = [
  { q: 'Which is healthier?', answers: ['Steamed', 'Fried'], correct: 0 },
  { q: 'Which is a fruit?', answers: ['Apple', 'Carrot'], correct: 0 },
  { q: 'Which is a local dish?', answers: ['Nasi Lemak', 'Pizza'], correct: 0 },
  { q: 'Which is more eco-friendly?', answers: ['Reusable bag', 'Plastic bag'], correct: 0 },
  { q: 'Which is a vegetable?', answers: ['Broccoli', 'Banana'], correct: 0 },
  { q: 'Which is a protein?', answers: ['Chicken', 'Rice'], correct: 0 },
  { q: 'Which is a drink?', answers: ['Water', 'Bread'], correct: 0 },
  { q: 'Which is a dessert?', answers: ['Ice Cream', 'Soup'], correct: 0 },
  { q: 'Which is spicy?', answers: ['Chili', 'Milk'], correct: 0 },
  { q: 'Which is a breakfast food?', answers: ['Eggs', 'Steak'], correct: 0 },
  { q: 'Which is dairy?', answers: ['Cheese', 'Chicken'], correct: 0 },
  { q: 'Which is a grain?', answers: ['Rice', 'Fish'], correct: 0 },
  { q: 'Which is a fruit?', answers: ['Orange', 'Cucumber'], correct: 0 },
  { q: 'Which is a healthy snack?', answers: ['Nuts', 'Candy'], correct: 0 },
  { q: 'Which is a root vegetable?', answers: ['Carrot', 'Apple'], correct: 0 },
  { q: 'Which is a seafood?', answers: ['Salmon', 'Chicken'], correct: 0 },
  { q: 'Which is a leafy green?', answers: ['Spinach', 'Potato'], correct: 0 },
  { q: 'Which is a soup?', answers: ['Tom Yum', 'Burger'], correct: 0 },
  { q: 'Which is a noodle dish?', answers: ['Laksa', 'Pizza'], correct: 0 },
  { q: 'Which is a beverage?', answers: ['Tea', 'Toast'], correct: 0 }
];

// Game state
let birdY = canvas.height / 2;
let birdV = 0;
let pipes = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('flappy_food_highscore') || '0');
let gameOver = false;
let started = false;
let selectedCharIdx = 0;
let birdImg = new Image();
birdImg.src = CHARACTER_IMAGES[selectedCharIdx];
let nextQuizIdx = 0;
let pipeCount = 0;
let activeQuiz = null;
let postQuizSpacing = false;
let flappyDiscount = parseFloat(localStorage.getItem('flappy_food_discount') || '0');
const FLAPPY_DISCOUNT_PER = 0.04;
const FLAPPY_DISCOUNT_CAP = 0.20;
let handledGameOverRedirect = false;
let pipesPassed = 0;
let quizPipesPassed = 0;

function resetGame() {
  birdY = canvas.height / 2;
  birdV = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  started = false;
  flappyDiscount = 0;
  localStorage.setItem('flappy_food_discount', '0');
  setAwardedCoupons([]);
  handledGameOverRedirect = false;
  pipesPassed = 0;
  quizPipesPassed = 0;
}

function drawBackground() {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, BG_TOP);
  grad.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Clouds
  drawCloud(60, 80, 1);
  drawCloud(220, 50, 0.7);
  drawCloud(300, 120, 1.1);
}
function drawCloud(x, y, scale) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, 32*scale, 18*scale, 0, 0, Math.PI*2);
  ctx.ellipse(x+22*scale, y+6*scale, 18*scale, 12*scale, 0, 0, Math.PI*2);
  ctx.ellipse(x-20*scale, y+8*scale, 16*scale, 10*scale, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBird() {
  // Bird image (no shadow)
  if (birdImg.complete && birdImg.naturalWidth > 0) {
    ctx.save();
    ctx.translate(canvas.width/4, birdY);
    ctx.rotate(Math.min(Math.PI/4, birdV/10));
    ctx.drawImage(birdImg, -BIRD_SIZE/2, -BIRD_SIZE/2, BIRD_SIZE, BIRD_SIZE);
    ctx.restore();
  } else {
    // fallback: draw emoji if image not loaded yet
    ctx.font = `${BIRD_SIZE}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(canvas.width/4, birdY);
    ctx.rotate(Math.min(Math.PI/4, birdV/10));
    ctx.fillText(BIRD_EMOJI, 0, 0);
    ctx.restore();
  }
}

function drawPipe(x, topH, bottomY, pipe) {
  if (pipe && pipe.isQuiz) {
    // Draw quiz pipe: two vertical gaps, one correct, one incorrect
    for (let i = 0; i < 2; i++) {
      const gapY = pipe.gapYs[i];
      // Top part
      ctx.fillStyle = '#43a047';
      ctx.fillRect(x, i === 0 ? 0 : pipe.gapYs[0] + QUIZ_GAP_SIZE/2, QUIZ_PIPE_WIDTH, gapY - QUIZ_GAP_SIZE/2 - (i === 0 ? 0 : pipe.gapYs[0] + QUIZ_GAP_SIZE/2));
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(x-3, gapY-QUIZ_GAP_SIZE/2-18, QUIZ_PIPE_WIDTH+6, 18);
      // Bottom part
      ctx.fillStyle = '#43a047';
      ctx.fillRect(x, gapY + QUIZ_GAP_SIZE/2, QUIZ_PIPE_WIDTH, (i === 1 ? canvas.height-GROUND_HEIGHT : pipe.gapYs[1] - QUIZ_GAP_SIZE/2) - (gapY + QUIZ_GAP_SIZE/2));
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(x-3, gapY+QUIZ_GAP_SIZE/2, QUIZ_PIPE_WIDTH+6, 18);
      // Label (centered in the gap)
      ctx.save();
      ctx.font = 'bold 24px Montserrat, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 4;
      ctx.strokeText(pipe.answers[i], x+QUIZ_PIPE_WIDTH/2, gapY);
      ctx.fillText(pipe.answers[i], x+QUIZ_PIPE_WIDTH/2, gapY);
      ctx.restore();
    }
  } else {
    // Normal pipe
    // Pipe shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#222';
    ctx.fillRect(x+6, 0, PIPE_WIDTH, topH+8);
    ctx.fillRect(x+6, bottomY, PIPE_WIDTH, canvas.height-GROUND_HEIGHT-bottomY+8);
    ctx.globalAlpha = 1;
    ctx.restore();
    // Pipe body
    // Top pipe
    ctx.fillStyle = '#43a047';
    ctx.fillRect(x, 0, PIPE_WIDTH, topH);
    // Top cap
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(x-3, topH-18, PIPE_WIDTH+6, 18);
    // Pipe highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x+6, 0, 8, topH);
    // Bottom pipe
    ctx.fillStyle = '#43a047';
    ctx.fillRect(x, bottomY, PIPE_WIDTH, canvas.height-GROUND_HEIGHT-bottomY);
    // Bottom cap
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(x-3, bottomY, PIPE_WIDTH+6, 18);
    // Pipe highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x+6, bottomY, 8, canvas.height-GROUND_HEIGHT-bottomY);
  }
}

function drawGround() {
  // Main ground
  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, canvas.height-GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
  // Ground shadow/texture
  ctx.fillStyle = GROUND_SHADOW;
  for (let i = 0; i < canvas.width; i += 32) {
    ctx.beginPath();
    ctx.ellipse(i+12, canvas.height-GROUND_HEIGHT+38, 18, 8, 0, 0, Math.PI*2);
    ctx.fill();
  }
  // Food icons
  ctx.font = '32px serif';
  ctx.textAlign = 'left';
  ctx.fillText('🍚🍳🥢', 10, canvas.height-GROUND_HEIGHT/2+10);
}

function drawScore() {
  ctx.font = 'bold 32px Montserrat, sans-serif';
  ctx.fillStyle = SCORE_COLOR;
  ctx.textAlign = 'center';
  let pendingDiscount = ((pipesPassed - quizPipesPassed) * 0.0025) + (quizPipesPassed * 0.0125);
  if (pendingDiscount > FLAPPY_DISCOUNT_CAP) pendingDiscount = FLAPPY_DISCOUNT_CAP;
  if (!gameOver) {
    ctx.fillText((pendingDiscount*100).toFixed(2) + '%', canvas.width/2, 60);
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.fillStyle = '#fbc02d';
    ctx.fillText('Pending Discount', canvas.width/2, 90);
  }
  if (gameOver && flappyDiscount > 0) {
    ctx.fillText((flappyDiscount*100).toFixed(2) + '%', canvas.width/2, 60);
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.fillStyle = '#fbc02d';
    ctx.fillText('Final Discount', canvas.width/2, 90);
  }
}

function drawGameOver() {
  ctx.font = 'bold 32px Montserrat, sans-serif';
  ctx.fillStyle = '#c62828';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width/2, canvas.height/2-20);
  ctx.font = '16px Montserrat, sans-serif';
  ctx.fillStyle = '#2e7d32';
  ctx.fillText('Tap/click/space to restart', canvas.width/2, canvas.height/2+24);
}

function spawnPipe() {
  pipeCount++;
  // Every QUIZ_INTERVAL pipes, spawn a quiz pipe
  if (pipeCount % QUIZ_INTERVAL === 0) {
    const quiz = QUIZ_QUESTIONS[nextQuizIdx % QUIZ_QUESTIONS.length];
    nextQuizIdx++;
    // Randomize which answer is on top/bottom
    const order = Math.random() < 0.5 ? [0, 1] : [1, 0];
    const gapYs = QUIZ_GAP_Y_POSITIONS;
    const answers = [quiz.answers[order[0]], quiz.answers[order[1]]];
    const correctIdx = order.indexOf(quiz.correct);
    pipes.push({
      x: canvas.width,
      isQuiz: true,
      quiz,
      gapYs,
      answers,
      correctIdx
    });
    activeQuiz = { quiz, x: canvas.width, gapYs, answers, correctIdx };
    postQuizSpacing = true;
  } else {
    // Normal pipe
    const minH = 120;
    const maxH = canvas.height - PIPE_GAP - GROUND_HEIGHT - 120;
    const topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
    pipes.push({ x: canvas.width, topH });
    postQuizSpacing = false;
  }
}

function update() {
  if (!started) return;
  birdV += GRAVITY;
  birdY += birdV;
  // Move pipes
  for (let pipe of pipes) {
    pipe.x -= PIPE_SPEED;
    if (pipe.isQuiz) activeQuiz = { quiz: pipe.quiz, x: pipe.x, gapYs: pipe.gapYs, answers: pipe.answers, correctIdx: pipe.correctIdx };
  }
  // Remove off-screen pipes
  if (pipes.length && pipes[0].x < -PIPE_WIDTH) pipes.shift();
  // Spawn new pipes
  if (pipes.length === 0 || (
    (!postQuizSpacing && pipes[pipes.length-1].x < canvas.width - 350) ||
    (postQuizSpacing && pipes[pipes.length-1].x < canvas.width - 700)
  )) {
    spawnPipe();
  }
  // Collision
  for (let pipe of pipes) {
    if (pipe.isQuiz) {
      // Quiz pipe: only the correct gap is safe
      let inCorrectGap = false;
      const gapY = pipe.gapYs[pipe.correctIdx];
      if (
        canvas.width/4 + BIRD_SIZE/2 > pipe.x &&
        canvas.width/4 - BIRD_SIZE/2 < pipe.x + QUIZ_PIPE_WIDTH &&
        birdY - BIRD_SIZE/2 > gapY - QUIZ_GAP_SIZE/2 &&
        birdY + BIRD_SIZE/2 < gapY + QUIZ_GAP_SIZE/2
      ) {
        inCorrectGap = true;
      }
      // If not in the correct gap, collision
      if (
        canvas.width/4 + BIRD_SIZE/2 > pipe.x &&
        canvas.width/4 - BIRD_SIZE/2 < pipe.x + QUIZ_PIPE_WIDTH &&
        !inCorrectGap
      ) {
        gameOver = true;
      }
      // Score for passing quiz pipe
      if (!pipe.passed && pipe.x + QUIZ_PIPE_WIDTH < canvas.width/4 - BIRD_SIZE/2) {
        pipe.passed = true;
        score++;
        pipesPassed++;
        quizPipesPassed++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('flappy_food_highscore', highScore);
        }
      }
    } else {
      // Normal pipe collision
      if (
        canvas.width/4 + BIRD_SIZE/2 > pipe.x &&
        canvas.width/4 - BIRD_SIZE/2 < pipe.x + PIPE_WIDTH
      ) {
        if (birdY - BIRD_SIZE/2 < pipe.topH || birdY + BIRD_SIZE/2 > pipe.topH + PIPE_GAP) {
          gameOver = true;
        }
      }
      // Score
      if (!pipe.passed && pipe.x + PIPE_WIDTH < canvas.width/4 - BIRD_SIZE/2) {
        pipe.passed = true;
        score++;
        pipesPassed++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('flappy_food_highscore', highScore);
        }
      }
    }
  }
  // Ground/ceiling collision
  if (birdY + BIRD_SIZE/2 > canvas.height-GROUND_HEIGHT || birdY - BIRD_SIZE/2 < 0) {
    gameOver = true;
  }
  if (gameOver) {
    started = false;
    if (!handledGameOverRedirect) {
      handledGameOverRedirect = true;
      let discount = ((pipesPassed - quizPipesPassed) * 0.0025) + (quizPipesPassed * 0.0125);
      if (discount > FLAPPY_DISCOUNT_CAP) discount = FLAPPY_DISCOUNT_CAP;
      flappyDiscount = discount;
      localStorage.setItem('flappy_food_discount', flappyDiscount.toString());
      let code = generateCouponCode(discount);
      setAwardedCoupons([{ code, percent: discount }]);
      if (discount > 0) {
        showCouponModal(code, [code], discount >= FLAPPY_DISCOUNT_CAP, null);
      }
    }
  }
}

function draw() {
  drawBackground();
  // Draw pipes
  for (let pipe of pipes) {
    if (pipe.isQuiz) {
      drawPipe(pipe.x, 0, 0, pipe);
    } else {
      drawPipe(pipe.x, pipe.topH, pipe.topH + PIPE_GAP, pipe);
    }
  }
  // Draw quiz question if active
  if (activeQuiz && activeQuiz.x > canvas.width/4 - 100 && activeQuiz.x < canvas.width) {
    ctx.save();
    ctx.font = 'bold 32px Montserrat, sans-serif';
    ctx.fillStyle = '#fffde7';
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 5;
    ctx.textAlign = 'center';
    ctx.strokeText(activeQuiz.quiz.q, canvas.width/2, 80);
    ctx.fillText(activeQuiz.quiz.q, canvas.width/2, 80);
    ctx.restore();
  }
  drawGround();
  drawBird();
  drawScore();
  if (gameOver && !started) drawGameOver();
  if (!started && !gameOver) {
    ctx.font = '24px Montserrat, sans-serif';
    ctx.fillStyle = '#2e7d32';
    ctx.textAlign = 'center';
    ctx.fillText('Tap/click/space to start', canvas.width/2, canvas.height/2+60);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function flap() {
  if (!started) {
    if (gameOver) resetGame();
    started = true;
  }
  if (!gameOver) birdV = FLAP;
}

canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', function(e) { e.preventDefault(); flap(); });
window.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    flap();
    e.preventDefault();
  }
});

// Character selection UI logic
window.addEventListener('DOMContentLoaded', function() {
  const char1Btn = document.getElementById('char1-btn');
  const char2Btn = document.getElementById('char2-btn');
  function updateSelection(idx) {
    selectedCharIdx = idx;
    birdImg.onload = function() { draw(); };
    birdImg.src = CHARACTER_IMAGES[selectedCharIdx];
    char1Btn.style.boxShadow = idx === 0 ? '0 0 0 3px #fbc02d' : 'none';
    char2Btn.style.boxShadow = idx === 1 ? '0 0 0 3px #fbc02d' : 'none';
  }
  if (char1Btn && char2Btn) {
    char1Btn.onclick = () => updateSelection(0);
    char2Btn.onclick = () => updateSelection(1);
    updateSelection(0);
  }
});

// --- Coupon Modal UI ---
function showCouponModal(newCode, allCodes, capReached, onClose) {
  let modal = document.getElementById('coupon-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'coupon-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.45)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `<div style="background:#fff;padding:2.2rem 2.5rem 2rem 2.5rem;border-radius:18px;box-shadow:0 8px 32px #2e7d3240;max-width:95vw;width:370px;text-align:center;">
      <h2 style='color:#2e7d32;margin-top:0;'>🎉 Coupon Unlocked!</h2>
      <div id="coupon-new-code" style="font-size:1.5rem;font-weight:700;color:#fbc02d;margin:0.7rem 0 0.5rem 0;"></div>
      <div style="font-size:1.08rem;margin-bottom:0.7rem;">Copy this code and enter it at checkout:</div>
      <div id="coupon-all-codes" style="font-size:1.08rem;margin-bottom:0.7rem;"></div>
      <div id="coupon-cap-msg" style="color:#c62828;font-weight:600;margin-bottom:0.7rem;"></div>
      <button id="close-coupon-modal" style="background:#2e7d32;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1.08rem;font-weight:700;cursor:pointer;">OK</button>
    </div>`;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.getElementById('coupon-new-code').textContent = newCode ? newCode : '';
  document.getElementById('coupon-all-codes').innerHTML =
    'Your codes: <span style="color:#2e7d32;font-weight:600;">' + allCodes.join(', ') + '</span>';
  document.getElementById('coupon-cap-msg').textContent = capReached ? 'You have reached the maximum 20% discount! No more coupons can be earned.' : '';
  document.getElementById('close-coupon-modal').onclick = function() {
    modal.style.display = 'none';
    if (onClose) onClose();
  };
}

// --- Coupon Awarding Logic ---
function getAwardedCoupons() {
  try {
    return JSON.parse(localStorage.getItem('flappy_food_coupons') || '[]');
  } catch (e) { return []; }
}
function setAwardedCoupons(codes) {
  localStorage.setItem('flappy_food_coupons', JSON.stringify(codes));
}

function generateCouponCode(percent) {
  // Simple code: FLAPPY5-XXXX or FLAPPY10-XXXX
  const rand = Math.floor(1000 + Math.random()*9000);
  return (percent === 0.1 ? 'FLAPPY10-' : 'FLAPPY5-') + rand;
}

resetGame();
gameLoop(); 