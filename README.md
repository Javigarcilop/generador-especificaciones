# Generador de especificaciones de producto

Escribes una idea de producto en una frase y la IA genera historias de usuario, criterios de aceptación y un mini roadmap. Pensado para el primer paso de definición de producto, antes de que un equipo empiece a programar.

**Demo:** https://generador-especificaciones.vercel.app

## Cómo funciona

1. El frontend (HTML/CSS/JS puro) envía la idea a una función serverless en `/api/generar`.
2. Esa función, alojada en Vercel, llama a la API de Gemini usando una clave guardada como variable de entorno (nunca expuesta en el código ni en el navegador).
3. Gemini devuelve el texto estructurado, que se muestra en pantalla.

## Por qué un backend y no llamar a la IA directamente

Si la clave de la API estuviera en el código del frontend, cualquiera podría verla abriendo las herramientas de desarrollador del navegador y usarla como si fuera suya. La función serverless resuelve esto: la clave vive solo en el servidor de Vercel.

## Stack

- HTML, CSS, JavaScript (sin frameworks)
- Función serverless en Vercel (Node.js)
- Google Gemini API

## Estructura

\`\`\`
generador-especificaciones/
├── index.html       Interfaz: caja de texto, botón y resultado
├── api/
│   └── generar.js   Función serverless que llama a Gemini
└── package.json
\`\`\`

## Ejecutarlo en local

Necesitas [Vercel CLI](https://vercel.com/docs/cli) y una clave de la API de Gemini.

\`\`\`bash
npm i -g vercel
vercel dev
\`\`\`

Crea un archivo \`.env.local\` con:
\`\`\`
GEMINI_API_KEY=tu_clave_aqui
\`\`\`