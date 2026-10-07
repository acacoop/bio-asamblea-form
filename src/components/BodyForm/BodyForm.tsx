import "./BodyForm.css";
import Card from "../Card/Card";
import Button from "../Button/Button";
import AccessToForm from "../AccessToForm/AccessToForm";
import { useNavigate } from "react-router-dom";

interface BodyFormProps {
  introText?: string;
  showCards?: boolean;
  showButton?: boolean;
  buttonLabel?: string;
  children?: React.ReactNode;
  showAccessForm?: boolean;
}

const BodyForm: React.FC<BodyFormProps> = ({
  introText,
  showCards = false,
  showButton = true,
  buttonLabel,
  children,
  showAccessForm = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="body-form">
      {introText && <p className="intro-form">{introText}</p>}

      {showCards && (
        <>
          <Card
            title="📅 Fecha de la Asamblea"
            description="30 de Octubre de 2026"
          />
          <Card
            title="📋 Descripción"
            description="Documentación para nominar delegados con derecho a voto en la Asamblea General Ordinaria de la ACABIO. Permite registrar a los delegados titulares.

Tener en cuenta: Todos los delegados deben estar nominados en la Credencial."
          />
          <Card
            title="🔐 Acceso Seguro"
            description="Para acceder al formulario, ingrese el Código de Cooperativa ACABIO y el código verificador proporcionado. Este sistema garantiza que solo personal autorizado pueda registrar los datos de cada cooperativa."
          />
          <Card
            title="ℹ️ Información Importante"
            description={
              <>
                Asegúrese de completar toda la información requerida y verificar
                los datos antes de enviar el formulario. Por consultas dirigirse
                a{" "}
                <a href="mailto:asamblea@acacoop.com.ar?subject=Consulta sobre Asamblea 2026&body=Hola, tengo una consulta sobre la Asamblea 2025.">
                  asamblea@acacoop.com.ar
                </a>
              </>
            }
          />
          {showAccessForm && <AccessToForm />}
        </>
      )}

      {children}

      {showButton && (
        <Button
          label={buttonLabel || "Ingreso formulario"}
          onClick={() => navigate("/form")}
        />
      )}
    </div>
  );
};

export default BodyForm;
