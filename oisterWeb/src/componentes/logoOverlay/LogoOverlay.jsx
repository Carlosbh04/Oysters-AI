import { Fragment } from "react";
import { TEXTO, INICIO_SUFIJO } from "./logotipo";
import "./LogoOverlay.css";

/* Logotipo del intro. Recibe:
   · opacity    — fundido del bloque completo (se enciende al
                  empezar el tipeo)
   · charsShown — cuántas "piezas" están reveladas: las letras de
                  la marca, el espacio y las del sufijo. El intro
                  lo alimenta a 110ms/letra.
   · cursorApagado — apaga el cursor. Va atado al FUNDIDO de
                  salida, no al fin del tipeo: si se apagaba al
                  terminar de escribir, la pausa final se quedaba
                  sin un solo píxel en movimiento y la intro
                  parecía colgada. */


function LogoOverlay({ opacity = 0, charsShown = 0, cursorApagado = false }) {
  return (
    <div className="logo-overlay" style={{ opacity }}>
      <div className="logo-overlay__text">
        {TEXTO.map((ch, i) => {
          const on = i < charsShown;
          const strong = i >= INICIO_SUFIJO; // "AI" destaca sobre la marca

          const piece =
            ch === "\u00B7" ? (
              <span
                key={i}
                className={`logo-overlay__dot ${on ? "is-on" : ""}`}
              />
            ) : (
              <span
                key={i}
                className={`logo-overlay__char ${on ? "is-on" : ""} ${
                  strong ? "logo-overlay__char--strong" : ""
                }`}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            );

          /* el cursor se inserta justo ANTES de la siguiente pieza
             por escribir (índice charsShown): marca el punto donde
             aparecerá la letra. Así arranca a la izquierda y AVANZA
             con cada letra, siempre pegado al texto visible. Al
             completar el tipeo (charsShown === TEXTO.length) ningún
             índice coincide y este cursor deja de existir — por
             eso hay otro al final del bloque, que es el que se ve
             durante la pausa. */
          return i === charsShown ? (
            <Fragment key={i}>
              <span
                className={`logo-overlay__cursor ${
                  cursorApagado ? "is-done" : ""
                }`}
              />
              {piece}
            </Fragment>
          ) : (
            piece
          );
        })}

        {/* El cursor DE LA PAUSA.
            Hace falta uno aparte porque el de arriba se inserta
            delante de la letra pendiente, y al acabar el tipeo no
            queda ninguna: desaparecía justo cuando empieza la
            espera. Este se queda al final del logo, parpadeando,
            hasta que arranca el fundido. Es lo único que se mueve
            en ese tramo, y basta para que se lea como una pausa y
            no como que se ha quedado clavada. */}
        {charsShown >= TEXTO.length && !cursorApagado && (
          <span className="logo-overlay__cursor" />
        )}
      </div>
    </div>
  );
}

export default LogoOverlay;
