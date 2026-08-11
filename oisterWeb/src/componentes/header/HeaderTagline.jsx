import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { nombreDeRuta, POR_DEFECTO } from "./rutasNombres";

/* ============================================================
   EL RÓTULO DEL HEADER — se teclea al cambiar de ruta

   Al navegar, el texto del centro de la píldora se borra letra
   a letra, y luego se escribe el de la ruta nueva, con un cursor
   de editor acompañando.

   ---- POR QUÉ ES UN COMPONENTE APARTE ----
   Éste es el motivo de que exista este archivo en vez de meter
   el estado en Header.jsx: tecleando, el estado cambia una vez
   por LETRA — unas 26 veces en una transición típica. Si ese
   estado viviera en el header, cada letra volvería a renderizar
   el logo, el menú de escritorio, la hamburguesa y el resto.

   Aislado aquí, cada letra solo redibuja este <span>. El header
   no se entera y su animación de entrada no se toca.

   ---- ESPERA A LA ENTRADA DEL HEADER ----
   Y aquí está lo importante. El header no se queda quieto al
   navegar: `introDone` se apaga mientras carga la ruta y se
   vuelve a encender después, así que la píldora REPITE su
   animación de entrada en cada cambio de página. El tagline
   además tiene la suya propia (`taglineIn`, 0,5s con 0,55s de
   retraso).

   Arrancando el tecleo con el cambio de ruta, medido, pasaba
   esto:
       0-1080ms  se borra y se escribe entero…
                 …con `header--enter` en false, o sea con el
                 header FUERA de pantalla
       1500ms    el header vuelve, con opacidad 0, y el texto
                 ya pone el destino
   La animación se ejecutaba entera a puerta cerrada. Nunca se
   veía una sola letra.

   Ahora el tecleo espera a que la animación de entrada del
   propio tagline TERMINE. Y no con un temporizador de 1050ms
   —que es lo que suman el retraso y la duración—, sino
   preguntándole al navegador por la animación real y esperando
   su promesa `finished`. Si mañana cambian esos tiempos en el
   CSS, esto sigue funcionando sin que nadie tenga que acordarse.

   ---- CANCELACIÓN ----
   Todo el motor es UNA cadena de setTimeout con una bandera
   `cancelado`. Al cambiar de ruta, el efecto se limpia: se
   levanta la bandera y se aborta el temporizador pendiente. Así,
   si alguien navega rápido entre tres páginas, las dos primeras
   transiciones mueren en el acto en lugar de seguir escribiendo
   por encima de la tercera.
   ============================================================ */

/* Milisegundos por letra. Borrar va más rápido que escribir: es
   lo que hace cualquier editor y lo que espera el ojo — retirar
   algo cuesta menos que ponerlo. */
const MS_BORRA = 45;
const MS_ESCRIBE = 60;

/* Cuánto se queda el cursor tras la última letra antes de
   apagarse. Sin esta pausa, el cursor desaparece a la vez que
   cae la última letra y se pierde el remate. */
const MS_PAUSA = 300;

function HeaderTagline({ introDone = true }) {
  const { pathname } = useLocation();
  const destino = nombreDeRuta(pathname);

  /* arranca ya con el texto puesto. En la primera carga no hay
     nada que borrar y el rótulo entra con el header; el tecleo
     empieza a existir a partir del primer cambio de ruta. */
  const [texto, setTexto] = useState(destino || POR_DEFECTO);
  const [cursor, setCursor] = useState(false);

  /* el <span>, para poder preguntarle por sus animaciones */
  const nodo = useRef(null);

  /* qué se está mostrando ahora mismo, sin pasar por el estado:
     el motor necesita leerlo en cada paso y con `texto` tendría
     que declararlo dependencia del efecto, lo que reiniciaría la
     animación en cada letra */
  const visible = useRef(texto);
  const primera = useRef(true);

  useEffect(() => {
    /* la primera vez no se anima: el texto ya está puesto */
    if (primera.current) {
      primera.current = false;
      return;
    }

    /* el header aún no ha vuelto: no hay nada que mirar todavía.
       Cuando `introDone` pase a true, este efecto se repite. */
    if (!introDone) return;

    if (visible.current === destino) return;

    let cancelado = false;
    let temporizador = null;
    let cuadro = null;

    const pon = (t) => {
      visible.current = t;
      setTexto(t);
    };

    const luego = (ms, fn) => {
      temporizador = setTimeout(() => {
        if (!cancelado) fn();
      }, ms);
    };

    const borrar = () => {
      if (visible.current.length === 0) return escribir();
      pon(visible.current.slice(0, -1));
      luego(MS_BORRA, borrar);
    };

    const escribir = () => {
      if (visible.current === destino) return rematar();
      pon(destino.slice(0, visible.current.length + 1));
      luego(MS_ESCRIBE, escribir);
    };

    const rematar = () => {
      luego(MS_PAUSA, () => setCursor(false));
    };

    /* ---- EL ARRANQUE VA DIFERIDO ----
       Nada de `setCursor(true)` ni de empezar a borrar aquí
       mismo. Cambiar el estado de forma síncrona dentro de un
       efecto encadena un render extra antes de que el navegador
       pinte, y React avisa de ello con razón.

       Metiendo el primer paso en el mismo temporizador que usa
       el resto del motor, el efecto solo AGENDA trabajo y no
       toca el estado, que es lo que se espera de él. */
    /* Espera a que el rótulo termine de entrar y solo entonces
       teclea. `getAnimations()` se consulta tras un cuadro
       porque en el tick en que React aplica la clase, la
       animación todavía no está registrada. */
    const arrancar = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        /* movimiento reducido: cambio directo, ni cursor ni
           letras ni espera */
        pon(destino);
        setCursor(false);
        return;
      }

      await new Promise((r) => {
        cuadro = requestAnimationFrame(r);
      });
      if (cancelado) return;

      const entrada = nodo.current
        ?.getAnimations?.()
        .find((a) => a.animationName === "taglineIn");

      if (entrada) {
        /* `finished` RECHAZA si la animación se cancela —pasa si
           el usuario navega otra vez a mitad—, así que se atrapa
           y se deja morir esta pasada; la siguiente ya se ha
           agendado por su cuenta */
        try {
          await entrada.finished;
        } catch {
          return;
        }
        if (cancelado) return;
      }

      setCursor(true);
      borrar();
    };

    arrancar();

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
      if (cuadro) cancelAnimationFrame(cuadro);
    };
  }, [destino, introDone]);

  return (
    <span className="header__tagline" ref={nodo}>
      {texto}
      {/* aria-hidden: el cursor es un adorno; anunciarlo
          interrumpiría la lectura del rótulo */}
      {cursor && <i className="header__cursor" aria-hidden="true" />}
    </span>
  );
}

export default HeaderTagline;
