// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
function generateServerFallback(userMessage, catalogContext) {
  const query = (userMessage || "").trim().toLowerCase();
  const cleanQuery = query.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, "").trim();
  if (/^(buenas tardes|tardes)$/i.test(cleanQuery)) {
    return {
      messageText: `\xA1Buenas tardes! \u2600\uFE0F Un placer saludarte. Bienvenido a *ConForce Venezuela*.

\xBFEn qu\xE9 te podemos colaborar hoy? Cu\xE9ntanos qu\xE9 producto, tienda o servicio est\xE1s buscando (tecnolog\xEDa, comida, v\xEDveres, farmacia, repuestos, etc.) y te dar\xE9 opciones y precios de inmediato.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }
  if (/^(buenos dias|buen dia|buenos días)$/i.test(cleanQuery)) {
    return {
      messageText: `\xA1Buenos d\xEDas! \u{1F305} \xA1Qu\xE9 gusto saludarte! Bienvenido a *ConForce Venezuela*.

\xBFEn qu\xE9 te podemos ayudar hoy? Dime qu\xE9 est\xE1s buscando y con gusto te orientamos con los mejores comercios y precios en Bs.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }
  if (/^(buenas noches|noches)$/i.test(cleanQuery)) {
    return {
      messageText: `\xA1Buenas noches! \u{1F319} Un placer saludarte. Bienvenido a *ConForce Venezuela*.

\xBFQu\xE9 producto o comercio est\xE1s buscando hoy? Escr\xEDbenos y con gusto te ayudamos a conseguirlo.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }
  if (/^(hola|buenas|hey|que tal|qué tal|saludos|aló|alo)$/i.test(cleanQuery)) {
    return {
      messageText: `\xA1Hola! \u{1F44B} \xA1Mucho gusto! Bienvenido a *ConForce Venezuela*.

\xBFQu\xE9 est\xE1s buscando hoy? Tenemos comercios de tecnolog\xEDa, restaurantes, supermercado, farmacias, ferreter\xEDa, repuestos y servicios. \xA1Escr\xEDbeme lo que necesitas y te ayudo!`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }
  if (/^(gracias|muchas gracias|mil gracias|agradecido|agradecida)$/i.test(cleanQuery)) {
    return {
      messageText: `\xA1Con much\xEDsimo gusto! \u{1F60A} Estamos a tu completa orden en *ConForce*. Si necesitas consultar otro producto o comercio, aqu\xED estoy para ayudarte.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }
  if (/^(adios|adiós|chao|chau|hasta luego|nos vemos)$/i.test(cleanQuery)) {
    return {
      messageText: `\xA1Hasta luego! \u{1F44B} Que tengas un excelente d\xEDa. Vuelve pronto a *ConForce Venezuela*.`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null
    };
  }
  const greetingPrefix = /buenas tardes/i.test(query) ? "\xA1Buenas tardes! \u2600\uFE0F " : /buenos dias|buen dia|buenos días/i.test(query) ? "\xA1Buenos d\xEDas! \u{1F305} " : /buenas noches/i.test(query) ? "\xA1Buenas noches! \u{1F319} " : /hola|buenas|saludos/i.test(query) ? "\xA1Hola! \u{1F44B} " : "";
  const words = cleanQuery.split(/\s+/).filter((w) => w.length > 2);
  const matchedProds = [];
  let matchedBiz = null;
  for (const b of catalogContext || []) {
    for (const p of b.products || []) {
      const pName = (p.name || "").toLowerCase();
      const pTags = (p.tags || "").toLowerCase();
      if (pName.includes(cleanQuery) || words.some((w) => pName.includes(w) || pTags.includes(w))) {
        matchedProds.push({ ...p, bizName: b.name, bizId: b.id, bizCategory: b.category });
        if (!matchedBiz) matchedBiz = b;
      }
    }
  }
  if (matchedProds.length > 0) {
    const topProd = matchedProds[0];
    const isPlural = matchedProds.length > 1;
    return {
      messageText: `${greetingPrefix}\u{1F4CD} \xA1Encontr\xE9 *${topProd.name}* disponible en *${topProd.bizName}* por *Bs. ${Number(topProd.price).toLocaleString()}*!

${isPlural ? `\u{1F50D} Tambi\xE9n localic\xE9 ${matchedProds.length - 1} opci\xF3n(es) adicional(es) en nuestro cat\xE1logo.` : "\u2728 Stock disponible para entrega inmediata o retiro en tienda."}

\u{1F449} Accede directo aqu\xED para ver detalles y ordenar:`,
      matchedBusinessIds: [topProd.bizId],
      matchedProductIds: matchedProds.slice(0, 3).map((p) => p.id),
      category: topProd.bizCategory || null
    };
  }
  for (const b of catalogContext || []) {
    const bName = (b.name || "").toLowerCase();
    const bCat = (b.category || "").toLowerCase();
    if (bName.includes(cleanQuery) || bCat.includes(cleanQuery) || words.some((w) => bName.includes(w) || bCat.includes(w))) {
      return {
        messageText: `${greetingPrefix}\u{1F3EC} Encontr\xE9 el comercio aliado *${b.name}* (${b.category}) en ConForce.

\u{1F4CD} Direcci\xF3n: ${b.address || "Ubicaci\xF3n c\xE9ntrica"}.

Puedes revisar sus productos destacados directamente en nuestro cat\xE1logo.`,
        matchedBusinessIds: [b.id],
        matchedProductIds: (b.products || []).slice(0, 2).map((p) => p.id),
        category: b.category || null
      };
    }
  }
  return {
    messageText: `${greetingPrefix}\u{1F50E} Estamos consultando en todos los comercios afiliados a *ConForce Venezuela*.

Contamos con tiendas de tecnolog\xEDa, farmacias, supermercados, ferreter\xEDas, restaurantes y repuestos.

\xBFDeseas buscar un producto espec\xEDfico, marca o categor\xEDa? Escr\xEDbemelo y te dar\xE9 opciones con precios en Bs.`,
    matchedBusinessIds: (catalogContext || []).slice(0, 3).map((b) => b.id),
    matchedProductIds: [],
    category: null
  };
}
var handleGeminiAssistant = async (req, res) => {
  const { userMessage, userLocation, catalogContext } = req.body || {};
  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing userMessage in request body" });
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.WEB_ASSISTANT_API_KEY || "AQ.Ab8RN6Jq1Ghsg8ZWZ8PZOrJnsiHXSN9orz_JdmlgIaJV1NMs1Q";
  if (!apiKey) {
    const fallback = generateServerFallback(userMessage, catalogContext);
    return res.status(200).json(fallback);
  }
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const systemInstruction = `Eres "Asistente ConForce", el asesor de compras inteligente, emp\xE1tico y servicial de ConForce Venezuela (Marketplace Multicategor\xEDa de Comercio, Tecnolog\xEDa, Alimentos, Farmacia, Ferreter\xEDa, Repuestos, Moda y Servicios en Venezuela).
Tu objetivo es atender a los clientes por WhatsApp con tono ultra profesional, c\xE1lido, \xE1gil y enfocado en ayudarlos a encontrar lo que necesitan en el marketplace.

PAUTAS CRUCIALES DE CONVERSACI\xD3N:
1. SALUDOS Y CORTES\xCDA:
   - Si el cliente te saluda (ej: "Buenas tardes", "Buenos d\xEDas", "Buenas noches", "Hola", "Saludos", "Qu\xE9 tal"):
     RESPONDE DIRECTAMENTE AL SALUDO con amabilidad y educaci\xF3n humana (ej: si dice "Buenas tardes", responde: "\xA1Buenas tardes! \u2600\uFE0F Un placer saludarte. Bienvenido a ConForce Venezuela. \xBFEn qu\xE9 te puedo colaborar hoy? \xBFBuscas tecnolog\xEDa, comida, farmacia, repuestos o alg\xFAn servicio?").
     No sueltes discursos prefabricados ni p\xE1rrafos impersonales.
     En un saludo simple, matchedBusinessIds y matchedProductIds deben ser arreglos vac\xEDos [].
   - Si el cliente te saluda Y pregunta algo a la vez (ej: "Buenas tardes, \xBFtienen comida o pizza?"):
     Devu\xE9lvele el saludo con cortes\xEDa ("\xA1Buenas tardes! \u{1F355} Con gusto...") y atiende de inmediato lo que busca.

2. MULTICATEGOR\xCDA COMPLETA:
   - Con Force vende de TODO: tel\xE9fonos y computaci\xF3n, comida y restaurantes, medicinas y farmacia, supermercado y v\xEDveres, herramientas y ferreter\xEDa, ropa y calzado, repuestos automotrices, etc.
   - NUNCA asumas que el usuario busca repuestos a menos que \xE9l lo mencione expl\xEDcitamente.

3. PRECIOS Y DISPONIBILIDAD:
   - Moneda oficial: Bol\xEDvares (Bs.). Precios transparentes.
   - Si el producto exacto no est\xE1 en el cat\xE1logo, recomi\xE9ndale con amabilidad los comercios afines disponibles en Con Force.
   - Formato WhatsApp: breve, claro, emojis amigables (\u{1F1FB}\u{1F1EA}, \u{1F6D2}, \u{1F4F1}, \u{1F354}, \u{1F48A}, \u{1F6E0}\uFE0F, \u{1F697}, \u2728) y llamada a la acci\xF3n.`;
    const prompt = `UBICACI\xD3N DEL CLIENTE: ${userLocation ? `Lat: ${userLocation.lat}, Lng: ${userLocation.lng}` : "No especificada"}

CAT\xC1LOGO REAL DISPONIBLE:
${JSON.stringify(catalogContext || [], null, 2)}

MENSAJE DEL CLIENTE:
"${userMessage}"

Analiza el mensaje del cliente. Si es un saludo, responde al saludo con cortes\xEDa y preg\xFAntale en qu\xE9 le ayudas. Si busca productos o servicios, ori\xE9ntalo con precisi\xF3n.`;
    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
    let parsed = null;
    for (const model of modelsToTry) {
      try {
        const responsePromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                messageText: {
                  type: Type.STRING,
                  description: "Texto de respuesta profesional en espa\xF1ol adaptado para WhatsApp con emojis."
                },
                matchedBusinessIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "IDs de comercios del cat\xE1logo que tienen o atienden lo que busca el cliente."
                },
                matchedProductIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "IDs de productos del cat\xE1logo que coinciden con la b\xFAsqueda."
                },
                category: {
                  type: Type.STRING,
                  description: "Categor\xEDa identificada (tecnologia, farmacia, restaurante, supermercado, ferreteria, repuestos, moda, servicios) o null."
                }
              },
              required: ["messageText", "matchedBusinessIds", "matchedProductIds"]
            }
          }
        });
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error(`Timeout exceeding 10000ms on ${model}`)), 1e4)
        );
        const response = await Promise.race([responsePromise, timeoutPromise]);
        const text = response?.text;
        if (text) {
          const cleanedText = text.replace(/```json\s*|\s*```/g, "").trim();
          parsed = JSON.parse(cleanedText);
          break;
        }
      } catch (err) {
        const errMsg = err?.message || String(err);
        if (errMsg.includes("429") || errMsg.includes("503") || errMsg.includes("quota") || errMsg.includes("demand")) {
          continue;
        }
      }
    }
    if (parsed && parsed.messageText) {
      return res.status(200).json(parsed);
    }
    const fallback = generateServerFallback(userMessage, catalogContext);
    return res.status(200).json(fallback);
  } catch (error) {
    const fallback = generateServerFallback(userMessage, catalogContext);
    return res.status(200).json(fallback);
  }
};
app.post("/api/gemini/chatbot", handleGeminiAssistant);
app.post("/api/gemini/assistant", handleGeminiAssistant);
async function startServer() {
  const distPath = path.resolve(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.resolve(distPath, "index.html"));
  const isProd = process.env.NODE_ENV === "production" || hasDist && process.env.NODE_ENV !== "development";
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {}
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`ConForce Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
