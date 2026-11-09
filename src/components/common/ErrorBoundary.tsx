import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Con Force ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('mk_current_role');
    } catch (e) {}
    window.location.href = '/';
  };

  private handleCleanReload = () => {
    try {
      localStorage.removeItem('mk_chatbot_config');
      localStorage.removeItem('mk_current_role');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 text-red-500 mx-auto flex items-center justify-center shadow-lg shadow-red-950/50">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                Recuperación del Sistema
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                {this.props.fallbackTitle || 'Protección de Pantalla Activa'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                El sistema detectó una excepción y activó el protocolo de resguardo para garantizar que no te quedes en blanco.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-left text-xs font-mono text-zinc-400 max-h-32 overflow-y-auto">
                <span className="text-red-400 font-bold block mb-1">Detalle:</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-[#D4021D] hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Entrar a ConForce Marketplace</span>
              </button>

              <button
                onClick={this.handleCleanReload}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recargar con Datos Seguros</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
