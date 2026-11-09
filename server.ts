import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

interface FallbackOutput {
  messageText: string;
  matchedBusinessIds: string[];
  matchedProductIds: string[];
  category: string | null;
}

function generateServerFallback(userMessage: string, catalogContext: any[]): FallbackOutput {
  const query = (userMessage || '').trim().toLowerCase();
  const cleanQuery = query.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '').trim();

  // 1. Natural greeting responses
  if (/^(buenas tardes|tardes)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Buenas tardes! ☀️ Un placer saludarte. Bienvenido a *ConForce Venezuela*.\n\n¿En qué te podemos colaborar hoy? Cuéntanos qué producto, tienda o servicio estás buscando (tecnología, comida, víveres, farmacia, repuestos, etc.) y te daré opciones y precios de inmediato.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }

  if (/^(buenos dias|buen dia|buenos días)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Buenos días! 🌅 ¡Qué gusto saludarte! Bienvenido a *ConForce Venezuela*.\n\n¿En qué te podemos ayudar hoy? Dime qué estás buscando y con gusto te orientamos con los mejores comercios y precios en Bs.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }

  if (/^(buenas noches|noches)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Buenas noches! 🌙 Un placer saludarte. Bienvenido a *ConForce Venezuela*.\n\n¿Qué producto o comercio estás buscando hoy? Escríbenos y con gusto te ayudamos a conseguirlo.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }

  if (/^(hola|buenas|hey|que tal|qué tal|saludos|aló|alo)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Hola! 👋 ¡Mucho gusto! Bienvenido a *ConForce Venezuela*.\n\n¿Qué estás buscando hoy? Tenemos comercios de tecnología, restaurantes, supermercado, farmacias, ferretería, repuestos y servicios. ¡Escríbeme lo que necesitas y te ayudo!`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }

  if (/^(gracias|muchas gracias|mil gracias|agradecido|agradecida)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Con muchísimo gusto! 😊 Estamos a tu completa orden en *ConForce*. Si necesitas consultar otro producto o comercio, aquí estoy para ayudarte.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }

  if (/^(adios|adiós|chao|chau|hasta luego|nos vemos)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Hasta luego! 👋 Que tengas un excelente día. Vuelve pronto a *ConForce Venezuela*.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }

  // Detect greeting prefix if user asked combined greeting + question
  const greetingPrefix = /buenas tardes/i.test(query)
    ? '¡Buenas tardes! ☀️ '
    : /buenos dias|buen dia|buenos días/i.test(query)
    ? '¡Buenos días! 🌅 '
    : /buenas noches/i.test(query)
    ? '¡Buenas noches! 🌙 '
    : /hola|buenas|saludos/i.test(query)
    ? '¡Hola! 👋 '
    : '';

  // 2. Search products in catalogContext
  const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
  const matchedProds: any[] = [];
  let matchedBiz: any = null;

  for (const b of (catalogContext || [])) {
    for (const p of (b.products || [])) {
      const pName = (p.name || '').toLowerCase();
      const pTags = (p.tags || '').toLowerCase();
      if (pName.includes(cleanQuery) || words.some(w => pName.includes(w) || pTags.includes(w))) {
        matchedProds.push({ ...p, bizName: b.name, bizId: b.id, bizCategory: b.category });
        if (!matchedBiz) matchedBiz = b;
      }
    }
  }

  if (matchedProds.length > 0) {
    const topProd = matchedProds[0];
    const isPlural = matchedProds.length > 1;
    return {
      messageText: `${greetingPrefix}📍 ¡Encontré *${topProd.name}* disponible en *${topProd.bizName}* por *Bs. ${Number(topProd.price).toLocaleString()}*!\n\n${
        isPlural
          ? `🔍 También localicé ${matchedProds.length - 1} opción(es) adicional(es) en nuestro catálogo.`
          : '✨ Stock disponible para entrega inmediata o retiro en tienda.'
      }\n\n👉 Accede directo aquí para ver detalles y ordenar:`,
      matchedBusinessIds: [topProd.bizId],
      matchedProductIds: matchedProds.slice(0, 3).map(p => p.id),
      category: topProd.bizCategory || null
    };
  }

  // 3. Search businesses / categories
  for (const b of (catalogContext || [])) {
    const bName = (b.name || '').toLowerCase();
    const bCat = (b.category || '').toLowerCase();
    if (bName.includes(cleanQuery) || bCat.includes(cleanQuery) || words.some(w => bName.includes(w) || bCat.includes(w))) {
      return {
        messageText: `${greetingPrefix}🏬 Encontré el comercio aliado *${b.name}* (${b.category}) en ConForce.\n\n📍 Dirección: ${b.address || 'Ubicación céntrica'}.\n\nPuedes revisar sus productos destacados directamente en nuestro catálogo.`,
        matchedBusinessIds: [b.id],
        matchedProductIds: (b.products || []).slice(0, 2).map((p: any) => p.id),
        category: b.category || null
      };
    }
  }

  // 4. Default helpful multi-category response
  return {
    messageText: `${greetingPrefix}🔎 Estamos consultando en todos los comercios afiliados a *ConForce Venezuela*.\n\nContamos con tiendas de tecnología, farmacias, supermercados, ferreterías, restaurantes y repuestos.\n\n¿Deseas buscar un producto específico, marca o categoría? Escríbemelo y te daré opciones con precios en Bs.`,
    matchedBusinessIds: (catalogContext || []).slice(0, 3).map((b: any) => b.id),
    matchedProductIds: [],
    category: null
  };
}

// Gemini AI Asistente Web / Chatbot Endpoint
const handleGeminiAssistant = async (req: express.Request, res: express.Response) => {
  const { userMessage, userLocation, catalogContext } = req.body || {};

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'Missing userMessage in request body' });
  }

  // Key for Asistente Web
  const apiKey = process.env.GEMINI_API_KEY || process.env.WEB_ASSISTANT_API_KEY || 'AQ.Ab8RN6Jq1Ghsg8ZWZ8PZOrJnsiHXSN9orz_JdmlgIaJV1NMs1Q';
  if (!apiKey) {
    const fallback = generateServerFallback(userMessage, catalogContext);
    return res.status(200).json(fallback);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `Eres "Asistente ConForce", el asesor de compras inteligente, empático y servicial de ConForce Venezuela (Marketplace Multicategoría de Comercio, Tecnología, Alimentos, Farmacia, Ferretería, Repuestos, Moda y Servicios en Venezuela).
Tu objetivo es atender a los clientes por WhatsApp con tono ultra profesional, cálido, ágil y enfocado en ayudarlos a encontrar lo que necesitan en el marketplace.

PAUTAS CRUCIALES DE CONVERSACIÓN:
1. SALUDOS Y CORTESÍA:
   - Si el cliente te saluda (ej: "Buenas tardes", "Buenos días", "Buenas noches", "Hola", "Saludos", "Qué tal"):
     RESPONDE DIRECTAMENTE AL SALUDO con amabilidad y educación humana (ej: si dice "Buenas tardes", responde: "¡Buenas tardes! ☀️ Un placer saludarte. Bienvenido a ConForce Venezuela. ¿En qué te puedo colaborar hoy? ¿Buscas tecnología, comida, farmacia, repuestos o algún servicio?").
     No sueltes discursos prefabricados ni párrafos impersonales.
     En un saludo simple, matchedBusinessIds y matchedProductIds deben ser arreglos vacíos [].
   - Si el cliente te saluda Y pregunta algo a la vez (ej: "Buenas tardes, ¿tienen comida o pizza?"):
     Devuélvele el saludo con cortesía ("¡Buenas tardes! 🍕 Con gusto...") y atiende de inmediato lo que busca.

2. MULTICATEGORÍA COMPLETA:
   - Con Force vende de TODO: teléfonos y computación, comida y restaurantes, medicinas y farmacia, supermercado y víveres, herramientas y ferretería, ropa y calzado, repuestos automotrices, etc.
   - NUNCA asumas que el usuario busca repuestos a menos que él lo mencione explícitamente.

3. PRECIOS Y DISPONIBILIDAD:
   - Moneda oficial: Bolívares (Bs.). Precios transparentes.
   - Si el producto exacto no está en el catálogo, recomiéndale con amabilidad los comercios afines disponibles en Con Force.
   - Formato WhatsApp: breve, claro, emojis amigables (🇻🇪, 🛒, 📱, 🍔, 💊, 🛠️, 🚗, ✨) y llamada a la acción.`;

    const prompt = `UBICACIÓN DEL CLIENTE: ${userLocation ? `Lat: ${userLocation.lat}, Lng: ${userLocation.lng}` : 'No especificada'}

CATÁLOGO REAL DISPONIBLE:
${JSON.stringify(catalogContext || [], null, 2)}

MENSAJE DEL CLIENTE:
"${userMessage}"

Analiza el mensaje del cliente. Si es un saludo, responde al saludo con cortesía y pregúntale en qué le ayudas. Si busca productos o servicios, oriéntalo con precisión.`;

    // Try models with separate quota allocations and fallback order
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
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
          setTimeout(() => reject(new Error(`Timeout exceeding 10000ms on ${model}`)), 10000)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        const text = response?.text;
        if (text) {
          const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
          parsed = JSON.parse(cleanedText);
          break;
        }
      } catch (err: any) {
        // Silently skip to next model on 429 quota exhaustion or 503 busy
        const errMsg = err?.message || String(err);
        if (errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('quota') || errMsg.includes('demand')) {
          continue;
        }
      }
    }

    if (parsed && parsed.messageText) {
      return res.status(200).json(parsed);
    }

    // Seamless fallback without raising server 500 error
    const fallback = generateServerFallback(userMessage, catalogContext);
    return res.status(200).json(fallback);
  } catch (error: any) {
    // Return graceful fallback rather than failing with 500
    const fallback = generateServerFallback(userMessage, catalogContext);
    return res.status(200).json(fallback);
  }
};

app.post('/api/gemini/chatbot', handleGeminiAssistant);
app.post('/api/gemini/assistant', handleGeminiAssistant);

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const hasRootIndex = fs.existsSync(path.resolve(process.cwd(), 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist || process.env.VERCEL === '1';

  if (!isProd && !hasDist) {
    // Development mode: attach Vite middleware dynamically
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static assets from dist or root
    const staticDir = hasDist ? distPath : process.cwd();
    app.use(express.static(staticDir));
    app.get('*', (req, res) => {
      const targetIndex = hasDist ? path.resolve(distPath, 'index.html') : path.resolve(process.cwd(), 'index.html');
      res.sendFile(targetIndex);
    });
  }

  // Handle both numeric ports and Unix sockets (common on Hostinger / LiteSpeed / Passenger)
  const portToListen = !isNaN(Number(PORT)) ? Number(PORT) : PORT;
  app.listen(portToListen, () => {
    console.log(`ConForce Server running on ${PORT}`);
  });
}

startServer();
