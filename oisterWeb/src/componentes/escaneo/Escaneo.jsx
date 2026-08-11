import "./Escaneo.css";

/* ============================================================
   ESCANEO — líneas holográficas de fondo

   Barras verticales finísimas que cruzan la sección muy
   despacio, cada una con una mota de luz recorriéndola. Es
   decoración de ambiente: tiene que notarse solo si te fijas.

   Se monta en cualquier contenedor con `position: relative`:

     <section className="loQueSea">
       <Escaneo />
       ...
     </section>

   ---- POR QUÉ CUATRO Y NO UNA ----
   Con una sola línea el movimiento se vuelve predecible: pasa,
   vuelve a pasar, y el ojo aprende el ritmo en dos vueltas.

   Cuatro con comportamientos distintos —una lenta, una rápida,
   una que aparece y desaparece, y una apagada— no dan esa
   sensación de bucle.

   ---- Y POR QUÉ ESAS DURACIONES ----
   8.3s, 9.7s, 11.9s y 12.7s. No son números redondos a
   propósito: con duraciones que compartan divisores (8, 10, 12)
   las líneas se reencuentran cada pocos ciclos y el conjunto
   late. Con estos valores el patrón tarda muchísimo en
   repetirse y nunca se ven sincronizadas.

   ---- EL LÍMITE QUE NO SE TOCA ----
   Ninguna pasa del 15% de opacidad. Es lo que las mantiene como
   ambiente: por encima empiezan a competir con el texto y el
   formulario, que son el foco.
   ============================================================ */

const LINEAS = [
  /* la lenta: la que da la sensación de calma */
  { izq: "22%", dur: "11.9s", retraso: "0s", op: 0.13, alto: "78%", mota: 0.55 },
  /* la rápida: cruza mientras las otras aún van por la mitad */
  { izq: "47%", dur: "8.3s", retraso: "-3.2s", op: 0.11, alto: "92%", mota: 0.75 },
  /* la que aparece y desaparece: su animación incluye tramos a
     opacidad 0, así que a ratos no existe */
  { izq: "68%", dur: "12.7s", retraso: "-7.5s", op: 0.15, alto: "64%", mota: 0.4, intermitente: true },
  /* la apagada: casi un rumor, para dar tercer plano */
  { izq: "86%", dur: "9.7s", retraso: "-1.8s", op: 0.08, alto: "84%", mota: 0.28 },
];

function Escaneo({ className = "" }) {
  return (
    /* aria-hidden: decoración pura, no aporta nada a quien
       navega con lector de pantalla */
    <div className={`escaneo ${className}`} aria-hidden="true">
      {LINEAS.map((l, i) => (
        <span
          key={i}
          className={`escaneo__linea${
            l.intermitente ? " escaneo__linea--intermitente" : ""
          }`}
          style={{
            "--izq": l.izq,
            "--dur": l.dur,
            "--retraso": l.retraso,
            "--op": l.op,
            "--alto": l.alto,
            "--mota": l.mota,
          }}
        >
          {/* la mota que recorre la línea. Va en su propio
              elemento porque su animación es VERTICAL y la de la
              línea es horizontal: en el mismo nodo, un transform
              pisaría al otro. */}
          <span className="escaneo__mota" />
        </span>
      ))}
    </div>
  );
}

export default Escaneo;
