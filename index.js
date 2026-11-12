// server.ts
import express from "express";
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
  if (cleanQuery.includes("moto") || cleanQuery.includes("mensajero") || cleanQuery.includes("repartidor") || cleanQuery.includes("motorizado") || cleanQuery.includes("delivery") || cleanQuery.includes("carrera") || cleanQuery.includes("chofer") || cleanQuery.includes("conducir")) {
    return {
      messageText: `\u{1F6F5} *\xA1\xDAnete a la Flota de Mensajeros en Moto de ConForce Venezuela!*

Genera ingresos diarios entregando pedidos de comercios y restaurantes aliados en tu ciudad.

\u{1F4CB} *Requisitos para registrarte:*
\u2022 Motocicleta propia en buen estado con casco (ej. Bera SBR 150, Empire Keeway Horse, Suzuki GN 125, etc.).
\u2022 C\xE9dula de Identidad (V/E) y Licencia de conducir vigente.
\u2022 Placa visible del veh\xEDculo.
\u2022 Tel\xE9fono inteligente con GPS y cuenta bancaria para cobrar por Pago M\xF3vil en Bol\xEDvares (Bs.).

\u2728 *Beneficios:*
\u2022 Pagos directos por cada carrera completada.
\u2022 Panel t\xE1ctil para mensajeros con navegaci\xF3n integrada en Google Maps y Waze.
\u2022 Horarios flexibles y soporte continuo.

\u{1F449} Haz clic en el bot\xF3n abajo para abrir el formulario de registro de mensajeros en moto:`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: "open_driver_register"
    };
  }
  if (cleanQuery.includes("negocio") || cleanQuery.includes("comercio") || cleanQuery.includes("afiliar") || cleanQuery.includes("vender") || cleanQuery.includes("tienda") || cleanQuery.includes("publicar") || cleanQuery.includes("abrir tienda") || cleanQuery.includes("registrar mi negocio")) {
    return {
      messageText: `\u{1F3EA} *\xA1Registra tu Comercio en ConForce Marketplace!*

\xA1La publicaci\xF3n de cat\xE1logos y productos es **100% GRATUITA** para todos los comercios y emprendedores en Venezuela!

\u{1F4CB} *Requisitos de afiliaci\xF3n:*
\u2022 Nombre comercial y categor\xEDa de tu tienda (Tecnolog\xEDa, Restaurante, Farmacia, Repuestos, V\xEDveres, etc.).
\u2022 Documento de identidad o RIF.
\u2022 N\xFAmero de WhatsApp comercial para recibir pedidos al instante.
\u2022 Direcci\xF3n f\xEDsica para despacho o retiro en tienda.

\u2728 *Ventajas para tu negocio:*
\u2022 Panel en vivo para gestionar productos, fotos y precios en Bol\xEDvares (Bs.).
\u2022 Integraci\xF3n directa con mensajeros en moto para delivery express.
\u2022 Opciones de Ads y Boost para posicionar tus productos como "Ofertas del D\xEDa".

\u{1F449} Haz clic abajo para completar tu registro de negocio de inmediato:`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: "open_business_register"
    };
  }
  if (cleanQuery.includes("como comprar") || cleanQuery.includes("c\xF3mo comprar") || cleanQuery.includes("como pedir") || cleanQuery.includes("c\xF3mo pedir") || cleanQuery.includes("como funciona") || cleanQuery.includes("pago movil") || cleanQuery.includes("pago m\xF3vil") || cleanQuery.includes("metodo de pago") || cleanQuery.includes("metodos de pago") || cleanQuery.includes("tarifa") || cleanQuery.includes("costo de envio") || cleanQuery.includes("costo de env\xEDo") || cleanQuery.includes("comision") || cleanQuery.includes("comisi\xF3n")) {
    return {
      messageText: `\u{1F6CD}\uFE0F *Gu\xEDa Oficial de Compra en ConForce Venezuela:*

Comprar en nuestro Marketplace es r\xE1pido, transparente y seguro:

1\uFE0F\u20E3 **Explora:** Busca productos en el cat\xE1logo o en el mapa interactivo por cercan\xEDa.
2\uFE0F\u20E3 **Agrega al Carrito:** Selecciona tus art\xEDculos con precios actualizados en Bol\xEDvares (Bs.).
3\uFE0F\u20E3 **Elige tu Entrega:**
   \u2022 \u{1F6F5} **Delivery en Moto:** Tarifa plana de **Bs. 35** (entregas en < 45 min).
   \u2022 \u{1F3EC} **Retiro en Tienda:** Totalmente Gratis.
4\uFE0F\u20E3 **Pago Seguro:** Paga c\xF3modamente mediante **Pago M\xF3vil** o transferencia bancaria e ingresa tu n\xFAmero de referencia.
5\uFE0F\u20E3 **Rastreo en Vivo:** Conoce el estado de tu pedido y visualiza al mensajero asignado en camino.

*(Tarifa de servicio: 5% del subtotal para soporte prioritario y seguro de entrega).*`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: "view_cart"
    };
  }
  if (cleanQuery.includes("iniciar sesion") || cleanQuery.includes("iniciar sesi\xF3n") || cleanQuery.includes("crear cuenta") || cleanQuery.includes("registrarse") || cleanQuery.includes("mi cuenta") || cleanQuery.includes("login")) {
    return {
      messageText: `\u{1F464} *Acceso y Registro de Usuarios en ConForce*

Puedes crear tu cuenta de cliente en segundos con tu correo, tel\xE9fono y direcci\xF3n de entrega habitual. As\xED podr\xE1s guardar favoritos, acumular historial y pagar con un solo clic.

\u{1F449} Accede a tu cuenta o reg\xEDstrate haciendo clic abajo:`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: "open_client_auth"
    };
  }
  if (cleanQuery.includes("mapa") || cleanQuery.includes("donde estan") || cleanQuery.includes("d\xF3nde est\xE1n") || cleanQuery.includes("cercanos") || cleanQuery.includes("ubicacion") || cleanQuery.includes("ubicaci\xF3n")) {
    return {
      messageText: `\u{1F5FA}\uFE0F *Mapa Interactivo de Comercios ConForce*

Puedes explorar las tiendas afiliadas directamente sobre el mapa, filtradas por cercan\xEDa GPS, rubro y estado de apertura.

\u{1F449} Haz clic abajo para abrir el mapa interactivo:`,
      matchedBusinessIds: (catalogContext || []).slice(0, 3).map((b) => b.id),
      matchedProductIds: [],
      category: null,
      actionType: "view_map"
    };
  }
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
    const systemInstruction = `Eres "Asistente ConForce", el asesor inteligente, emp\xE1tico y experto de ConForce Venezuela (Marketplace Multicategor\xEDa de Comercio, Tecnolog\xEDa, Alimentos, Farmacia, Ferreter\xEDa, Repuestos, Moda y Servicios en Venezuela).
Tu objetivo es orientar a los usuarios tanto en la web como en WhatsApp con tono profesional, c\xE1lido, \xE1gil y resolutivo.

CAPACIDADES Y CONOCIMIENTO OFICIAL DEL MARKETPLACE:

1. ASESOR\xCDA DE REGISTRO PARA COMERCIOS Y NEGOCIOS:
   - Si el usuario pregunta c\xF3mo afiliar su tienda, registrar su negocio o vender productos:
     * Expl\xEDcale que la publicaci\xF3n de cat\xE1logos y productos en ConForce es 100% GRATUITA para todos los comercios y emprendedores.
     * Requisitos: Nombre comercial, RIF o documento de identidad, n\xFAmero de WhatsApp para recibir pedidos directamente y cat\xE1logo inicial.
     * Cuentan con panel en vivo para actualizar precios e inventario en Bs., adem\xE1s de opciones de Ads/Boost para destacar productos.
     * Asigna actionType: "open_business_register".

2. ASESOR\xCDA DE REGISTRO PARA MENSAJEROS EN MOTO:
   - Si el usuario pregunta c\xF3mo ser repartidor, mensajero en moto o generar ingresos entregando pedidos:
     * Expl\xEDcale que ConForce dispone de una flota activa de mensajer\xEDa express en moto.
     * Requisitos: Motocicleta propia en buen estado (ej. Bera SBR 150, Empire Keeway Horse, Suzuki GN 125, etc.), placa, licencia de conducir vigente, c\xE9dula y cuenta bancaria para cobrar por Pago M\xF3vil.
     * Beneficios: Gana por cada carrera completada, cobros garantizados en Bol\xEDvares por Pago M\xF3vil y panel m\xF3vil t\xE1ctil con rutas en Google Maps y Waze.
     * Asigna actionType: "open_driver_register".

3. GU\xCDA DE COMPRA Y M\xC9TODOS DE PAGO:
   - Si el usuario pregunta c\xF3mo comprar, c\xF3mo pagar o c\xF3mo funciona el marketplace:
     * Pasos: 1) Explora tiendas y productos en el cat\xE1logo o mapa \u2794 2) A\xF1ade lo que desees al carrito \u2794 3) Selecciona si deseas Entrega en Moto a Domicilio o Retiro en Tienda \u2794 4) Realiza tu pago en Bol\xEDvares (Pago M\xF3vil o Transferencia) e introduce tu n\xFAmero de referencia \u2794 5) Sigue tu pedido en vivo con el motorizado asignado.
     * Costo de env\xEDo delivery local: Bs. 35 tarifa plana en moto (o Gratis en Retiro en Tienda). Tarifa de servicio: 5% del subtotal para soporte prioritario y seguro.
     * Asigna actionType: "view_cart" o "open_client_auth".

4. B\xDASQUEDA DE COMERCIOS Y PRODUCTOS:
   - Cuando busquen un producto, marca o rubro espec\xEDfico (ej. farmacia, repuestos, comida, celulares):
     * Proporciona respuesta emp\xE1tica en Bol\xEDvares (Bs.).
     * Rellena matchedProductIds y matchedBusinessIds con los elementos exactos del cat\xE1logo.
     * Asigna actionType: "view_catalog".

5. SALUDOS Y CORTES\xCDA VENEZOLANA:
   - Responde con calidez humana ("\xA1Buenas tardes! \u2600\uFE0F Un placer saludarte. Bienvenido a ConForce Venezuela...").
   - Emojis recomendados: \u{1F1FB}\u{1F1EA}, \u{1F6D2}, \u{1F3EA}, \u{1F6F5}, \u{1F4F1}, \u{1F354}, \u{1F48A}, \u{1F6E0}\uFE0F, \u{1F697}, \u2728.`;
    const prompt = `UBICACI\xD3N DEL CLIENTE: ${userLocation ? `Lat: ${userLocation.lat}, Lng: ${userLocation.lng}` : "No especificada"}

CAT\xC1LOGO REAL DISPONIBLE:
${JSON.stringify(catalogContext || [], null, 2)}

MENSAJE DEL CLIENTE:
"${userMessage}"

Analiza el mensaje del cliente. Si busca registrarse como negocio o mensajero, ori\xE9ntalo con los requisitos y fija el actionType correspondiente. Si busca comprar o rastrear, dale la gu\xEDa de compra. Si busca productos, ind\xEDcale opciones y precios en Bs.`;
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
                  description: "Texto de respuesta profesional, emp\xE1tico y completo con emojis en espa\xF1ol venezolano."
                },
                actionType: {
                  type: Type.STRING,
                  description: 'Acci\xF3n interactiva recomendada: "open_business_register", "open_driver_register", "open_client_auth", "view_cart", "view_map", "view_catalog", o "none".'
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
  const hasRootIndex = fs.existsSync(path.resolve(process.cwd(), "index.html"));
  const isProd = process.env.NODE_ENV === "production" || hasDist || process.env.VERCEL === "1";
  if (!isProd && !hasDist) {
    const { createServer: createViteServer } = await import("vite");
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
    const staticDir = hasDist ? distPath : process.cwd();
    app.use(express.static(staticDir));
    app.get("*", (req, res) => {
      const targetIndex = hasDist ? path.resolve(distPath, "index.html") : path.resolve(process.cwd(), "index.html");
      res.sendFile(targetIndex);
    });
  }
  const portToListen = !isNaN(Number(PORT)) ? Number(PORT) : PORT;
  app.listen(portToListen, () => {
    console.log(`ConForce Server running on ${PORT}`);
  });
}
startServer();
