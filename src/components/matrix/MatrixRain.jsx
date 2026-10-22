import { useEffect, useRef } from "react";

const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ZTVNF:.=*+-<>|";
const FONT_SIZE = 16;
const FPS = 20;
const BG = "5, 11, 7"; // matches the page background (#050b07)

// Full-screen "digital rain" drawn on a fixed canvas behind the app.
// Purely decorative: ignores pointer events and pauses when the tab is hidden.
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let drops = [];
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgb(${BG})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const columns = Math.ceil(window.innerWidth / FONT_SIZE);
      const rows = window.innerHeight / FONT_SIZE;
      drops = Array.from({ length: columns }, () => Math.random() * -rows);
    };

    const step = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = `rgba(${BG}, 0.08)`;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${FONT_SIZE}px "Share Tech Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FONT_SIZE;
        if (y > 0) {
          const glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          // Bright head, the fading trail is left by the translucent fill above
          ctx.fillStyle = Math.random() > 0.975 ? "#d6ffe4" : "#00ff66";
          ctx.fillText(glyph, i * FONT_SIZE, y);
        }
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    };

    const loop = (time) => {
      frame = requestAnimationFrame(loop);
      if (time - last < 1000 / FPS) return;
      last = time;
      step();
    };

    resize();
    if (reducedMotion) {
      // Draw a single settled frame instead of animating
      for (let i = 0; i < 120; i++) step();
    } else {
      frame = requestAnimationFrame(loop);
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reducedMotion) for (let i = 0; i < 120; i++) step();
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none z-0 opacity-[0.28]"
    />
  );
}

export default MatrixRain;
