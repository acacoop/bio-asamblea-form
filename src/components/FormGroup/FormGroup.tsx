// components/FormGroup/FormGroup.tsx
import "./FormGroup.css";
import Input from "../Input/Input";
import AddItem from "../AddItem/AddItem";
import { useEffect, useState } from "react";
import Button from "../Button/Button";
import CartaPoder from "../CartaPoder/CartaPoder";
import type { Cooperativa } from "../../types/types";

// ACABIO no usa suplentes ni cartas poder; poner en true para reactivarlos.
const SHOW_SUPLENTES_Y_CARTA_PODER = false;

type Props = {
  cooperativa?: Cooperativa | null;
};

export default function FormGroup({ cooperativa }: Props) {
  const [coopNombre, setCoopNombre] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");
  const [votos, setVotos] = useState<number | "">("");

  const [secretario, setSecretario] = useState<string>("");
  const [presidente, setPresidente] = useState<string>("");
  const [contactoEmail, setContactoEmail] = useState<string>("");

  const [titulares, setTitulares] = useState<
    Array<{ id: string; nombre: string; documento?: string }>
  >([]);
  const [suplentesArr, setSuplentesArr] = useState<
    Array<{ id: string; nombre: string; documento?: string }>
  >([]);

  const [showAddFor, setShowAddFor] = useState<null | "titular" | "suplente">(
    null
  );
  const [showCarta, setShowCarta] = useState(false);

  useEffect(() => {
    if (!cooperativa) return;

    setCoopNombre(cooperativa.name ?? "");
    setCodigo(cooperativa.code ?? "");

    setVotos(
      typeof cooperativa.votes === "number"
        ? cooperativa.votes
        : cooperativa.votes
        ? Number(cooperativa.votes)
        : ""
    );

    const autoridades =
      (cooperativa as any).autoridades ??
      (cooperativa as any).autoridad ??
      null;
    setSecretario(autoridades?.secretario ?? "");
    setPresidente(autoridades?.presidente ?? "");

    const contacto =
      (cooperativa as any).contacto ?? (cooperativa as any).contact ?? null;
    setContactoEmail(contacto?.correoElectronico ?? contacto?.email ?? "");

    const datos = (cooperativa as any).datos ?? (cooperativa as any);

    function parseArrayField(field: any) {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return [];
    }

    const rawTitulares = parseArrayField(
      datos?.titulares ?? (cooperativa as any).titulares
    );
    const rawSuplentes = parseArrayField(
      datos?.suplentes ?? (cooperativa as any).suplentes
    );

    const normalize = (arr: any[]) =>
      arr.map((it) => ({
        id:
          it.id ??
          it.ID ??
          it.documento ??
          Math.random().toString(36).slice(2, 10),
        nombre: it.nombre ?? it.name ?? it.fullName ?? it.nombreCompleto ?? "",
        documento:
          it.documento ?? it.document ?? it.documentoIdentidad ?? undefined,
      }));

    setTitulares(normalize(rawTitulares));
    setSuplentesArr(normalize(rawSuplentes));
  }, [cooperativa]);

  useEffect(() => {
    if (secretario || presidente) {
      persistLists(undefined, undefined, { presidente, secretario }, undefined);
    }
  }, [secretario, presidente]);

  useEffect(() => {
    if (contactoEmail) {
      persistLists(undefined, undefined, undefined, {
        correoElectronico: contactoEmail,
      });
    }
  }, [contactoEmail]);
  function persistLists(
    updatedTitulares?: typeof titulares,
    updatedSuplentes?: typeof suplentesArr,
    updatedAutoridades?: { presidente: string; secretario: string },
    updatedContacto?: { correoElectronico: string }
  ) {
    try {
      const raw = localStorage.getItem("formExistingData");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.datos = parsed.datos ?? {};
      if (updatedTitulares) parsed.datos.titulares = updatedTitulares;
      if (updatedTitulares) parsed.titulares = updatedTitulares;
      if (updatedSuplentes) parsed.datos.suplentes = updatedSuplentes;
      if (updatedSuplentes) parsed.suplentes = updatedSuplentes;
      if (updatedAutoridades) {
        parsed.datos.autoridades = parsed.datos.autoridades ?? {};
        parsed.datos.autoridades.presidente = updatedAutoridades.presidente;
        parsed.datos.autoridades.secretario = updatedAutoridades.secretario;
      }
      if (updatedContacto) {
        parsed.datos.contacto = parsed.datos.contacto ?? {};
        parsed.datos.contacto.correoElectronico =
          updatedContacto.correoElectronico;
      }
      localStorage.setItem("formExistingData", JSON.stringify(parsed));
      try {
        window.dispatchEvent(
          new CustomEvent("formExistingDataChanged", { detail: parsed })
        );
      } catch (e) {}
    } catch (e) {}
  }

  function handleAddItemTo(
    kind: "titular" | "suplente",
    item: { id: string; nombre: string; documento?: string }
  ) {
    if (kind === "titular") {
      const next = [...titulares, item];
      setTitulares(next);
      persistLists(next, undefined);
    } else {
      const next = [...suplentesArr, item];
      setSuplentesArr(next);
      persistLists(undefined, next);
    }
  }

  function handleRemoveItemFrom(kind: "titular" | "suplente", id: string) {
    if (kind === "titular") {
      const next = titulares.filter((t) => t.id !== id);
      setTitulares(next);
      persistLists(next, undefined);
    } else {
      const next = suplentesArr.filter((s) => s.id !== id);
      setSuplentesArr(next);
      persistLists(undefined, next);
    }
  }

  function handleUpdateItemIn(
    kind: "titular" | "suplente",
    item: { id: string; nombre: string; documento?: string }
  ) {
    if (kind === "titular") {
      const next = titulares.map((t) => (t.id === item.id ? item : t));
      setTitulares(next);
      persistLists(next, undefined);
    } else {
      const next = suplentesArr.map((s) => (s.id === item.id ? item : s));
      setSuplentesArr(next);
      persistLists(undefined, next);
    }
  }

  const canAddTitular = titulares.every(
    (t) =>
      String(t.nombre).trim() !== "" && String(t.documento ?? "").trim() !== ""
  );
  const canAddSuplente = suplentesArr.every(
    (s) =>
      String(s.nombre).trim() !== "" && String(s.documento ?? "").trim() !== ""
  );

  const maxPeople =
    typeof votos === "number" && !Number.isNaN(votos) ? Math.max(0, votos) : 6;

  return (
    <div className="form-group-container">
      <div className="form-group">
        <h2 className="title-form-group">Información de la Cooperativa</h2>

        <Input
          label="Cooperativa:"
          name="cooperativa"
          value={coopNombre}
          readOnly
        />
        <Input label="Código:" name="codigo" value={codigo} readOnly />
        <Input
          label="Votos:"
          name="votos"
          type="number"
          value={votos}
          readOnly
        />
      </div>

      {(secretario || presidente || contactoEmail) && (
        <div className="notice">
          <h3>✏️ Datos del formulario</h3>
          <p>
            Complete o modifique la información según corresponda. Los datos se guardarán automáticamente.
          </p>
        </div>
      )}

      <div className="form-group">
        <h2 className="title-form-group">Autoridades de la Cooperativa</h2>
        <Input
          label="Nombre completo del Secretario:"
          name="secretario"
          value={secretario}
          required={true}
          onChange={(v) => setSecretario(String(v))}
        />

        <Input
          label="Nombre completo del Presidente:"
          name="presidente"
          required={true}
          value={presidente}
          onChange={(v) => setPresidente(String(v))}
        />

        <Input
          label="Correo Electrónico de Contacto:"
          name="contacto_email"
          type="email"
          required={true}
          value={contactoEmail}
          placeholder="ejemplo@correo.com"
          onChange={(v) => setContactoEmail(String(v))}
        />
        <p className="help-text">
          Ante cualquier problema con el formulario, nos comunicaremos a este correo.
        </p>
      </div>

      <div className="form-group">
        <h2 className="title-form-group">{`Titulares (máximo ${maxPeople})`}</h2>
        {titulares.length === 0 && showAddFor !== "titular" && (
          <p className="empty">No hay titulares cargados.</p>
        )}
        {titulares.map((t) => (
          <AddItem
            key={t.id}
            initial={t}
            onEdit={(item) => handleUpdateItemIn("titular", item)}
            onRemove={(id) => handleRemoveItemFrom("titular", id)}
          />
        ))}

        {showAddFor === "titular" && titulares.length < maxPeople && (
          <div className="add-new-item">
            <AddItem
              onAdd={(item) => {
                handleAddItemTo("titular", item);
                setShowAddFor(null);
              }}
              onClose={() => setShowAddFor(null)}
            />
          </div>
        )}

        <div className="button-add-item-container">
          <Button
            label="Agregar Titular"
            onClick={() => setShowAddFor("titular")}
            color="--aca-blue-light"
            disabled={!canAddTitular || titulares.length >= maxPeople}
          />
        </div>
      </div>

      {SHOW_SUPLENTES_Y_CARTA_PODER && (
      <div className="form-group">
        <h2 className="title-form-group">{`Suplentes (máximo ${maxPeople})`}</h2>
        {suplentesArr.length === 0 && showAddFor !== "suplente" && (
          <p className="empty">No hay suplentes cargados.</p>
        )}
        {suplentesArr.map((s) => (
          <AddItem
            key={s.id}
            initial={s}
            onEdit={(item) => handleUpdateItemIn("suplente", item)}
            onRemove={(id) => handleRemoveItemFrom("suplente", id)}
          />
        ))}

        {showAddFor === "suplente" && suplentesArr.length < maxPeople && (
          <div className="add-new-item">
            <AddItem
              onAdd={(item) => {
                handleAddItemTo("suplente", item);
                setShowAddFor(null);
              }}
              onClose={() => setShowAddFor(null)}
            />
          </div>
        )}

        <div className="button-add-item-container">
          <Button
            label="Agregar Suplente"
            color="--aca-blue-light"
            onClick={() => setShowAddFor("suplente")}
            disabled={!canAddSuplente || suplentesArr.length >= maxPeople}
          />
        </div>
      </div>
      )}
      {SHOW_SUPLENTES_Y_CARTA_PODER && (
      <div className="form-group">
        <h2 className="title-form-group">Cartas Poder</h2>
        <p className="help-text">
          Un delegado puede representar por poder hasta dos delegados.
        </p>
        <CartaPoder />

        {showCarta && (
          <div className="carta-modal">
            <CartaPoder />
            <div style={{ marginTop: 8 }}>
              <Button label="Cerrar" onClick={() => setShowCarta(false)} />
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
