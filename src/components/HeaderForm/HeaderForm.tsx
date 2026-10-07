import { useNavigate } from "react-router-dom";
import logoBio from "../../assets/logo_bio.png";
import "./HeaderForm.css";

type HeaderFormProps = {
  titleForm: string;
  showButtonBack?: boolean;
};

export default function HeaderForm({
  titleForm,
  showButtonBack,
}: HeaderFormProps) {
  const navigate = useNavigate();
  return (
    <header className="header-form">
      {showButtonBack && (
        <button className="back-button" onClick={() => navigate(-1)}>
          Volver
        </button>
      )}
      <div className="brand-logo-container">
        <img className="brand-logo" src={logoBio} alt="ACABIO" />
      </div>
      <div className="container-title-form">
        <h1 className="title-form">{titleForm}</h1>
      </div>
    </header>
  );
}
