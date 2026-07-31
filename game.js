const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const landedEl = document.getElementById("landed");
const livesEl = document.getElementById("lives");
const restartButton = document.getElementById("restart");

const TAU = Math.PI * 2;
const state = {
  width: 0,
  height: 0,
  dpr: 1,
  last: 0,
  elapsed: 0,
  spawnIn: 0,
  score: 0,
  landed: 0,
  lives: 3,
  selected: null,
  gameOver: false,
  planes: [],
  pings: [],
};

function resize() {
  state.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function runway() {
  const length = Math.min(state.width, state.height) * 0.34;
  const width = Math.max(22, Math.min(state.width, state.height) * 0.035);
  return {
    x: state.width * 0.5,
    y: state.height * 0.56,
    length,
    width,
    angle: -0.18,
  };
}

function reset() {
  Object.assign(state, {
    last: performance.now(),
    elapsed: 0,
    spawnIn: 0.4,
    score: 0,
    landed: 0,
    lives: 3,
    selected: null,
    gameOver: false,
    planes: [],
    pings: [],
  });
  updateHud();
}

function updateHud() {
  scoreEl.textContent = state.score;
  landedEl.textContent = state.landed;
  livesEl.textContent = state.lives;
}

function spawnPlane() {
  const margin = 44;
  const edge = Math.floor(Math.random() * 4);
  const x = edge === 0 ? -margin : edge === 1 ? state.width + margin : Math.random() * state.width;
  const y = edge === 2 ? -margin : edge === 3 ? state.height + margin : Math.random() * state.height;
  const r = runway();
  const target = { x: r.x + (Math.random() - 0.5) * r.length * 0.8, y: r.y + (Math.random() - 0.5) * r.width * 8 };
  const angle = Math.atan2(target.y - y, target.x - x);
  const speed = 46 + Math.random() * 28;
  state.planes.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    x,
    y,
    angle,
    speed,
    target,
    radius: 12,
    safe: true,
    age: 0,
  });
}

function setTarget(plane, x, y) {
  plane.target = { x, y };
  plane.angle = Math.atan2(y - plane.y, x - plane.x);
  state.pings.push({ x, y, age: 0 });
}

function planeAt(x, y) {
  let nearest = null;
  let distance = 24;
  for (const plane of state.planes) {
    const d = Math.hypot(plane.x - x, plane.y - y);
    if (d < distance) {
      nearest = plane;
      distance = d;
    }
  }
  return nearest;
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches && event.touches[0];
  return {
    x: (touch ? touch.clientX : event.clientX) - rect.left,
    y: (touch ? touch.clientY : event.clientY) - rect.top,
  };
}

function handlePointer(event) {
  event.preventDefault();
  if (state.gameOver) {
    reset();
    return;
  }
  const { x, y } = pointerPosition(event);
  const picked = planeAt(x, y);
  if (picked) {
    state.selected = picked;
    return;
  }
  if (state.selected) {
    setTarget(state.selected, x, y);
  }
}

function update(dt) {
  if (state.gameOver) return;
  state.elapsed += dt;
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnPlane();
    state.spawnIn = Math.max(1.1, 4.2 - state.elapsed * 0.045);
  }

  const r = runway();
  for (const plane of state.planes) {
    plane.age += dt;
    const desired = Math.atan2(plane.target.y - plane.y, plane.target.x - plane.x);
    plane.angle = turnToward(plane.angle, desired, dt * 1.35);
    plane.x += Math.cos(plane.angle) * plane.speed * dt;
    plane.y += Math.sin(plane.angle) * plane.speed * dt;
    plane.safe = true;
  }

  for (let i = 0; i < state.planes.length; i += 1) {
    for (let j = i + 1; j < state.planes.length; j += 1) {
      const a = state.planes[i];
      const b = state.planes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 24) {
        crash(a, b);
        return;
      }
      if (d < 70) {
        a.safe = false;
        b.safe = false;
      }
    }
  }

  state.planes = state.planes.filter((plane) => {
    if (canLand(plane, r)) {
      state.score += 100;
      state.landed += 1;
      updateHud();
      return false;
    }
    if (plane.x < -120 || plane.x > state.width + 120 || plane.y < -120 || plane.y > state.height + 120) {
      loseLife();
      return false;
    }
    return true;
  });

  state.pings = state.pings.filter((ping) => {
    ping.age += dt;
    return ping.age < 0.8;
  });
}

function turnToward(current, target, maxTurn) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + Math.max(-maxTurn, Math.min(maxTurn, delta));
}

function canLand(plane, r) {
  const metrics = landingMetrics(plane, r);
  return metrics.inLine && metrics.onRunway && metrics.headingOk && plane.speed < 78;
}

function landingMetrics(plane, r) {
  const dx = plane.x - r.x;
  const dy = plane.y - r.y;
  const along = Math.cos(r.angle) * dx + Math.sin(r.angle) * dy;
  const cross = -Math.sin(r.angle) * dx + Math.cos(r.angle) * dy;
  const heading = Math.abs(Math.atan2(Math.sin(plane.angle - r.angle), Math.cos(plane.angle - r.angle)));
  return {
    along,
    cross,
    heading,
    inLine: Math.abs(cross) < r.width * 1.3,
    onRunway: Math.abs(along) < r.length * 0.47,
    headingOk: heading < 0.34,
  };
}

function landingHint(plane, r) {
  const metrics = landingMetrics(plane, r);
  if (canLand(plane, r)) return { ok: true, text: "LAND OK" };
  if (!metrics.inLine) return { ok: false, text: "LINE UP" };
  if (!metrics.headingOk) return { ok: false, text: "BAD HDG" };
  if (!metrics.onRunway) return { ok: false, text: "APPROACH" };
  return { ok: false, text: "NO LAND" };
}

function crash() {
  loseLife();
  state.planes = [];
  state.selected = null;
}

function loseLife() {
  state.lives -= 1;
  if (state.lives <= 0) state.gameOver = true;
  updateHud();
}

function draw() {
  ctx.clearRect(0, 0, state.width, state.height);
  drawRadar();
  drawRunway();
  for (const ping of state.pings) drawPing(ping);
  for (const plane of state.planes) drawPlane(plane);
  if (state.gameOver) drawGameOver();
}

function drawRadar() {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const radius = Math.hypot(state.width, state.height);
  const sweep = (state.elapsed * 0.72) % TAU;

  ctx.save();
  ctx.strokeStyle = "rgba(122,255,205,0.12)";
  ctx.lineWidth = 1;
  for (let r = 90; r < radius; r += 90) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();
  }
  for (let a = 0; a < TAU; a += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.stroke();
  }

  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius * 0.55);
  glow.addColorStop(0, "rgba(88,255,209,0.08)");
  glow.addColorStop(1, "rgba(88,255,209,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.rotate(0);
  const gradient = ctx.createConicGradient(sweep - 0.24, cx, cy);
  gradient.addColorStop(0, "rgba(88,255,209,0)");
  gradient.addColorStop(0.04, "rgba(88,255,209,0.16)");
  gradient.addColorStop(0.08, "rgba(88,255,209,0)");
  gradient.addColorStop(1, "rgba(88,255,209,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.restore();
}

function drawRunway() {
  const r = runway();
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(r.angle);
  ctx.strokeStyle = "rgba(255,231,118,0.34)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(-r.length * 1.25, 0);
  ctx.lineTo(r.length * 1.25, 0);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,231,118,0.2)";
  ctx.beginPath();
  ctx.moveTo(-r.length * 1.25, -r.width * 2.6);
  ctx.lineTo(-r.length / 2, -r.width / 2);
  ctx.lineTo(r.length / 2, -r.width / 2);
  ctx.moveTo(-r.length * 1.25, r.width * 2.6);
  ctx.lineTo(-r.length / 2, r.width / 2);
  ctx.lineTo(r.length / 2, r.width / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(210,255,241,0.16)";
  ctx.strokeStyle = "rgba(231,255,246,0.55)";
  ctx.lineWidth = 2;
  ctx.fillRect(-r.length / 2, -r.width / 2, r.length, r.width);
  ctx.strokeRect(-r.length / 2, -r.width / 2, r.length, r.width);
  ctx.setLineDash([18, 16]);
  ctx.beginPath();
  ctx.moveTo(-r.length / 2 + 20, 0);
  ctx.lineTo(r.length / 2 - 20, 0);
  ctx.strokeStyle = "rgba(231,255,246,0.7)";
  ctx.stroke();
  ctx.restore();
}

function drawPing(ping) {
  ctx.save();
  ctx.globalAlpha = 1 - ping.age / 0.8;
  ctx.strokeStyle = "rgba(88,255,209,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ping.x, ping.y, 8 + ping.age * 42, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPlane(plane) {
  const selected = plane === state.selected;
  ctx.save();
  ctx.translate(plane.x, plane.y);
  ctx.rotate(plane.angle);

  ctx.strokeStyle = selected ? "rgba(255,231,118,0.9)" : plane.safe ? "rgba(88,255,209,0.82)" : "rgba(255,94,115,0.95)";
  ctx.fillStyle = selected ? "rgba(255,231,118,0.24)" : plane.safe ? "rgba(88,255,209,0.2)" : "rgba(255,94,115,0.24)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = selected || !plane.safe ? 18 : 10;
  ctx.shadowColor = ctx.strokeStyle;

  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-11, -8);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-11, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  ctx.save();
  ctx.strokeStyle = selected ? "rgba(255,231,118,0.42)" : "rgba(122,255,205,0.2)";
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(plane.x, plane.y);
  ctx.lineTo(plane.target.x, plane.target.y);
  ctx.stroke();
  ctx.fillStyle = plane.safe ? "rgba(231,255,246,0.74)" : "rgba(255,130,145,0.9)";
  ctx.font = "12px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText(`${Math.round(plane.speed)}kt`, plane.x + 16, plane.y - 14);
  if (selected) drawLandingHint(plane);
  ctx.restore();
}

function drawLandingHint(plane) {
  const hint = landingHint(plane, runway());
  const x = plane.x + 16;
  const y = plane.y + 12;
  ctx.save();
  ctx.font = "700 12px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillStyle = hint.ok ? "rgba(88,255,209,0.18)" : "rgba(255,94,115,0.2)";
  ctx.strokeStyle = hint.ok ? "rgba(88,255,209,0.85)" : "rgba(255,94,115,0.85)";
  ctx.lineWidth = 1;
  ctx.fillRect(x - 6, y - 14, 72, 22);
  ctx.strokeRect(x - 6, y - 14, 72, 22);
  ctx.fillStyle = hint.ok ? "#9ffff0" : "#ff9aaa";
  ctx.fillText(hint.text, x, y + 1);
  ctx.restore();
}

function drawGameOver() {
  ctx.save();
  ctx.fillStyle = "rgba(1,4,3,0.72)";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#e7fff6";
  ctx.font = "700 42px system-ui, sans-serif";
  ctx.fillText("Game Over", state.width / 2, state.height / 2 - 18);
  ctx.fillStyle = "rgba(231,255,246,0.76)";
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText("Click radar or Restart to try again", state.width / 2, state.height / 2 + 22);
  ctx.restore();
}

function loop(now) {
  const dt = Math.min(0.04, (now - state.last) / 1000 || 0);
  state.last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function selfCheck() {
  const old = { width: state.width, height: state.height };
  state.width = 1000;
  state.height = 700;
  const r = runway();
  console.assert(canLand({ x: r.x, y: r.y, angle: r.angle, speed: 60 }, r), "aligned plane should land");
  console.assert(!canLand({ x: r.x, y: r.y, angle: r.angle + 1.2, speed: 60 }, r), "bad heading should not land");
  console.assert(Math.abs(turnToward(0, Math.PI, 0.2) - 0.2) < 0.001, "turnToward clamps rotation");
  Object.assign(state, old);
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", handlePointer);
restartButton.addEventListener("click", reset);

resize();
selfCheck();
reset();
requestAnimationFrame(loop);
