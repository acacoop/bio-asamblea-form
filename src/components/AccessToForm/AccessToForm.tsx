import "./AccessToForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authCooperativa, consultarDatos } from "../../services/services";
import NotificationToast from "../NotificationToast/NotificationToast";

export default function AccessToForm() {
  const [cooperativeId, setCooperativeId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authCooperativa(cooperativeId, verificationCode);

      if (data?.cooperativa) {
        localStorage.setItem("cooperativa", JSON.stringify(data.cooperativa));

        const datos = await consultarDatos(
          data.cooperativa.code || cooperativeId,
        );
        if (datos) {
          localStorage.setItem("formExistingData", JSON.stringify(datos));
        }

        // show success toast
        setToastType("success");
        setToastMessage("Verificación exitosa");
        setToastOpen(true);

        // small delay to show toast, then navigate
        setTimeout(() => navigate("/form"), 600);
      } else {
        setToastType("error");
        setToastMessage("Credenciales incorrectas.");
        setToastOpen(true);
      }
    } catch (err: any) {
      const msg = err?.message || "Error en autenticación";
      // si la respuesta trae status 401 mostramos mensaje concreto
      if ((err as any)?.status === 401) {
        setToastType("error");
        setToastMessage("Ingrese una cooperativa válida");
      } else {
        setToastType("error");
        setToastMessage(msg);
      }
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="access-to-form" onSubmit={handleSubmit}>
      <h2 className="title-access">Ingreso de Cooperativa</h2>
      <div className="access-form-container">
        <div className="input-group">
          <label className="input-label" htmlFor="cooperativeId">
            Código de Cooperativa ACABIO <span className="required">*</span>
          </label>
          <input
            className="input-field"
            type="text"
            id="cooperativeId"
            name="cooperativeId"
            placeholder="Ej: 123"
            value={cooperativeId}
            onChange={(e) => setCooperativeId(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="verificationCode">
            Código Verificador <span className="required">*</span>
          </label>
          <input
            className="input-field"
            type="text"
            id="verificationCode"
            name="verificationCode"
            placeholder="Ej: AC123"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>
      </div>

      <button className="access-button" type="submit" disabled={loading}>
        {loading ? "Verificando..." : "Acceder al formulario"}
      </button>
      <NotificationToast
        message={toastMessage}
        type={toastType}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={4000}
      />
    </form>
  );
}
