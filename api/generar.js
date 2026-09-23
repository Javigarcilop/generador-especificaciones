export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { idea } = req.body;

  if (!idea || idea.trim() === '') {
    return res.status(400).json({ error: 'Falta la idea' });
  }

  const prompt = `Eres un Product Manager senior. A partir de esta idea de producto, genera una especificación breve y clara, en español, con este formato exacto:

HISTORIAS DE USUARIO
(2-3 historias, formato "Como [rol], quiero [acción] para [beneficio]")

CRITERIOS DE ACEPTACIÓN
(lista de condiciones concretas y verificables)

MINI ROADMAP
(3 pasos, en orden, para construir esto)

Idea del usuario: "${idea}"`;

  try {
    const respuestaGemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!respuestaGemini.ok) {
      const errorTexto = await respuestaGemini.text();
      console.error('Error de Gemini:', errorTexto);
      return res.status(502).json({ error: 'Error al contactar con la IA' });
    }

    const datos = await respuestaGemini.json();
    const texto = datos.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar respuesta.';

    return res.status(200).json({ texto });

  } catch (error) {
    console.error('Error interno:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}