import { useEffect, useRef } from 'react';
import type { SceneLight } from './config/convite';

interface MagicCanvasProps {
  reduced: boolean;
  className?: string;
  lights?: SceneLight[];
  onReveal?: (percent: number) => void;
}

interface Spark {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
  ember: boolean;
}

export function MagicCanvas({ reduced, className = '', lights = [], onReveal }: MagicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (onReveal) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let animation = 0;
    const count = reduced ? 9 : 34;
    const sparks: Spark[] = [];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sparks.length = 0;
      for (let index = 0; index < count; index += 1) {
        sparks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.8 + 0.5,
          speed: Math.random() * 0.25 + 0.08,
          phase: Math.random() * Math.PI * 2,
          ember: Math.random() > 0.72,
        });
      }
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      if (!reduced) {
        const haze = context.createLinearGradient(0, height * 0.53, 0, height);
        haze.addColorStop(0, 'rgba(24, 42, 48, 0)');
        haze.addColorStop(0.78, 'rgba(55, 59, 49, 0.12)');
        haze.addColorStop(1, 'rgba(148, 79, 41, 0.13)');
        context.fillStyle = haze;
        context.fillRect(0, height * 0.53, width, height * 0.47);
        context.globalCompositeOperation = 'screen';
        lights.filter((light) => light.kind === 'candle' || light.kind === 'fire' || light.kind === 'moon').slice(0, 3).forEach((light) => {
          const x = width * light.x / 100;
          const y = height * light.y / 100;
          const spread = light.kind === 'moon' ? width * 0.3 : width * 0.13;
          const beam = context.createLinearGradient(x, y, x + spread, Math.min(height, y + height * 0.52));
          beam.addColorStop(0, 'rgba(242, 207, 135, 0.06)');
          beam.addColorStop(1, 'rgba(242, 207, 135, 0)');
          context.fillStyle = beam;
          context.beginPath();
          context.moveTo(x - 4, y);
          context.lineTo(x + 5, y);
          context.lineTo(x + spread, Math.min(height, y + height * 0.52));
          context.lineTo(x - spread * 0.16, Math.min(height, y + height * 0.52));
          context.closePath();
          context.fill();
        });
        context.globalCompositeOperation = 'source-over';
      }
      sparks.forEach((spark) => {
        const opacity = 0.3 + Math.sin(frame * 0.035 + spark.phase) * 0.28;
        context.beginPath();
        context.fillStyle = spark.ember
          ? `rgba(255, ${Math.floor(119 + 70 * Math.sin(spark.phase + frame * 0.03))}, 74, ${opacity * 0.72})`
          : `rgba(245, 212, 138, ${opacity})`;
        context.shadowBlur = reduced ? 0 : spark.ember ? 8 : 5;
        context.shadowColor = spark.ember ? '#ff8b48' : '#f5d48a';
        context.arc(spark.x, spark.y, spark.ember ? spark.r * 1.15 : spark.r, 0, Math.PI * 2);
        context.fill();
        spark.y -= spark.speed * (spark.ember ? 1.8 : 1);
        spark.x += Math.sin(frame * 0.012 + spark.phase) * (spark.ember ? 0.2 : 0.06);
        if (spark.y < -4) {
          spark.y = height + 4;
          spark.x = Math.random() * width;
        }
      });
      if (!reduced && lights.length > 0) {
        const warmLights = lights.filter((light) => light.kind === 'candle' || light.kind === 'fire');
        if (warmLights.length > 0) {
          const flicker = 0.006 + Math.abs(Math.sin(frame * 0.093)) * 0.009 + Math.abs(Math.sin(frame * 0.037)) * 0.006;
          context.fillStyle = `rgba(255, 170, 91, ${flicker})`;
          context.fillRect(0, 0, width, height);
        }

        context.globalCompositeOperation = 'lighter';
        const drawFlame = (x: number, y: number, size: number, phase: number) => {
          const flicker = 0.8 + Math.sin(frame * 0.11 + phase) * 0.11 + Math.sin(frame * 0.047 + phase) * 0.09;
          context.save();
          context.translate(x, y);
          context.scale(size * flicker, size * (0.92 + Math.sin(frame * 0.08 + phase) * 0.12));
          context.shadowBlur = 20;
          context.shadowColor = '#ffae4f';
          context.fillStyle = 'rgba(255, 143, 59, 0.22)';
          context.beginPath();
          context.moveTo(-10, 0);
          context.bezierCurveTo(-21, -17, 7, -30, -1, -52);
          context.bezierCurveTo(12, -43, 20, -20, 10, 0);
          context.closePath();
          context.fill();
          context.shadowBlur = 5;
          context.fillStyle = 'rgba(255, 224, 141, 0.8)';
          context.beginPath();
          context.moveTo(-4, 0);
          context.bezierCurveTo(-10, -12, 4, -19, 0, -33);
          context.bezierCurveTo(9, -22, 10, -8, 4, 0);
          context.closePath();
          context.fill();
          context.restore();
        };

        lights.forEach((light, index) => {
          const x = width * light.x / 100;
          const y = height * light.y / 100;
          const phase = index * 1.79;
          if (light.kind === 'window') {
            const pulse = 0.6 + Math.sin(frame * 0.036 + phase) * 0.12;
            const glow = context.createRadialGradient(x, y, 1, x, y, 31);
            glow.addColorStop(0, `rgba(255, 207, 125, ${pulse * 0.34})`);
            glow.addColorStop(1, 'rgba(255, 153, 66, 0)');
            context.fillStyle = glow;
            context.fillRect(x - 31, y - 31, 62, 62);
          } else if (light.kind === 'moon') {
            const glow = context.createRadialGradient(x, y, 1, x, y, 100);
            glow.addColorStop(0, 'rgba(207, 224, 218, 0.12)');
            glow.addColorStop(1, 'rgba(207, 224, 218, 0)');
            context.fillStyle = glow;
            context.fillRect(x - 100, y - 100, 200, 200);
          } else if (light.kind === 'wand') {
            const pulse = 0.72 + Math.sin(frame * 0.14 + phase) * 0.2;
            const glow = context.createRadialGradient(x, y, 1, x, y, 70);
            glow.addColorStop(0, `rgba(141, 255, 193, ${pulse * 0.34})`);
            glow.addColorStop(1, 'rgba(42, 196, 128, 0)');
            context.fillStyle = glow;
            context.fillRect(x - 70, y - 70, 140, 140);
          } else {
            drawFlame(x, y, light.kind === 'fire' ? 1.55 : 0.7, phase);
          }
        });
        context.globalCompositeOperation = 'source-over';
      }
      context.shadowBlur = 0;
      animation = window.requestAnimationFrame(draw);
    };

    resize();
    animation = window.requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const pause = () => {
      if (document.hidden) window.cancelAnimationFrame(animation);
      else animation = window.requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', pause);
    return () => {
      window.cancelAnimationFrame(animation);
      observer.disconnect();
      document.removeEventListener('visibilitychange', pause);
    };
  }, [lights, reduced, onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !context || !onReveal) return;
    let drawing = false;
    let width = 0;
    let height = 0;

    let lastMeasurement = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = 'rgba(18, 13, 10, 0.985)';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'destination-out';
    };
    const point = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      canvas.parentElement?.style.setProperty('--wand-x', `${position.x}px`);
      canvas.parentElement?.style.setProperty('--wand-y', `${position.y}px`);
      return position;
    };
    const erase = (event: PointerEvent) => {
      if (!drawing) return;
      const { x, y } = point(event);
      const brush = context.createRadialGradient(x, y, 4, x, y, 48);
      brush.addColorStop(0, 'rgba(0,0,0,1)');
      brush.addColorStop(0.7, 'rgba(0,0,0,0.9)');
      brush.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = brush;
      context.beginPath();
      context.arc(x, y, 48, 0, Math.PI * 2);
      context.fill();
      const now = performance.now();
      if (now - lastMeasurement < 160) return;
      lastMeasurement = now;
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let erased = 0;
      const sampleStep = 16 * 4;
      for (let index = 3; index < pixels.length; index += sampleStep) {
        if (pixels[index] < 30) erased += 1;
      }
      onReveal(erased / Math.ceil(pixels.length / sampleStep));
    };
    const start = (event: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      erase(event);
    };
    const stop = () => { drawing = false; };
    resize();
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', erase);
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', erase);
      canvas.removeEventListener('pointerup', stop);
      canvas.removeEventListener('pointercancel', stop);
    };
  }, [onReveal]);

  return <canvas aria-hidden="true" ref={canvasRef} className={`magic-canvas ${className}`} />;
}
