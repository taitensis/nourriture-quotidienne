(() => {
  const root = document.documentElement;

  // remove stale override; Layout will re-apply cached one if present
  root.style.removeProperty("--brand-override");

  // ----- tiny color helpers -----
  const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
  const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  const hexToRgb = (h: string) => { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h.trim()); return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null; };
  const rgbToHsl = ({r,g,b}:{r:number;g:number;b:number}) => { r/=255; g/=255; b/=255; const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min, l=(max+min)/2; let h=0,s=0; if(d){ s=d/(1-Math.abs(2*l-1)); switch(max){case r:h=((g-b)/d+(g<b?6:0));break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;} h/=6;} return {h,s,l}; };
  const hslToRgb = ({h,s,l}:{h:number;s:number;l:number}) => { const f=(n:number)=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l),c=l-a*Math.max(-1,Math.min(k-3,Math.min(9-k,1))); return Math.round(c*255)}; return {r:f(0),g:f(8),b:f(4)}; };
  const luminance = ({r,g,b}:{r:number;g:number;b:number}) => { const toLin=(v:number)=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}; const R=toLin(r),G=toLin(g),B=toLin(b); return .2126*R+.7152*G+.0722*B; };
  const contrast = (c1:{r:number;g:number;b:number}, c2:{r:number;g:number;b:number}) => { const L1=luminance(c1),L2=luminance(c2); const [a,b]=L1>L2?[L1,L2]:[L2,L1]; return (a+.05)/(b+.05); };

  function chooseColor(imgEl: HTMLImageElement) {
    const c = document.createElement("canvas"), w = 36, h = 36;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    try {
      ctx.drawImage(imgEl, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      let best = { r: 94, g: 165, b: 0 }, bestScore = -1; // fallback #5ea500
      for (let i=0; i<data.length; i+=4) {
        const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3];
        if (a < 230) continue;
        const { s, l } = rgbToHsl({ r, g, b });
        if (s < 0.35) continue;
        if (l < 0.15 || l > 0.85) continue;
        const score = s * (1 - Math.abs(l - 0.5));
        if (score > bestScore) { bestScore = score; best = { r, g, b }; }
      }
      let hsl = rgbToHsl(best);
      hsl.s = clamp(Math.max(hsl.s, 0.65), 0, 0.95);
      hsl.l = clamp(hsl.l, 0.38, 0.62);
      let rgb = hslToRgb(hsl);

      const bgStr = getComputedStyle(root).getPropertyValue("--bg").trim() || "#ffffff";
      const bg = hexToRgb(bgStr) || { r:255, g:255, b:255 };
      if (contrast(rgb, bg) < 3) {
        const bgL = luminance(bg);
        const dir = bgL > 0.5 ? -1 : 1;
        hsl.l = clamp(hsl.l + dir * 0.15, 0.25, 0.7);
        rgb = hslToRgb(hsl);
      }
      return hex(rgb.r, rgb.g, rgb.b);
    } catch {
      return null;
    }
  }

  function reveal() {
    root.setAttribute("data-brand", "ready");
    root.classList.remove("app-pending");
  }

  function setBrand(hex: string) {
    root.style.setProperty("--brand-override", hex);
    root.style.setProperty("--link", hex);
    try {
      const key = "brand:" + location.pathname.replace(/\/$/, "");
      localStorage.setItem(key, hex);
    } catch {}
    reveal();
  }

  function getHeroImg(): HTMLImageElement | null {
    return (
      document.querySelector<HTMLImageElement>("img.hero-img") ||
      document.querySelector<HTMLImageElement>("picture.hero-img img") ||
      document.querySelector<HTMLImageElement>(".hero-img picture img")
    );
  }

  async function run() {
    const img = getHeroImg();
    if (!img) { reveal(); return; }

    try {
      if ("decode" in img) {
        await (img as any).decode();
      } else if (!img.complete) {
        await new Promise<void>(res => img.addEventListener("load", () => res(), { once: true }));
      }
    } catch {
      if (!img.complete) {
        await new Promise<void>(res => img.addEventListener("load", () => res(), { once: true }));
      }
    }

    const color = chooseColor(img);
    if (color) setBrand(color);
    else reveal();
  }

  // Safety: ensure we never keep the page hidden if something goes wrong
  const safety = setTimeout(reveal, 1500);

  function clearSafety() {
    try { clearTimeout(safety); } catch {}
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { run().finally(clearSafety); }, { once: true });
  } else {
    run().finally(clearSafety);
  }
})();
