"use client";

import Link from "next/link";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const cards = [
    { href: "/matriz", icon: "📦", title: "Inventario", description: "Gestiona tu inventario de manera eficiente.", color: "rgba(8, 30, 150, 0.77)" },
    { href: "/prueba", icon: "🧪", title: "Pruebas", description: "Explora nuevas funciones visualmente.", color: "rgba(240, 26, 240, 0.25)" },
    { href: "/dashboard", icon: "📊", title: "Dashboard", description: "Visualiza métricas en tiempo real.", color: "rgba(0,255,128,0.2)" },
    { href: "/configuracion", icon: "⚙️", title: "Configuración", description: "Ajusta la app a tu gusto.", color: "rgba(255,165,0,0.2)" },
    { href: "/notas", icon: "📝", title: "Notas", description: "Guarda ideas o registros rápidos.", color: "rgba(0,128,255,0.2)" },
    { href: "/integraciones", icon: "🌐", title: "Integraciones", description: "Conecta con otras herramientas.", color: "rgba(255,0,128,0.2)" },
  ];

  const rotation = useMotionValue(0);
  const step = 360 / cards.length;

  // Layout y responsividad
  const [radius, setRadius] = useState(500);
  const [cardWidth, setCardWidth] = useState(260);
  const [height, setHeight] = useState(480);

  // Solo renderizar el carrusel en el cliente
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setRadius(300);
        setCardWidth(200);
        setHeight(380);
      } else if (window.innerWidth < 1024) {
        setRadius(450);
        setCardWidth(240);
        setHeight(440);
      } else {
        setRadius(600);
        setCardWidth(280);
        setHeight(500);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Transformaciones precalculadas (hooks fuera del map)
  const transforms = cards.map((_, i) => {
    const angle = step * i;
    const x = useTransform(rotation, (r) => Math.sin(((r + angle) * Math.PI) / 180) * radius);
    const z = useTransform(rotation, (r) => Math.cos(((r + angle) * Math.PI) / 180) * radius);
    const scale = useTransform(z, [-radius, radius], [0.6, 1.2]);
    const opacity = useTransform(z, [-radius, radius], [0.2, 1]);
    const rotateY = useTransform(rotation, (r) => -(r + angle));
    return { x, z, scale, opacity, rotateY };
  });

  // Navegación
  const handleNext = () => {
    const newRotation = Math.round(rotation.get() / step) * step - step;
    animate(rotation, newRotation, { type: "spring", stiffness: 200, damping: 20 });
  };

  const handlePrev = () => {
    const newRotation = Math.round(rotation.get() / step) * step + step;
    animate(rotation, newRotation, { type: "spring", stiffness: 200, damping: 20 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) handleNext();
    else handlePrev();
  };

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = touchEndX.current - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) handlePrev();
      else handleNext();
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 overflow-hidden relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 mb-12 tracking-wide drop-shadow-lg text-center">
        Menu de Navegación
      </h1>

      {isClient && (
        <div className="relative flex items-center justify-center w-full" style={{ height }}>
          <button
            onClick={handlePrev}
            className="absolute left-1 sm:left-8 flex items-center justify-center p-2 sm:p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 transition shadow-lg z-20"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <motion.div
            style={{ perspective: 2000, width: "100%", height: "100%", position: "relative" }}
            className="flex items-center justify-center"
          >
            {cards.map((card, i) => {
              const t = transforms[i];
              return (
                <motion.div
                  key={card.title}
                  style={{
                    x: t.x,
                    z: t.z,
                    scale: t.scale,
                    opacity: t.opacity,
                    rotateY: t.rotateY,
                    position: "absolute",
                    width: cardWidth,
                  }}
                >
                  <Link href={card.href}>
                    <div
                      style={{ backgroundColor: card.color, backdropFilter: "blur(10px)" }}
                      className="relative overflow-hidden rounded-3xl cursor-pointer group transition-all duration-500 p-4 sm:p-6 flex flex-col justify-between h-44 sm:h-56 shadow-xl border border-transparent"
                    >
                      <div className="text-5xl sm:text-7xl mb-2 sm:mb-4 opacity-20 absolute top-4 right-4 group-hover:opacity-100 text-white transition-opacity duration-500">
                        {card.icon}
                      </div>
                      <div className="relative z-10">
                        <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">{card.title}</h2>
                        <p className="text-white/70 text-sm sm:text-base">{card.description}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-white transition-all duration-500 group-hover:w-full rounded"></div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <button
            onClick={handleNext}
            className="absolute right-1 sm:right-8 flex items-center justify-center p-2 sm:p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 transition shadow-lg z-20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
