import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearData = () => {
    if (confirm('Скинути збережені дані для відновлення роботи? Рекомендується перед цим скопіювати резервну копію.')) {
      try {
        localStorage.clear();
      } catch {}
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold">Ой, виникла непередбачена помилка</h1>
            <p className="text-sm text-slate-400">
              {this.state.error?.message || 'Стався збій під час завантаження інтерфейсу.'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Оновити сторінку
              </button>
              <button
                onClick={this.handleClearData}
                className="w-full py-2 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition rounded-xl text-xs cursor-pointer"
              >
                Скинути кеш та налаштування
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
