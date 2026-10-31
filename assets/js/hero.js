'use strict';

/**
 * Landing journey: a full-screen WebGL2 particle field that morphs through
 * Varad's career (name, gears, rocket, wafer, Google G and others) and then
 * flies into the portfolio. Scroll, keys, or the rail move through it; the
 * cursor scatters particles, a click sends a shockwave, dragging rotates.
 * Skipped for reduced-motion users and browsers without WebGL2.
 */

(function () {

  const SEEN_KEY = 'heroSeen';
  const FLOATS_PER_POINT = 7;
  const GEAR_A = { x: -0.6, r: 0.85, teeth: 18 };
  const GEAR_B = { x: -0.6 + 0.85 + 0.85 * 12 / 18, r: 0.85 * 12 / 18, teeth: 12 };
  const GEAR_SPEED = 0.4;

  // every stop a journey can visit
  const STOPS = {
    chemtech: {
      shape: 'gears',
      view: { rx: -0.22, ry: -0.38, rz: 0, side: 0.3, dof: 0.35 },
      year: 2019,
      label: 'Chemtech',
      kicker: 'Where it started',
      company: 'Chemtech Systems',
      role: 'Senior Mechanical Engineer, High-Volume Manufacturing',
    },
    asu: {
      shape: 'cap',
      view: { rx: 0.42, ry: 0, rz: -0.1, side: 0.3, dof: 0.35 },
      year: 2024,
      label: 'ASU',
      kicker: 'Class of 2024',
      company: 'Arizona State University',
      role: 'Master of Science in Mechanical Engineering'
    },
    nasa: {
      shape: 'rocket',
      view: { rx: 0.08, ry: 0, rz: -0.2, side: 0.34, dof: 1 },
      year: 2022,
      label: 'NASA',
      kicker: 'Aiming higher',
      company: 'NASA',
      role: 'Mechanical Project Specialist Co-op, L\'SPACE',
    },
    rayn: {
      shape: 'lens',
      view: { rx: 0.1, ry: -0.5, rz: 0, side: 0.16, dof: 0.35 },
      year: 2024,
      label: 'Rayn',
      kicker: 'Bending light',
      company: 'Rayn Innovation',
      role: 'Senior Opto-Mechanical Engineer Co-op, R&D and Hardware & Thermal Test'
    },
    tsmc: {
      shape: 'wafer',
      view: { rx: 0.98, ry: 0, rz: -0.16, side: 0.3, dof: 0.55 },
      year: 2024,
      label: 'TSMC',
      kicker: 'Inside the fab',
      company: 'TSMC',
      role: 'Mechanical Engineer, Critical Facilities Systems',
    },
    google: {
      shape: 'google',
      view: { rx: -0.08, ry: -0.22, rz: 0, side: 0.3, dof: 0.4 },
      year: 2025,
      label: 'Google',
      kicker: 'Today',
      company: 'Google',
      role: 'Senior Mechanical Engineer',
    }
  };

  const JOURNEY = ['chemtech', 'nasa', 'rayn', 'asu', 'tsmc', 'google'];
  const INTRO_SECONDS = 4.2;
  const STOP_SECONDS = 5.1;
  const MORPH_SPEED = 2.3;

  const journey = JOURNEY.map(function (key) { return STOPS[key]; });

  // shape order: opening dust, the name, then each stop
  const SHAPES = ['dust', 'name'].concat(journey.map(function (stop) { return stop.shape; }));
  const STAGES = [null, null].concat(journey);
  const VIEWS = [
    { rx: 0.95, ry: 0, rz: 0, side: 0, dof: 0.5 },
    { rx: 0, ry: 0, rz: 0, side: 0, dof: 0 }
  ].concat(journey.map(function (stop) { return stop.view; }));
  const FIRST_STAGE = 1;
  const LAST_STAGE = SHAPES.length - 1;

  const reducedMotion = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const storageGet = function (key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  };

  const storageSet = function (key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) { /* private mode */ }
  };

  const releaseBoot = function () {
    document.documentElement.classList.remove('hero-boot');
  };



  // --------------------
  // Shapes
  // --------------------

  const rand = Math.random;
  const lerp = function (a, b, t) { return a + (b - a) * t; };
  const clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  const smooth = function (t) { return t * t * (3 - 2 * t); };

  const GOLD = [1, 0.84, 0.42];
  const AMBER = [1, 0.58, 0.18];
  const HOT = [1, 0.95, 0.82];
  const COOL = [0.32, 0.72, 1];

  const mixColor = function (a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  };

  const writer = function (count) {
    const data = new Float32Array(count * FLOATS_PER_POINT);
    let i = 0;
    return {
      data: data,
      remaining: function () { return count - i; },
      put: function (x, y, z, c, gain, flag) {
        if (i >= count) return;
        const o = i * FLOATS_PER_POINT;
        data[o] = x; data[o + 1] = y; data[o + 2] = z;
        data[o + 3] = c[0] * gain; data[o + 4] = c[1] * gain; data[o + 5] = c[2] * gain;
        data[o + 6] = flag || 0;
        i++;
      }
    };
  };

  // pairs each slot with a random partner so morphs swirl instead of sliding,
  // and a shorter draw count on slow devices thins every part evenly
  const shuffle = function (data) {
    const s = FLOATS_PER_POINT;
    const tmp = new Float32Array(s);
    for (let i = data.length / s - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      tmp.set(data.subarray(i * s, i * s + s));
      data.copyWithin(i * s, j * s, j * s + s);
      data.set(tmp, j * s);
    }
    return data;
  };

  const buildDust = function (count) {
    const w = writer(count);
    while (w.remaining()) {
      const r = Math.pow(rand(), 0.55) * 2.5;
      const arm = Math.floor(rand() * 3) * (Math.PI * 2 / 3);
      const a = arm + r * 2.3 + (rand() - 0.5) * (0.9 - r * 0.2);
      const c = mixColor(HOT, AMBER, Math.min(1, r / 1.7));
      w.put(Math.cos(a) * r, (rand() - 0.5) * 0.16 * (2.6 - r), Math.sin(a) * r, c, 1.15 - r * 0.25, 5);
    }
    return shuffle(w.data);
  };

  const buildName = function (count, portrait) {
    const canvas = document.createElement('canvas');
    canvas.width = portrait ? 800 : 1600;
    canvas.height = portrait ? 620 : 300;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = (portrait ? 230 : 230) + 'px Poppins, Helvetica, Arial, sans-serif';
    ctx.font = '600 ' + ctx.font;
    if (portrait) {
      ctx.fillText('VARAD', 400, 170);
      ctx.fillText('LAD', 400, 450);
    } else {
      ctx.fillText('VARAD LAD', 800, 150);
    }

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hits = [];
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        if (image[(y * canvas.width + x) * 4 + 3] > 128) hits.push(x, y);
      }
    }

    const worldWidth = portrait ? 2.5 : 3.7;
    const unit = worldWidth / canvas.width;
    const w = writer(count);
    while (w.remaining()) {
      const k = Math.floor(rand() * hits.length / 2) * 2;
      const px = hits[k] + rand() * 2;
      const py = hits[k + 1] + rand() * 2;
      const c = mixColor(GOLD, AMBER, 0.1 + 0.55 * px / canvas.width);
      w.put((px - canvas.width / 2) * unit, (canvas.height / 2 - py) * unit,
        (rand() - 0.5) * 0.05, c, 0.62, 0);
    }
    return shuffle(w.data);
  };

  const toothRadius = function (angle, gear, phase) {
    const module = 2 * gear.r / gear.teeth;
    const tip = gear.r + module;
    const root = gear.r - 1.25 * module;
    let t = ((angle - phase) * gear.teeth / (Math.PI * 2)) % 1;
    if (t < 0) t += 1;
    const d = Math.abs(t > 0.5 ? t - 1 : t);
    if (d < 0.17) return tip;
    if (d < 0.31) return lerp(tip, root, (d - 0.17) / 0.14);
    return root;
  };

  const buildGear = function (w, gear, phase, flag, share, tone) {
    const thickness = 0.13;
    const hub = gear.r * 0.24;
    const holeOrbit = gear.r * 0.56;
    const holeRadius = gear.r * 0.17;
    const holes = 6;
    const start = w.remaining();
    const target = start - share;

    while (w.remaining() > target) {
      const pick = rand();
      const a = rand() * Math.PI * 2;
      let r;
      let z;
      let gain = 0.5;

      if (pick < 0.46) {
        // tooth outline: the two faces carry the crisp silhouette
        r = toothRadius(a, gear, phase);
        z = rand() < 0.72 ? (rand() < 0.5 ? -thickness : thickness) : (rand() * 2 - 1) * thickness;
        gain = 0.95;
      } else if (pick < 0.58) {
        // hub ring
        r = hub;
        z = (rand() * 2 - 1) * thickness;
        gain = 0.9;
      } else if (pick < 0.72) {
        // lightening hole rims
        const h = Math.floor(rand() * holes) * (Math.PI * 2 / holes);
        const b = rand() * Math.PI * 2;
        const x = Math.cos(h) * holeOrbit + Math.cos(b) * holeRadius;
        const y = Math.sin(h) * holeOrbit + Math.sin(b) * holeRadius;
        w.put(gear.x + x, y, (rand() < 0.5 ? -1 : 1) * thickness, tone, 0.85, flag);
        continue;
      } else {
        // web between hub and teeth, minus the holes
        const outer = toothRadius(a, gear, phase);
        r = Math.sqrt(lerp(hub * hub, outer * outer, rand()));
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        let blocked = r > outer - 2.4 * 2 * gear.r / gear.teeth && false;
        for (let h = 0; h < holes && !blocked; h++) {
          const ha = h * Math.PI * 2 / holes;
          const dx = x - Math.cos(ha) * holeOrbit;
          const dy = y - Math.sin(ha) * holeOrbit;
          if (dx * dx + dy * dy < holeRadius * holeRadius) blocked = true;
        }
        if (blocked) continue;
        z = (rand() < 0.5 ? -1 : 1) * thickness;
        gain = 0.46;
      }
      w.put(gear.x + Math.cos(a) * r, Math.sin(a) * r, z, tone, gain, flag);
    }
  };

  const buildGears = function (count) {
    const w = writer(count);
    const bShare = Math.floor(count * 0.36);
    buildGear(w, GEAR_A, 0, 1, count - bShare, GOLD);
    buildGear(w, GEAR_B, Math.PI + Math.PI / GEAR_B.teeth, 2, bShare, mixColor(GOLD, HOT, 0.55));
    return shuffle(w.data);
  };

  const buildRocket = function (count) {
    const w = writer(count);
    const bottom = -0.8;
    const shoulder = 0.32;
    const top = 0.96;
    const core = 0.17;

    const coreRadius = function (y) {
      if (y < shoulder) return core;
      const t = (y - shoulder) / (top - shoulder);
      return core * Math.sqrt(Math.max(0, 1 - t * t));
    };

    // revolved surface; rings and bands give the body its engineering lines
    const putBody = function (cx, radiusAt, yLo, yHi, tone, gain) {
      let y = lerp(yLo, yHi, rand());
      const band = rand();
      if (band < 0.3) y = yLo + Math.round((y - yLo) / 0.13) * 0.13;
      const a = rand() * Math.PI * 2;
      const r = radiusAt(y);
      const facing = 0.55 + 0.45 * Math.abs(Math.cos(a));
      // the far side stays dim so the lettering reads cleanly
      const near = Math.sin(a) > 0 ? 1 : 0.32;
      w.put(cx + Math.cos(a) * r, y, Math.sin(a) * r, tone, gain * facing * near * (band < 0.3 ? 1.3 : 1), 0);
    };

    const boosterRadius = function (y) {
      const r = 0.06;
      const tip = 0.38;
      const start = 0.2;
      if (y < start) return r;
      const t = (y - start) / (tip - start);
      return r * Math.sqrt(Math.max(0, 1 - t * t));
    };

    const coreShare = Math.floor(count * 0.33);
    const letterShare = Math.floor(count * 0.1);
    const boosterShare = Math.floor(count * 0.13);
    const exhaustShare = Math.floor(count * 0.14);
    const earthShare = Math.floor(count * 0.09);

    for (let i = 0; i < coreShare; i++) putBody(0, coreRadius, bottom, top, mixColor(GOLD, HOT, 0.25), 0.48);
    // NASA, stacked down the body and wrapped around the cylinder
    const letters = document.createElement('canvas');
    letters.width = 160;
    letters.height = 640;
    const lettersCtx = letters.getContext('2d', { willReadFrequently: true });
    lettersCtx.fillStyle = '#fff';
    lettersCtx.textAlign = 'center';
    lettersCtx.textBaseline = 'middle';
    lettersCtx.font = '600 150px Poppins, Helvetica, Arial, sans-serif';
    'NASA'.split('').forEach(function (letter, i) {
      lettersCtx.fillText(letter, 80, (i + 0.5) * 160);
    });
    const pixels = lettersCtx.getImageData(0, 0, letters.width, letters.height).data;
    const letterHits = [];
    for (let y = 0; y < letters.height; y++) {
      for (let x = 0; x < letters.width; x++) {
        if (pixels[(y * letters.width + x) * 4 + 3] > 128) letterHits.push(x, y);
      }
    }
    const letterUnit = 0.0014;
    const letterTop = 0.26;
    for (let i = 0; i < letterShare; i++) {
      const k = Math.floor(rand() * letterHits.length / 2) * 2;
      const angle = (letterHits[k] - 80) * letterUnit / core;
      w.put(Math.sin(angle) * core, letterTop - letterHits[k + 1] * letterUnit,
        Math.cos(angle) * core + 0.004, HOT, 1.7, 0);
    }

    for (let i = 0; i < boosterShare; i++) {
      putBody(rand() < 0.5 ? -0.235 : 0.235, boosterRadius, bottom + 0.02, 0.38, GOLD, 0.7);
    }

    for (let i = 0; i < exhaustShare; i++) {
      const lane = rand();
      const cx = lane < 0.6 ? 0 : (lane < 0.8 ? -0.235 : 0.235);
      const spread = lane < 0.6 ? 0.13 : 0.05;
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * spread;
      w.put(cx + Math.cos(a) * r, bottom - 0.02, Math.sin(a) * r, HOT, 1.3, 4);
    }

    // the curve of the Earth below the launch
    for (let i = 0; i < earthShare; i++) {
      const a = lerp(-0.95, 0.95, rand());
      const r = 3.3 - Math.pow(rand(), 2.2) * 0.3;
      const c = mixColor(COOL, HOT, rand() * 0.2);
      w.put(Math.sin(a) * r, Math.cos(a) * r - 4.45, -0.4 + (rand() - 0.5) * 0.1, c, 0.85, 0);
    }

    // planets at different distances, so the lens can pull them out of focus
    const light = [-0.55, 0.45, 0.7];
    const putPlanet = function (share, x, y, z, radius, toneAt, gain) {
      for (let i = 0; i < share; i++) {
        const ny = rand() * 2 - 1;
        const a = rand() * Math.PI;
        const ring = Math.sqrt(1 - ny * ny);
        const nx = Math.cos(a) * ring;
        const nz = Math.sin(a) * ring;
        const lit = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
        w.put(x + nx * radius, y + ny * radius, z + nz * radius, toneAt(ny), gain * (0.04 + lit * lit * 1.3), 0);
      }
    };

    const banded = function (a, b, bands) {
      return function (lat) { return mixColor(a, b, 0.5 + 0.5 * Math.sin(lat * bands)); };
    };

    // close to the lens: huge and soft
    putPlanet(Math.floor(count * 0.03), 0.62, 0.3, 1.75, 0.34, banded([0.95, 0.32, 0.14], [1, 0.62, 0.32], 7), 2);

    // far away, with rings
    const saturn = { x: -0.86, y: 0.46, z: -0.5, r: 0.25 };
    putPlanet(Math.floor(count * 0.05), saturn.x, saturn.y, saturn.z, saturn.r, banded(GOLD, HOT, 16), 1.5);
    const ringShare = Math.floor(count * 0.035);
    for (let i = 0; i < ringShare; i++) {
      const a = rand() * Math.PI * 2;
      const r = saturn.r * lerp(1.35, 2.25, Math.sqrt(rand()));
      if (r > saturn.r * 1.72 && r < saturn.r * 1.82) continue;
      const rx = Math.cos(a) * r;
      const rz = Math.sin(a) * r;
      w.put(saturn.x + rx * 0.94 - rz * 0.1, saturn.y + rx * 0.32 + rz * 0.22, saturn.z + rz * 0.9, GOLD, 1.6, 0);
    }

    // a small, distant blue world
    putPlanet(Math.floor(count * 0.02), 1.5, 0.78, -3.2, 0.2, banded(COOL, HOT, 5), 1.6);

    while (w.remaining()) {
      w.put((rand() - 0.5) * 7, (rand() - 0.5) * 4, -1.5 - rand() * 2.5, HOT, 0.22 + rand() * 0.35, 6);
    }
    return shuffle(w.data);
  };

  const buildWafer = function (count) {
    const w = writer(count);
    const radius = 1.08;
    const pitch = 0.108;

    const hash = function (i, j) {
      const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    // thin-film colors shift across the surface the way a real wafer does
    const film = function (x, z) {
      const t = 0.5 + 0.5 * Math.sin(x * 2.4 + z * 3.1);
      const a = mixColor(GOLD, [1, 0.42, 0.62], t);
      return mixColor(a, COOL, Math.pow(0.5 + 0.5 * Math.sin(x * 3.6 - z * 1.8 + 1.2), 2));
    };

    while (w.remaining()) {
      const pick = rand();
      if (pick < 0.16) {
        const a = rand() * Math.PI * 2;
        const r = radius - rand() * 0.012;
        w.put(Math.cos(a) * r, (rand() - 0.5) * 0.03, Math.sin(a) * r, HOT, 1.25, 5);
        continue;
      }
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * radius;
      let x = Math.cos(a) * r;
      let z = Math.sin(a) * r;

      if (pick < 0.58) {
        // scribe lines between dies
        if (rand() < 0.5) x = Math.round(x / pitch) * pitch;
        else z = Math.round(z / pitch) * pitch;
        if (x * x + z * z > radius * radius) continue;
        w.put(x, (rand() - 0.5) * 0.01, z, mixColor(film(x, z), HOT, 0.3), 1.05, 5);
      } else {
        // die bodies, each at its own brightness
        const die = hash(Math.round(x / pitch - 0.5), Math.round(z / pitch - 0.5));
        w.put(x, (rand() - 0.5) * 0.01, z, film(x, z), 0.22 + die * 0.75, 5);
      }
    }
    return shuffle(w.data);
  };

  const buildGoogle = function (count) {
    const w = writer(count);
    const RED = [0.95, 0.17, 0.12];
    const YELLOW = [1, 0.7, 0.02];
    const GREEN = [0.16, 0.68, 0.3];
    const BLUE = [0.2, 0.48, 1];
    const COLORS = [BLUE, RED, YELLOW, GREEN];
    const outer = 1.05;
    const inner = outer * 0.6;
    const barHalf = outer * 0.2;
    const depth = 0.1;
    const gapEnd = 47;

    const degrees = function (x, y) {
      const a = Math.atan2(y, x) * 180 / Math.PI;
      return a < 0 ? a + 360 : a;
    };

    const inBar = function (x, y) {
      return x >= 0 && Math.abs(y) <= barHalf && x * x + y * y <= outer * outer;
    };

    const inside = function (x, y) {
      if (inBar(x, y)) return true;
      const r = Math.sqrt(x * x + y * y);
      if (r < inner || r > outer) return false;
      return !(x > 0 && y > barHalf && degrees(x, y) < gapEnd);
    };

    const tone = function (x, y) {
      if (inBar(x, y)) return BLUE;
      const a = degrees(x, y);
      if (a >= gapEnd && a < 156) return RED;
      if (a >= 156 && a < 203) return YELLOW;
      if (a >= 203 && a < 310) return GREEN;
      return BLUE;
    };

    const putEdge = function (x, y) {
      const onFace = rand() < 0.7;
      const z = onFace ? (rand() < 0.75 ? depth : -depth) : (rand() * 2 - 1) * depth;
      // the back stays dim so the letter reads as solid
      w.put(x, y, z, tone(x * 0.995, y * 0.995), z < 0 ? 0.3 : 1.05, 0);
    };

    const barTop = Math.sqrt(outer * outer - barHalf * barHalf);
    const barLow = Math.sqrt(inner * inner - barHalf * barHalf);

    while (w.remaining()) {
      const pick = rand();

      if (pick < 0.46) {
        // the two faces
        const x = (rand() * 2 - 1) * outer;
        const y = (rand() * 2 - 1) * outer;
        if (!inside(x, y)) continue;
        const front = rand() < 0.86;
        w.put(x, y, front ? depth : -depth, tone(x, y), front ? 0.62 : 0.14, 0);
      } else if (pick < 0.82) {
        // the outline, extruded so the letter has real depth
        const edge = rand();
        if (edge < 0.5) {
          const a = rand() * Math.PI * 2;
          const x = Math.cos(a) * outer;
          const y = Math.sin(a) * outer;
          if (inside(x * 0.999, y * 0.999)) putEdge(x, y);
        } else if (edge < 0.8) {
          const a = rand() * Math.PI * 2;
          const x = Math.cos(a) * inner;
          const y = Math.sin(a) * inner;
          if (inside(x * 1.002, y * 1.002) && !inBar(x, y)) putEdge(x, y);
        } else if (edge < 0.89) {
          putEdge(rand() * barTop, barHalf);
        } else if (edge < 0.94) {
          putEdge(rand() * barLow, -barHalf);
        } else if (edge < 0.97) {
          putEdge(0, (rand() * 2 - 1) * barHalf);
        } else {
          const r = lerp(inner, outer, rand());
          const a = (gapEnd + 0.2) * Math.PI / 180;
          putEdge(Math.cos(a) * r, Math.sin(a) * r);
        }
      } else if (pick < 0.95) {
        // four comets, one in each color, orbiting the letter
        const i = Math.floor(rand() * 4);
        const trail = Math.pow(rand(), 1.7);
        const a = i * Math.PI / 2 - trail * 1.3;
        const r = 1.62 + (rand() - 0.5) * (0.03 + trail * 0.12);
        w.put(Math.cos(a) * r, (rand() - 0.5) * (0.02 + trail * 0.08), Math.sin(a) * r,
          COLORS[i], 0.2 + (1 - trail) * 2.2, 3);
      } else {
        // a field of stars in the same four colors
        w.put((rand() - 0.5) * 7.5, (rand() - 0.5) * 4.4, -1.4 - rand() * 2.6,
          COLORS[Math.floor(rand() * 4)], 0.35 + rand() * 0.5, 6);
      }
    }
    return shuffle(w.data);
  };



  const buildCap = function (count) {
    const w = writer(count);
    const MAROON = [0.72, 0.08, 0.26];
    const SUN = [1, 0.76, 0.12];
    const half = 1.2;
    const top = 0.3;

    // the plate is a square turned 45 degrees: |x| + |z| = half
    while (w.remaining()) {
      const pick = rand();
      if (pick < 0.34) {
        const u = rand() * 2 - 1;
        const v = rand() * 2 - 1;
        const x = (u + v) * half / 2;
        const z = (u - v) * half / 2;
        const glow = 0.5 + 0.5 * Math.sin(x * 2.2 + z * 1.6);
        w.put(x, top, z, mixColor(MAROON, SUN, glow * 0.22), 0.72, 5);
      } else if (pick < 0.56) {
        const side = Math.floor(rand() * 4);
        const t = rand();
        const corners = [[half, 0], [0, half], [-half, 0], [0, -half], [half, 0]];
        const x = lerp(corners[side][0], corners[side + 1][0], t);
        const z = lerp(corners[side][1], corners[side + 1][1], t);
        w.put(x, top + (rand() - 0.5) * 0.04, z, SUN, 1.15, 5);
      } else if (pick < 0.76) {
        // the skull cap under the plate
        const a = rand() * Math.PI * 2;
        const y = lerp(top - 0.03, -0.2, Math.pow(rand(), 0.8));
        const silhouette = 0.5 + 0.9 * Math.pow(Math.abs(Math.cos(a)), 3);
        w.put(Math.cos(a) * 0.62, y, Math.sin(a) * 0.62, MAROON, silhouette * 1.1, 5);
      } else if (pick < 0.8) {
        const a = rand() * Math.PI * 2;
        w.put(Math.cos(a) * 0.62, -0.2, Math.sin(a) * 0.62, SUN, 1.1, 5);
      } else if (pick < 0.9) {
        // cord from the button to the front corner, then the tassel
        const t = rand();
        if (t < 0.5) {
          w.put(t * 2 * 0.86 + (rand() - 0.5) * 0.012, top + 0.03, (rand() - 0.5) * 0.012, SUN, 1.5, 5);
        } else {
          const drop = (t - 0.5) * 2;
          const spread = drop > 0.62 ? (drop - 0.62) * 0.2 : 0.008;
          w.put(0.86 + (rand() - 0.5) * spread, top + 0.03 - drop * 0.86, (rand() - 0.5) * spread, SUN, 1.4, 5);
        }
      } else if (pick < 0.93) {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 0.06;
        w.put(Math.cos(a) * r, top + 0.03, Math.sin(a) * r, SUN, 1.8, 5);
      } else {
        w.put((rand() - 0.5) * 7, (rand() - 0.5) * 4, -1.5 - rand() * 2.5,
          rand() < 0.5 ? SUN : MAROON, 0.3 + rand() * 0.4, 6);
      }
    }
    return shuffle(w.data);
  };

  const buildLens = function (count) {
    const w = writer(count);
    const aperture = 1;
    const bulge = 0.27;

    while (w.remaining()) {
      const pick = rand();
      const a = rand() * Math.PI * 2;
      if (pick < 0.36) {
        const r = Math.sqrt(rand()) * aperture;
        const sag = bulge * (1 - r * r);
        const c = mixColor(COOL, HOT, r * 0.5);
        w.put((rand() < 0.5 ? -1 : 1) * sag, Math.cos(a) * r, Math.sin(a) * r, c, 0.5 + r * r * 0.5, 0);
      } else if (pick < 0.52) {
        // the metal barrel holding the glass: the opto-mechanical part
        const r = aperture + 0.07;
        w.put((rand() * 2 - 1) * 0.11, Math.cos(a) * r, Math.sin(a) * r, GOLD, 0.95, 0);
      } else if (pick < 0.86) {
        // light rays, focused to a point by the shader
        const ring = 0.25 + Math.floor(rand() * 4) * 0.2;
        const n = Math.floor(rand() * 20) * (Math.PI / 10);
        w.put(rand(), Math.cos(n) * ring, Math.sin(n) * ring, COOL, 1.15, 7);
      } else if (pick < 0.9) {
        // the focal point
        const d = Math.pow(rand(), 2) * 0.09;
        const b = rand() * Math.PI;
        w.put(1.3 + Math.cos(b) * d, Math.sin(b) * Math.cos(a) * d, Math.sin(b) * Math.sin(a) * d, HOT, 2, 0);
      } else {
        w.put((rand() - 0.5) * 7, (rand() - 0.5) * 4, -1.5 - rand() * 2.5, COOL, 0.25 + rand() * 0.35, 6);
      }
    }
    return shuffle(w.data);
  };



  // --------------------
  // Shaders
  // --------------------

  const POINT_VS = `#version 300 es
    precision highp float;
    layout(location = 0) in vec3 aPosA;
    layout(location = 1) in vec3 aColA;
    layout(location = 2) in float aFlagA;
    layout(location = 3) in vec3 aPosB;
    layout(location = 4) in vec3 aColB;
    layout(location = 5) in float aFlagB;
    layout(location = 6) in vec2 aSeed;

    uniform float uMix, uTime, uCamZ, uFocal, uAspect, uPointScale, uScale, uFade, uDof, uFocus;
    uniform mat3 uRot;
    uniform vec2 uOffset, uPointer, uBurst;
    uniform float uPointerForce, uBurstAge;

    out vec3 vCol;
    out float vAlpha;
    out float vBlur;

    const float TAU = 6.2831853;

    vec2 spin(vec2 p, float a) {
      float c = cos(a), s = sin(a);
      return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    }

    vec3 motion(vec3 p, float flag, inout vec3 col) {
      float seed = aSeed.x;
      if (flag < 0.5) return p;
      if (flag < 1.5) {
        p.xy = spin(p.xy - vec2(${GEAR_A.x.toFixed(4)}, 0.0), uTime * ${GEAR_SPEED.toFixed(4)}) + vec2(${GEAR_A.x.toFixed(4)}, 0.0);
        return p;
      }
      if (flag < 2.5) {
        p.xy = spin(p.xy - vec2(${GEAR_B.x.toFixed(4)}, 0.0), -uTime * ${(GEAR_SPEED * GEAR_A.teeth / GEAR_B.teeth).toFixed(4)}) + vec2(${GEAR_B.x.toFixed(4)}, 0.0);
        return p;
      }
      if (flag < 3.5) {
        // comets orbit on a tilted plane around the letter
        p.xz = spin(p.xz, uTime * 0.55);
        p.yz = spin(p.yz, 0.42);
        p.xy = spin(p.xy, -0.18);
        return p;
      }
      if (flag < 4.5) {
        // rocket exhaust: falls and widens, white to orange
        float t = fract(seed * 7.0 + uTime * (0.8 + seed * 0.9));
        p.y -= t * t * 0.55 + t * 0.45;
        p.xz *= 1.0 + t * 2.6;
        col *= mix(vec3(1.0, 0.92, 0.7), vec3(1.0, 0.38, 0.06), t) * (1.0 - t);
        return p;
      }
      if (flag < 5.5) {
        p.xz = spin(p.xz, uTime * 0.2);
        return p;
      }
      if (flag < 6.5) {
        // twinkle
        col *= 0.35 + 1.5 * pow(0.5 + 0.5 * sin(uTime * (0.6 + seed * 2.0) + seed * TAU * 8.0), 6.0);
        return p;
      }
      if (flag < 7.5) {
        // light rays: parallel until the lens, then converging on the focal point
        float t = fract(p.x + uTime * 0.17);
        float x = mix(-2.5, 2.7, t);
        float s = x < 0.0 ? 1.0 : abs(1.0 - x / 1.3);
        col *= mix(vec3(0.6, 0.85, 1.0), vec3(1.6, 1.3, 0.7), step(0.0, x)) * smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.82, t);
        return vec3(x, p.y * s, p.z * s);
      }
      return p;
    }

    void main() {
      float seed = aSeed.x;

      vec3 colA = aColA, colB = aColB;
      vec3 a = motion(aPosA, aFlagA, colA);
      vec3 b = motion(aPosB, aFlagB, colB);

      // particles leave at slightly different moments
      float k = clamp(uMix * 1.6 - seed * 0.6, 0.0, 1.0);
      k = k * k * (3.0 - 2.0 * k);
      float travel = sin(k * 3.14159265);

      vec3 p = mix(a, b, k);
      vec3 col = mix(colA, colB, k);

      // curling flow mid-morph
      vec3 flow = vec3(
        sin(p.y * 2.1 + uTime * 0.9 + seed * TAU),
        sin(p.z * 2.3 - uTime * 0.7 + seed * 9.0),
        sin(p.x * 1.9 + uTime * 0.6 + seed * 4.0));
      p += flow * travel * (0.42 + seed * 0.5);
      p.xz = spin(p.xz, travel * (seed - 0.5) * 2.4);
      col *= 1.0 + travel * 0.5;

      // resting shimmer, and a slow band of light across every shape
      p += sin(uTime * 0.8 + seed * 50.0) * 0.0035 * vec3(seed, 1.0 - seed, 0.5);
      float band = 0.5 + 0.5 * sin(dot(p, vec3(1.1, 0.75, 0.35)) * 1.7 - uTime * 0.95);
      col *= 1.0 + 1.5 * pow(band, 14.0);

      p = uRot * (p * uScale);

      float w = uCamZ - p.z;
      vec2 ndc = vec2(p.x * uFocal / uAspect, p.y * uFocal) / max(w, 0.02) + uOffset;

      // the cursor parts the field and drags it around slightly
      vec2 toPoint = (ndc - uPointer) * vec2(uAspect, 1.0);
      float dist = length(toPoint) + 0.0001;
      vec2 dir = toPoint / dist;
      float near = exp(-dist * dist / 0.05) * uPointerForce;
      vec2 push = dir * near * (0.09 + seed * 0.13) + vec2(-dir.y, dir.x) * near * 0.05 * (seed - 0.5);

      // click shockwave
      vec2 toBurst = (ndc - uBurst) * vec2(uAspect, 1.0);
      float burstDist = length(toBurst) + 0.0001;
      float ring = uBurstAge * 1.7;
      float wave = exp(-pow((burstDist - ring) * 5.5, 2.0)) * (1.0 - clamp(uBurstAge, 0.0, 1.0));
      push += toBurst / burstDist * wave * (0.16 + seed * 0.2);
      col *= 1.0 + wave * 1.6 + near * 0.8;

      ndc += push / vec2(uAspect, 1.0);

      gl_Position = vec4(ndc, 0.0, 1.0);
      if (w < 0.04) gl_Position = vec4(3.0, 3.0, 0.0, 1.0);

      float sharpSize = clamp(uPointScale * (0.55 + aSeed.y * aSeed.y * 1.6) * (1.0 + travel * 0.7) / max(w, 0.2), 1.0, 40.0);

      // depth of field: away from the focal plane each point opens into a soft
      // disc, spreading the same light over a larger area
      float circle = uDof * abs(w - uFocus) / max(w, 0.3);
      float size = min(sharpSize + circle * uPointScale * 15.0, 110.0);
      gl_PointSize = size;
      vBlur = smoothstep(0.02, 0.45, circle);
      float spread = pow(sharpSize / size, 1.65);

      float fog = exp(-max(w - 3.4, 0.0) * 0.13);
      float closeFade = smoothstep(0.1, 0.9, w);
      vCol = col;
      vAlpha = fog * closeFade * uFade * spread;
    }`;

  const POINT_FS = `#version 300 es
    precision mediump float;
    in vec3 vCol;
    in float vAlpha;
    in float vBlur;
    out vec4 outColor;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float soft = smoothstep(0.5, 0.0, d);
      soft *= soft;
      float a = mix(soft, smoothstep(0.5, 0.4, d) * 0.55, vBlur);
      outColor = vec4(vCol * a * vAlpha * 1.9, 1.0);
    }`;

  const QUAD_VS = `#version 300 es
    out vec2 vUv;
    void main() {
      vec2 p = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0);
      vUv = p * 0.5 + 0.5;
      gl_Position = vec4(p, 0.0, 1.0);
    }`;

  const BLUR_FS = `#version 300 es
    precision mediump float;
    in vec2 vUv;
    out vec4 outColor;
    uniform sampler2D uTex;
    uniform vec2 uDir;
    void main() {
      vec3 c = texture(uTex, vUv).rgb * 0.227;
      c += (texture(uTex, vUv + uDir * 1.385).rgb + texture(uTex, vUv - uDir * 1.385).rgb) * 0.316;
      c += (texture(uTex, vUv + uDir * 3.231).rgb + texture(uTex, vUv - uDir * 3.231).rgb) * 0.070;
      outColor = vec4(c, 1.0);
    }`;

  const COMPOSITE_FS = `#version 300 es
    precision mediump float;
    in vec2 vUv;
    out vec4 outColor;
    uniform sampler2D uScene, uGlow;
    uniform float uGlowGain;
    void main() {
      vec3 c = texture(uScene, vUv).rgb + texture(uGlow, vUv).rgb * uGlowGain;
      vec2 q = vUv - 0.5;
      c *= 1.0 - dot(q, q) * 0.9;
      c = 1.0 - exp(-c * 1.25);
      outColor = vec4(c + vec3(0.016, 0.016, 0.022), 1.0);
    }`;

  const compile = function (gl, vs, fs) {
    const program = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (pair) {
      const shader = gl.createShader(pair[0]);
      gl.shaderSource(shader, pair[1]);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      gl.attachShader(program, shader);
    });
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
  };

  const uniforms = function (gl, program, names) {
    const map = {};
    names.forEach(function (n) { map[n] = gl.getUniformLocation(program, n); });
    return map;
  };

  const makeTarget = function (gl, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture: texture, framebuffer: framebuffer, width: width, height: height };
  };



  // --------------------
  // Page chrome
  // --------------------

  const buildDom = function () {
    const root = document.createElement('div');
    root.id = 'hero';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Career journey intro');

    const rail = STAGES.map(function (stage, i) {
      if (!stage) return '';
      return '<button class="hero-rail-node" type="button" data-stage="' + i + '">' +
        '<span class="hero-rail-dot"></span>' +
        '<span class="hero-rail-label">' + stage.label + '<small>' + stage.year + '</small></span>' +
        '</button>';
    }).join('');

    root.classList.toggle('hero-dense', journey.length > 4);

    root.innerHTML =
      '<canvas class="hero-canvas" aria-hidden="true"></canvas>' +
      '<div class="hero-scrim"></div>' +
      '<div class="hero-title">' +
        '<p class="hero-title-role">Senior Mechanical Engineer, Google</p>' +
        '<p class="hero-title-hint"></p>' +
      '</div>' +
      '<div class="hero-year" aria-hidden="true"></div>' +
      '<div class="hero-panel" aria-live="polite">' +
        '<p class="hero-kicker"></p>' +
        '<h2 class="hero-company"></h2>' +
        '<p class="hero-role"></p>' +
        '<button class="hero-enter" type="button">Enter portfolio<span aria-hidden="true">&rarr;</span></button>' +
      '</div>' +
      '<div class="hero-rail"><div class="hero-rail-line"><div class="hero-rail-fill"></div></div>' + rail + '</div>' +
      '<button class="hero-skip" type="button">Skip intro &amp; enter portfolio</button>';

    document.body.appendChild(root);
    return root;
  };

  const addReplayButton = function () {
    if (document.querySelector('.hero-replay')) return;
    const button = document.createElement('button');
    button.className = 'hero-replay';
    button.type = 'button';
    button.textContent = 'Replay journey';
    button.addEventListener('click', function () { start(); });
    (document.querySelector('.sidebar-info_more') || document.body).appendChild(button);
  };



  // --------------------
  // Journey
  // --------------------

  let running = false;

  const start = async function () {
    if (running) return;
    running = true;

    document.documentElement.classList.add('hero-open');
    const root = buildDom();
    releaseBoot();
    const canvas = root.querySelector('.hero-canvas');

    const gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance'
    });

    const abort = function () {
      root.remove();
      running = false;
      document.documentElement.classList.remove('hero-open');
      releaseBoot();
    };

    if (!gl) { abort(); return; }

    // the name is drawn with the site's font, so give it a moment to arrive
    try {
      await Promise.race([
        document.fonts.load('600 230px Poppins'),
        new Promise(function (resolve) { setTimeout(resolve, 1500); })
      ]);
    } catch (e) { /* fall back to a system font */ }

    const portrait = window.innerWidth < window.innerHeight;
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    const total = small ? 42000 : 90000;
    let drawCount = total;

    let pointProgram;
    let blurProgram;
    let compositeProgram;
    try {
      pointProgram = compile(gl, POINT_VS, POINT_FS);
      blurProgram = compile(gl, QUAD_VS, BLUR_FS);
      compositeProgram = compile(gl, QUAD_VS, COMPOSITE_FS);
    } catch (e) {
      console.error('Hero intro unavailable:', e);
      abort();
      return;
    }

    const u = uniforms(gl, pointProgram, ['uMix', 'uTime', 'uCamZ', 'uFocal', 'uAspect', 'uPointScale',
      'uScale', 'uFade', 'uDof', 'uFocus', 'uRot', 'uOffset', 'uPointer', 'uBurst', 'uPointerForce', 'uBurstAge']);
    const uBlur = uniforms(gl, blurProgram, ['uTex', 'uDir']);
    const uComposite = uniforms(gl, compositeProgram, ['uScene', 'uGlow', 'uGlowGain']);

    const builders = {
      dust: buildDust,
      name: function (count) { return buildName(count, portrait); },
      gears: buildGears,
      cap: buildCap,
      rocket: buildRocket,
      lens: buildLens,
      wafer: buildWafer,
      google: buildGoogle
    };

    const shapes = SHAPES.map(function (name) { return builders[name](total); }).map(function (data) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return buffer;
    });

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const seeds = new Float32Array(total * 2);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
    const seedBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(6);
    gl.vertexAttribPointer(6, 2, gl.FLOAT, false, 0, 0);
    for (let i = 0; i < 6; i++) gl.enableVertexAttribArray(i);

    let boundPair = -1;
    const bindPair = function (index) {
      if (boundPair === index) return;
      boundPair = index;
      const stride = FLOATS_PER_POINT * 4;
      [index, index + 1].forEach(function (shape, side) {
        const base = side * 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, shapes[shape]);
        gl.vertexAttribPointer(base, 3, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(base + 1, 3, gl.FLOAT, false, stride, 12);
        gl.vertexAttribPointer(base + 2, 1, gl.FLOAT, false, stride, 24);
      });
    };

    const emptyVao = gl.createVertexArray();

    let dprCap = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    let scene = null;
    let glowA = null;
    let glowB = null;
    let aspect = 1;
    let pointScale = 1;

    const deleteTarget = function (target) {
      if (!target) return;
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    };

    const sceneScale = function () {
      return portrait ? clamp(aspect / 1.05, 0.45, 1) : clamp(aspect / 1.5, 0.72, 1);
    };

    const resize = function () {
      const width = Math.round(window.innerWidth * dprCap);
      const height = Math.round(window.innerHeight * dprCap);
      canvas.width = width;
      canvas.height = height;
      aspect = width / height;
      pointScale = 4.4 * dprCap * clamp(window.innerHeight / 860, 0.72, 1.4);

      // sit the subtitle just under the drawn name
      const nameHalfHeight = (portrait ? 0.6875 : 0.186) * sceneScale() * 2.41 / 3.3;
      root.querySelector('.hero-title').style.top =
        Math.round(window.innerHeight / 2 * (1 + nameHalfHeight) + 26) + 'px';

      [scene, glowA, glowB].forEach(deleteTarget);
      scene = makeTarget(gl, width, height);
      const glowWidth = Math.max(2, Math.round(width / 4));
      const glowHeight = Math.max(2, Math.round(height / 4));
      glowA = makeTarget(gl, glowWidth, glowHeight);
      glowB = makeTarget(gl, glowWidth, glowHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const quad = function (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };



    // --------------------
    // State
    // --------------------

    let progress = 0;
    let target = 0;
    let autoPause = 0;
    let holdLeft = 0.4;
    let time = 0;
    let last = performance.now();
    let frameTimes = 0;
    let frameSamples = 0;
    let exitStart = 0;
    let exitLength = 0;
    let frame = 0;

    const pointer = { x: 9, y: 9, sx: 9, sy: 9, force: 0, active: false };
    const parallax = { x: 0, y: 0 };
    const drag = { x: 0, y: 0, on: false, moved: false, startX: 0, startY: 0, lastX: 0, lastY: 0, type: 'mouse' };
    let burst = { x: 0, y: 0, age: 9 };
    let overscroll = 0;
    let snapTimer = null;

    const el = {
      title: root.querySelector('.hero-title'),
      hint: root.querySelector('.hero-title-hint'),
      year: root.querySelector('.hero-year'),
      panel: root.querySelector('.hero-panel'),
      kicker: root.querySelector('.hero-kicker'),
      company: root.querySelector('.hero-company'),
      role: root.querySelector('.hero-role'),
      enter: root.querySelector('.hero-enter'),
      rail: root.querySelector('.hero-rail'),
      railFill: root.querySelector('.hero-rail-fill'),
      railNodes: root.querySelectorAll('.hero-rail-node'),
      skip: root.querySelector('.hero-skip')
    };

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    el.hint.textContent = coarse ? 'Swipe through the years, or just watch. Tap anywhere.' : 'Scroll through the years, or just watch. Move your cursor. Click anywhere.';



    // --------------------
    // Panel
    // --------------------

    let shownStage = -1;

    const showStage = function (index) {
      shownStage = index;
      const stage = STAGES[index];
      if (!stage) return;
      el.kicker.textContent = stage.kicker;
      el.company.textContent = stage.company;
      el.role.textContent = stage.role;
      el.enter.hidden = index !== LAST_STAGE;
      root.style.setProperty('--hero-panel-space', el.panel.offsetHeight + 'px');
      el.railNodes.forEach(function (node) {
        const i = Number(node.dataset.stage);
        node.classList.toggle('is-active', i === index);
        node.classList.toggle('is-past', i < index);
        if (i === index) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
      });
    };

    const updateChrome = function () {
      const nearest = Math.round(progress);
      const settled = Math.abs(progress - nearest) < 0.2;

      if (settled && nearest !== shownStage) showStage(nearest);

      const panelOn = settled && !!STAGES[nearest] && nearest === shownStage;
      el.panel.classList.toggle('is-in', panelOn);
      root.classList.toggle('is-final', nearest === LAST_STAGE && settled);
      root.classList.toggle('is-journey', progress > 1.5);
      el.title.classList.toggle('is-in', Math.abs(progress - 1) < 0.2);

      // the year ticks forward while the shape is morphing
      if (progress >= 1.5) {
        const i = clamp(Math.floor(progress), 2, LAST_STAGE - 1);
        const t = clamp(progress - i, 0, 1);
        const y = Math.round(lerp(STAGES[i].year, STAGES[i + 1].year, t));
        const text = String(y);
        if (el.year.textContent !== text) el.year.textContent = text;
      }

      el.railFill.style.transform = 'scaleX(' + clamp((progress - 2) / (LAST_STAGE - 2), 0, 1) + ')';
    };



    // --------------------
    // Input
    // --------------------

    // the visitor drives; the journey carries on by itself once they stop
    const RESUME_SECONDS = 6;
    const takeControl = function () {
      autoPause = RESUME_SECONDS;
      holdLeft = 0;
    };

    const goTo = function (index) {
      takeControl();
      target = clamp(index, FIRST_STAGE, LAST_STAGE);
      overscroll = 0;
    };

    const snapSoon = function () {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () { target = Math.round(target); }, 170);
    };

    const onWheel = function (e) {
      e.preventDefault();
      takeControl();
      const delta = clamp(e.deltaY, -120, 120);
      if (delta > 0 && target >= LAST_STAGE && progress > LAST_STAGE - 0.05) {
        overscroll += delta;
        if (overscroll > 420) leave();
        return;
      }
      overscroll = 0;
      target = clamp(target + delta * 0.0024, FIRST_STAGE, LAST_STAGE);
      snapSoon();
    };

    const toNdc = function (e) {
      return { x: e.clientX / window.innerWidth * 2 - 1, y: 1 - e.clientY / window.innerHeight * 2 };
    };

    const onPointerMove = function (e) {
      const p = toNdc(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
      parallax.x = p.x;
      parallax.y = p.y;

      if (!drag.on) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 6) drag.moved = true;
      if (!drag.moved) return;

      if (drag.type === 'touch') {
        takeControl();
        target = clamp(target - dy * 0.0065, FIRST_STAGE, LAST_STAGE);
        drag.y += dx * 0.004;
      } else {
        takeControl();
        drag.y += dx * 0.005;
        drag.x += dy * 0.005;
      }
    };

    const onPointerDown = function (e) {
      if (e.target !== canvas) return;
      drag.on = true;
      drag.moved = false;
      drag.type = e.pointerType;
      drag.startX = drag.lastX = e.clientX;
      drag.startY = drag.lastY = e.clientY;
      canvas.classList.add('is-dragging');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* already released */ }
      onPointerMove(e);
    };

    const onPointerUp = function (e) {
      if (!drag.on) return;
      drag.on = false;
      canvas.classList.remove('is-dragging');
      if (drag.type === 'touch') {
        pointer.active = false;
        target = Math.round(target);
      }
      if (!drag.moved) {
        const p = toNdc(e);
        burst = { x: p.x, y: p.y, age: 0 };
      }
    };

    const onPointerLeave = function () { pointer.active = false; };

    const onKey = function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (e.target.tagName === 'BUTTON' && e.key === ' ') return;
        e.preventDefault();
        goTo(Math.round(target) + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(Math.round(target) - 1);
      } else if (e.key === 'Escape') {
        leave();
      }
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('keydown', onKey);
    el.skip.addEventListener('click', function () { leave(); });
    el.enter.addEventListener('click', function () { leave(); });
    el.railNodes.forEach(function (node) {
      node.addEventListener('click', function () { goTo(Number(node.dataset.stage)); });
    });



    // --------------------
    // Exit
    // --------------------

    let finished = false;

    const finish = function () {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('keydown', onKey);
      clearTimeout(snapTimer);
      const context = gl.getExtension('WEBGL_lose_context');
      if (context) context.loseContext();
      root.remove();
      document.documentElement.classList.remove('hero-open');
      running = false;
      addReplayButton();
    };

    const leave = function () {
      if (exitStart) return;
      exitLength = progress > LAST_STAGE - 0.5 ? 1.5 : 0.9;
      exitStart = performance.now();
      root.classList.add('is-leaving');
      // real time, so a slow device can't get stuck behind the intro
      setTimeout(finish, exitLength * 1000 + 300);
      storageSet(SEEN_KEY, '1');
      // reveal the site underneath so it plays its entrance as the camera arrives
      setTimeout(function () {
        document.dispatchEvent(new CustomEvent('hero:exit'));
      }, exitLength * 450);
    };



    // --------------------
    // Render loop
    // --------------------

    const rotation = function (rx, ry, rz) {
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cz = Math.cos(rz), sz = Math.sin(rz);
      // column-major Rz * Rx * Ry
      return new Float32Array([
        cz * cy - sz * sx * sy, sz * cy + cz * sx * sy, -cx * sy,
        -sz * cx, cz * cx, sx,
        cz * sy + sz * sx * cy, sz * sy - cz * sx * cy, cx * cy
      ]);
    };

    const tick = function (now) {
      if (finished) return;
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;

      // thin the field on devices that can't hold frame rate
      if (frameSamples < 90 && time > 1) {
        frameTimes += dt;
        frameSamples++;
        if (frameSamples === 90 && frameTimes / 90 > 0.03) {
          drawCount = Math.floor(total * 0.55);
          dprCap = Math.min(dprCap, 1);
          resize();
        }
      }

      if (autoPause > 0) {
        autoPause -= dt;
      } else {
        holdLeft -= dt;
        if (holdLeft <= 0 && target < LAST_STAGE) {
          target = Math.round(target) + 1;
          holdLeft = target === 1 ? INTRO_SECONDS : STOP_SECONDS;
        }
      }

      progress += (target - progress) * (1 - Math.exp(-dt * MORPH_SPEED));
      if (Math.abs(target - progress) < 0.001) progress = target;

      updateChrome();

      const index = clamp(Math.floor(progress), 0, LAST_STAGE - 1);
      const mix = progress - index;
      const blend = smooth(clamp(mix, 0, 1));
      const a = VIEWS[index];
      const b = VIEWS[index + 1];

      // pointer parallax and drag; drag eases home after release
      if (!drag.on) {
        drag.x *= Math.exp(-dt * 1.4);
        drag.y *= Math.exp(-dt * 1.4);
      }
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 9));
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 9));
      pointer.force += ((pointer.active ? 1 : 0) - pointer.force) * (1 - Math.exp(-dt * 6));
      burst.age += dt * 0.85;

      const sway = Math.sin(time * 0.31) * 0.05;
      const rx = lerp(a.rx, b.rx, blend) - parallax.y * 0.1 + drag.x;
      const ry = lerp(a.ry, b.ry, blend) + parallax.x * 0.16 + sway + drag.y;
      const rz = lerp(a.rz, b.rz, blend);

      const dof = lerp(a.dof, b.dof, blend);
      const side = lerp(a.side, b.side, blend);
      const offsetX = portrait ? 0 : side;
      const offsetY = portrait ? side * 0.72 : 0;

      let camZ = 3.3;
      if (exitStart) {
        const p = clamp((now - exitStart) / 1000 / exitLength, 0, 1);
        camZ -= p * p * (index >= LAST_STAGE - 1 ? 12 : 7);
        if (p >= 1) { finish(); return; }
      }

      // ---- particles
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);
      gl.viewport(0, 0, scene.width, scene.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(pointProgram);
      gl.bindVertexArray(vao);
      bindPair(index);
      gl.uniform1f(u.uMix, mix);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uCamZ, camZ);
      gl.uniform1f(u.uFocal, 2.41);
      gl.uniform1f(u.uAspect, aspect);
      gl.uniform1f(u.uPointScale, pointScale);
      gl.uniform1f(u.uScale, sceneScale());
      gl.uniform1f(u.uFade, clamp(time / 0.4, 0, 1) * total / drawCount);
      gl.uniform1f(u.uDof, dof);
      gl.uniform1f(u.uFocus, 3.3);
      gl.uniformMatrix3fv(u.uRot, false, rotation(rx, ry, rz));
      gl.uniform2f(u.uOffset, offsetX, offsetY);
      gl.uniform2f(u.uPointer, pointer.sx, pointer.sy);
      gl.uniform1f(u.uPointerForce, pointer.force);
      gl.uniform2f(u.uBurst, burst.x, burst.y);
      gl.uniform1f(u.uBurstAge, burst.age);
      gl.drawArrays(gl.POINTS, 0, drawCount);

      // ---- glow: blur a quarter-size copy, then add it over the scene
      gl.disable(gl.BLEND);
      gl.bindVertexArray(emptyVao);
      gl.useProgram(blurProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(uBlur.uTex, 0);

      gl.bindTexture(gl.TEXTURE_2D, scene.texture);
      gl.uniform2f(uBlur.uDir, 1 / glowA.width, 0);
      quad(glowA);
      gl.bindTexture(gl.TEXTURE_2D, glowA.texture);
      gl.uniform2f(uBlur.uDir, 0, 1 / glowA.height);
      quad(glowB);
      gl.bindTexture(gl.TEXTURE_2D, glowB.texture);
      gl.uniform2f(uBlur.uDir, 2 / glowA.width, 0);
      quad(glowA);
      gl.bindTexture(gl.TEXTURE_2D, glowA.texture);
      gl.uniform2f(uBlur.uDir, 0, 2 / glowA.height);
      quad(glowB);

      gl.useProgram(compositeProgram);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, glowB.texture);
      gl.uniform1i(uComposite.uGlow, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);
      gl.uniform1i(uComposite.uScene, 0);
      gl.uniform1f(uComposite.uGlowGain, 1.55);
      quad(null);
    };

    frame = requestAnimationFrame(tick);
    root.classList.add('is-ready');
  };



  // --------------------
  // Boot
  // --------------------

  const params = new URLSearchParams(window.location.search);
  const forced = params.has('intro');
  const webgl2 = !!window.WebGL2RenderingContext;

  if (reducedMotion() || !webgl2) {
    releaseBoot();
    return;
  }

  if (storageGet(SEEN_KEY) && !forced) {
    releaseBoot();
    addReplayButton();
    return;
  }

  start().catch(function (e) {
    console.error('Hero intro failed:', e);
    const root = document.getElementById('hero');
    if (root) root.remove();
    document.documentElement.classList.remove('hero-open');
    running = false;
    releaseBoot();
  });

})();
