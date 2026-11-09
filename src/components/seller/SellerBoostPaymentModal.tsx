import React, { useState } from 'react';
import { Product, BoostPlan } from '../../types';
import { BOOST_PLANS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  X,
  Zap,
  Sparkles,
  Rocket,
  ShieldCheck,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SellerBoostPaymentModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const SellerBoostPaymentModal: React.FC<SellerBoostPaymentModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { boostProduct } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<BoostPlan>(
    BOOST_PLANS.find((p) => p.recommended) || BOOST_PLANS[1]
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | 'balance'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9012');
  const [cardHolder, setCardHolder] = useState('Comercio Afiliado ConForce');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  if (!isOpen) return null;

  const handlePayAndActivate = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const result = boostProduct(product.id, selectedPlan.id, selectedPlan.days);
      setIsProcessing(false);
      if (result.success) {
        setIsSuccess(true);
        setResultMessage(result.message);
        try {
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="seller-boost-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-[#D4021D] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 text-2xl shrink-0">
              🚀
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                Ads & Posicionamiento Patrocinado
              </div>
              <h3 className="text-lg font-black leading-tight">Impulsar Publicación</h3>
              <p className="text-xs text-red-100">
                La publicación básica es <span className="underline font-bold">100% gratuita</span>. Usa Ads para multiplicar tus ventas.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">¡Publicación Destacada Activa!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {resultMessage}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Producto:</span>
                  <span className="font-bold text-slate-900">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan contratado:</span>
                  <span className="font-bold text-[#D4021D]">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Visibilidad:</span>
                  <span className="font-bold text-emerald-600">Prioridad #1 en búsquedas</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-[#D4021D] hover:bg-[#b50218] text-white font-black rounded-2xl text-sm transition-all cursor-pointer"
              >
                Entendido y Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Product Preview Snippet */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Precio regular: <span className="font-bold text-slate-800">Bs. {product.price}</span>
                  </p>
                </div>
                {product.isBoosted ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    Actualmente Activo
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Orgánico Gratis
                  </span>
                )}
              </div>

              {/* Boost Plans Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Selecciona tu paquete de posicionamiento:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {BOOST_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#D4021D] bg-red-50/40 ring-1 ring-red-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              {plan.name}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                plan.recommended
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {plan.badgeText}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Eye className="w-3 h-3 text-[#D4021D]" />
                            {plan.impressionsEstimate}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-black text-slate-900">Bs. {plan.price}</div>
                          <span className="text-[10px] text-slate-500 block">pago único</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Gateway Mock Integration */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pasarela de Cobro al Comercio:
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Cifrado Seguro 256-bit
                  </span>
                </div>

                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#D4021D] bg-red-50 text-[#D4021D]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('spei')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'spei'
                        ? 'border-[#D4021D] bg-red-50 text-[#D4021D]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>SPEI / Clabe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('balance')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'balance'
                        ? 'border-[#D4021D] bg-red-50 text-[#D4021D]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Saldo Negocio</span>
                  </button>
                </div>

                {/* Payment method input fields */}
                {paymentMethod === 'card' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                        Número de Tarjeta (Débito/Crédito)
                      </span>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                        Titular o Razón Social
                      </span>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'spei' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">Transferencia Electrónica Inmediata (SPEI)</p>
                    <p className="text-slate-600 text-[11px]">
                      CLABE STP: <strong className="font-mono text-slate-900">646180123400987654</strong>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Activación automática en menos de 60 segundos tras confirmar pago.
                    </p>
                  </div>
                )}

                {paymentMethod === 'balance' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Saldo disponible por ventas:</span>
                      <span className="font-bold text-emerald-600">Bs. 4.850,00</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      El monto del paquete (Bs. {selectedPlan.price}) se descontará automáticamente de tu próximo corte semanal.
                    </p>
                  </div>
                )}
              </div>

              {/* Guarantee Disclaimer */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Garantía de Tráfico:</strong> Al activar este paquete, tu producto aparecerá con etiqueta "Patrocinado" y en las primeras posiciones de la matriz comparativa cuando los compradores busquen artículos de esta categoría.
                </p>
              </div>

              {/* Submit Button */}
              <button
                id="btn-confirm-boost-pay"
                disabled={isProcessing}
                onClick={handlePayAndActivate}
                className="w-full py-3.5 px-4 bg-[#D4021D] hover:bg-[#b50218] text-white font-black rounded-2xl text-sm transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Procesando cobro y activando Ads...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Confirmar y Pagar Bs. {selectedPlan.price}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
