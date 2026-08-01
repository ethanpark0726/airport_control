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
  stage: 1,
  stageLanded: 0,
  stageTarget: 8,
  stageCleared: false,
  lives: 3,
  selected: null,
  drawing: false,
  drawnRoute: [],
  gameOver: false,
  lastInputAt: 0,
  ignoreClickUntil: 0,
  planes: [],
  pings: [],
};

function getStageConfig(stageNumber) {
  const stage = Math.max(1, stageNumber || 1);
  const target = Math.floor(8 + (stage - 1) * 2);
  const spawnInterval = Math.max(0.9, 3.6 - (stage - 1) * 0.05);
  const speedMin = Math.min(65, 44 + (stage - 1) * 0.5);
  const speedMax = Math.min(105, 72 + (stage - 1) * 0.7);
  const isMilestone = stage % 5 === 0;
  return { stage, target, spawnInterval, speedMin, speedMax, isMilestone };
}

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

function runwayPoints(r = runway()) {
  const ax = Math.cos(r.angle);
  const ay = Math.sin(r.angle);
  const point = (distance) => ({ x: r.x + ax * distance, y: r.y + ay * distance });
  return {
    approach: point(-r.length * 1.18),
    threshold: point(-r.length * 0.52),
    touchdown: point(-r.length * 0.1),
    exit: point(r.length * 0.72),
  };
}

function reset() {
  const config = getStageConfig(1);
  Object.assign(state, {
    last: performance.now(),
    elapsed: 0,
    spawnIn: 0.4,
    score: 0,
    landed: 0,
    stage: 1,
    stageLanded: 0,
    stageTarget: config.target,
    stageCleared: false,
    lives: 3,
    selected: null,
    drawing: false,
    drawnRoute: [],
    gameOver: false,
    planes: [],
    pings: [],
  });
  updateHud();
}

function updateHud() {
  const stageEl = document.getElementById("stage");
  if (stageEl) stageEl.textContent = state.stage;
  scoreEl.textContent = state.score;
  landedEl.textContent = `${state.stageLanded} / ${state.stageTarget}`;
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
  const config = getStageConfig(state.stage);
  const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
  state.planes.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    x,
    y,
    angle,
    speed,
    target,
    route: [],
    curveControl: null,
    radius: 12,
    safe: true,
    age: 0,
  });
}

function setTarget(plane, x, y) {
  setDrawnRoute(plane, [{ x, y }]);
  state.pings.push({ x, y, age: 0 });
}

function setDrawnRoute(plane, route) {
  const cleanRoute = simplifyRoute(route);
  plane.curveControl = null;
  plane.route = [...cleanRoute];
  plane.target = plane.route[0] || plane.target;
}

function simplifyRoute(route) {
  const result = [];
  for (const point of route) {
    const last = result.at(-1);
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 10) {
      result.push(point);
    }
  }
  return result;
}

function assignLandingRoute(plane, control = defaultCurveControl(plane)) {
  const points = runwayPoints();
  const curve = sampleQuadratic({ x: plane.x, y: plane.y }, control, points.approach, 18);
  plane.curveControl = control;
  plane.route = [...curve];
  plane.target = plane.route[0];
  state.pings.push({ ...points.approach, age: 0 });
}

function defaultCurveControl(plane) {
  const points = runwayPoints();
  return {
    x: (plane.x + points.approach.x) / 2,
    y: (plane.y + points.approach.y) / 2 + Math.min(state.width, state.height) * 0.16,
  };
}

function sampleQuadratic(start, control, end, steps) {
  const points = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const m = 1 - t;
    points.push({
      x: m * m * start.x + 2 * m * t * control.x + t * t * end.x,
      y: m * m * start.y + 2 * m * t * control.y + t * t * end.y,
    });
  }
  return points;
}

function planeAt(x, y, maxDistance = 72) {
  let nearest = null;
  let distance = maxDistance;
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
  const touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
  const clientX = touch ? touch.clientX : (event.clientX !== undefined ? event.clientX : 0);
  const clientY = touch ? touch.clientY : (event.clientY !== undefined ? event.clientY : 0);

  const scaleX = rect.width ? state.width / rect.width : 1;
  const scaleY = rect.height ? state.height / rect.height : 1;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function handlePointerDown(event) {
  event.preventDefault();
  if (state.gameOver) {
    reset();
    return;
  }
  if (state.stageCleared) {
    advanceStage();
    return;
  }
  if (state.selected && !state.planes.includes(state.selected)) {
    state.selected = null;
  }
  const { x, y } = pointerPosition(event);
  const picked = planeAt(x, y, state.selected ? 72 : Infinity);
  if (picked) {
    state.selected = picked;
    state.drawing = true;
    state.drawnRoute = [{ x: picked.x, y: picked.y }];
    if (canvas.setPointerCapture && event.pointerId !== undefined) {
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
    }
    return;
  }
  if (state.selected) {
    state.drawing = true;
    state.drawnRoute = [{ x: state.selected.x, y: state.selected.y }];
    if (canvas.setPointerCapture && event.pointerId !== undefined) {
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
    }
    return;
  }
}

function advanceStage() {
  state.stage += 1;
  const config = getStageConfig(state.stage);
  state.stageLanded = 0;
  state.stageTarget = config.target;
  state.stageCleared = false;
  state.planes = [];
  state.selected = null;
  state.spawnIn = 0.5;
  updateHud();
}

function handlePointerMove(event) {
  if (!state.drawing || !state.selected || state.gameOver || state.stageCleared) return;
  event.preventDefault();
  const { x, y } = pointerPosition(event);
  const last = state.drawnRoute.at(-1);
  if (last && Math.hypot(x - last.x, y - last.y) < 8) return;
  state.drawnRoute.push({ x, y });
  setDrawnRoute(state.selected, state.drawnRoute);
}

function handlePointerUp(event) {
  if (canvas.releasePointerCapture && event && event.pointerId !== undefined) {
    try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
  }
  state.drawing = false;
  state.drawnRoute = [];
}

function update(dt) {
  if (state.gameOver) return;
  state.elapsed += dt;

  if (!state.stageCleared) {
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnPlane();
      const config = getStageConfig(state.stage);
      state.spawnIn = Math.max(0.9, config.spawnInterval - Math.min(1.5, state.elapsed * 0.005));
    }
  }

  const r = runway();
  for (const plane of state.planes) {
    plane.age += dt;
    if (plane.route.length) {
      moveAlongRoute(plane, plane.speed * dt);
    } else {
      const desired = Math.atan2(plane.target.y - plane.y, plane.target.x - plane.x);
      plane.angle = turnToward(plane.angle, desired, dt * 1.35);
      plane.x += Math.cos(plane.angle) * plane.speed * dt;
      plane.y += Math.sin(plane.angle) * plane.speed * dt;
    }
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
      state.stageLanded += 1;
      if (state.stageLanded >= state.stageTarget && !state.stageCleared) {
        state.stageCleared = true;
        const config = getStageConfig(state.stage);
        state.score += state.stage * 500 + (config.isMilestone ? 1000 : 0);
      }
      updateHud();
      return false;
    }
    if (plane.x < -120 || plane.x > state.width + 120 || plane.y < -120 || plane.y > state.height + 120) {
      loseLife();
      return false;
    }
    return true;
  });

  if (state.selected && !state.planes.includes(state.selected)) {
    state.selected = null;
  }

  state.pings = state.pings.filter((ping) => {
    ping.age += dt;
    return ping.age < 0.8;
  });
}

function moveAlongRoute(plane, distance) {
  while (distance > 0 && plane.route.length) {
    const next = plane.route[0];
    const dx = next.x - plane.x;
    const dy = next.y - plane.y;
    const segment = Math.hypot(dx, dy);
    if (segment <= distance) {
      plane.x = next.x;
      plane.y = next.y;
      plane.route.shift();
      distance -= segment;
      continue;
    }
    plane.angle = Math.atan2(dy, dx);
    plane.x += Math.cos(plane.angle) * distance;
    plane.y += Math.sin(plane.angle) * distance;
    distance = 0;
  }
  plane.target = plane.route[0] || plane.target;
}

function turnToward(current, target, maxTurn) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + Math.max(-maxTurn, Math.min(maxTurn, delta));
}

function canLand(plane, r) {
  const metrics = landingMetrics(plane, r);
  return metrics.inLine && metrics.onRunway && metrics.headingOk && metrics.oneWay && plane.speed < 78;
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
    oneWay: along > -r.length * 0.5 && along < r.length * 0.62,
  };
}

function landingHint(plane, r) {
  const metrics = landingMetrics(plane, r);
  if (canLand(plane, r)) return { ok: true, text: "LAND OK" };
  if (!metrics.inLine) return { ok: false, text: "LINE UP" };
  if (!metrics.headingOk) return { ok: false, text: "BAD HDG" };
  if (!metrics.oneWay) return { ok: false, text: "ONE WAY" };
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
  drawCozyEnvironment();
  drawRunway();
  for (const ping of state.pings) drawPing(ping);
  for (const plane of state.planes) drawPlane(plane);
  if (state.stageCleared && !state.gameOver) drawStageClear();
  if (state.gameOver) drawGameOver();
}

function drawCozyEnvironment() {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const radius = Math.hypot(state.width, state.height);
  const r = runway();
  const points = runwayPoints(r);

  ctx.save();

  // Rich Airfield Grass Meadow Base
  const bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, radius * 0.7);
  bgGrad.addColorStop(0, "#1d4031");
  bgGrad.addColorStop(0.7, "#142d22");
  bgGrad.addColorStop(1, "#0c1d16");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, state.width, state.height);

  // Soft Organic Field Patch Texture
  ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
  ctx.beginPath();
  ctx.arc(state.width * 0.2, state.height * 0.3, 180, 0, TAU);
  ctx.arc(state.width * 0.8, state.height * 0.7, 240, 0, TAU);
  ctx.fill();

  // Perimeter Tree Line Clusters (Corner Foliage)
  ctx.fillStyle = "rgba(13, 31, 23, 0.75)";
  const trees = [
    { x: 40, y: 50, r: 45 }, { x: 90, y: 35, r: 35 }, { x: 30, y: 110, r: 40 },
    { x: state.width - 40, y: state.height - 50, r: 50 }, { x: state.width - 90, y: state.height - 30, r: 40 },
    { x: 60, y: state.height - 60, r: 48 }, { x: 110, y: state.height - 40, r: 38 }
  ];
  for (const tree of trees) {
    ctx.beginPath();
    ctx.arc(tree.x, tree.y, tree.r, 0, TAU);
    ctx.fill();
  }

  // Tarmac Apron & Taxiway Connecting to Runway
  ctx.save();
  ctx.fillStyle = "#1d2924";
  ctx.strokeStyle = "rgba(255, 231, 118, 0.35)";
  ctx.lineWidth = 1.5;

  // Taxiway Strip from Apron to Runway
  ctx.beginPath();
  ctx.moveTo(r.x + r.length * 0.1, r.y - r.width);
  ctx.lineTo(state.width - 150, 90);
  ctx.lineTo(state.width - 120, 90);
  ctx.lineTo(r.x + r.length * 0.25, r.y - r.width);
  ctx.closePath();
  ctx.fill();

  // Parking Apron Tarmac (Top Right)
  ctx.beginPath();
  ctx.roundRect(state.width - 165, 20, 145, 75, 8);
  ctx.fill();
  ctx.stroke();

  // Yellow Taxiway Guide Line
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(r.x + r.length * 0.17, r.y - r.width / 2);
  ctx.quadraticCurveTo(state.width - 140, r.y * 0.6, state.width - 95, 55);
  ctx.stroke();
  ctx.setLineDash([]);

  // Parked Aircraft Silhouettes on Apron
  ctx.fillStyle = "rgba(88, 255, 209, 0.35)";
  drawParkedPlaneSilhouette(state.width - 130, 45, -0.4);
  drawParkedPlaneSilhouette(state.width - 65, 45, -0.4);
  ctx.restore();

  // Control Tower Structure (Top Right of Apron)
  const tx = state.width - 175;
  const ty = 40;
  ctx.fillStyle = "#13211b";
  ctx.strokeStyle = "rgba(159, 255, 220, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tx, ty, 12, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Tower Beacon Pulsing Light
  const beaconGlow = (Math.sin(state.elapsed * 4) + 1) / 2;
  ctx.fillStyle = `rgba(88, 255, 209, ${0.4 + beaconGlow * 0.5})`;
  ctx.beginPath();
  ctx.arc(tx, ty, 4, 0, TAU);
  ctx.fill();

  // Animated Windmill (Top Left)
  const wx = 80;
  const wy = 85;
  ctx.strokeStyle = "rgba(231,255,246,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wx - 8, wy + 24);
  ctx.lineTo(wx, wy);
  ctx.lineTo(wx + 8, wy + 24);
  ctx.stroke();
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(state.elapsed * 1.5);
  ctx.strokeStyle = "rgba(255,231,118,0.5)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.rotate(TAU / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -18);
    ctx.stroke();
  }
  ctx.restore();

  // Animated Windsock near Approach
  const wsx = points.approach.x + 35;
  const wsy = points.approach.y - 25;
  ctx.strokeStyle = "rgba(231,255,246,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wsx, wsy + 16);
  ctx.lineTo(wsx, wsy);
  ctx.stroke();
  const sockAngle = Math.sin(state.elapsed * 2) * 0.15 + 0.3;
  ctx.save();
  ctx.translate(wsx, wsy);
  ctx.rotate(sockAngle);
  ctx.fillStyle = "#ff7b54";
  ctx.fillRect(0, -4, 14, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(4, -4, 4, 8);
  ctx.restore();

  // Drifting Soft Clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  for (let i = 0; i < 3; i += 1) {
    const cloudX = ((state.elapsed * 12 + i * 280) % (state.width + 200)) - 100;
    const cloudY = 120 + i * 160;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, 32, 0, TAU);
    ctx.arc(cloudX + 26, cloudY - 10, 26, 0, TAU);
    ctx.arc(cloudX + 50, cloudY, 28, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawParkedPlaneSilhouette(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.roundRect(-3, -10, 6, 20, 2);
  ctx.roundRect(-8, -2, 16, 4, 1);
  ctx.fill();
  ctx.restore();
}

function drawRunway() {
  const r = runway();
  const points = runwayPoints(r);
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(r.angle);

  // Approach Centerline Guide
  ctx.strokeStyle = "rgba(255,231,118,0.35)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(-r.length * 1.25, 0);
  ctx.lineTo(r.length * 1.25, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Asphalt Runway Main Strip
  ctx.fillStyle = "#1e2824";
  ctx.strokeStyle = "rgba(231,255,246,0.6)";
  ctx.lineWidth = 2;
  ctx.fillRect(-r.length / 2, -r.width / 2, r.length, r.width);
  ctx.strokeRect(-r.length / 2, -r.width / 2, r.length, r.width);

  // Concrete Threshold Piano Keys
  ctx.fillStyle = "rgba(240, 255, 249, 0.75)";
  const stripeWidth = 3;
  const stripeHeight = r.width * 0.7;
  for (let i = -3; i <= 3; i += 1) {
    if (i === 0) continue;
    ctx.fillRect(-r.length / 2 + 8, i * 3.5 - stripeHeight / 6, 12, stripeWidth);
    ctx.fillRect(r.length / 2 - 20, i * 3.5 - stripeHeight / 6, 12, stripeWidth);
  }

  // Yellow Centerline Dashes
  ctx.strokeStyle = "#ffe776";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(-r.length / 2 + 26, 0);
  ctx.lineTo(r.length / 2 - 26, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Green Landing Touchdown Zone Box
  ctx.fillStyle = "rgba(88,255,209,0.22)";
  ctx.strokeStyle = "rgba(88,255,209,0.85)";
  ctx.lineWidth = 2;
  ctx.fillRect(-r.length / 2 + 10, -r.width / 2 + 4, r.length * 0.38, r.width - 8);
  ctx.strokeRect(-r.length / 2 + 10, -r.width / 2 + 4, r.length * 0.38, r.width - 8);

  // Text & Arrow Guidance
  ctx.fillStyle = "#9ffff0";
  ctx.font = "700 11px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("LAND", -r.length * 0.31, -r.width * 0.72);
  drawRunwayArrow(-r.length * 0.42, r.width * 0.72, 18);
  drawRunwayArrow(-r.length * 0.24, r.width * 0.72, 18);
  ctx.restore();

  // Approach Marker Text
  ctx.save();
  ctx.fillStyle = "rgba(255,231,118,0.95)";
  ctx.font = "700 12px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("APPROACH", points.approach.x, points.approach.y - 12);
  ctx.beginPath();
  ctx.moveTo(points.approach.x - Math.cos(r.angle) * 12, points.approach.y - Math.sin(r.angle) * 12);
  ctx.lineTo(points.approach.x + Math.cos(r.angle) * 12, points.approach.y + Math.sin(r.angle) * 12);
  ctx.strokeStyle = "rgba(255,231,118,0.85)";
  ctx.stroke();
  ctx.restore();
}

function drawRunwayArrow(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(159,255,240,0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-size / 2, 0);
  ctx.lineTo(size / 2, 0);
  ctx.lineTo(size / 2 - 5, -4);
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2 - 5, 4);
  ctx.stroke();
  ctx.restore();
}

function drawPing(ping) {
  ctx.save();
  ctx.globalAlpha = 1 - ping.age / 0.8;
  ctx.strokeStyle = "rgba(88,255,209,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ping.x, ping.y, 8 + ping.age * 42, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPlane(plane) {
  const selected = plane === state.selected;
  ctx.save();

  // Drop Shadow for Depth
  ctx.save();
  ctx.translate(plane.x + 5, plane.y + 7);
  ctx.rotate(plane.angle);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 5, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Selected Halo Ring
  if (selected) {
    ctx.save();
    ctx.translate(plane.x, plane.y);
    ctx.strokeStyle = "#ffe776";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = "#ffe776";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Cute Airplane Body
  ctx.save();
  ctx.translate(plane.x, plane.y);
  ctx.rotate(plane.angle);

  const bodyColor = selected ? "#ffe776" : plane.safe ? "#58ffd1" : "#ff5e73";
  const strokeColor = selected ? "#ffffff" : plane.safe ? "#e7fff6" : "#ffd0d6";

  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Main Rounded Wings
  ctx.beginPath();
  ctx.roundRect(-4, -15, 8, 30, 4);
  ctx.fill();
  ctx.stroke();

  // Tail Stabilizer
  ctx.beginPath();
  ctx.roundRect(-12, -7, 5, 14, 2);
  ctx.fill();
  ctx.stroke();

  // Fuselage (Capsule Shape)
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 6, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Cockpit Glass Sheen
  ctx.fillStyle = "#74f0ff";
  ctx.beginPath();
  ctx.ellipse(5, 0, 4, 3, 0, 0, TAU);
  ctx.fill();

  // Animated Spinning Propeller Nose
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1.5;
  const propAnim = Math.sin(state.elapsed * 35) * 6;
  ctx.beginPath();
  ctx.moveTo(16, -propAnim);
  ctx.lineTo(16, propAnim);
  ctx.stroke();

  ctx.restore();

  // Flight Route & Hint
  ctx.save();
  if (selected && plane.route.length) drawLandingRoute(plane);
  else drawTargetLine(plane, selected);
  ctx.fillStyle = plane.safe ? "rgba(231,255,246,0.85)" : "rgba(255,130,145,0.95)";
  ctx.font = "700 12px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText(`${Math.round(plane.speed)}kt`, plane.x + 18, plane.y - 14);
  if (selected) drawLandingHint(plane);
  ctx.restore();
}

function drawTargetLine(plane, selected) {
  ctx.strokeStyle = selected ? "rgba(255,231,118,0.42)" : "rgba(122,255,205,0.2)";
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(plane.x, plane.y);
  ctx.lineTo(plane.target.x, plane.target.y);
  ctx.stroke();
}

function drawLandingRoute(plane) {
  const points = plane.route;
  if (!points.length) return;
  ctx.strokeStyle = "rgba(255,50,68,0.9)";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(plane.x, plane.y);
  for (let i = 0; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  if (plane.curveControl) {
    const approachAnchor = points[Math.max(0, points.length - 4)];
    ctx.strokeStyle = "rgba(255,231,118,0.28)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(plane.x, plane.y);
    ctx.lineTo(plane.curveControl.x, plane.curveControl.y);
    ctx.lineTo(approachAnchor.x, approachAnchor.y);
    ctx.stroke();
  }

  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, TAU);
    ctx.fillStyle = "rgba(255,231,118,0.84)";
    ctx.fill();
  }
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

function drawStageClear() {
  const config = getStageConfig(state.stage);
  const nextConfig = getStageConfig(state.stage + 1);
  ctx.save();
  ctx.fillStyle = "rgba(4, 18, 14, 0.84)";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.textAlign = "center";

  ctx.fillStyle = "#58ffd1";
  ctx.font = "700 38px system-ui, sans-serif";
  ctx.fillText(`STAGE ${state.stage} CLEAR!`, state.width / 2, state.height / 2 - 48);

  if (config.isMilestone) {
    ctx.fillStyle = "#ffe776";
    ctx.font = "700 16px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.fillText("🏆 HEAVY TRAFFIC MILESTONE ACHIEVED! (+1000 Bonus)", state.width / 2, state.height / 2 - 16);
  }

  const stars = state.lives === 3 ? "⭐⭐⭐ PERFECT PERFORMANCE!" : state.lives === 2 ? "⭐⭐ GREAT JOB!" : "⭐ STAGE CLEARED!";
  ctx.fillStyle = "#e7fff6";
  ctx.font = "600 20px system-ui, sans-serif";
  ctx.fillText(stars, state.width / 2, state.height / 2 + 16);

  ctx.fillStyle = "rgba(231,255,246,0.85)";
  ctx.font = "15px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText(`Next Target: ${nextConfig.target} Landings`, state.width / 2, state.height / 2 + 54);

  ctx.fillStyle = "#58ffd1";
  ctx.font = "700 17px system-ui, sans-serif";
  ctx.fillText(`Tap screen to start Stage ${state.stage + 1}`, state.width / 2, state.height / 2 + 96);
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
  const fakePlane = { x: 0, y: 0, target: null, route: [] };
  console.assert(canLand({ x: r.x, y: r.y, angle: r.angle, speed: 60 }, r), "aligned plane should land");
  console.assert(!canLand({ x: r.x, y: r.y, angle: r.angle + 1.2, speed: 60 }, r), "bad heading should not land");
  console.assert(!canLand({ x: r.x, y: r.y, angle: r.angle + Math.PI, speed: 60 }, r), "opposite heading should not land");
  assignLandingRoute(fakePlane);
  console.assert(fakePlane.route.length === 18, "landing route should include curve samples");
  moveAlongRoute(fakePlane, 10);
  console.assert(fakePlane.x !== 0 || fakePlane.y !== 0, "route movement should move the aircraft onto the curve");
  setDrawnRoute(fakePlane, [{ x: r.x, y: r.y }]);
  console.assert(fakePlane.route.length === 1, "drawn routes should contain exactly the user drawn points");
  console.assert(Math.abs(turnToward(0, Math.PI, 0.2) - 0.2) < 0.001, "turnToward clamps rotation");

  // Verify selection resets when plane lands
  state.planes = [fakePlane];
  state.selected = fakePlane;
  state.planes = [];
  if (state.selected && !state.planes.includes(state.selected)) {
    state.selected = null;
  }
  console.assert(state.selected === null, "selected plane should reset to null when plane is removed from state.planes");

  // Verify Stage 1 to 50+ configuration scaling
  const c1 = getStageConfig(1);
  const c5 = getStageConfig(5);
  const c10 = getStageConfig(10);
  const c50 = getStageConfig(50);
  console.assert(c1.target === 8, "Stage 1 target should be 8");
  console.assert(c10.target === 26, "Stage 10 target should be 26");
  console.assert(c50.target === 106, "Stage 50 target should be 106");
  console.assert(c5.isMilestone && c10.isMilestone && c50.isMilestone, "Milestone stages should be every 5th stage");
  console.assert(c50.spawnInterval < c1.spawnInterval, "Later stages should have faster spawn interval");

  // Verify Stage Clear trigger
  state.stage = 1;
  state.stageLanded = 7;
  state.stageTarget = 8;
  state.stageCleared = false;
  state.stageLanded += 1;
  if (state.stageLanded >= state.stageTarget) state.stageCleared = true;
  console.assert(state.stageCleared === true, "Stage should be cleared when stageLanded reaches target");

  Object.assign(state, old);
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", handlePointerUp);
window.addEventListener("pointercancel", handlePointerUp);
restartButton.addEventListener("click", reset);

resize();
selfCheck();
reset();
requestAnimationFrame(loop);
