import React, { useEffect, useRef } from 'react';

interface LiveWallpaperProps {
  isDarkMode: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function LiveWallpaper({ isDarkMode }: LiveWallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000, active: false };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(65, Math.floor((canvas.width * canvas.height) / 22000));
      
      const darkColors = [
        '#00baf2', '#00f0ff', // Cyan
        '#8b5cf6', '#a78bfa', // Purple
        '#ec4899', '#ff007f', // Magenta/Hot Pink
        '#10b981', '#34d399'  // Mint Green
      ];
      
      const lightColors = [
        '#3b82f6', '#475569', // Blue/Slate
        '#db2777', '#7c3aed', // Pink/Violet
        '#059669', '#d97706'  // Emerald/Amber
      ];

      for (let i = 0; i < particleCount; i++) {
        const color = !isDarkMode 
          ? lightColors[Math.floor(Math.random() * lightColors.length)]
          : darkColors[Math.floor(Math.random() * darkColors.length)];

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4, // Slow drift
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1.5,
          color
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update & Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Draw connection lines
      const maxDistance = 130;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            const alpha = (1 - dist / maxDistance) * (isDarkMode ? 0.12 : 0.08);
            ctx.strokeStyle = isDarkMode 
              ? `rgba(0, 240, 255, ${alpha})`
              : `rgba(71, 85, 105, ${alpha})`;
            
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Connection to mouse position
      if (mouse.active) {
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance + 30) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            
            const alpha = (1 - dist / (maxDistance + 30)) * (isDarkMode ? 0.22 : 0.12);
            ctx.strokeStyle = isDarkMode 
              ? `rgba(0, 186, 242, ${alpha})`
              : `rgba(59, 130, 246, ${alpha})`;
              
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <>
      {/* Drifting luxury mesh blobs background */}
      <div className="mesh-gradient-bg">
        <div className="mesh-blob blob-purple"></div>
        <div className="mesh-blob blob-pink"></div>
        <div className="mesh-blob blob-teal"></div>
        <div className="mesh-blob blob-amber"></div>
      </div>

      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </>
  );
}
