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
  actionType?: string;
}

function generateServerFallback(userMessage: string, catalogContext: any[]): FallbackOutput {
  const query = (userMessage || '').trim().toLowerCase();
  const cleanQuery = query.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '').trim();

  // 1. Motorcycle Couriers / Repartidores en Moto
  if (
    cleanQuery.includes('moto') ||
    cleanQuery.includes('mensajero') ||
    cleanQuery.includes('repartidor') ||
    cleanQuery.includes('motorizado') ||
    cleanQuery.includes('delivery') ||
    cleanQuery.includes('carrera') ||
    cleanQuery.includes('chofer') ||
    cleanQuery.includes('conducir')
  ) {
    return {
      messageText: `🛵 *¡Únete a la Flota de Mensajeros en Moto de ConForce Venezuela!*\n\nGenera ingresos diarios entregando pedidos de comercios y restaurantes aliados en tu ciudad.\n\n📋 *Requisitos para registrarte:*\n• Motocicleta propia en buen estado con casco (ej. Bera SBR 150, Empire Keeway Horse, Suzuki GN 125, etc.).\n• Cédula de Identidad (V/E) y Licencia de conducir vigente.\n• Placa visible del vehículo.\n• Teléfono inteligente con GPS y cuenta bancaria para cobrar por Pago Móvil en Bolívares (Bs.).\n\n✨ *Beneficios:*\n• Pagos directos por cada carrera completada.\n• Panel táctil para mensajeros con navegación integrada en Google Maps y Waze.\n• Horarios flexibles y soporte continuo.\n\n👉 Haz clic en el botón abajo para abrir el formulario de registro de mensajeros en moto:`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: 'open_driver_register'
    };
  }

  // 2. Business / Store Registration
  if (
    cleanQuery.includes('negocio') ||
    cleanQuery.includes('comercio') ||
    cleanQuery.includes('afiliar') ||
    cleanQuery.includes('vender') ||
    cleanQuery.includes('tienda') ||
    cleanQuery.includes('publicar') ||
    cleanQuery.includes('abrir tienda') ||
    cleanQuery.includes('registrar mi negocio')
  ) {
    return {
      messageText: `🏪 *¡Registra tu Comercio en ConForce Marketplace!*\n\n¡La publicación de catálogos y productos es **100% GRATUITA** para todos los comercios y emprendedores en Venezuela!\n\n📋 *Requisitos de afiliación:*\n• Nombre comercial y categoría de tu tienda (Tecnología, Restaurante, Farmacia, Repuestos, Víveres, etc.).\n• Documento de identidad o RIF.\n• Número de WhatsApp comercial para recibir pedidos al instante.\n• Dirección física para despacho o retiro en tienda.\n\n✨ *Ventajas para tu negocio:*\n• Panel en vivo para gestionar productos, fotos y precios en Bolívares (Bs.).\n• Integración directa con mensajeros en moto para delivery express.\n• Opciones de Ads y Boost para posicionar tus productos como "Ofertas del Día".\n\n👉 Haz clic abajo para completar tu registro de negocio de inmediato:`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: 'open_business_register'
    };
  }

  // 3. Buying guide, payments & fees
  if (
    cleanQuery.includes('como comprar') ||
    cleanQuery.includes('cómo comprar') ||
    cleanQuery.includes('como pedir') ||
    cleanQuery.includes('cómo pedir') ||
    cleanQuery.includes('como funciona') ||
    cleanQuery.includes('pago movil') ||
    cleanQuery.includes('pago móvil') ||
    cleanQuery.includes('metodo de pago') ||
    cleanQuery.includes('metodos de pago') ||
    cleanQuery.includes('tarifa') ||
    cleanQuery.includes('costo de envio') ||
    cleanQuery.includes('costo de envío') ||
    cleanQuery.includes('comision') ||
    cleanQuery.includes('comisión')
  ) {
    return {
      messageText: `🛍️ *Guía Oficial de Compra en ConForce Venezuela:*\n\nComprar en nuestro Marketplace es rápido, transparente y seguro:\n\n1️⃣ **Explora:** Busca productos en el catálogo o en el mapa interactivo por cercanía.\n2️⃣ **Agrega al Carrito:** Selecciona tus artículos con precios actualizados en Bolívares (Bs.).\n3️⃣ **Elige tu Entrega:**\n   • 🛵 **Delivery en Moto:** Tarifa plana de **Bs. 35** (entregas en < 45 min).\n   • 🏬 **Retiro en Tienda:** Totalmente Gratis.\n4️⃣ **Pago Seguro:** Paga cómodamente mediante **Pago Móvil** o transferencia bancaria e ingresa tu número de referencia.\n5️⃣ **Rastreo en Vivo:** Conoce el estado de tu pedido y visualiza al mensajero asignado en camino.\n\n*(Tarifa de servicio: 5% del subtotal para soporte prioritario y seguro de entrega).*`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: 'view_cart'
    };
  }

  // 4. Client Account / Login / Register
  if (
    cleanQuery.includes('iniciar sesion') ||
    cleanQuery.includes('iniciar sesión') ||
    cleanQuery.includes('crear cuenta') ||
    cleanQuery.includes('registrarse') ||
    cleanQuery.includes('mi cuenta') ||
    cleanQuery.includes('login')
  ) {
    return {
      messageText: `👤 *Acceso y Registro de Usuarios en ConForce*\n\nPuedes crear tu cuenta de cliente en segundos con tu correo, teléfono y dirección de entrega habitual. Así podrás guardar favoritos, acumular historial y pagar con un solo clic.\n\n👉 Accede a tu cuenta o regístrate haciendo clic abajo:`,
      matchedBusinessIds: [],
      matchedProductIds: [],
      category: null,
      actionType: 'open_client_auth'
    };
  }

  // 5. Interactive Map & Nearby Stores
  if (
    cleanQuery.includes('mapa') ||
    cleanQuery.includes('donde estan') ||
    cleanQuery.includes('dónde están') ||
    cleanQuery.includes('cercanos') ||
    cleanQuery.includes('ubicacion') ||
    cleanQuery.includes('ubicación')
  ) {
    return {
      messageText: `🗺️ *Mapa Interactivo de Comercios ConForce*\n\nPuedes explorar las tiendas afiliadas directamente sobre el mapa, filtradas por cercanía GPS, rubro y estado de apertura.\n\n👉 Haz clic abajo para abrir el mapa interactivo:`,
      matchedBusinessIds: (catalogContext || []).slice(0, 3).map((b: any) => b.id),
      matchedProductIds: [],
      category: null,
      actionType: 'view_map'
    };
  }

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

    const systemInstruction = `Eres "Asistente ConForce", el asesor inteligente, empático y experto de ConForce Venezuela (Marketplace Multicategoría de Comercio, Tecnología, Alimentos, Farmacia, Ferretería, Repuestos, Moda y Servicios en Venezuela).
Tu objetivo es orientar a los usuarios tanto en la web como en WhatsApp con tono profesional, cálido, ágil y resolutivo.

CAPACIDADES Y CONOCIMIENTO OFICIAL DEL MARKETPLACE:

1. ASESORÍA DE REGISTRO PARA COMERCIOS Y NEGOCIOS:
   - Si el usuario pregunta cómo afiliar su tienda, registrar su negocio o vender productos:
     * Explícale que la publicación de catálogos y productos en ConForce es 100% GRATUITA para todos los comercios y emprendedores.
     * Requisitos: Nombre comercial, RIF o documento de identidad, número de WhatsApp para recibir pedidos directamente y catálogo inicial.
     * Cuentan con panel en vivo para actualizar precios e inventario en Bs., además de opciones de Ads/Boost para destacar productos.
     * Asigna actionType: "open_business_register".

2. ASESORÍA DE REGISTRO PARA MENSAJEROS EN MOTO:
   - Si el usuario pregunta cómo ser repartidor, mensajero en moto o generar ingresos entregando pedidos:
     * Explícale que ConForce dispone de una flota activa de mensajería express en moto.
     * Requisitos: Motocicleta propia en buen estado (ej. Bera SBR 150, Empire Keeway Horse, Suzuki GN 125, etc.), placa, licencia de conducir vigente, cédula y cuenta bancaria para cobrar por Pago Móvil.
     * Beneficios: Gana por cada carrera completada, cobros garantizados en Bolívares por Pago Móvil y panel móvil táctil con rutas en Google Maps y Waze.
     * Asigna actionType: "open_driver_register".

3. GUÍA DE COMPRA Y MÉTODOS DE PAGO:
   - Si el usuario pregunta cómo comprar, cómo pagar o cómo funciona el marketplace:
     * Pasos: 1) Explora tiendas y productos en el catálogo o mapa ➔ 2) Añade lo que desees al carrito ➔ 3) Selecciona si deseas Entrega en Moto a Domicilio o Retiro en Tienda ➔ 4) Realiza tu pago en Bolívares (Pago Móvil o Transferencia) e introduce tu número de referencia ➔ 5) Sigue tu pedido en vivo con el motorizado asignado.
     * Costo de envío delivery local: Bs. 35 tarifa plana en moto (o Gratis en Retiro en Tienda). Tarifa de servicio: 5% del subtotal para soporte prioritario y seguro.
     * Asigna actionType: "view_cart" o "open_client_auth".

4. BÚSQUEDA DE COMERCIOS Y PRODUCTOS:
   - Cuando busquen un producto, marca o rubro específico (ej. farmacia, repuestos, comida, celulares):
     * Proporciona respuesta empática en Bolívares (Bs.).
     * Rellena matchedProductIds y matchedBusinessIds con los elementos exactos del catálogo.
     * Asigna actionType: "view_catalog".

5. SALUDOS Y CORTESÍA VENEZOLANA:
   - Responde con calidez humana ("¡Buenas tardes! ☀️ Un placer saludarte. Bienvenido a ConForce Venezuela...").
   - Emojis recomendados: 🇻🇪, 🛒, 🏪, 🛵, 📱, 🍔, 💊, 🛠️, 🚗, ✨.`;

    const prompt = `UBICACIÓN DEL CLIENTE: ${userLocation ? `Lat: ${userLocation.lat}, Lng: ${userLocation.lng}` : 'No especificada'}

CATÁLOGO REAL DISPONIBLE:
${JSON.stringify(catalogContext || [], null, 2)}

MENSAJE DEL CLIENTE:
"${userMessage}"

Analiza el mensaje del cliente. Si busca registrarse como negocio o mensajero, oriéntalo con los requisitos y fija el actionType correspondiente. Si busca comprar o rastrear, dale la guía de compra. Si busca productos, indícale opciones y precios en Bs.`;

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
                  description: 'Texto de respuesta profesional, empático y completo con emojis en español venezolano.'
                },
                actionType: {
                  type: Type.STRING,
                  description: 'Acción interactiva recomendada: "open_business_register", "open_driver_register", "open_client_auth", "view_cart", "view_map", "view_catalog", o "none".'
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
  const rootDir = process.cwd();
  const distPath = path.resolve(rootDir, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');
  const entryScript = path.basename(process.argv[1] || '');
  const isCompiledServer = entryScript.endsWith('.js');
  const isProdMode =
    (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || isCompiledServer) &&
    fs.existsSync(distIndexPath);

  if (isProdMode) {
    // Production mode: serve built static assets from dist
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      if (fs.existsSync(distIndexPath)) {
        return res.sendFile(distIndexPath);
      }
      return res.status(503).send('La aplicación se está actualizando. Por favor recarga en unos segundos.');
    });
  } else {
    // Development mode (or fallback when dist/index.html is absent): attach Vite middleware dynamically
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
  }

  // Handle both numeric ports and Unix sockets (common on Hostinger / LiteSpeed / Passenger)
  const portToListen = !isNaN(Number(PORT)) ? Number(PORT) : PORT;
  app.listen(portToListen, () => {
    console.log(`ConForce Server running on ${PORT}`);
  });
}

startServer();
