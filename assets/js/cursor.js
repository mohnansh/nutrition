/**
 * NUTRITION FIRE - Minimal Modern Custom Cursor Controller
 * Provides buttery-smooth 60fps tracking, subtle hover expansion,
 * and clean click micro-interaction without visual clutter.
 */

(function () {
  // Disable on touch devices
  if (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isHovered = false;

  const cursorWrap = document.createElement("div");
  cursorWrap.className = "anime-cursor-wrap";

  const cursorDot = document.createElement("div");
  cursorDot.className = "anime-cursor-dot";

  const cursorRing = document.createElement("div");
  cursorRing.className = "anime-cursor-ring";

  cursorWrap.appendChild(cursorDot);
  cursorWrap.appendChild(cursorRing);
  document.body.appendChild(cursorWrap);

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  // Smooth lerp for outer ring
  function renderCursor() {
    const ease = 0.24;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Click ripple
  window.addEventListener("mousedown", (e) => {
    cursorRing.style.transform = "translate(-50%, -50%) scale(0.85)";

    const wave = document.createElement("div");
    wave.className = "anime-cursor-click-wave";
    wave.style.left = `${e.clientX}px`;
    wave.style.top = `${e.clientY}px`;
    document.body.appendChild(wave);

    setTimeout(() => {
      wave.remove();
    }, 320);
  });

  window.addEventListener("mouseup", () => {
    cursorRing.style.transform = isHovered ? "translate(-50%, -50%) scale(1.05)" : "translate(-50%, -50%) scale(1)";
  });

  // Hover detection
  const hoverSelectors = "a, button, input, select, textarea, [role='button'], .product-card, .category-tab-btn, .category-tile, .clickable, label";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelectors)) {
      isHovered = true;
      cursorWrap.classList.add("cursor-hover");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSelectors)) {
      isHovered = false;
      cursorWrap.classList.remove("cursor-hover");
    }
  });

  document.addEventListener("mouseleave", () => {
    cursorWrap.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorWrap.style.opacity = "1";
  });
})();
