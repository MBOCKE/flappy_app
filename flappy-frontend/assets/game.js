// Needs apiSubmitScore from api.js loaded before this script

function startFlappyGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const statusText = document.getElementById('status-text');

  const width = canvas.width;
  const height = canvas.height;

  // Bird
  const bird = {
    x: 80,
    y: height / 2,
    radius: 12,
    velocity: 0,
  };

  const gravity = 0.4;
  const jumpStrength = -7;

  // Pipes
  const pipes = [];
  const pipeWidth = 60;
  const gapHeight = 140;
  const pipeSpeed = 2;
  const pipeInterval = 1500; // ms

  let lastPipeTime = 0;
  let score = 0;
  let gameOver = false;
  let animationId = null;

  function resetGame() {
    bird.y = height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    gameOver = false;
    lastPipeTime = performance.now();
    statusText.textContent = 'Press SPACE or click to jump';
    loop(performance.now());
  }

  function spawnPipe() {
    const minTopHeight = 40;
    const maxTopHeight = height - gapHeight - 40;
    const topHeight =
      Math.floor(Math.random() * (maxTopHeight - minTopHeight)) + minTopHeight;

    pipes.push({
      x: width,
      top: topHeight,
      bottom: topHeight + gapHeight,
      passed: false,
    });
  }

  function drawBird() {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPipes() {
    ctx.fillStyle = '#4caf50';
    pipes.forEach((pipe) => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, height - pipe.bottom);
    });
  }

  function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
  }

  function update(deltaTime, currentTime) {
    if (gameOver) return;

    // Bird physics
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Spawn pipes
    if (currentTime - lastPipeTime > pipeInterval) {
      spawnPipe();
      lastPipeTime = currentTime;
    }

    // Move pipes
    pipes.forEach((pipe) => {
      pipe.x -= pipeSpeed;

      // Increase score when passing
      if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
        pipe.passed = true;
        score++;
      }
    });

    // Remove offscreen pipes
    while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
      pipes.shift();
    }

    // Collisions with ground/ceiling
    if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= height) {
      handleGameOver();
      return;
    }

    // Collisions with pipes
    for (const pipe of pipes) {
      const withinX =
        bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth;
      const withinTop = bird.y - bird.radius < pipe.top;
      const withinBottom = bird.y + bird.radius > pipe.bottom;

      if (withinX && (withinTop || withinBottom)) {
        handleGameOver();
        return;
      }
    }
  }

  function handleGameOver() {
    if (gameOver) return;
    gameOver = true;
    statusText.textContent = `Game over! Score: ${score} (sending to server...)`;

    cancelAnimationFrame(animationId);

    // Show restart buttons
    const buttonsDiv = document.getElementById('game-over-buttons');
    if (buttonsDiv) {
      buttonsDiv.style.display = 'block';
    }

    // Submit score to backend
    apiSubmitScore(score)
      .then((res) => {
        statusText.textContent = `Game over! Score: ${score}. Best: ${res.best_score}`;
        // reload leaderboard from game page script
        if (typeof loadLeaderboard === 'function') {
          loadLeaderboard();
        }
        // also update best score text if available
        const bestScoreEl = document.getElementById('best-score');
        if (bestScoreEl) bestScoreEl.textContent = res.best_score;
      })
      .catch((err) => {
        console.error(err);
        statusText.textContent = `Game over! Score: ${score}. Error submitting score.`;
      });
  }

  function jump() {
    if (gameOver) {
      resetGame();
      return;
    }
    bird.velocity = jumpStrength;
  }

  function loop(currentTime) {
    if (gameOver) return;

    ctx.clearRect(0, 0, width, height);

    update(16, currentTime);
    drawPipes();
    drawBird();
    drawScore();

    animationId = requestAnimationFrame(loop);
  }

  // Controls
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      jump();
    }
  });

  canvas.addEventListener('click', jump);

  // Make resetGame and other controls available globally
  window.restartGame = resetGame;

  resetGame();
}
