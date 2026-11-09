import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, Product, Business } from '../../types';
import { processChatbotMessage } from '../../services/geminiService';
import { buildDeepLink } from '../../utils/urlUtils';
import {
  Send,
  MapPin,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  CheckCheck,
  ExternalLink,
  ShoppingBag,
  Flame,
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';

export const WhatsAppChatModal: React.FC = () => {
  const {
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    whatsappInitialPrompt,
    businesses,
    products,
    userLocation,
    setSelectedBusinessForDetail,
    chatbotConfig,
    setCurrentRole,
    setActiveClientTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome message + offer of the day on open
  useEffect(() => {
    if (isWhatsAppModalOpen && messages.length === 0) {
      const offerProd = products.find(p => p.id === chatbotConfig.featuredOfferId || p.isOfferOfTheDay) || (products.length > 0 ? products[0] : null);
      const offerBiz = offerProd ? (businesses.find(b => b.id === offerProd.businessId) || businesses[0]) : null;

      const welcomeMsg: ChatMessage = {
        id: 'msg-welcome',
        sender: 'bot',
        text: chatbotConfig.welcomeMessage || '¡Hola! Bienvenido al asistente oficial de ConForce.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const messagesToSet: ChatMessage[] = [welcomeMsg];

      if (offerProd && offerBiz) {
        const offerMsg: ChatMessage = {
          id: 'msg-offer',
          sender: 'bot',
          text: `🔥 *OFERTA DEL DÍA EN TU ZONA* 🔥\n*${offerProd.name}*\n🏷️ Solo *Bs. ${offerProd.price}* (Antes Bs. ${offerProd.originalPrice || offerProd.price + 45})\n🏪 Disponible en *${offerBiz.name}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'product_card',
          data: {
            product: offerProd,
            products: [offerProd],
            business: offerBiz,
            deepLink: buildDeepLink({ businessId: offerBiz.id, productId: offerProd.id })
          }
        };
        messagesToSet.push(offerMsg);
      }

      setMessages(messagesToSet);

      // If an initial prompt was passed from button
      if (whatsappInitialPrompt) {
        setTimeout(() => {
          handleSendMessage(whatsappInitialPrompt);
        }, 600);
      }
    }
  }, [isWhatsAppModalOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await processChatbotMessage(query, userLocation, businesses, products);

      const matchedBiz = response.recommendedBusinesses[0] || (response.foundProducts[0] ? businesses.find(b => b.id === response.foundProducts[0]?.businessId) : undefined);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: response.foundProducts.length > 0 ? 'product_card' : 'text',
        data: {
          product: response.foundProducts[0],
          products: response.foundProducts,
          business: matchedBiz,
          deepLink: response.deepLink
        }
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Entendido. Puedes explorar todo nuestro catálogo y comercios en el mapa interactivo de ConForce.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // User shares location via quick action
  const handleSendLocation = () => {
    const locMsg: ChatMessage = {
      id: `user-loc-${Date.now()}`,
      sender: 'user',
      text: '📍 Compartí mi ubicación en tiempo real',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'location'
    };

    setMessages(prev => [...prev, locMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const nearbyPharmacies = businesses.filter(b => b.category === 'farmacia');
      const nearbyRestos = businesses.filter(b => b.category === 'restaurante');

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📍 *¡Ubicación recibida con éxito!*\n\nDetectamos a tu alrededor:\n• 💊 *${nearbyPharmacies.length} Farmacias* con medicamentos y entrega express.\n• 🍔 *${nearbyRestos.length} Restaurantes* abiertos.\n\n¿Qué te gustaría pedir?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    }, 700);
  };

  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  const handleOpenDeepLink = (businessId?: string) => {
    if (businessId) {
      const biz = businesses.find(b => b.id === businessId);
      if (biz) {
        setSelectedBusinessForDetail(biz);
        setCurrentRole('client');
        setActiveClientTab('explore');
        setIsWhatsAppModalOpen(false);
        return;
      }
    }
    setCurrentRole('client');
    setActiveClientTab('explore');
    setIsWhatsAppModalOpen(false);
  };

  const handleCopyLink = (link?: string, index?: number) => {
    if (!link) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      if (index !== undefined) {
        setCopiedLinkIndex(index);
        setTimeout(() => setCopiedLinkIndex(null), 2000);
      }
    }
  };

  if (!isWhatsAppModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* WhatsApp Window Container */}
      <div className="w-full h-full md:h-[650px] md:max-w-md bg-[#0b141a] text-slate-100 flex flex-col md:rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
        
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-slate-700/40 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="text-slate-300 hover:text-white p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar & Bot Info */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#D4021D] flex items-center justify-center text-white text-lg font-bold shadow-md">
                🤖
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#D4021D] border-2 border-[#1f2c34] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">ConForce Bot IA</h3>
                <span className="px-1.5 py-0.2 bg-[#D4021D]/20 border border-[#D4021D]/40 text-white text-[10px] font-bold rounded">
                  Oficial
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1">
                <span className="text-[#D4021D] font-bold">● en línea</span>
                <span className="text-slate-400">· Meta Cloud API</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <button className="hover:text-white p-1"><Phone className="w-4 h-4" /></button>
            <button className="hover:text-white p-1"><Video className="w-4 h-4" /></button>
            <button onClick={() => setIsWhatsAppModalOpen(false)} className="hover:text-white p-1 font-bold">✕</button>
          </div>
        </div>

        {/* Quick Location Action Bar */}
        <div className="bg-[#111b21] px-4 py-2 flex items-center justify-between border-b border-slate-800/80">
          <button
            onClick={handleSendLocation}
            className="flex items-center gap-1.5 bg-[#D4021D]/20 hover:bg-[#D4021D]/30 text-white border border-[#D4021D]/40 px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4021D]" />
            <span>📍 Enviar mi ubicación actual</span>
          </button>
          <span className="text-[10px] text-slate-400">Deep Links Activos</span>
        </div>

        {/* WhatsApp Chat Messages Canvas with subtle wallpaper pattern */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md relative text-xs md:text-sm ${
                    isUser
                      ? 'bg-[#1e1e1e] border border-[#D4021D]/50 text-white rounded-tr-none'
                      : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40'
                  }`}
                >
                  {/* Text body */}
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Product Rich Deep Link Card inside WhatsApp */}
                  {msg.data?.product && (
                    <div className="mt-2.5 p-2.5 bg-[#111b21] rounded-xl border border-slate-700/60 overflow-hidden space-y-2">
                      <div className="flex gap-2.5 items-center">
                        <img
                          src={msg.data.product.image || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=200'}
                          alt={msg.data.product.name}
                          className="w-14 h-14 object-cover rounded-lg shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">
                            {msg.data.business?.name || 'Comercio Afiliado'}
                          </span>
                          <h4 className="font-bold text-white text-xs truncate">
                            {msg.data.product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-extrabold text-[#D4021D] text-xs">
                              Bs. {msg.data.product.price.toLocaleString()}
                            </span>
                            {msg.data.product.originalPrice && msg.data.product.originalPrice > msg.data.product.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                Bs. {msg.data.product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Multiple products note if applicable */}
                      {msg.data.products && msg.data.products.length > 1 && (
                        <div className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-1 rounded">
                          ✨ {msg.data.products.length} opciones coincidentes en catálogo
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => handleOpenDeepLink(msg.data?.business?.id || msg.data?.product?.businessId)}
                          className="flex items-center justify-center gap-1 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition-all shadow cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Abrir en App</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(msg.data?.deepLink, idx)}
                          className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-1.5 px-2 rounded-lg text-[11px] transition-all border border-slate-700 cursor-pointer"
                          title="Copiar enlace directo para compartir"
                        >
                          {copiedLinkIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Direct URL preview */}
                      {msg.data.deepLink && (
                        <a
                          href={msg.data.deepLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[10px] text-cyan-400 hover:underline truncate"
                        >
                          🔗 {msg.data.deepLink}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Timestamp & read status */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400/80">
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bot Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 bg-[#202c33] text-slate-400 px-3.5 py-2 rounded-2xl rounded-tl-none w-fit border border-slate-700/40">
              <Sparkles className="w-3.5 h-3.5 text-[#D4021D] animate-spin" />
              <span className="text-xs">Buscando en comercios cercanos...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="bg-[#111b21] px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-800">
          <button
            onClick={() => handleSendMessage('¿Qué comercios y productos hay disponibles en el Marketplace?')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            🛒 Explorar Todo
          </button>
          <button
            onClick={() => handleSendMessage('¿Qué opciones de celulares o tecnología tienen disponibles?')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            📱 Tecnología
          </button>
          <button
            onClick={() => handleSendMessage('Quiero ver restaurantes y comida con delivery')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            🍔 Restaurantes
          </button>
          <button
            onClick={() => handleSendMessage('¿Qué medicamentos o farmacias tienen disponibles?')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            💊 Farmacia
          </button>
          <button
            onClick={() => handleSendMessage('¿Tienen repuestos para vehículos?')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            🚗 Repuestos
          </button>
          <button
            onClick={() => handleSendMessage('Busco herramientas o artículos de ferretería')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            🛠️ Ferretería
          </button>
          <button
            onClick={() => handleSendMessage('¿Cuál es la oferta destacada de hoy?')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            🔥 Oferta del día
          </button>
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="bg-[#1f2c34] p-3 flex items-center gap-2 border-t border-slate-700/40 shrink-0">
          <button className="text-slate-400 hover:text-white p-1">
            <Smile className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-white p-1" onClick={handleSendLocation}>
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe lo que buscas (tecnología, comida, repuestos, farmacia...)"
            className="flex-1 bg-[#2a3942] text-white text-xs md:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D4021D] placeholder-slate-400"
          />

          {inputMessage.trim() ? (
            <button
              onClick={() => handleSendMessage()}
              className="w-10 h-10 rounded-full bg-[#D4021D] hover:bg-[#b50218] text-white flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full bg-[#D4021D] hover:bg-[#b50218] text-white flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0">
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
