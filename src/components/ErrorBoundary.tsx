import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CountTo caught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center text-xl font-black mb-4">
              !
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Bir Yükleme Hatası Oluştu
            </h2>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              CountTo güvenli modda çalışıyor. Sayfayı yenileyerek veya ana ekrana dönerek devam edebilirsiniz.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Ana Ekrana Dön
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
