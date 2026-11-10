# Pauta

**Generador de especificaciones de producto.** Describes una idea en una o dos frases y Pauta la convierte en historias de usuario, criterios de aceptación y un plan en tres fases. Pensado para el primer paso de definición de producto, antes de que un equipo empiece a programar.

**Demo:** https://generador-especificaciones.vercel.app

## Qué hace

- Historias de usuario con el formato *Como [rol], quiero [acción] para [beneficio]* (HU-01, HU-02…).
- Criterios de aceptación verificables que puedes ir marcando como revisados (CA-01, CA-02…).
- Un plan en tres fases, en orden.
- Exporta el documento en Markdown (copiar o descargar `.md`) para pegarlo en Jira, Notion o un issue.

## Cómo funciona

1. El frontend (HTML, CSS y JavaScript, sin frameworks) envía la idea a una función serverless en `/api/generar`.
2. La función llama a Gemini con **salida estructurada**: `responseMimeType: application/json` y un `responseSchema` que fija los campos (título, historias, criterios y fases).
3. Antes de responder, el servidor normaliza y comprueba el JSON; si falta algo, devuelve un error claro en vez de un resultado a medias.
4. El navegador pinta el documento con `textContent`, nunca como HTML.

## Decisiones

- **Clave fuera del navegador.** La clave de Gemini es una variable de entorno de Vercel. Si estuviera en el frontend, cualquiera podría verla en las herramientas de desarrollador.
- **JSON con esquema en vez de texto libre.** Con texto libre el formato cambia de una respuesta a otra y no se puede presentar ni exportar bien. Con esquema, cada parte llega en su campo.
- **Límites de entrada.** La idea tiene un máximo de 500 caracteres y va delimitada en el prompt, que indica que no se sigan instrucciones escritas dentro.

## Stack

- HTML, CSS y JavaScript sin frameworks
- Función serverless en Vercel (Node.js)
- Google Gemini API

## Estructura

```
generador-especificaciones/
├── index.html       Estructura de la página
├── estilos.css      Diseño (modo claro y oscuro, móvil)
├── app.js           Petición a la API, documento, Markdown y descarga
├── favicon.svg
├── api/
│   └── generar.js   Función serverless: prompt, esquema y validación
└── package.json
```

## Ejecutarlo en local

Necesitas [Vercel CLI](https://vercel.com/docs/cli) y una clave de la API de Gemini.

```bash
npm i -g vercel
vercel dev
```

Crea un archivo `.env.local` con:
```
GEMINI_API_KEY=tu_clave_aqui
```
