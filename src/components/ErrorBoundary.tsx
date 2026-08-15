import * as React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { resetToInitialSampleData } from '../utils/storage';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    resetToInitialSampleData();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8F3] text-[#2D3329] flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl border border-[#E0E4D9] shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-[#FCECEC] text-[#995353] rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#2D3329]">Application Notice</h2>
            <p className="text-xs text-[#707969]">
              An unexpected issue occurred while rendering the portal. Click below to refresh and load default records safely.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset & Reload Portal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
