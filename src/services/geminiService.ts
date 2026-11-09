import { Business, Product, BusinessCategory } from '../types';
import { buildDeepLink } from '../utils/urlUtils';

export interface ChatbotResponse {
  messageText: string;
  foundProducts: Product[];
  recommendedBusinesses: Business[];
  deepLink?: string;
  categoryDetected?: BusinessCategory;
}

type ProductsDirectory = Product[];

export async function processChatbotMessage(
  userMessage: string,
  userLocation: { lat: number; lng: number } | null,
  businesses: Business[],
  products: ProductsDirectory
): Promise<ChatbotResponse> {
  const queryLower = userMessage.toLowerCase().trim();

  // Prepare multi-category catalog context for server-side Gemini AI
  const catalogContext = businesses.map((b) => {
    const bizProducts = products.filter((p) => p.businessId === b.id);
    return {
      id: b.id,
      name: b.name,
      category: b.category,
      address: b.address,
      coords: b.coordinates,
      products: bizProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        tags: p.tags.join(', '),
        inStock: p.inStock,
        isOffer: p.isOfferOfTheDay
      }))
    };
  });

  // Call Server-Side Gemini API endpoint (works on both local server and Vercel serverless)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const response = await fetch('/api/gemini/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userMessage,
        userLocation,
        catalogContext
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      if (data && data.messageText) {
        const matchedBusinesses = businesses.filter((b) =>
          data.matchedBusinessIds?.includes(b.id)
        );
        const matchedProducts = products.filter((p) =>
          data.matchedProductIds?.includes(p.id)
        );

        const primaryBiz = matchedBusinesses[0] || businesses[0];
        const primaryProd = matchedProducts[0];

        const deepLink = buildDeepLink({
          businessId: primaryBiz?.id,
          productId: primaryProd?.id,
          category: data.category || primaryBiz?.category
        });

        return {
          messageText: data.messageText,
          foundProducts: matchedProducts,
          recommendedBusinesses: matchedBusinesses.length > 0 ? matchedBusinesses : (primaryBiz ? [primaryBiz] : []),
          deepLink,
          categoryDetected: data.category as BusinessCategory
        };
      }
    }
  } catch (error) {
    console.warn('Chatbot server API route not reachable, transitioning to smart local engine:', error);
  }

  // Multi-Category Intelligent Marketplace Matching Engine
  return fallbackIntelligentMatcher(queryLower, businesses, products, userLocation);
}

/**
 * Multi-Category Venezuelan Marketplace Intelligent Matching Engine
 * Handles ANY search (tech, groceries, food, health, hardware, clothing, auto, etc.)
 * NEVER repeats the default welcome message when a user asks a question.
 */
function fallbackIntelligentMatcher(
  query: string,
  businesses: Business[],
  products: Product[],
  _userLocation: { lat: number; lng: number } | null
): ChatbotResponse {
  const cleanQuery = query.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '').trim().toLowerCase();

  // Natural conversational greeting replies
  if (/^(buenas tardes|tardes)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Buenas tardes! ☀️ Un placer saludarte. Bienvenido a *ConForce Venezuela*.\n\n¿En qué te podemos colaborar hoy? Cuéntanos qué producto, tienda o servicio estás buscando (tecnología, comida, víveres, farmacia, repuestos, etc.) y te daré opciones y precios de inmediato.`,
      foundProducts: [],
      recommendedBusinesses: businesses.slice(0, 3),
      deepLink: buildDeepLink()
    };
  }

  if (/^(buenos dias|buen dia|buenos días)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Buenos días! 🌅 ¡Qué gusto saludarte! Bienvenido a *ConForce Venezuela*.\n\n¿En qué te podemos ayudar hoy? Dime qué estás buscando y con gusto te orientamos con los mejores comercios y precios en Bs.`,
      foundProducts: [],
      recommendedBusinesses: businesses.slice(0, 3),
      deepLink: buildDeepLink()
    };
  }

  if (/^(buenas noches|noches)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Buenas noches! 🌙 Un placer saludarte. Bienvenido a *ConForce Venezuela*.\n\n¿Qué producto o comercio estás buscando hoy? Escríbenos y con gusto te ayudamos a conseguirlo.`,
      foundProducts: [],
      recommendedBusinesses: businesses.slice(0, 3),
      deepLink: buildDeepLink()
    };
  }

  if (/^(hola|buenas|hey|que tal|qué tal|saludos|aló|alo)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Hola! 👋 ¡Mucho gusto! Bienvenido a *ConForce Venezuela*.\n\n¿Qué estás buscando hoy? Tenemos comercios de tecnología, restaurantes, supermercado, farmacias, ferretería, repuestos y servicios. ¡Escríbeme lo que necesitas y te ayudo!`,
      foundProducts: [],
      recommendedBusinesses: businesses.slice(0, 3),
      deepLink: buildDeepLink()
    };
  }

  if (/^(gracias|muchas gracias|mil gracias|agradecido|agradecida)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Con muchísimo gusto! 😊 Estamos a tu completa orden en *ConForce*. Si necesitas consultar otro producto o comercio, aquí estoy para ayudarte.`,
      foundProducts: [],
      recommendedBusinesses: businesses.slice(0, 3),
      deepLink: buildDeepLink()
    };
  }

  if (/^(adios|adiós|chao|chau|hasta luego|nos vemos)$/i.test(cleanQuery)) {
    return {
      messageText: `¡Hasta luego! 👋 Que tengas un excelente día. Vuelve pronto a *ConForce Venezuela*.`,
      foundProducts: [],
      recommendedBusinesses: businesses.slice(0, 3),
      deepLink: buildDeepLink()
    };
  }

  // Detect if user included a greeting with their query
  const greetingPrefix = /buenas tardes/i.test(query)
    ? '¡Buenas tardes! ☀️ '
    : /buenos dias|buen dia|buenos días/i.test(query)
    ? '¡Buenos días! 🌅 '
    : /buenas noches/i.test(query)
    ? '¡Buenas noches! 🌙 '
    : /hola|buenas|saludos/i.test(query)
    ? '¡Hola! 👋 '
    : '';

  // Normalize query words
  const words = query
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  // 1. Direct or partial product search across ALL categories
  const matchedProducts = products.filter((p) => {
    const nameLower = p.name.toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    const tagsLower = p.tags.map((t) => t.toLowerCase());

    if (nameLower.includes(query) || descLower.includes(query)) return true;

    const matchCount = words.filter((w) => {
      return (
        nameLower.includes(w) ||
        descLower.includes(w) ||
        tagsLower.some((t) => t.includes(w) || w.includes(t))
      );
    }).length;

    return matchCount >= 1;
  });

  if (matchedProducts.length > 0) {
    const primaryProduct = matchedProducts[0];
    const biz = businesses.find((b) => b.id === primaryProduct.businessId) || businesses[0];
    const deepLink = buildDeepLink({
      businessId: biz?.id,
      productId: primaryProduct.id,
      category: biz?.category
    });

    const isPlural = matchedProducts.length > 1;
    return {
      messageText: `${greetingPrefix}📍 ¡Encontré *${primaryProduct.name}* disponible en *${biz?.name || 'Comercio Afiliado'}* por *Bs. ${primaryProduct.price.toLocaleString()}*!\n\n${
        isPlural
          ? `🔍 También localicé ${matchedProducts.length - 1} opción(es) adicional(es) en nuestro catálogo.`
          : '✨ Stock disponible para entrega inmediata o retiro en tienda.'
      }\n\n👉 Accede directo aquí para ver detalles y ordenar:`,
      foundProducts: matchedProducts,
      recommendedBusinesses: biz ? [biz] : [],
      deepLink,
      categoryDetected: biz?.category
    };
  }

  // 2. Multi-Category Domain Intent Detection

  // A. Technology / Phones / Electronics
  const techKeywords = [
    'celular', 'telefono', 'teléfono', 'iphone', 'samsung', 'xiaomi', 'redmi', 'laptop', 'computadora',
    'pc', 'tablet', 'cargador', 'cable', 'audifonos', 'audífonos', 'teclado', 'mouse', 'monitor',
    'pantalla', 'televisor', 'tv', 'smart', 'gadget', 'tecnologia', 'tecnología'
  ];
  if (techKeywords.some((k) => query.includes(k))) {
    const techBiz = businesses.filter(
      (b) => b.category === 'tecnologia' || b.name.toLowerCase().includes('tec') || b.tags.some(t => t.toLowerCase().includes('tec'))
    );
    const targetBiz = techBiz[0] || businesses[0];
    const bizProds = targetBiz ? products.filter((p) => p.businessId === targetBiz.id) : [];
    const deepLink = buildDeepLink({ businessId: targetBiz?.id, category: 'tecnologia' });

    return {
      messageText: `📱 *Tecnología y Electrónica en ConForce*\n\nDetectamos tu búsqueda de *"${query}"*. En nuestro Marketplace contamos con tiendas especializadas en telefonía, cómputo y accesorios con garantía y precios en Bs.\n\n👉 Explora los comercios y productos tecnológicos disponibles:`,
      foundProducts: bizProds.slice(0, 3),
      recommendedBusinesses: techBiz.length > 0 ? techBiz : [targetBiz],
      deepLink,
      categoryDetected: 'tecnologia'
    };
  }

  // B. Health / Pharmacy / Medicines
  const pharmacyKeywords = [
    'farmacia', 'medicina', 'medicamento', 'salud', 'pastilla', 'dolor', 'jarabe', 'paracetamol',
    'acetaminofen', 'acetaminofén', 'ibuprofeno', 'aspirina', 'alcohol', 'remedio', 'vitamina', 'antibiotico'
  ];
  if (pharmacyKeywords.some((k) => query.includes(k))) {
    const pharmacies = businesses.filter((b) => b.category === 'farmacia');
    const biz = pharmacies[0] || businesses[0];
    const deepLink = buildDeepLink({ businessId: biz?.id, category: 'farmacia' });

    return {
      messageText: `💊 *Farmacias y Medicamentos en ConForce*\n\nRecibimos tu consulta para *"${query}"*. Tenemos farmacias activas con medicamentos de primera necesidad, artículos de cuidado y despacho express en Bolívares.\n\n👉 Revisa las opciones de farmacia disponibles aquí:`,
      foundProducts: biz ? products.filter((p) => p.businessId === biz.id) : [],
      recommendedBusinesses: pharmacies,
      deepLink,
      categoryDetected: 'farmacia'
    };
  }

  // C. Food / Restaurants / Delivery
  const foodKeywords = [
    'comida', 'hambre', 'restaurante', 'comer', 'tacos', 'burger', 'hamburguesa', 'pizza',
    'almuerzo', 'cena', 'desayuno', 'sushi', 'empanada', 'pollo', 'arepa', 'bebida', 'postre'
  ];
  if (foodKeywords.some((k) => query.includes(k))) {
    const restaurants = businesses.filter((b) => b.category === 'restaurante');
    const biz = restaurants[0] || businesses[0];
    const deepLink = buildDeepLink({ businessId: biz?.id, category: 'restaurante' });

    return {
      messageText: `🍔 *Restaurantes y Delivery en ConForce*\n\n¡Qué rico! Detectamos tu búsqueda de *"${query}"*. Contamos con locales gastronómicos listos para despachar platos preparados, hamburguesas, pizzas y más.\n\n👉 Explora y ordena directo aquí:`,
      foundProducts: biz ? products.filter((p) => p.businessId === biz.id) : [],
      recommendedBusinesses: restaurants,
      deepLink,
      categoryDetected: 'restaurante'
    };
  }

  // D. Supermarket / Groceries / Food market
  const groceryKeywords = [
    'supermercado', 'mercado', 'víveres', 'viveres', 'arroz', 'harina', 'aceite', 'pasta',
    'azucar', 'azúcar', 'leche', 'cafe', 'café', 'carne', 'charcuteria', 'queso', 'despensa'
  ];
  if (groceryKeywords.some((k) => query.includes(k))) {
    const markets = businesses.filter((b) => b.category === 'supermercado');
    const biz = markets[0] || businesses[0];
    const deepLink = buildDeepLink({ businessId: biz?.id, category: 'supermercado' });

    return {
      messageText: `🛒 *Supermercados y Víveres en ConForce*\n\nRecibimos tu búsqueda de despensa (*"${query}"*). Conectamos comercios con víveres, alimentos frescos y productos de primera necesidad en Bolívares.\n\n👉 Consulta abastos y supermercados aquí:`,
      foundProducts: biz ? products.filter((p) => p.businessId === biz.id) : [],
      recommendedBusinesses: markets,
      deepLink,
      categoryDetected: 'supermercado'
    };
  }

  // E. Hardware / Tools / Home
  const hardwareKeywords = [
    'ferreteria', 'ferretería', 'herramienta', 'taladro', 'tornillo', 'pintura', 'cemento',
    'tuberia', 'tubería', 'cableado', 'bombillo', 'candado', 'construccion', 'construcción', 'hogar'
  ];
  if (hardwareKeywords.some((k) => query.includes(k))) {
    const hardwareBiz = businesses.filter(
      (b) => b.category === 'hogar' || b.name.toLowerCase().includes('ferre') || b.tags.some(t => t.toLowerCase().includes('ferre'))
    );
    const targetBiz = hardwareBiz[0] || businesses[0];
    const deepLink = buildDeepLink({ businessId: targetBiz?.id, category: targetBiz?.category });

    return {
      messageText: `🛠️ *Ferretería y Hogar en ConForce*\n\nDetectamos tu búsqueda de *"${query}"*. Tenemos comercios asociados con herramientas, materiales de construcción y artículos para el hogar.\n\n👉 Revisa las ferreterías aliadas:`,
      foundProducts: targetBiz ? products.filter((p) => p.businessId === targetBiz.id) : [],
      recommendedBusinesses: hardwareBiz.length > 0 ? hardwareBiz : [targetBiz],
      deepLink,
      categoryDetected: targetBiz?.category
    };
  }

  // F. Fashion / Clothes / Shoes
  const fashionKeywords = [
    'ropa', 'camisa', 'pantalon', 'pantalón', 'zapatos', 'calzado', 'zapatillas', 'vestido',
    'franela', 'gorra', 'bolso', 'moda', 'chaqueta', 'jeans'
  ];
  if (fashionKeywords.some((k) => query.includes(k))) {
    const fashionBiz = businesses.filter((b) => b.category === 'moda');
    const targetBiz = fashionBiz[0] || businesses[0];
    const deepLink = buildDeepLink({ businessId: targetBiz?.id, category: 'moda' });

    return {
      messageText: `👗 *Moda y Calzado en ConForce*\n\nDetectamos tu búsqueda de *"${query}"*. En nuestro Marketplace dispones de tiendas con las últimas tendencias de ropa, calzado y accesorios.\n\n👉 Conoce las tiendas de moda aliadas:`,
      foundProducts: targetBiz ? products.filter((p) => p.businessId === targetBiz.id) : [],
      recommendedBusinesses: fashionBiz.length > 0 ? fashionBiz : [targetBiz],
      deepLink,
      categoryDetected: 'moda'
    };
  }

  // G. Automotive / Vehicles / Auto Parts (including Seat, Ibiza, Volkswagen, etc.)
  const autoKeywords = [
    'repuesto', 'repuestos', 'bomba', 'pastilla', 'freno', 'amortiguador', 'bujia', 'bujía',
    'bobina', 'filtro', 'aceite', 'correa', 'tiempo', 'croche', 'embrague', 'empacadura',
    'alternador', 'arranque', 'tripoide', 'terminal', 'rotula', 'muñon', 'muñón', 'radiador',
    'termostato', 'bateria', 'batería', 'refrigerante', 'aveo', 'optra', 'corsa', 'spark',
    'cruze', 'silverado', 'tahoe', 'fiesta', 'focus', 'explorer', 'hilux', 'corolla', 'yaris',
    'fortuner', 'palio', 'siena', 'chevrolet', 'toyota', 'ford', 'fiat', 'chery', 'seat',
    'ibiza', 'volkswagen', 'vw', 'gol', 'polo', 'jetta', 'renault', 'clio', 'megane', 'symbol',
    'nissan', 'sentra', 'tiida', 'hyundai', 'getz', 'elantra', 'tucson', 'kia', 'rio', 'sportage',
    'peugeot', 'honda', 'civic', 'mitsubishi', 'lancer', 'jeep', 'cherokee', 'auto', 'carro', 'vehiculo'
  ];
  if (autoKeywords.some((k) => query.includes(k))) {
    const autoBiz = businesses.filter(
      (b) =>
        b.category === 'repuestos' ||
        b.category === 'automotriz' ||
        b.name.toLowerCase().includes('repuesto') ||
        b.name.toLowerCase().includes('auto') ||
        b.name.toLowerCase().includes('motor') ||
        b.name.toLowerCase().includes('force')
    );
    const targetBiz = autoBiz[0] || businesses[0];
    const bizProds = targetBiz ? products.filter((p) => p.businessId === targetBiz.id) : [];
    const deepLink = buildDeepLink({ businessId: targetBiz?.id, category: 'repuestos' });

    return {
      messageText: `🚗 *Comercios de Repuestos y Vehículos en ConForce*\n\nRecibimos tu consulta para *"${query}"*. En ConForce contamos con comercios afiliados que suministran repuestos garantizados para diversas marcas y modelos en Bolívares (Bs.).\n\n🔧 Para verificar disponibilidad inmediata: dinos qué repuesto o servicio necesitas, o explora las tiendas aliadas aquí:`,
      foundProducts: bizProds.slice(0, 3),
      recommendedBusinesses: autoBiz.length > 0 ? autoBiz : [targetBiz],
      deepLink,
      categoryDetected: 'repuestos'
    };
  }

  // H. General Multi-Category Matcher (NEVER repeats welcome message!)
  const generalDeepLink = buildDeepLink();
  return {
    messageText: `🛍️ *ConForce Marketplace*\n\nRecibí tu búsqueda de *"${query}"*.\n\nEn ConForce contamos con comercios de todos los rubros (alimentos, tecnología, farmacia, ferretería, repuestos, moda y servicios). Si buscas este producto en específico, puedes explorar nuestras tiendas afiliadas o escribirnos el detalle para orientarte con la tienda más cercana con stock disponible.\n\n👉 Explora los comercios y catálogo del Marketplace:`,
    foundProducts: [],
    recommendedBusinesses: businesses.slice(0, 4),
    deepLink: generalDeepLink
  };
}
