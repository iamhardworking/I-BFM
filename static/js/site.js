const presets = {
  low: {
    value: 0.26,
    video: "static/video/z2z-low.mp4",
    csv: "static/data/z2z-low.csv",
    summary: "static/data/z2z-low-summary.json",
  },
  mid: {
    value: 0.55,
    video: "static/video/z2z-mid.mp4",
    csv: "static/data/z2z-mid.csv",
    summary: "static/data/z2z-mid-summary.json",
  },
  high: {
    value: 0.72,
    video: "static/video/z2z-high.mp4",
    csv: "static/data/z2z-high.csv",
    summary: "static/data/z2z-high-summary.json",
  },
};

const phaseColors = {
  approach: "#79e5ea",
  lift: "#d9ff43",
  transport: "#f7aa59",
  place: "#c29cff",
  complete: "#67de92",
};

document.querySelectorAll("video[autoplay]").forEach((video) => {
  video.play().catch(() => {});
});

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
  { threshold: 0.08 }
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    document.querySelectorAll(".chapter-nav a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-30% 0px -55%", threshold: [0, 0.2, 0.6] }
);
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

document.querySelectorAll(".overview-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".overview-tabs button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".overview-panel").forEach((panel) => {
      const active = panel.id === button.getAttribute("aria-controls");
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    if (button.id === "overview-tab-video") {
      document.querySelector(".feature-video")?.play().catch(() => {});
    } else {
      document.querySelector(".feature-video")?.pause();
    }
  });
});

const soundToggle = document.querySelector(".sound-toggle");
const featureVideo = document.querySelector(".feature-video");
soundToggle?.addEventListener("click", () => {
  featureVideo.muted = !featureVideo.muted;
  soundToggle.textContent = featureVideo.muted ? "Sound off" : "Sound on";
  featureVideo.play().catch(() => {});
});

document.querySelectorAll(".lab-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".lab-tabs button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".lab-panel").forEach((panel) => {
      const active = panel.id === button.getAttribute("aria-controls");
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    if (button.id === "tab-manual") document.querySelector("#manual-stage")?.focus();
  });
});

const z2zVideo = document.querySelector("#z2z-video");
const heightSlider = document.querySelector("#height-slider");
const heightOutput = document.querySelector("#height-output");
const heightPath = document.querySelector("#height-path");
const distancePath = document.querySelector("#distance-path");
const tracePlayhead = document.querySelector("#trace-playhead");
let activeTrace = [];
let activePreset = "low";
let loadSerial = 0;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const stride = Math.max(1, Math.floor((lines.length - 1) / 500));
  const rows = [];
  for (let i = 1; i < lines.length; i += stride) {
    const values = lines[i].split(",");
    rows.push({
      time: Number(values[index.time_s]),
      phase: values[index.phase_after],
      height: Number(values[index.object_height_m]),
      distance: Number(values[index.goal_distance_m]),
    });
  }
  const finalValues = lines.at(-1).split(",");
  const finalRow = {
    time: Number(finalValues[index.time_s]),
    phase: finalValues[index.phase_after],
    height: Number(finalValues[index.object_height_m]),
    distance: Number(finalValues[index.goal_distance_m]),
  };
  if (rows.at(-1)?.time !== finalRow.time) rows.push(finalRow);
  return rows.filter((row) => Object.values(row).every((value) => typeof value === "string" || Number.isFinite(value)));
}

function pathFor(trace, key, maximum) {
  if (!trace.length) return "";
  const maxTime = trace.at(-1).time || 1;
  return trace.map((row, i) => {
    const x = 20 + (row.time / maxTime) * 860;
    const y = 176 - Math.min(row[key] / maximum, 1) * 150;
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function drawTrace(trace) {
  const maxHeight = Math.max(1, ...trace.map((row) => row.height));
  const maxDistance = Math.max(1, ...trace.map((row) => row.distance));
  heightPath.setAttribute("d", pathFor(trace, "height", maxHeight));
  distancePath.setAttribute("d", pathFor(trace, "distance", maxDistance));

  const grid = document.querySelector(".grid-lines");
  grid.innerHTML = [26, 76, 126, 176].map((y) => `<line x1="20" y1="${y}" x2="880" y2="${y}"></line>`).join("");

  const bands = [];
  let start = 0;
  for (let i = 1; i <= trace.length; i += 1) {
    if (i === trace.length || trace[i].phase !== trace[start].phase) {
      const x = 20 + (start / (trace.length - 1)) * 860;
      const width = Math.max(2, ((i - start) / (trace.length - 1)) * 860);
      bands.push(`<rect class="phase-band" x="${x}" y="16" width="${width}" height="168" fill="${phaseColors[trace[start].phase] || "#999"}"></rect>`);
      start = i;
    }
  }
  document.querySelector("#phase-bands").innerHTML = bands.join("");
}

async function setPreset(name, autoplay = true) {
  const preset = presets[name];
  const serial = ++loadSerial;
  activePreset = name;
  heightSlider.value = preset.value;
  heightOutput.value = `${preset.value.toFixed(2)} m`;
  document.querySelectorAll(".preset").forEach((button) => button.classList.toggle("active", button.dataset.preset === name));
  z2zVideo.src = preset.video;
  z2zVideo.load();
  if (autoplay) z2zVideo.play().catch(() => {});

  try {
    const [csvResponse, summaryResponse] = await Promise.all([fetch(preset.csv), fetch(preset.summary)]);
    if (!csvResponse.ok || !summaryResponse.ok) throw new Error("Trace asset unavailable");
    const [csv, summary] = await Promise.all([csvResponse.text(), summaryResponse.json()]);
    if (serial !== loadSerial) return;
    activeTrace = parseCsv(csv);
    drawTrace(activeTrace);
    document.querySelector("#metric-outcome").textContent = summary.completed ? "Completed" : `Window ended / ${summary.final_phase}`;
    document.querySelector("#metric-distance").textContent = `${summary.final_goal_distance.toFixed(2)} m`;
    document.querySelector("#metric-contact").textContent = summary.transport_bilateral_contact_rate == null ? "n/a" : `${(summary.transport_bilateral_contact_rate * 100).toFixed(1)}%`;
    document.querySelector("#metric-horizon").textContent = `${(summary.step_count * 0.02).toFixed(1)} s`;
  } catch (error) {
    document.querySelector("#z2z-phase").textContent = "SERVE VIA HTTP TO LOAD TRACE";
  }
}

document.querySelectorAll(".preset").forEach((button) => button.addEventListener("click", () => setPreset(button.dataset.preset)));
heightSlider?.addEventListener("input", () => {
  const value = Number(heightSlider.value);
  const nearest = Object.entries(presets).sort((a, b) => Math.abs(a[1].value - value) - Math.abs(b[1].value - value))[0][0];
  heightOutput.value = `${value.toFixed(2)} m`;
  if (nearest !== activePreset) setPreset(nearest);
});
document.querySelector("#random-preset")?.addEventListener("click", () => {
  const choices = Object.keys(presets).filter((name) => name !== activePreset);
  setPreset(choices[Math.floor(Math.random() * choices.length)]);
});

z2zVideo?.addEventListener("timeupdate", () => {
  if (!activeTrace.length || !z2zVideo.duration) return;
  const progress = z2zVideo.currentTime / z2zVideo.duration;
  const x = 20 + progress * 860;
  tracePlayhead.setAttribute("x1", x);
  tracePlayhead.setAttribute("x2", x);
  const traceTime = progress * activeTrace.at(-1).time;
  const row = activeTrace.reduce((best, item) => Math.abs(item.time - traceTime) < Math.abs(best.time - traceTime) ? item : best, activeTrace[0]);
  document.querySelector("#z2z-phase").textContent = `PHASE / ${row.phase.toUpperCase()}`;
});

setPreset("low");

const manual = {
  x: 28,
  y: 72,
  angle: 0,
  phase: "approach",
  held: new Set(),
  timer: null,
};
const robot = document.querySelector("#robot-object");
const box = document.querySelector("#box-object");
const manualStage = document.querySelector("#manual-stage");
const manualMessage = document.querySelector("#manual-message");
const activeLatent = document.querySelector("#active-latent");

function renderManual() {
  robot.style.left = `${manual.x}%`;
  robot.style.top = `${manual.y}%`;
  robot.style.transform = `translate(-50%,-50%) rotate(${manual.angle}deg)`;
  if (["lift", "transport"].includes(manual.phase)) {
    box.style.left = `${manual.x}%`;
    box.style.top = `${manual.y}%`;
    box.classList.add("carried");
  } else {
    box.classList.remove("carried");
  }
  document.querySelector("#manual-phase").textContent = `PHASE / ${manual.phase.toUpperCase()}`;
  document.querySelectorAll(".state-rail [data-phase]").forEach((node) => node.classList.toggle("active", node.dataset.phase === manual.phase));
}

function setManualPhase(phase, message) {
  manual.phase = phase;
  const latentByPhase = {
    approach: "z_empty_idle",
    lift: "z_lift",
    transport: "z_transport + manual_motion",
    place: "z_align → z_lower → z_place",
  };
  activeLatent.textContent = latentByPhase[phase];
  manualMessage.textContent = message;
  renderManual();
}

function manualAction(key) {
  if (key === "ArrowDown" || key === " " || key === "Spacebar") {
    manual.held.clear();
    manualMessage.textContent = "Motion stopped; the current interaction phase is preserved.";
  }
  if (key.toLowerCase() === "b") {
    if (manual.phase !== "approach") {
      manualMessage.textContent = `Lift ignored while phase=${manual.phase}.`;
      return;
    }
    clearTimeout(manual.timer);
    setManualPhase("lift", "Lift requested without pose gating; blending into transport.");
    manual.timer = setTimeout(() => setManualPhase("transport", "Transport active. Use ↑ with ←/→ to curve."), 800);
  }
  if (key.toLowerCase() === "f") {
    if (manual.phase !== "transport") {
      manualMessage.textContent = `Place ignored while phase=${manual.phase}.`;
      return;
    }
    clearTimeout(manual.timer);
    setManualPhase("place", "Aligning, lowering, then releasing at the current box XY.");
    manual.timer = setTimeout(() => setManualPhase("approach", "Placement released. Empty-hand approach restored."), 1500);
  }
  if (key.toLowerCase() === "r") resetManual();
  if (key.toLowerCase() === "p") {
    manualMessage.textContent = "phase=" + manual.phase + " · x=" + manual.x.toFixed(1) + " · y=" + manual.y.toFixed(1) + " · turn_blend=0.65";
  }
}

function resetManual() {
  clearTimeout(manual.timer);
  Object.assign(manual, { x: 28, y: 72, angle: 0, phase: "approach" });
  box.style.left = "50%";
  box.style.top = "50%";
  manual.held.clear();
  setManualPhase("approach", "Move toward the object, then request lift.");
}

function manualLoop() {
  if (manual.held.has("ArrowLeft")) manual.angle -= 2.4;
  if (manual.held.has("ArrowRight")) manual.angle += 2.4;
  if (manual.held.has("ArrowUp")) {
    const radians = (manual.angle - 90) * Math.PI / 180;
    manual.x = Math.min(96, Math.max(4, manual.x + Math.cos(radians) * .24));
    manual.y = Math.min(94, Math.max(8, manual.y + Math.sin(radians) * .24));
  }
  renderManual();
  requestAnimationFrame(manualLoop);
}

document.addEventListener("keydown", (event) => {
  if (document.querySelector("#panel-manual").hidden) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "b", "B", "f", "F", "r", "R", "p", "P"].includes(event.key)) event.preventDefault();
  if (["ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) manual.held.add(event.key);
  if (!event.repeat) manualAction(event.key);
  document.querySelector(`[data-key="${event.key.length === 1 ? event.key.toLowerCase() : event.key}"]`)?.classList.add("pressed");
});
document.addEventListener("keyup", (event) => {
  manual.held.delete(event.key);
  document.querySelector(`[data-key="${event.key.length === 1 ? event.key.toLowerCase() : event.key}"]`)?.classList.remove("pressed");
});

document.querySelectorAll(".key").forEach((button) => {
  const key = button.dataset.key;
  const press = (event) => {
    event.preventDefault();
    button.classList.add("pressed");
    if (["ArrowUp", "ArrowLeft", "ArrowRight"].includes(key)) manual.held.add(key);
    manualAction(key);
  };
  const release = () => {
    button.classList.remove("pressed");
    manual.held.delete(key);
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
});
document.querySelector("#manual-reset")?.addEventListener("click", resetManual);
manualStage?.addEventListener("click", () => manualStage.focus());
resetManual();
manualLoop();
