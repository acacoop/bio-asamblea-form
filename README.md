# Asamblea Form ACABIO (fork)

Este repositorio es un fork del formulario base original adaptado para el flujo de votación y manejo de poderes de ACABIO. Contiene lógica de autorización de acceso, carga/normalización de datos de la cooperativa, gestión dinámica de titulares y cartas de poder, y manejo de archivos adjuntos exportables.

Resumen rápido

- Framework: React + Vite + TypeScript
- Estado: fork con personalizaciones (cartas de poder, FileStatusBanner, localStorage-driven persistence)

## Estructura del proyecto

```
src/
├── assets/
│   ├── download.svg
│   └── template-*.docx
├── components/
│   ├── AddItem/
│   │   ├── AddItem.tsx
│   │   └── AddItem.css
│   ├── AccessToForm/
│   │   ├── AccessToForm.tsx
│   │   └── AccessToForm.css
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.css
│   ├── CartaPoder/
│   │   ├── CartaPoder.tsx
│   │   └── CartaPoder.css
│   ├── Card/
│   ├── BodyForm/
│   ├── Footer/
│   ├── FileStatusBanner/
│   ├── FormGroup/
│   ├── HeaderForm/
│   ├── Input/
│   └── NotificationToast/
├── pages/
│   ├── Home/
│   └── Form/
├── services/
│   └── services.ts
├── types/
│   └── types.ts
├── utils/
│   └── formDataExtractor.ts
├── main.tsx
└── App.tsx
```

## Instalación y ejecución

Clonar el repositorio y levantar el proyecto en modo desarrollo:

```bash
git clone https://github.com/acacoop/bio-asamblea-form.git
cd bio-asamblea-form
npm install
npm run dev
```

Abrir en el navegador:
http://localhost:5173/bio-asamblea-form/ (la `base` de Vite es `/bio-asamblea-form/`)

## Deploy (GitHub Pages)

La app se publica en la rama `gh-pages` con el paquete `gh-pages`. `base` en `vite.config.ts` y `basename` del Router en `src/App.tsx` deben coincidir con el nombre del repo (`bio-asamblea-form`).

```bash
npm run build
npm run deploy
```

Si el repo local no tiene remoto, agregarlo antes de publicar:

```bash
git remote add origin https://github.com/acacoop/bio-asamblea-form.git
git remote -v
```

Luego, en GitHub: Settings → Pages → Source: rama `gh-pages`, carpeta `/ (root)`.

## Uso / Notas rápidas

- Si el banner de archivos aparece, puedes descargar PDFs / archivos base64 desde el `FileStatusBanner`.

## Dependencias y scripts

Dependencias principales (ver `package.json`): react, react-dom, react-router-dom, papaparse, jspdf, html2canvas, file-saver, docx, docxtemplater, pizzip.

Scripts útiles:

- `npm run dev` — inicia Vite en modo desarrollo
- `npm run build` — compila TypeScript y genera `dist`
- `npm run preview` — vista previa de `dist`
- `npm run deploy` — ejecuta el deploy en github Pages

## Comportamientos importantes del fork

- Persistencia: los datos del formulario se guardan en `localStorage` bajo la clave `formExistingData`. Dentro de ese objeto se encuentra `datos.cartasPoder` y `datos.archivos`.
- Cartas de poder: la lógica está en `src/components/CartaPoder/CartaPoder.tsx`. Reglas vigentes:
  - Un apoderado puede recibir hasta 2 delegaciones.
  - Un apoderado no puede ser poderdante en ninguna carta.
  - Un poderdante solo puede ceder su voto una vez.
  - No se permite auto-delegación.
- FileStatusBanner (`src/components/FileStatusBanner`) muestra archivos adjuntos (base64) y permite descargas individuales y en lote.
- Eventos: al persistir cambios se dispara `formExistingDataChanged` para sincronizar componentes.

## Notas para desarrolladores

- Normalización: `src/pages/Form/Form.tsx` realiza normalización de la cooperativa (codigo/nombre/votos). Si cambias la forma de los datos, actualiza esa normalización.
- Persistencia: `CartaPoder` usa `persistCartas` para actualizar `localStorage`. Considera validar y migrar datos si introduces cambios en la forma almacenada.
- UI: los botones y estilos están en `src/components/Button` y `src/components/CartaPoder/CartaPoder.css`.

## Licencia

Todos los derechos reservados.  
Este proyecto es de uso exclusivo dentro de ACABIO.  
No está permitido copiar, distribuir ni modificar fuera de la organización.

## Autor / Contacto

- Miguel Miguez, mmiguez@acacoop.com.ar
- Manuel Regiardo, mregiardo@acacoop.com.ar
