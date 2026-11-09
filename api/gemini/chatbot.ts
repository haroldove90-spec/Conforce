import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { userMessage, userLocation, catalogContext } = req.body || {};

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'Missing userMessage in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `Eres "Asistente ConForce", el asesor de compras experto e inteligente de ConForce Venezuela (Marketplace Multicategoría de Comercio, Tecnología, Alimentos, Farmacia, Repuestos, Ferretería, Moda, Hogar y Servicios en Venezuela).
Tu objetivo es responder a clientes por WhatsApp con tono ultra profesional, empático, dinámico y enfocado en orientarlos a conseguir cualquier producto y concretar ventas.

DATOS CLAVE DEL MARKETPLACE:
- ConForce es un Marketplace integral: vendemos TODO tipo de productos y servicios (tecnología, celulares, ropa, calzado, comida/restaurantes, supermercado y víveres, salud/farmacia, ferretería y herramientas, repuestos automotrices, etc.).
- NO asumas que el usuario solo busca repuestos o autos. Entiende la consulta en su contexto exacto.
- Moneda oficial en la plataforma: Bolívares (Bs.) y precios referenciales transparentes.
- Si el usuario comparte ubicación o busca comercios cercanos, recomiéndale los comercios de su zona.
- Si el producto exacto no está registrado en el catálogo proporcionado, asesóralo amablemente indicándole qué comercios afines o alternativas existen en Con Force, sin inventar precios falsos.
- NUNCA respondas con un mensaje genérico de bienvenida repetitivo. Responde SIEMPRE a la necesidad concreta que plantea el cliente.
- Mantén el formato WhatsApp: viñetas claras, emojis atractivos (🇻🇪, 🛒, 📱, 🍔, 💊, 🚗, 🛠️, 💳, 📍) y llamada a la acción para comprar o ver el catálogo.`;

    const prompt = `UBICACIÓN DEL CLIENTE: ${userLocation ? `Lat: ${userLocation.lat}, Lng: ${userLocation.lng}` : 'No especificada'}

CATÁLOGO REAL DE COMERCIOS Y PRODUCTOS DISPONIBLES:
${JSON.stringify(catalogContext || [], null, 2)}

MENSAJE DEL CLIENTE:
"${userMessage}"

Por favor analiza la consulta del cliente, selecciona los comercios y productos más pertinentes de cualquier rubro y genera la respuesta.`;

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    let parsed: any = null;

    for (const model of modelsToTry) {
      try {
        const responsePromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                messageText: {
                  type: Type.STRING,
                  description: 'Texto de respuesta profesional en español adaptado para WhatsApp con emojis.'
                },
                matchedBusinessIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'IDs de comercios del catálogo que tienen o atienden lo que busca el cliente.'
                },
                matchedProductIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'IDs de productos del catálogo que coinciden con la búsqueda.'
                },
                category: {
                  type: Type.STRING,
                  description: 'Categoría identificada (tecnologia, farmacia, restaurante, supermercado, ferreteria, repuestos, moda, servicios) o null.'
                }
              },
              required: ['messageText', 'matchedBusinessIds', 'matchedProductIds']
            }
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout exceeding 12000ms on ${model}`)), 12000)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        const text = response.text;
        if (text) {
          const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
          parsed = JSON.parse(cleanedText);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Vercel function Gemini model ${model} failed:`, err.message || err);
      }
    }

    if (!parsed) {
      throw lastError || new Error('All Gemini candidate models failed to produce a valid response.');
    }

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Gemini chatbot error on Vercel handler:', error);
    return res.status(500).json({
      error: error.message || 'Error processing message with Gemini AI'
    });
  }
}
