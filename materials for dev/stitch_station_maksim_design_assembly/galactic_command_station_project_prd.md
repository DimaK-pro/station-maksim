# Project Brief: Galactic Command Station (Max's Space Station)

## 1. Project Overview
**Title:** Galactic Command Station
**Concept:** A gamified family education and behavior management system designed as a mobile-first PWA.
**Target Audience:** A family consisting of a child (Max, ~8 years old) and his parents/guardians (Dad, Mom, Grandma).
**Core Mechanic:** Parents evaluate the child's actions across four key spheres. These evaluations impact the "Station Energy" level. High energy unlocks rewards; low energy triggers consequences.

---

## 2. Visual Identity & Design System (Theme: "Max")
The project uses a high-fidelity 3D mobile game aesthetic (Brawl Stars/Clash Royale style).

- **Visual Style:** 3D renders with depth, metallic textures, volumetric glows, and realistic light bleed.
- **Color Palette:**
  - **Background:** Deep Space (`#0a0b13`) with nebula overlays (`BG-min.jpg`).
  - **Surfaces:** Dark glass panels with neon borders and high corner radius.
  - **Positive:** Cyan/Turquoise (`#22d3ee`) and Gold.
  - **Negative:** Bright Red (`#fd435e`) and Orange.
- **Typography:**
  - **Headlines:** Orbitron/Exo 2 (Sci-fi feel).
  - **Interface/Body:** Inter/Nunito (Readability).
  - **Language:** Russian (Cyrillic).

---

## 3. Core Features & Logic

### 3.1 Evaluation Spheres
Actions are categorized into four domains, each with a specific weight:
1. **Study (Учёба):** Homework, grades, effort.
2. **Respect (Уважение):** Attitude toward adults/teachers.
3. **Focus (Фокус):** Attention, finishing tasks.
4. **Home (Дом):** Obedience, chores, routine.

### 3.2 Action Scaling
- **Positive:** +2 to +30 points (from small gestures to major achievements).
- **Neutral:** 0 to -5 points (observations or warnings).
- **Negative:** -2 to -30 points (misbehavior to critical violations).

### 3.3 Energy Calculation
- **Energy (E):** Ranges from -100 to +100.
- Calculated using a logistic curve based on the weighted sum of actions over a rolling 7-day window.
- **Daily Decay:** Accumulated points decrease by ~8% daily at midnight to ensure continuous engagement.

---

## 4. Application Structure

### Child View (Max)
- **Main Station Screen:** Displays the 3D station, current energy, sphere progress bars, and reward/consequence chests.
- **Reward Roulette:** A slot-machine style interface where Max spins to win a prize when energy is high.
- **Consequence Roulette:** A similar interface for negative results when energy is low.
- **Mission Journal:** A feed of all rated actions.

### Admin View (Parents)
- **PIN Entry:** Secure 4-digit code entry for Dad, Mom, or Grandma.
- **Add Event:** A multi-step flow to log a new behavior (Sphere -> Type -> Power -> Comment).
- **Chest Management:** Interface to add or edit the list of rewards (1-4 stars) and consequences.

---

## 5. Technical Specifications
- **Platform:** Responsive Web Application (PWA).
- **Frontend:** React/Next.js with Framer Motion for gaming-style animations.
- **Backend:** Node.js API with a PostgreSQL or Firebase database.
- **Real-time:** WebSockets (Socket.io) to update the child's screen immediately when a parent logs an event.
- **Deployment:** Vercel or Railway for fast iteration.

---

## 6. Approved Assets
- **Background:** `{{DATA:IMAGE:IMAGE_38}}`
- **Main Station Render:** `{{DATA:IMAGE:IMAGE_47}}`
- **Max Header:** `{{DATA:IMAGE:IMAGE_51}}`
- **Reward Chest:** `{{DATA:IMAGE:IMAGE_52}}`
- **Danger Module:** `{{DATA:IMAGE:IMAGE_49}}`
- **Energy Screen:** `{{DATA:IMAGE:IMAGE_48}}`
