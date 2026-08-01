# 🛫 Cozy Airport Control - Senior PO Game Product Roadmap

## 📌 Executive Summary & Vision

**Cozy Airport Control** is a warm, engaging, and accessible air traffic management game. Transitioning from a dark radar simulator to a charming, countryside-inspired regional airport game broadens player appeal across all age groups while deepening strategic gameplay.

By combining **Stage-based progression**, **Cute aircraft art style**, **Diverse fleet handling**, **Color-coded runway matching**, **Procedural Web Audio API sound design**, and **Emergency active skills**, we create a rich, satisfying game loop that balances cozy visuals with exhilarating puzzle management.

---

## 💡 Senior Product Owner (PO) Evaluation & Refinement of Proposed Ideas

### 1. Stage-Based Game Loop (50+ Stages)
* **PO Assessment**: **Highly Recommended**. Endless modes often induce fatigue. Stage milestones provide distinct victory beats, reward dopamine, and give players achievable goals.
* **PO Refinement**:
  - Implement **50+ Procedurally Scaled Stages** (Stage 1: 8 landings → Stage 10: 26 landings → Stage 25: 56 landings → Stage 50: 106 landings).
  - Every 5th Stage (Stage 5, 10, 15... 50) triggers a **Heavy Traffic Milestone** with special badges and bonus multipliers.
  - Add a **Stage Clear** bonus screen with landing efficiency stars (1-3 stars based on zero collisions and speed).
  - Unlock **Endless High-Score Mode** upon clearing Stage 50+.

### 2. Visual Overhaul: Cozy Regional Airport & Cute Aircraft
* **PO Assessment**: **Highly Recommended**. Shifting to a bright, cozy, countryside aesthetic (soft green fields, charming terminal, windmills, warm lighting) increases player retention and emotional attachment.
* **PO Refinement**:
  - Replace abstract vector planes with cute, stylized SVG/Canvas rendered aircraft (rounded wings, friendly silhouettes).
  - Add animated environmental touches: spinning windmills, drifting clouds, wind socks, and subtle runway lights.

### 3. Diverse Aircraft Profiles (Speed, Size, Handling & Cargo)
* **PO Assessment**: **Highly Recommended**. Differentiating plane dynamics turns simple line drawing into a rich spatial puzzle.
* **PO Refinement**:
  - 🛩️ **Small Propeller**: Fast velocity, tight turning radius.
  - 🛫 **Regional Jet**: Medium speed, standard turn radius.
  - 📦 **Cargo Freighter**: Slow velocity, wide turn radius, larger collision box, appears in later stages.
  - 🚁 **Helicopter**: Slow, capable of sharp 90° pivots, lands on dedicated Helipads.

### 4. Color-Coded Runways & Aircraft Matching
* **PO Assessment**: **Highly Recommended**. Color matching adds clear visual targets and strategic routing complexity.
* **PO Refinement**:
  - **Curated HSL Color Palette**:
    - 🟡 **Amber Gold** (`#FFD166`): Passenger Flights / Runway Alpha
    - 🔵 **Ocean Cyan** (`#4ECDC4`): Regional Jet / Runway Bravo
    - 🔴 **Coral Red** (`#FF6B6B`): Cargo Strip
    - 🟢 **Emerald Green** (`#06D6A0`): Helipad
  - **Colorblind Accessibility**: Every color-coded aircraft and runway features distinct geometric icons (Circle `●`, Triangle `▲`, Star `★`, Diamond `◆`) so colorblind players enjoy 100% clarity.

### 5. Procedural Web Audio API Sound Design
* **PO Assessment**: **Highly Recommended**. Audio feedback provides immediate tactile satisfaction without external asset loading delays.
* **PO Refinement**:
  - Synthesize custom retro-cozy sound effects:
    - *Selection*: Crisp radio click.
    - *Route Drawing*: Soft pencil tick sound.
    - *Landing Success*: Uplifting major-third chime + touchdown squeak.
    - *Near-Miss Warning*: Gentle radio warning pulse.
    - *Stage Clear*: Brassy victory fanfare.

### 6. Active Skills & Item Systems Analysis
* **PO Assessment**: **Feasible & Highly Strategic**. Emergency items reduce player frustration during chaotic moments and add fun tactical choices.
* **Feasibility**: 100% feasible using HTML5 Canvas + Vanilla JS with zero performance overhead.
* **PO Item Designs**:
  - 🛑 **Air Traffic Freeze (Clock)**: Slows down all airborne aircraft by 60% for 5 seconds (cooldown-based).
  - 🚀 **Speed Boost (Turbo)**: Immediately boosts a selected aircraft to clear space quickly.
  - 🔄 **Emergency Reroute (Go-Around)**: Clears a plane's route and diverts it safely to outer airspace when collision is imminent.
  - ☁️ **Wind Gust Hazard**: Moving weather clouds that slow planes down or drift them slightly.

---

## 🗺️ Product Roadmap & Milestones

### Phase 1: Game Loop & Stage Progression System ⏳ (In Progress)
- [ ] Define Stage Manager (`stageManager.js` / state logic)
- [ ] Implement Stage 1 (8 landings threshold) to Stage 5 progression
- [ ] Create Stage Clear modal and transition screens
- [ ] Add HUD Stage progress indicators

### Phase 2: Cozy Visual Refresh & Regional Airport Background 🎨
- [ ] Design Cozy Countryside Airport canvas graphics (lush grass, terminal, runway markings)
- [ ] Implement cute vector aircraft models (Propeller, Commercial Jet, Cargo, Helicopter)
- [ ] Add environmental micro-animations (wind sock, runway beacons, clouds)

### Phase 3: Aircraft Fleet Profiling & Variable Dynamics ✈️
- [ ] Implement variable speeds, acceleration, and turn radii by plane type
- [ ] Introduce Cargo Freighters (large collision box, slow) in Stage 3+
- [ ] Introduce Helicopters with Helipad landing targets

### Phase 4: Color-Coded Matching & Colorblind Accessibility 🎨
- [ ] Create HSL curated color theme for runways, helipads, and aircraft
- [ ] Implement matching landing rules (Yellow plane -> Yellow runway, etc.)
- [ ] Add geometric accessibility symbols (●, ▲, ★, ◆) on aircraft and runway markers

### Phase 5: Web Audio API Sound System 🔊
- [ ] Implement `sound.js` procedural sound synthesizer
- [ ] Add selection, route drawing, landing chime, warning alert, and stage clear audio effects
- [ ] Add audio toggle button on HUD

### Phase 6: Active Items, Skills & Weather Hazards ⚡
- [ ] Implement Skill Bar UI (Air Traffic Freeze, Speed Boost, Emergency Reroute)
- [ ] Implement cooldown and trigger mechanics for active skills
- [ ] Add dynamic weather hazards (moving cloud zones)

---

## 📈 Key Performance Indicators (KPIs)
1. **Player Retention**: Increase average session time through stage milestones.
2. **Accessibility**: 100% playability for colorblind users and mobile touch users.
3. **Frustration Reduction**: Reduce accidental collisions by 40% using skill emergency valves.
