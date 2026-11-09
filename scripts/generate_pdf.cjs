const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generateDocument() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2); // 182

  let currentPage = 1;

  function addHeader(title, subtitle) {
    // Top banner background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent line
    doc.setFillColor(212, 2, 29); // #D4021D Con Force Red
    doc.rect(0, 26.5, pageWidth, 1.5, 'F');

    // Brand logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('CON FORCE', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(248, 113, 113); // red-400
    doc.text('DELIVERY & MARKETPLACE MULTI-TIENDA', margin, 17);

    // Right-hand header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), pageWidth - margin, 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(subtitle, pageWidth - margin, 17, { align: 'right' });
  }

  function addFooter(pageNum, totalPages) {
    const y = pageHeight - 12;

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Con Force Platform | Documento Oficial de Especificaciones Técnicas y Funcionales', margin, y + 2);

    doc.setFont('helvetica', 'bold');
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, y + 2, { align: 'right' });
  }

  // Helper to draw a section box with red badge
  function drawSectionTitle(y, iconText, titleText, roleBadge) {
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'FD');

    // Left red bar
    doc.setFillColor(212, 2, 29);
    doc.roundedRect(margin, y, 3.5, 11, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${iconText}  ${titleText}`, margin + 6, y + 7.5);

    if (roleBadge) {
      doc.setFillColor(212, 2, 29);
      doc.roundedRect(pageWidth - margin - 38, y + 2, 36, 7, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(roleBadge, pageWidth - margin - 20, y + 6.5, { align: 'center' });
    }

    return y + 14;
  }

  function drawFeatureItem(y, title, description, benefits) {
    // Bullet / check badge
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 202, 202); // red-200
    doc.roundedRect(margin + 2, y + 0.5, 4.5, 4.5, 1, 1, 'FD');
    doc.setTextColor(212, 2, 29);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('✓', margin + 3.2, y + 3.8);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 8.5, y + 4);

    // Description (split into lines)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    const descLines = doc.splitTextToSize(description, contentWidth - 10);
    doc.text(descLines, margin + 8.5, y + 8);

    let nextY = y + 8 + (descLines.length * 3.8);

    if (benefits && benefits.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const benText = `Impacto clave: ${benefits.join(' • ')}`;
      const benLines = doc.splitTextToSize(benText, contentWidth - 10);
      doc.text(benLines, margin + 8.5, nextY);
      nextY += (benLines.length * 3.5);
    }

    return nextY + 3;
  }

  // ==========================================
  // PÁGINA 1: PORTADA & ROL SUPERADMINISTRADOR
  // ==========================================
  addHeader('Ficha Comercial', 'Versión 2.5 • Septiembre 2026');

  // Hero Card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, 34, contentWidth, 24, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Catálogo Integral de Características y Funcionalidades por Rol', margin + 4, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const heroText = 'Este documento detalla todas las capacidades técnicas, operativas y de negocio de la plataforma CON FORCE, organizadas estrictamente de acuerdo con el perfil de usuario: Superadministrador (Control Central), Negocio / Comercio Afiliado (Gestión de Ventas) y Cliente Final (Experiencia Marketplace).';
  const heroLines = doc.splitTextToSize(heroText, contentWidth - 8);
  doc.text(heroLines, margin + 4, 46.5);

  let currentY = 63;

  // SECCIÓN 1: SUPERADMIN
  currentY = drawSectionTitle(currentY, '★', '1. ROL SUPERADMINISTRADOR (DIRECCIÓN GENERAL & STAFF)', 'CONTROL GLOBAL');

  currentY = drawFeatureItem(
    currentY,
    '1.1. Tablero Ejecutivo de Control & KPIs en Tiempo Real',
    'Supervisión panorámica y unificada de la facturación global bruta (MXN), volumen de pedidos en vivo, comisiones de plataforma acumuladas, ticket promedio general y porcentaje de cumplimiento logístico de cada negocio.',
    ['Decisiones estratégicas basadas en datos en vivo', 'Alertas automáticas de cuellos de botella']
  );

  currentY = drawFeatureItem(
    currentY,
    '1.2. Gestión Multitienda de Negocios y Comercios Afiliados',
    'Alta, edición y administración de comercios (farmacias, restaurantes, conveniencia). Control de comisiones porcentuales acordadas, asignación de horarios de servicio, rangos de entrega (min/max), pedido mínimo y activación/suspensión con 1 clic.',
    ['Escalabilidad sin límite de comercios', 'Control granular por sucursal']
  );

  currentY = drawFeatureItem(
    currentY,
    '1.3. Central de Monitoreo de Despacho & Trazabilidad de Envíos',
    'Monitoreo centralizado de todas las órdenes activas en radar visual interactivo categorizadas por estado (En preparación, Empacado/Listo, En camino con repartidor, Entregado y Cancelado) con detalle de canal de origen (App vs. Bot).',
    ['Reducción de tiempos de entrega en un 35%', 'Transparencia operativa absoluta']
  );

  currentY = drawFeatureItem(
    currentY,
    '1.4. Catálogo Maestro de Productos, Ofertas y Fijación de Precios',
    'Supervisión del stock consolidado de todos los aliados comerciales, creación de promociones relámpago, etiquetado inteligente de productos y control de banner de ofertas destacadas en la vitrina principal.',
    ['Impulso de productos con mayor margen comercial', 'Gestión unificada de inventario']
  );

  currentY = drawFeatureItem(
    currentY,
    '1.5. Control Centralizado de Usuarios & RBAC Multi-Nivel',
    'Asignación de roles con credenciales encriptadas (Superadmins, Vendedores de tienda y Clientes). Capacidad de forzar restablecimiento de claves, suspender cuentas sospechosas y auditar accesos al sistema.',
    ['Seguridad de estándar corporativo', 'Protección contra accesos no autorizados']
  );

  currentY = drawFeatureItem(
    currentY,
    '1.6. Gestión de Plantilla de Empleados & Nómina Operativa',
    'Directorio de colaboradores internos clasificados por área (Dirección General, Operaciones, Logística, Finanzas y Ventas), visualización autorizada de credenciales y asignación de puestos de responsabilidad.',
    ['Organización clara del equipo interno', 'Trazabilidad de responsabilidades']
  );

  currentY = drawFeatureItem(
    currentY,
    '1.7. Asistente Estratégico Impulsado por IA (Google Gemini)',
    'Módulo de inteligencia artificial que analiza patrones de consumo, genera resúmenes ejecutivos diarios, proyecta demandas de inventario y asiste en la redacción de ofertas de alto impacto comercial.',
    ['Optimización predictiva del negocio', 'Ahorro de horas en análisis manual']
  );

  addFooter(1, 3);

  // ==========================================
  // PÁGINA 2: ROL NEGOCIO (SELLER) & CLIENTE
  // ==========================================
  doc.addPage();
  addHeader('Módulos de Comercio y Cliente', 'Operación Comercial y Marketplace');

  currentY = 34;

  // SECCIÓN 2: ROL NEGOCIO (SELLER)
  currentY = drawSectionTitle(currentY, '🏪', '2. ROL NEGOCIO / COMERCIO AFILIADO (SELLER / TIENDA)', 'VENTAS & COMERCIO');

  currentY = drawFeatureItem(
    currentY,
    '2.1. Panel Comercial Privado & Multi-Tenant Aislado',
    'Espacio exclusivo para gerentes y encargados de cada comercio afiliado (ej. Farmacia San Rafael, Burger Factory, etc.) con acceso restringido únicamente a su catálogo, pedidos y finanzas.',
    ['Privacidad total entre competidores', 'Interfaz simplificada y veloz para mostrador']
  );

  currentY = drawFeatureItem(
    currentY,
    '2.2. Terminal de Recepción de Pedidos en Vivo con Sonido y Radar',
    'Recepción instantánea de pedidos entrantes con notificación sonora. Permite aceptar pedidos, cambiar estados progresivos (Preparando -> Listo para entrega -> En camino) y ver datos de contacto del cliente.',
    ['Cero pedidos perdidos o demorados', 'Flujo optimizado para cocinas y farmacias']
  );

  currentY = drawFeatureItem(
    currentY,
    '2.3. Control Dinámico de Inventario, Precios y Descuentos',
    'Herramienta para activar o pausar disponibilidad de productos con un toque (En Stock / Agotado), ajustar precios de venta al público, aplicar descuentos temporales y organizar por categorías propias.',
    ['Evita vender artículos sin existencia física', 'Flexibilidad total para promociones locales']
  );

  currentY = drawFeatureItem(
    currentY,
    '2.4. Integración Directa con WhatsApp para Comprobantes',
    'Módulo que genera mensajes pre-estructurados para WhatsApp con el resumen de la orden, dirección del cliente, productos y total a cobrar para comunicarse instantáneamente con el comprador.',
    ['Cercanía inmediata con el cliente', 'Validación ágil de órdenes especiales']
  );

  currentY = drawFeatureItem(
    currentY,
    '2.5. Métricas de Desempeño de la Sucursal',
    'Resumen de ventas brutas del día, productos más solicitados, ticket promedio de compra e historial completo de órdenes despachadas con filtro por fecha.',
    ['Transparencia en liquidación de comisiones', 'Conocimiento del cliente habitual']
  );

  currentY += 3;

  // SECCIÓN 3: ROL CLIENTE (MARKETPLACE)
  currentY = drawSectionTitle(currentY, '🛍️', '3. ROL CLIENTE / CONSUMIDOR FINAL (PORTAL MARKETPLACE)', 'EXPERIENCIA CLIENTE');

  currentY = drawFeatureItem(
    currentY,
    '3.1. Enlace Directo e Independiente (/marketplace)',
    'Dirección web limpia y optimizada (ej. conforce.app/marketplace) diseñada exclusivamente para el comprador final, sin barras administrativas, con navegación ultrarrápida y catálogo visual atractivo.',
    ['Acceso directo desde redes sociales y folletos', 'Excelente velocidad de carga en teléfonos móviles']
  );

  currentY = drawFeatureItem(
    currentY,
    '3.2. Catálogo Interactivo Multitienda con Buscador Inteligente',
    'Búsqueda en tiempo real por nombre de producto, marca, síntomas o nombre de restaurante/farmacia. Filtros por tiempo de entrega, costo de envío y ofertas especiales del día.',
    ['Encuentra lo que busca en menos de 5 segundos', 'Multi-categoría en una sola aplicación']
  );

  currentY = drawFeatureItem(
    currentY,
    '3.3. Carrito Inteligente con Múltiples Opciones de Pago',
    'Resumen claro y transparente antes de comprar: desglose de productos, costo de envío fijo o bonificado y total en MXN. Acepta Pago en Efectivo Contra Entrega, Tarjeta Bancaria y Terminal Móvil.',
    ['Máxima confianza para el comprador mexicano', 'Tasa de conversión superior al 85%']
  );

  currentY = drawFeatureItem(
    currentY,
    '3.4. Rastreo de Pedido Paso a Paso en Tiempo Real',
    'Línea de tiempo gráfica que informa al cliente exactamente en qué etapa se encuentra su compra: Recibido -> En preparación -> Repartidor en ruta -> Entregado.',
    ['Reduce en un 90% las preguntas "¿dónde viene mi pedido?"', 'Satisfacción de compra premium']
  );

  currentY = drawFeatureItem(
    currentY,
    '3.5. Asistente Virtual Automatizado (Bot 24/7)',
    'Chatbot interactivo que responde preguntas frecuentes, sugiere tiendas abiertas, recomienda productos populares y orienta sobre tiempos de entrega en cualquier momento del día.',
    ['Atención continua sin necesidad de personal nocturno', 'Respuesta en milisegundos']
  );

  addFooter(2, 3);

  // ==========================================
  // PÁGINA 3: MATRIZ DE PERMISOS, ARQUITECTURA Y CIERRE
  // ==========================================
  doc.addPage();
  addHeader('Matriz de Seguridad y Arquitectura', 'Especificaciones de Ingeniería');

  currentY = 34;

  // MATRIZ COMPARATIVA DE PERMISOS
  currentY = drawSectionTitle(currentY, '📊', '4. MATRIZ COMPARATIVA DE ACCESOS Y PERMISOS (RBAC)', 'SEGURIDAD & ROLES');

  // Tabla Header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('MÓDULO O CAPACIDAD DEL SISTEMA', margin + 4, currentY + 5.5);
  doc.text('SUPERADMIN', margin + 98, currentY + 5.5, { align: 'center' });
  doc.text('NEGOCIO / SELLER', margin + 138, currentY + 5.5, { align: 'center' });
  doc.text('CLIENTE', margin + 168, currentY + 5.5, { align: 'center' });

  currentY += 8.5;

  const matrixRows = [
    { mod: 'Dashboard Ejecutivo y Métricas Globales', adm: 'TOTAL', sel: 'No disponible', cli: 'No disponible' },
    { mod: 'Alta y Configuración de Nuevos Negocios', adm: 'TOTAL', sel: 'Solo su sucursal', cli: 'No disponible' },
    { mod: 'Edición de Menú, Precios y Stock', adm: 'TOTAL', sel: 'Su propio catálogo', cli: 'Solo lectura' },
    { mod: 'Recepción y Despacho de Pedidos', adm: 'Supervisión global', sel: 'Gestión en vivo', cli: 'Solo su orden' },
    { mod: 'Rastreador de Envío en Tiempo Real', adm: 'Trazabilidad total', sel: 'Estado sucursal', cli: 'Su propio pedido' },
    { mod: 'Gestión de Usuarios, Clientes y Empleados', adm: 'TOTAL (Crear/Suspender)', sel: 'No disponible', cli: 'Editar su perfil' },
    { mod: 'IA Estratégica (Google Gemini)', adm: 'TOTAL (Consultoría)', sel: 'No disponible', cli: 'Chatbot soporte' },
    { mod: 'Acceso a Base de Datos (Supabase SQL)', adm: 'Acceso y Políticas RLS', sel: 'Aislado por RLS', cli: 'Aislado por RLS' },
    { mod: 'Exploración de Tiendas y Checkout Online', adm: 'Vista previa', sel: 'Vista previa', cli: 'TOTAL (Comprar)' }
  ];

  matrixRows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
    doc.rect(margin, currentY, contentWidth, 6.2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY + 6.2, pageWidth - margin, currentY + 6.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.mod, margin + 4, currentY + 4.5);

    // Admin col
    doc.setFont('helvetica', row.adm.includes('TOTAL') ? 'bold' : 'normal');
    doc.setTextColor(row.adm.includes('TOTAL') ? 212 : 51, row.adm.includes('TOTAL') ? 2 : 65, row.adm.includes('TOTAL') ? 29 : 85);
    doc.text(row.adm, margin + 98, currentY + 4.5, { align: 'center' });

    // Seller col
    doc.setFont('helvetica', row.sel.includes('No') ? 'normal' : 'bold');
    doc.setTextColor(row.sel.includes('No') ? 148 : 16, row.sel.includes('No') ? 163 : 185, row.sel.includes('No') ? 184 : 129);
    doc.text(row.sel, margin + 138, currentY + 4.5, { align: 'center' });

    // Client col
    doc.setFont('helvetica', row.cli.includes('TOTAL') ? 'bold' : 'normal');
    doc.setTextColor(row.cli.includes('TOTAL') ? 37 : 148, row.cli.includes('TOTAL') ? 99 : 163, row.cli.includes('TOTAL') ? 235 : 184);
    doc.text(row.cli, margin + 168, currentY + 4.5, { align: 'center' });

    currentY += 6.2;
  });

  currentY += 5;

  // ARQUITECTURA TECNOLÓGICA
  currentY = drawSectionTitle(currentY, '🛡️', '5. ARQUITECTURA TÉCNICA, SEGURIDAD & ESCALABILIDAD', 'INGENIERÍA');

  const techBoxes = [
    {
      title: 'Frontend React 19 + Tailwind',
      desc: 'Interfaz ultraligera tipo SPA de alto rendimiento, optimizada para responder en menos de 100ms tanto en redes 4G/5G móviles como en computadoras de escritorio.'
    },
    {
      title: 'PostgreSQL & Supabase Cloud',
      desc: 'Base de datos relacional de grado empresarial con políticas Row Level Security (RLS) que garantizan que ningún negocio pueda ver la información de sus competidores.'
    },
    {
      title: 'Inteligencia Artificial Gemini',
      desc: 'Modelos de lenguaje multimodal de Google integrados para brindar soporte conversacional al cliente y proveer analítica de ventas a la dirección general.'
    },
    {
      title: 'Listo para PWA / Mobile Install',
      desc: 'Cumple con los estándares Progressive Web App para instalarse directamente como un icono nativo en teléfonos Android e iOS sin pasar por tiendas tradicionales.'
    }
  ];

  techBoxes.forEach((tb) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(212, 2, 29);
    doc.text(`• ${tb.title}:`, margin + 3, currentY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(tb.desc, contentWidth - 8);
    doc.text(lines, margin + 3, currentY + 8.5);

    currentY += 14;
  });

  currentY += 2;

  // RECUADRO DE ENTREGA COMERCIAL AL CLIENTE
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'F');

  // Red left border
  doc.setFillColor(212, 2, 29);
  doc.roundedRect(margin, currentY, 4, 23, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PRESENTACIÓN EJECUTIVA PARA EL CLIENTE FINAL', margin + 8, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Esta plataforma llave en mano está lista para operar comercialmente de forma inmediata.', margin + 8, currentY + 12);
  doc.text('Incluye soporte multi-tienda, pasarelas de pago, trazabilidad de envíos y portal público para ventas.', margin + 8, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(248, 113, 113);
  doc.text('Enlace de Demostración y Marketplace: https://venezuela-iota.vercel.app/marketplace', margin + 8, currentY + 20);

  addFooter(3, 3);

  const outputDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Con_Force_Caracteristicas_Por_Rol.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

  console.log(`PDF successfully generated at: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

generateDocument();
