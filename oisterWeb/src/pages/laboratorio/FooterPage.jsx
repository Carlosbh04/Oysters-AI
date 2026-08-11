import Footer from "../../componentes/footer/Footer";
import "./FooterPage.css";

/* ============================================================
   BANCO DE PRUEBAS — PIE

   El pie se monta aquí antes de colgarlo del sitio, por lo mismo
   que se hizo con casos de uso: un pie va en TODAS las páginas,
   así que equivocarse dentro de una ruta suelta cuesta un
   refresco y equivocarse ya montado cuesta romperlas todas.

   El bloque de relleno de arriba no es decoración: el pie cierra
   una página, y juzgarlo pegado a la cabecera no dice nada de
   cómo se va a ver de verdad.
   ============================================================ */
function FooterPage() {
  return (
    <div className="pie-lab">
      <p className="pie-lab__nota">Banco de pruebas del pie</p>

      <div className="pie-lab__relleno" aria-hidden="true" />

      <Footer />
    </div>
  );
}

export default FooterPage;
