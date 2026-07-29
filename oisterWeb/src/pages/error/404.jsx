import PageSection from "../../componentes/layout/PageSection.jsx";
import "./404.css";

function NotFoundPage() {
  return (
    <PageSection>
      <div className="not-found">
        <h1>404</h1>

        <h2>Página no encontrada</h2>

        <p>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
      </div>
    </PageSection>
  );
}

export default NotFoundPage;
