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
  button.addEventListener("click", () => {
    const embed = button.closest(".live-embed");
    const frame = embed?.querySelector("iframe");
    if (!frame || frame.src) return;
    frame.src = frame.dataset.src;
    embed.classList.add("loaded");
  });
});
