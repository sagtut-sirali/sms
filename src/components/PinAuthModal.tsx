import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, CheckCircle2, X, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { DEFAULT_MASTER_PIN } from '../utils/storage';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentMasterPin: string;
  onUpdatePin: (newPin: string) => void;
  actionReason?: string;
  mode?: 'unlock' | 'change_pin';
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentMasterPin,
  onUpdatePin,
  actionReason,
  mode: initialMode = 'unlock',
}) => {
  const [mode, setMode] = useState<'unlock' | 'change_pin'>(initialMode);
  
  // Unlock mode state
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  
  // Change PIN mode state
  const [currentPinCheck, setCurrentPinCheck] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmNewPin, setConfirmNewPin] = useState<string>('');
  const [changeStep, setChangeStep] = useState<1 | 2>(1); // 1: verify current, 2: set new
  const [successNotice, setSuccessNotice] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setPinInput('');
      setCurrentPinCheck('');
      setNewPin('');
      setConfirmNewPin('');
      setErrorMsg('');
      setSuccessNotice('');
      setChangeStep(1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    if (mode === 'unlock') {
      if (pinInput.length < 4) {
        const next = pinInput + val;
        setPinInput(next);
        if (next.length === 4) {
          validateAndUnlock(next);
        }
      }
    } else if (mode === 'change_pin') {
      if (changeStep === 1) {
        if (currentPinCheck.length < 4) {
          const next = currentPinCheck + val;
          setCurrentPinCheck(next);
          if (next.length === 4) {
            validateCurrentForChange(next);
          }
        }
      } else {
        if (newPin.length < 4) {
          setNewPin(prev => prev + val);
        } else if (confirmNewPin.length < 4) {
          const nextConfirm = confirmNewPin + val;
          setConfirmNewPin(nextConfirm);
          if (nextConfirm.length === 4) {
            finalizeNewPin(newPin, nextConfirm);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    if (mode === 'unlock') {
      setPinInput(prev => prev.slice(0, -1));
    } else if (mode === 'change_pin') {
      if (changeStep === 1) {
        setCurrentPinCheck(prev => prev.slice(0, -1));
      } else {
        if (confirmNewPin.length > 0) {
          setConfirmNewPin(prev => prev.slice(0, -1));
        } else {
          setNewPin(prev => prev.slice(0, -1));
        }
      }
    }
  };

  const handleClear = () => {
    setErrorMsg('');
    if (mode === 'unlock') {
      setPinInput('');
    } else if (mode === 'change_pin') {
      if (changeStep === 1) {
        setCurrentPinCheck('');
      } else {
        setNewPin('');
        setConfirmNewPin('');
      }
    }
  };

  const validateAndUnlock = (pinToTest: string) => {
    if (pinToTest === currentMasterPin) {
      setErrorMsg('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect Master PIN. Please try again.');
      setPinInput('');
    }
  };

  const validateCurrentForChange = (pinToTest: string) => {
    if (pinToTest === currentMasterPin) {
      setErrorMsg('');
      setChangeStep(2);
    } else {
      setErrorMsg('Current PIN does not match. Please try again.');
      setCurrentPinCheck('');
    }
  };

  const finalizeNewPin = (p1: string, p2: string) => {
    if (p1.length !== 4 || p2.length !== 4) {
      setErrorMsg('PIN must be 4 digits.');
      return;
    }
    if (p1 !== p2) {
      setErrorMsg('New PINs do not match. Please re-enter.');
      setNewPin('');
      setConfirmNewPin('');
      return;
    }
    onUpdatePin(p1);
    setSuccessNotice('Master PIN successfully updated!');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  const isDefaultPin = currentMasterPin === DEFAULT_MASTER_PIN;

  return (
    <div className="fixed inset-0 bg-[#1F231D]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E0E4D9] overflow-hidden flex flex-col my-4">
        
        {/* Header */}
        <div className="bg-[#3A4035] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C6652] text-[#E0E4D9] flex items-center justify-center shadow-xs">
              {mode === 'unlock' ? <Lock className="w-5 h-5 text-[#CAD3C0]" /> : <KeyRound className="w-5 h-5 text-[#CAD3C0]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'unlock' ? 'Admin PIN Protection' : 'Change Master PIN'}
              </h3>
              <p className="text-xs text-[#CAD3C0]">
                {mode === 'unlock' 
                  ? (actionReason || 'Protected action: editing and deleting requires PIN') 
                  : 'Update your 4-digit security code'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#CAD3C0] hover:text-white hover:bg-[#2D3329]/80 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center">
          
          {mode === 'unlock' && (
            <>
              <div className="text-center mb-5">
                <p className="text-sm font-semibold text-[#2D3329]">Enter 4-Digit Security PIN</p>
                <p className="text-xs text-[#707969] mt-0.5">
                  Unlock full access to add, edit, or delete records
                </p>
              </div>

              {/* PIN Indicator Dots */}
              <div className="flex items-center justify-center gap-3.5 mb-6">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pinInput.length > idx;
                  const char = pinInput[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                        filled 
                          ? 'border-[#5C6652] bg-[#F0F2EA] text-[#2D3329] shadow-xs scale-105' 
                          : 'border-[#E0E4D9] bg-[#F7F8F3] text-transparent'
                      }`}
                    >
                      {filled ? (showPin ? char : '●') : ''}
                    </div>
                  );
                })}
              </div>

              {/* Hidden text input for physical keyboard entry */}
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinInput(val);
                  setErrorMsg('');
                  if (val.length === 4) validateAndUnlock(val);
                }}
                className="sr-only"
                autoFocus
              />

              {/* Show/Hide PIN toggle button */}
              <div className="flex items-center justify-between w-full max-w-[280px] mb-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[#707969] hover:text-[#2D3329] flex items-center gap-1.5 font-medium transition cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'Hide Digits' : 'Show Digits'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('change_pin')}
                  className="text-[#5C6652] hover:text-[#3A4035] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change PIN</span>
                </button>
              </div>
            </>
          )}

          {mode === 'change_pin' && (
            <>
              {successNotice ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#EBF1E5] text-[#4E6B3E] flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#2D3329]">{successNotice}</h4>
                  <p className="text-xs text-[#707969] mt-1">Unlocking portal in Admin Mode...</p>
                </div>
              ) : changeStep === 1 ? (
                <>
                  <div className="text-center mb-5">
                    <p className="text-sm font-semibold text-[#2D3329]">Verify Current Master PIN</p>
                    <p className="text-xs text-[#707969] mt-0.5">
                      Enter your existing security PIN to continue
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3.5 mb-6">
                    {[0, 1, 2, 3].map((idx) => {
                      const filled = currentPinCheck.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                            filled 
                              ? 'border-[#5C6652] bg-[#F0F2EA] text-[#2D3329]' 
                              : 'border-[#E0E4D9] bg-[#F7F8F3]'
                          }`}
                        >
                          {filled ? (showPin ? currentPinCheck[idx] : '●') : ''}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-[#2D3329]">
                      {newPin.length < 4 ? 'Enter New 4-Digit PIN' : 'Confirm New 4-Digit PIN'}
                    </p>
                    <p className="text-xs text-[#707969] mt-0.5">
                      {newPin.length < 4 ? 'Choose a memorable 4-digit code' : 'Re-enter the new PIN to confirm'}
                    </p>
                  </div>

                  <div className="w-full max-w-[280px] space-y-3 mb-5">
                    <div>
                      <span className="text-[11px] font-medium text-[#707969] block mb-1">New PIN</span>
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className={`w-10 h-11 rounded-xl border flex items-center justify-center text-base font-bold ${
                              newPin.length > idx ? 'border-[#5C6652] bg-[#F0F2EA] text-[#2D3329]' : 'border-[#E0E4D9] bg-[#F7F8F3]'
                            }`}
                          >
                            {newPin.length > idx ? (showPin ? newPin[idx] : '●') : ''}
                          </div>
                        ))}
                      </div>
                    </div>

                    {newPin.length === 4 && (
                      <div>
                        <span className="text-[11px] font-medium text-[#707969] block mb-1">Confirm PIN</span>
                        <div className="flex justify-center gap-2">
                          {[0, 1, 2, 3].map((idx) => (
                            <div
                              key={idx}
                              className={`w-10 h-11 rounded-xl border flex items-center justify-center text-base font-bold ${
                                confirmNewPin.length > idx ? 'border-[#5C6652] bg-[#F0F2EA] text-[#2D3329]' : 'border-[#E0E4D9] bg-[#F7F8F3]'
                              }`}
                            >
                              {confirmNewPin.length > idx ? (showPin ? confirmNewPin[idx] : '●') : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full max-w-[280px] mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Numeric Keypad */}
          {!successNotice && (
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => {
                const isClear = item === 'C';
                const isBack = item === '⌫';
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (isClear) handleClear();
                      else if (isBack) handleBackspace();
                      else handleKeypadPress(item);
                    }}
                    className={`h-12 rounded-2xl font-bold text-lg transition flex items-center justify-center active:scale-95 cursor-pointer select-none ${
                      isClear 
                        ? 'bg-[#F0F2EA] text-[#707969] hover:bg-[#E0E4D9] text-sm font-semibold'
                        : isBack
                        ? 'bg-[#F0F2EA] text-[#707969] hover:bg-[#E0E4D9]'
                        : 'bg-white border border-[#E0E4D9] text-[#2D3329] hover:bg-[#F7F8F3] hover:border-[#5C6652] shadow-xs'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          {/* Initial Default PIN note */}
          {isDefaultPin && mode === 'unlock' && (
            <div className="mt-4 p-2 bg-[#F0F2EA] border border-[#E0E4D9] rounded-xl text-[11px] text-[#5C6652] text-center max-w-[280px] w-full flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Initial default master PIN is <strong>1234</strong></span>
            </div>
          )}

          {/* Back button if changing pin */}
          {mode === 'change_pin' && !successNotice && (
            <button
              type="button"
              onClick={() => {
                setMode('unlock');
                setErrorMsg('');
              }}
              className="mt-4 text-xs font-semibold text-[#707969] hover:text-[#2D3329] transition cursor-pointer"
            >
              ← Back to Unlock PIN
            </button>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F7F8F3] px-6 py-3.5 border-t border-[#E0E4D9] flex items-center justify-between text-xs">
          <span className="text-[#707969]">Client-Side Secure Protection</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#707969] hover:text-[#2D3329] font-medium transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
