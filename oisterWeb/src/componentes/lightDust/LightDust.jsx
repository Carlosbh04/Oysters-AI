import { useEffect, useRef, useState } from "react";
import "./LightDust.css";

/* Motas de luz cayendo lentamente, en dos capas con distinta
   velocidad (parallax). Componente ATMOSFÉRICO reutilizable:
   móntalo dentro de cualquier sección con position:relative
   y llenará su área de polvo luminoso sin bloquear nada.

   Uso:  <LightDust />
   Cero elementos por partícula y cero JS de animación: cada
   capa es UN punto invisible cuyas box-shadows pintan todas
   las motas (la técnica de las partículas del hero móvil).

   ---- EL ÚNICO JS QUE LLEVA: DORMIRSE FUERA DE PANTALLA ----
   La portada monta CUATRO copias y las cuatro caían en bucle
   para siempre, se vieran o no. Medido con el recorrido de
   scroll instrumentado, el polvo costaba ~20ms por fotograma —
   uno de los cuatro grandes costes de pintura de la página.

   El observador duerme la caída cuando la sección queda fuera
   de pantalla (margen 35%: al volver, ya está cayendo antes de
   asomar). Pausar no reinicia: las motas se quedan donde
   estaban y retoman de ahí. Invisible por definición — solo
   ocurre cuando nadie lo ve. */
function LightDust() {
  const ref = useRef(null);
  const [lejos, setLejos] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setLejos(!e.isIntersecting),
      { rootMargin: "35%" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`light-dust ${lejos ? "light-dust--lejos" : ""}`}
      aria-hidden="true"
    />
  );
}

export default LightDust;
