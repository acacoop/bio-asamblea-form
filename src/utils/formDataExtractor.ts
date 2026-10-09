import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import templateCredencialUrl from "../assets/template-credencial.docx?url";
import templateCartaPoderUrl from "../assets/template-carta-poder.docx?url";

const ASAMBLEA_YEAR = 2026;

const AUTOMATE_UPLOAD_ENDPOINT =
  import.meta.env.VITE_AUTOMATE_UPLOAD_ENDPOINT || "";
const AUTOMATE_FETCH_ENDPOINT =
  import.meta.env.VITE_AUTOMATE_FETCH_ENDPOINT || "";

/**
 * Transform the current form data into the required JSON schema format
 */
export function transformFormDataToSchema(): any {
  const formData = localStorage.getItem("formExistingData");
  const cooperativaData = localStorage.getItem("cooperativa");
  const parsedForm = formData ? JSON.parse(formData) : {};
  const parsedCoop = cooperativaData ? JSON.parse(cooperativaData) : {};

  console.log("Raw parsed form:", parsedForm);
  console.log("Raw parsed coop:", parsedCoop);

  // Cooperativa fields
  const cooperativa = {
    codigo:
      parsedCoop.code ||
      parsedCoop.codigo ||
      parsedForm?.cooperativa?.code ||
      parsedForm?.cooperativa?.codigo ||
      "",
    nombre:
      parsedCoop.name ||
      parsedCoop.nombre ||
      parsedForm?.cooperativa?.name ||
      parsedForm?.cooperativa?.nombre ||
      "",
    votos: parseInt(
      parsedCoop.votes ||
        parsedCoop.votos ||
        parsedForm?.cooperativa?.votes ||
        parsedForm?.cooperativa?.votos ||
        0,
    ),
    suplentes: parseInt(
      parsedCoop.suplentes ||
        parsedCoop.substitutes ||
        parsedForm?.cooperativa?.suplentes ||
        parsedForm?.cooperativa?.substitutes ||
        0,
    ),
    car:
      parsedCoop.CAR ||
      parsedCoop.car ||
      parsedForm?.cooperativa?.CAR ||
      parsedForm?.cooperativa?.car ||
      "",
    carNombre:
      parsedCoop["CAR Nombre"] ||
      parsedCoop.carNombre ||
      parsedForm?.cooperativa?.["CAR Nombre"] ||
      parsedForm?.cooperativa?.carNombre ||
      "",
  };

  // Autoridades (try to get from multiple possible locations)
  const autoridades = {
    secretario:
      parsedForm?.datos?.autoridades?.secretario ||
      parsedForm?.autoridades?.secretario ||
      parsedForm?.secretario ||
      parsedCoop?.secretario ||
      "",
    presidente:
      parsedForm?.datos?.autoridades?.presidente ||
      parsedForm?.autoridades?.presidente ||
      parsedForm?.presidente ||
      parsedCoop?.presidente ||
      "",
  };

  // Contacto (try to get from multiple possible locations)
  const contacto = {
    correoElectronico:
      parsedForm?.datos?.contacto?.correoElectronico ||
      parsedForm?.contacto?.correoElectronico ||
      parsedForm?.correoElectronico ||
      parsedCoop?.correoElectronico ||
      "",
  };

  // Arrays (ensure always array, never stringified)
  function parseArray(field: any) {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return [];
  }
  const titulares = parseArray(parsedForm?.datos?.titulares);
  const suplentes = parseArray(parsedForm?.datos?.suplentes);
  const cartasPoder: any[] = parseArray(parsedForm?.datos?.cartasPoder);

  // Valor fijo para no pisar los votos máximos de la cooperativa en el flujo
  const resumen = {
    votosEfectivos: 1,
  };

  // Timestamp
  const timestamp = new Date().toISOString();

  return {
    timestamp,
    cooperativa,
    autoridades,
    contacto,
    titulares,
    suplentes,
    cartasPoder,
    resumen,
  };
}

export function extractFormDataAsJSON() {
  const formData = localStorage.getItem("formExistingData");
  const cooperativaData = localStorage.getItem("cooperativa");

  const parsedForm = formData ? JSON.parse(formData) : {};
  const parsedCoop = cooperativaData ? JSON.parse(cooperativaData) : {};

  console.log("Raw parsed form:", parsedForm);
  console.log("Raw parsed coop:", parsedCoop);

  // Normalize arrays helper function
  const parseArray = (field: any) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return [];
  };

  // Get cartas poder to find apoderados
  const cartasPoder = parseArray(parsedForm?.datos?.cartasPoder);
  console.log("Cartas poder:", cartasPoder);

  // Helper function to find apoderado for a person
  const findApoderado = (personId: string, allPeople: any[]) => {
    const carta = cartasPoder.find((c: any) => c.poderanteId === personId);
    if (!carta?.apoderadoId) return ""; // Return empty string instead of null

    const apoderado = allPeople.find((p: any) => p.id === carta.apoderadoId);
    return apoderado?.nombre || "";
  };

  const titulares = parseArray(parsedForm?.datos?.titulares || []);
  const suplentes = parseArray(parsedForm?.datos?.suplentes || []);
  const allPeople = [...titulares, ...suplentes];

  console.log("Parsed titulares:", titulares);
  console.log("Parsed suplentes:", suplentes);

  if (cartasPoder.length === 0) {
    const result = {
      cooperativa: parsedCoop,
      formData: {
        ...parsedForm,
        titulares,
        suplentes,
      },
    };
    console.log("Final extracted data (no cartas poder):", result);
    return result;
  }

  // Add apoderado to each titular
  const titularesWithApoderado = titulares.map((titular: any) => ({
    ...titular,
    apoderado: findApoderado(titular.id, allPeople) ?? "",
  }));

  // Add apoderado to each suplente (if needed)
  const suplentesWithApoderado = suplentes.map((suplente: any) => ({
    ...suplente,
    apoderado: findApoderado(suplente.id, allPeople) ?? "",
  }));

  const result = {
    cooperativa: parsedCoop,
    formData: {
      ...parsedForm,
      titulares: titularesWithApoderado,
      suplentes: suplentesWithApoderado,
    },
  };

  console.log("Final extracted data:", result);
  return result;
}

/**
 * Generate PDF from DOCX template using the form data.
 * The Carta Poder template authorizes the (single) Titular of the
 * cooperativa to represent it in the Asamblea, so only the Titular's
 * name and DNI are needed (there is exactly one Titular per Cooperativa).
 */
export async function generateCartaPoderPDF(
  formData: any,
): Promise<{ blob: Blob; fileName: string }[]> {
  try {
    // Load the template from the assets folder
    const templateResponse = await fetch(templateCartaPoderUrl);
    if (!templateResponse.ok) {
      throw new Error("Template file not found");
    }
    const templateBuffer = await templateResponse.arrayBuffer();

    // Extract needed data
    const cooperativaName =
      formData.cooperativa?.name || formData.cooperativa?.nombre || "";
    const presidente = formData.formData?.datos?.autoridades?.presidente || "";
    const secretario = formData.formData?.datos?.autoridades?.secretario || "";

    // Helper to ensure arrays are always arrays, never strings
    const parseArray = (field: any) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return [];
    };

    const titulares = parseArray(
      formData.formData?.titulares || formData.titulares,
    );

    // There is only one Titular per Cooperativa
    const titular = titulares[0] || {};

    if (!titular.nombre) {
      console.log("No titular found, skipping carta poder generation.");
      return [];
    }

    const templateData = {
      titular: titular.nombre || "",
      dniTitular: titular.documento || titular.dni || "",
      cooperativaName,
      presidente,
      secretario,
      anio: ASAMBLEA_YEAR,
      year: ASAMBLEA_YEAR,
    };

    console.log("Generating carta poder with data:", templateData);

    const fileName = `Asamblea ACABIO ${ASAMBLEA_YEAR} - ${
      formData.cooperativa?.code || "Unknown"
    } - CartaPoder - ${titular.nombre || "SinNombre"}.docx`;

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    doc.render(templateData);
    const output = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return [{ blob: output, fileName }];
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors
        .map((err: any) => err.properties.explanation)
        .join(", ");
      throw new Error(`Template error: ${errorMessages}`);
    }
    throw new Error("Failed to generate PDF from template");
  }
}

export async function generatePDF(formData: any): Promise<Blob> {
  try {
    // Load the template from the assets folder
    const templateResponse = await fetch(templateCredencialUrl);
    if (!templateResponse.ok) {
      throw new Error("Template file not found");
    }

    // Read the template file as ArrayBuffer
    const templateBuffer = await templateResponse.arrayBuffer();

    // Create a PizZip instance with the template
    const zip = new PizZip(templateBuffer);

    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Prepare data for the template - flatten the structure for docxtemplater
    const templateData = {
      anio: ASAMBLEA_YEAR,
      year: ASAMBLEA_YEAR,
      // Flatten cooperativa to root level
      cooperativaName:
        formData.cooperativa?.name || formData.cooperativa?.nombre || "",
      cooperativaCode:
        formData.cooperativa?.code || formData.cooperativa?.codigo || "",
      presidente: formData.formData?.datos?.autoridades?.presidente || "",
      secretario: formData.formData?.datos?.autoridades?.secretario || "",

      // Also keep nested structure in case template uses it
      cooperativa: {
        name: formData.cooperativa?.name || formData.cooperativa?.nombre || "",
        code: formData.cooperativa?.code || formData.cooperativa?.codigo || "",
      },

      titulares: (formData.formData?.titulares || formData.titulares || []).map(
        (t: any) => ({
          nombre: t.nombre || "",
          documento: t.documento || t.dni || "",
          apoderado: t.apoderado || "",
        }),
      ),
      suplentes: (formData.formData?.suplentes || formData.suplentes || []).map(
        (s: any) => ({
          nombre: s.nombre || "",
          documento: s.documento || s.dni || "",
          apoderado: s.apoderado || "",
        }),
      ),
    };

    console.log("Template data being passed:", templateData); // Debug log

    // Render the document (replace placeholders with actual data)
    doc.render(templateData);

    // Generate the document as blob
    const output = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return output;
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors
        .map((err: any) => err.properties.explanation)
        .join(", ");
      throw new Error(`Template error: ${errorMessages}`);
    }
    throw new Error("Failed to generate PDF from template");
  }
}

/**
 * Upload PDF to SharePoint via Power Automate endpoint
 */
export async function uploadPDF(
  files: Array<{ blob: Blob; name: string }>,
  cooperativaCode: string,
): Promise<{
  success: boolean;
  files?: Array<{ name: string; fileContent: string }>;
  error?: string;
}> {
  try {
    // Convert blobs to base64 strings
    const filesData = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        content: await blobToBase64(file.blob),
      })),
    );

    const body: any = {
      cooperativaCode,
      files: filesData,
    };

    const response = await fetch(AUTOMATE_UPLOAD_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return {
      success: true,
      files: result,
    };
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetch all PDF links for the logged cooperativa
 */
export async function fetchPDFs(cooperativaCode: string): Promise<{
  success: boolean;
  files?: Array<{ name: string; url: string; date: string }>;
  error?: string;
}> {
  try {
    const url = new URL(AUTOMATE_FETCH_ENDPOINT);
    url.searchParams.append("cooperativaCode", cooperativaCode);
    url.searchParams.append("action", "list");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files || [],
    };
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch PDFs",
    };
  }
}

/**
 * Complete workflow: Extract data, generate PDF, and upload to SharePoint
 */
export async function processFormSubmission(): Promise<{
  success: boolean;
  fileUrl?: string;
  error?: string;
}> {
  try {
    // Step 1: Extract form data
    const formData = extractFormDataAsJSON();

    if (!formData.cooperativa?.code) {
      throw new Error("Cooperativa code is required");
    }

    // Step 2: Generate PDF from template
    const pdfBlob = await generatePDF(formData);

    // Step 3: Create filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const fileName = `Asamblea ACABIO ${ASAMBLEA_YEAR} - ${formData.cooperativa.code} - ${timestamp}.docx`;

    const files = [{ blob: pdfBlob, name: fileName }]; // Include carta poder as second file

    // Step 4: Upload to SharePoint
    const uploadResult = await uploadPDF(files, formData.cooperativa.code);

    return uploadResult;
  } catch (error) {
    console.error("Error in form submission process:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Form submission failed",
    };
  }
}

/**
 * Download the generated document locally (for testing/backup)
 */
export async function downloadGeneratedDocument(): Promise<{
  success: boolean;
  files?: Array<{ name: string; fileContent: string }>;
  error?: string;
}> {
  try {
    const formData = extractFormDataAsJSON();
    //const credencialBlob = await generatePDF(formData);
    const cartasPoderBlobs = await generateCartaPoderPDF(formData);

    //const fileName = `Asamblea ACABIO ${ASAMBLEA_YEAR} - ${
    //  formData.cooperativa?.code || "Unknown"
    //} - Credencial.docx`;

    const files: { blob: Blob; name: string }[] = [];

    //files.push({ blob: credencialBlob, name: fileName });
    if (Array.isArray(cartasPoderBlobs)) {
      cartasPoderBlobs.forEach((cartaBlob) => {
        files.push({ blob: cartaBlob.blob, name: cartaBlob.fileName });
      });
    }

    const uploadResult = await uploadPDF(
      files,
      formData.cooperativa?.code || "Unknown",
    );
    return uploadResult;
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
}
