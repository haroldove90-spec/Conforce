import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ShoppingBag,
  Store,
  HelpCircle,
  Truck,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Product } from '../../types';
import { processChatbotMessage } from '../../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  quickActions?: { label: string; action: () => void }[];
}

export const WebAssistantChatModal: React.FC = () => {
  const {
    isWebAssistantOpen,
    setIsWebAssistantOpen,
    webAssistantInitialPrompt,
    products,
    businesses,
    userLocation,
    addToCart,
    openWhatsAppWithPrompt,
    openBusinessRegistration,
    openDriverRegistration,
    setIsClientAuthModalOpen,
    setClientAuthIntent,
    setActiveClientTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initialization and custom prompt opening
  useEffect(() => {
    if (isWebAssistantOpen) {
      if (messages.length === 0) {
        // Initial bot greeting
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'bot',
            text: '👋 ¡Hola! Soy tu Asistente Virtual en ConForce Venezuela. 🇻🇪🛒\n\nPuedo orientarte con búsquedas de productos (tecnología, comida, víveres, farmacia, repuestos), cómo comprar paso a paso, o cómo registrarte como **Comercio Aliado** o **Mensajero en Moto**.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickActions: [
              {
                label: '🛵 ¿Cómo ser mensajero en moto?',
                action: () => handleSendPreset('¿Cómo puedo registrarme como mensajero en moto y ganar dinero?')
              },
              {
                label: '🏪 ¿Cómo afiliar mi negocio?',
                action: () => handleSendPreset('¿Cómo registrar mi negocio en el marketplace y vender?')
              },
              {
                label: '🛍️ ¿Cómo comprar en ConForce?',
                action: () => handleSendPreset('¿Cómo comprar y cuáles son las tarifas de envío?')
              },
              {
                label: '📱 Celulares y Tecnología',
                action: () => handleSendPreset('¿Qué celulares y artículos de tecnología tienen disponibles?')
              },
              {
                label: '💊 Farmacias y Salud',
                action: () => handleSendPreset('¿Qué farmacias o medicinas tienen disponibles?')
              },
              {
                label: '🍔 Comida y Restaurantes',
                action: () => handleSendPreset('¿Qué opciones de comida o restaurantes hay con delivery?')
              },
              {
                label: '🚗 Repuestos de Autos',
                action: () => handleSendPreset('¿Qué repuestos para vehículos tienen en catálogo?')
              }
            ]
          }
        ]);
      }

      if (webAssistantInitialPrompt && webAssistantInitialPrompt.trim()) {
        handleSendPreset(webAssistantInitialPrompt);
      }
    }
  }, [isWebAssistantOpen, webAssistantInitialPrompt]);

  const generateBotReply = (userQuery: string): ChatMessage => {
    const lower = userQuery.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Motorcycle Couriers / Drivers
    if (
      lower.includes('moto') ||
      lower.includes('mensajero') ||
      lower.includes('repartidor') ||
      lower.includes('motorizado') ||
      lower.includes('delivery') ||
      lower.includes('carrera') ||
      lower.includes('chofer')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: '🛵 *¡Únete a la Flota de Mensajeros en Moto de ConForce Venezuela!*\n\nGenera ingresos diarios entregando pedidos de comercios y restaurantes aliados en tu ciudad.\n\n📋 *Requisitos:*\n• Motocicleta en buen estado con casco.\n• Cédula (V/E) y Licencia vigente.\n• Placa visible del vehículo.\n• Teléfono inteligente con GPS y cuenta bancaria para cobrar por Pago Móvil en Bolívares (Bs.).\n\n✨ Pagos directos por carrera completada y panel táctil con rutas en Google Maps y Waze.',
        timestamp: time,
        quickActions: [
          {
            label: '🛵 Abrir Formulario de Mensajeros en Moto',
            action: () => {
              openDriverRegistration();
              setIsWebAssistantOpen(false);
            }
          },
          {
            label: '💬 Soporte Mensajeros WhatsApp',
            action: () => openWhatsAppWithPrompt('Hola, deseo postularme como mensajero en moto en ConForce.')
          }
        ]
      };
    }

    // 2. Business / Store Registration
    if (
      lower.includes('vender') ||
      lower.includes('comercio') ||
      lower.includes('afiliar') ||
      lower.includes('negocio') ||
      lower.includes('tienda') ||
      lower.includes('publicar')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: '🏪 ¡Excelente noticia! En ConForce la **publicación de catálogos y productos es 100% gratuita** para todos los comercios y emprendedores en Venezuela.\n\n📋 *Requisitos:*\n• Nombre comercial y categoría de tu tienda.\n• Documento de identidad o RIF.\n• Número de WhatsApp comercial para recibir pedidos al instante.\n• Dirección física para despacho o retiro en tienda.\n\nCuentas con panel en vivo para actualizar precios e inventario en Bs.',
        timestamp: time,
        quickActions: [
          {
            label: '🏪 Registrar Mi Negocio (Gratis)',
            action: () => {
              openBusinessRegistration(false);
              setIsWebAssistantOpen(false);
            }
          },
          {
            label: '📲 Contactar a Soporte Comercios',
            action: () => openWhatsAppWithPrompt('Hola, quiero registrar mi negocio en el marketplace ConForce.')
          }
        ]
      };
    }

    // 3. How to buy, fees and shipping
    if (
      lower.includes('como comprar') ||
      lower.includes('cómo comprar') ||
      lower.includes('como pedir') ||
      lower.includes('envio') ||
      lower.includes('tarifa') ||
      lower.includes('servicio') ||
      lower.includes('costo') ||
      lower.includes('comision') ||
      lower.includes('pago movil')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: '🛍️ *Guía Oficial de Compra en ConForce Venezuela:*\n\n1️⃣ **Explora:** Revisa comercios y productos en el catálogo o mapa.\n2️⃣ **Carrito:** Agrega los productos que deseas en Bolívares (Bs.).\n3️⃣ **Entrega:** Selecciona Delivery en Moto (Bs. 35 flat) o Retiro en Tienda (Gratis).\n4️⃣ **Pago:** Paga cómodamente por Pago Móvil o transferencia bancaria e ingresa tu número de referencia.\n5️⃣ **Rastreo:** Sigue a tu mensajero asignado en tiempo real.\n\n*(Tarifa de servicio: 5% del subtotal para soporte prioritario y seguro).*',
        timestamp: time,
        quickActions: [
          {
            label: '🛒 Explorar Catálogo y Comprar',
            action: () => {
              setActiveClientTab('explore');
              setIsWebAssistantOpen(false);
            }
          }
        ]
      };
    }

    // 4. Search matching in products catalog
    const matchedProducts = products.filter((p) => {
      const q = lower;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (q.includes('farmacia') && p.category === 'farmacia') ||
        (q.includes('comida') && p.category === 'restaurante') ||
        (q.includes('hamburguesa') && p.name.toLowerCase().includes('burger')) ||
        (q.includes('medicina') && p.category === 'farmacia')
      );
    });

    if (matchedProducts.length > 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `Encontré ${matchedProducts.length} producto(s) disponibles que coinciden con lo que necesitas:`,
        timestamp: time,
        suggestedProducts: matchedProducts.slice(0, 3),
        quickActions: [
          {
            label: '🛒 Ver más en el catálogo',
            action: () => {
              setActiveClientTab('explore');
              setIsWebAssistantOpen(false);
            }
          }
        ]
      };
    }

    // 5. Default helpful answer
    return {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `Entiendo tu consulta sobre "${userQuery}". En ConForce contamos con comercios de tecnología, restaurantes, víveres, farmacias, ferreterías y repuestos.\n\n¿Deseas buscar un producto específico o registrarte como comercio o mensajero en moto?`,
      timestamp: time,
      quickActions: [
        {
          label: '🛵 Registro de Mensajeros',
          action: () => {
            openDriverRegistration();
            setIsWebAssistantOpen(false);
          }
        },
        {
          label: '🏪 Registro de Negocios',
          action: () => {
            openBusinessRegistration(false);
            setIsWebAssistantOpen(false);
          }
        },
        {
          label: '💬 Chatear por WhatsApp',
          action: () => openWhatsAppWithPrompt(`Hola, necesito orientación sobre: ${userQuery}`)
        }
      ]
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await processChatbotMessage(text, userLocation, businesses, products);
      setIsTyping(false);

      // Construct dynamic contextual actions based on actionType
      const dynamicActions: { label: string; action: () => void }[] = [];

      if (response.actionType === 'open_driver_register') {
        dynamicActions.push({
          label: '🛵 Abrir Formulario de Mensajeros en Moto',
          action: () => {
            openDriverRegistration();
            setIsWebAssistantOpen(false);
          }
        });
        dynamicActions.push({
          label: '💬 Consultar Flota WhatsApp',
          action: () => openWhatsAppWithPrompt('Hola, deseo postularme como mensajero en moto en ConForce.')
        });
      } else if (response.actionType === 'open_business_register') {
        dynamicActions.push({
          label: '🏪 Registrar Mi Negocio (Gratis)',
          action: () => {
            openBusinessRegistration(false);
            setIsWebAssistantOpen(false);
          }
        });
        dynamicActions.push({
          label: '📲 Soporte Comercios WhatsApp',
          action: () => openWhatsAppWithPrompt('Hola, deseo registrar mi negocio en el marketplace ConForce.')
        });
      } else if (response.actionType === 'open_client_auth') {
        dynamicActions.push({
          label: '👤 Iniciar Sesión / Registrarme',
          action: () => {
            setClientAuthIntent('login');
            setIsClientAuthModalOpen(true);
            setIsWebAssistantOpen(false);
          }
        });
      } else if (response.actionType === 'view_map') {
        dynamicActions.push({
          label: '🗺️ Abrir Mapa Interactivo',
          action: () => {
            setActiveClientTab('map');
            setIsWebAssistantOpen(false);
          }
        });
      } else if (response.actionType === 'view_cart') {
        dynamicActions.push({
          label: '🛍️ Ver Carrito / Comprar',
          action: () => {
            setActiveClientTab('explore');
            setIsWebAssistantOpen(false);
          }
        });
      } else {
        dynamicActions.push({
          label: '🛒 Ver más en el catálogo',
          action: () => {
            setActiveClientTab('explore');
            setIsWebAssistantOpen(false);
          }
        });
        dynamicActions.push({
          label: '📲 Consultar por WhatsApp',
          action: () => openWhatsAppWithPrompt(text)
        });
      }

      const botResponse: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: response.messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: response.foundProducts.slice(0, 3),
        quickActions: dynamicActions
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.warn('WebAssistant Gemini error, using fallback:', err);
      setIsTyping(false);
      const botResponse = generateBotReply(text);
      setMessages((prev) => [...prev, botResponse]);
    }
  };

  const handleSendPreset = (presetText: string) => {
    handleSendMessage(presetText);
  };

  if (!isWebAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        id="web-assistant-chat-modal"
        className="bg-white w-full sm:w-[420px] h-[85vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#D4021D] p-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm leading-tight">Asistente Virtual ConForce</h3>
                <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-1.5 py-0.2 rounded border border-red-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Guía interactiva 24/7 & Búsqueda IA</p>
            </div>
          </div>

          <button
            onClick={() => setIsWebAssistantOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-xl bg-[#D4021D] text-white flex items-center justify-center shrink-0 text-xs shadow-2xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                      : 'bg-[#D4021D] text-white font-medium shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Suggested Products Cards if any */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {msg.suggestedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between gap-2"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-slate-900 truncate text-[11px]">{prod.name}</h5>
                            <span className="text-[#D4021D] font-extrabold text-[11px]">
                              Bs. {prod.price}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(prod, 1);
                              handleSendPreset(`Agregué "${prod.name}" a mi carrito.`);
                            }}
                            className="p-1.5 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick action buttons if any */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {msg.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={qa.action}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-[#D4021D] rounded-lg text-[10px] font-bold border border-red-200 transition-colors cursor-pointer"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right ${
                      isBot ? 'text-slate-400' : 'text-red-100'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-slate-400 pl-9">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px]">Asistente escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu duda o producto que buscas..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>💡 Preguntas frecuentes: medicamentos, comida, cómo vender.</span>
            <button
              onClick={() => openWhatsAppWithPrompt('Hola, necesito asistencia personalizada en ConForce')}
              className="text-[#D4021D] font-bold hover:underline cursor-pointer"
            >
              Soporte WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
