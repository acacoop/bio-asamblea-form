# 📊 Dashboard de Métricas - Asamblea Form

## Acceso

La página de métricas es **oculta** y solo accesible mediante URL directa:

```
https://tu-dominio.com/bio-asamblea-form/metrics-dashboard-2025
```

En desarrollo local:

```
http://localhost:5173/bio-asamblea-form/metrics-dashboard-2025
```

## Características

### 📈 Métricas Generales

- **Total de Cooperativas**: Cuenta total de todas las cooperativas registradas
- **Registros Completos**: Cooperativas que completaron su registro
- **Registros Incompletos**: Cooperativas pendientes de completar registro
- **Total de Votos**: Suma de todos los votos disponibles
- **Titulares, Suplentes y Cartas de Poder**: Contadores totales

### 🗺️ Métricas por Región

Tabla detallada que muestra por cada región:

- Total de cooperativas
- Cantidad de registros completos e incompletos
- Porcentaje de avance visual con barra de progreso
- Total de votos por región

### 🔍 Lista de Cooperativas

Tabla completa con:

- Código de cooperativa
- Localidad
- Nombre
- Región
- Total de votos
- Estado del registro (Completo/Pendiente)
- Cantidad de titulares, suplentes y cartas de poder
- Fecha de registro

### ⚡ Funcionalidades

#### Filtros:

- **Por Estado**: Ver todas, solo completas o solo incompletas
- **Búsqueda**: Filtrar por código, nombre o localidad

#### Actualización:

- Los datos se cargan automáticamente al entrar
- Botón de "Reintentar" en caso de error

## Endpoint

Los datos se obtienen desde:

```
https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1433da937a6b48cf94231a7381de7676/triggers/manual/paths/invoke
```

### Estructura de Respuesta

```typescript
{
  statusCode: 200,
  headers: { ... },
  body: {
    "@odata.nextLink": "...",
    value: [
      {
        ID: number,
        Title: string,              // Código
        field_1: string,            // Localidad
        field_2: string,            // Nombre completo
        Nombre_corto: string,       // Nombre corto
        field_5: {                  // Región
          Value: string
        },
        Total_x0020_votos: string,
        RegistroCompleto: boolean,
        FechaRegistro: string,
        TotalTitulares: number,
        TotalSuplentes: number,
        TotalCartasPoder: number,
        ...
      }
    ]
  }
}
```

## Tecnologías Utilizadas

- React + TypeScript
- CSS personalizado con gradientes y animaciones
- Fetch API para obtención de datos
- React Router para navegación

## Notas de Seguridad

- La ruta `/metrics-dashboard-2025` no aparece en ningún menú ni enlace visible
- Solo accesible conociendo la URL exacta
- Para mayor seguridad, considerar implementar autenticación en el futuro

## Mantenimiento

Para cambiar el endpoint de métricas, editar:

```
src/services/services.ts → función obtenerMetricas()
```

Para modificar los tipos, editar:

```
src/types/types.ts → MetricasResponse y CooperativaMetrica
```
