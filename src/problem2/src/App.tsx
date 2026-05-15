import { SwapForm } from './components/SwapForm';
import { Toast } from './components/Toast';
import type { SwapFormData } from './types/token';
import { useToast } from './hooks/useToast';

function App() {
  const { toasts, removeToast, success, error } = useToast();

  const handleSwap = async (data: SwapFormData): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          console.log('Swap executed:', data);
          success(`Successfully swapped ${data.fromAmount} ${data.fromToken?.symbol} to ${data.toAmount} ${data.toToken?.symbol}`);
          resolve();
        } else {
          const errorMsg = 'Swap failed due to network error. Please try again.';
          error(errorMsg);
          reject(new Error(errorMsg));
        }
      }, 2000);
    });
  };

  return (
    <>
      <SwapForm onSwap={handleSwap} />

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

export default App;
