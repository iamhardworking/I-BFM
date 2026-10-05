document.querySelectorAll("video[autoplay]").forEach((video) => {
  video.play().catch(() => {});
});

const autoplayOnViewVideos = document.querySelectorAll("video[data-autoplay-on-view]");
const playVisibleVideo = (video) => {
  video.muted = true;
  video.play().catch(() => {});
};
const autoplayObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting && !document.hidden) playVisibleVideo(entry.target);
    else entry.target.pause();
  }),
  { rootMargin: "100px 0px", threshold: 0.1 }
);
autoplayOnViewVideos.forEach((video) => autoplayObserver.observe(video));
document.addEventListener("visibilitychange", () => {
  autoplayOnViewVideos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    if (!document.hidden && rect.bottom > 0 && rect.top < window.innerHeight) playVisibleVideo(video);
    else video.pause();
  });
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
    const featureVideo = document.querySelector(".feature-video");
    if (button.id === "overview-tab-video") featureVideo?.play().catch(() => {});
    else featureVideo?.pause();
  });
});

const soundToggle = document.querySelector(".sound-toggle");
const featureVideo = document.querySelector(".feature-video");
soundToggle?.addEventListener("click", () => {
  featureVideo.muted = !featureVideo.muted;
  soundToggle.textContent = featureVideo.muted ? "Sound off" : "Sound on";
  featureVideo.play().catch(() => {});
});

document.querySelectorAll(".load-live-session").forEach((button) => {
  const embed = button.closest(".live-embed");
  const frame = embed?.querySelector("iframe");
  frame?.addEventListener("load", () => {
    const active = embed.classList.contains("loaded");
    frame.contentWindow?.postMessage({ type: "ibfm-visibility", active }, window.location.origin);
    if (active && frame.hasAttribute("data-keyboard-control")) frame.focus();
  });
  button.addEventListener("click", () => {
    if (!frame) return;
    document.querySelectorAll(".live-embed iframe[src]").forEach((other) => {
      if (other === frame) return;
      other.contentWindow?.postMessage({ type: "ibfm-visibility", active: false }, window.location.origin);
      other.closest(".live-embed")?.classList.remove("loaded");
    });
    if (!frame.hasAttribute("src")) {
      frame.src = frame.dataset.src;
    } else {
      frame.contentWindow?.postMessage({ type: "ibfm-visibility", active: true }, window.location.origin);
    }
    if (frame.hasAttribute("data-keyboard-control")) frame.focus();
    embed.classList.add("loaded");
  });
});

const keyboardFrame = document.querySelector("#keyboard-control iframe[data-keyboard-control]");
const keyboardCodes = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyB", "KeyF"]);
const forwardedKeys = new Set();

function sendKeyboardInput(code, action, repeat = false) {
  if (!keyboardFrame?.hasAttribute("src")) return;
  keyboardFrame.contentWindow?.postMessage({ type: "ibfm-keyboard", code, action, repeat }, window.location.origin);
}

function keyboardViewerVisible() {
  if (!keyboardFrame?.closest(".live-embed")?.classList.contains("loaded")) return false;
  const rect = keyboardFrame.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
}

window.addEventListener("keydown", (event) => {
  if (!keyboardCodes.has(event.code) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest?.("input, textarea, select, [contenteditable]")) return;
  if (!keyboardViewerVisible()) return;
  event.preventDefault();
  forwardedKeys.add(event.code);
  sendKeyboardInput(event.code, "down", event.repeat);
});

window.addEventListener("keyup", (event) => {
  if (!forwardedKeys.delete(event.code)) return;
  event.preventDefault();
  sendKeyboardInput(event.code, "up");
});

window.addEventListener("blur", () => {
  for (const code of forwardedKeys) sendKeyboardInput(code, "up");
  forwardedKeys.clear();
});
