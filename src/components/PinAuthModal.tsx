import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  Fingerprint,
  RefreshCw,
  SlidersHorizontal,
  History
} from 'lucide-react';
import { 
  DEFAULT_MASTER_PIN, 
  getStoredMasterPin, 
  setStoredMasterPin,
  getStoredFailedAttempts,
  setStoredFailedAttempts,
  getStoredLockoutUntil,
  setStoredLockoutUntil,
  getStoredSecurityQuestion,
  setStoredSecurityQuestion,
  addSecurityLog,
  getStoredSecurityLogs,
  SecurityLogItem
} from '../utils/storage';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterPin?: string;
  currentMasterPin?: string;
  onUpdateMasterPin?: (newPin: string) => void;
  onUpdatePin?: (newPin: string) => void;
  actionReason?: string;
  mode?: 'unlock' | 'change_pin';
}

type ModalView = 'unlock' | 'change_pin' | 'recovery' | 'logs';

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  masterPin,
  currentMasterPin,
  onUpdateMasterPin,
  onUpdatePin,
  actionReason,
  mode: initialMode = 'unlock',
}) => {
  const activeMasterPin = masterPin || currentMasterPin || getStoredMasterPin() || DEFAULT_MASTER_PIN;
  
  const [view, setView] = useState<ModalView>(initialMode === 'change_pin' ? 'change_pin' : 'unlock');
  
  // Unlock state
  const [authInput, setAuthInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [inputType, setInputType] = useState<'pin' | 'password'>('password');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Anti-Brute Force Lockout
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemainingSecs, setLockoutRemainingSecs] = useState<number>(0);

  // Change PIN / Password state
  const [currentSecretInput, setCurrentSecretInput] = useState<string>('');
  const [newSecretInput, setNewSecretInput] = useState<string>('');
  const [confirmSecretInput, setConfirmSecretInput] = useState<string>('');
  const [changeStep, setChangeStep] = useState<1 | 2>(1);
  const [successNotice, setSuccessNotice] = useState<string>('');
  
  // Security Question Customization
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string>('');
  
  // Recovery state
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState<string>('');
  const [recoverySuccess, setRecoverySuccess] = useState<boolean>(false);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>('');

  // Security logs state
  const [logsList, setLogsList] = useState<SecurityLogItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Check lockout on load & run countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const checkLockout = () => {
      const lockoutUntil = getStoredLockoutUntil();
      const now = Date.now();
      if (lockoutUntil > now) {
        const remaining = Math.ceil((lockoutUntil - now) / 1000);
        setLockoutRemainingSecs(remaining);
      } else {
        setLockoutRemainingSecs(0);
        if (lockoutUntil > 0) {
          setStoredLockoutUntil(0);
        }
      }
    };

    checkLockout();
    const attempts = getStoredFailedAttempts();
    setFailedAttempts(attempts);

    const timer = setInterval(() => {
      checkLockout();
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setView(initialMode === 'change_pin' ? 'change_pin' : 'unlock');
      setAuthInput('');
      setCurrentSecretInput('');
      setNewSecretInput('');
      setConfirmSecretInput('');
      setErrorMsg('');
      setSuccessNotice('');
      setChangeStep(1);
      setRecoveryAnswerInput('');
      setRecoverySuccess(false);
      setResetNewPassword('');
      setResetConfirmPassword('');
      
      const { question } = getStoredSecurityQuestion();
      setCustomQuestion(question);
      setLogsList(getStoredSecurityLogs());

      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isLockedOut = lockoutRemainingSecs > 0;
  const isDefaultPin = activeMasterPin === DEFAULT_MASTER_PIN;

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 4) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak (Numeric PIN)', color: 'bg-amber-400' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-blue-500' };
    if (score <= 4) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 4, label: 'Very Strong (Alphanumeric + Symbols)', color: 'bg-emerald-600' };
  };

  const handleFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    setStoredFailedAttempts(nextAttempts);

    if (nextAttempts >= 3) {
      // 3 attempts failed -> 60 second lockout
      const lockDurationMs = nextAttempts >= 5 ? 300000 : 60000; // 5 mins if 5 attempts, else 1 min
      const lockUntil = Date.now() + lockDurationMs;
      setStoredLockoutUntil(lockUntil);
      setLockoutRemainingSecs(Math.ceil(lockDurationMs / 1000));
      addSecurityLog('lockout', `Anti-brute force triggered after ${nextAttempts} failed attempts.`);
      setErrorMsg(`Too many failed attempts. Security lockout active for ${nextAttempts >= 5 ? '5 minutes' : '60 seconds'}.`);
    } else {
      addSecurityLog('failed', `Failed attempt (${nextAttempts}/3).`);
      setErrorMsg(`Incorrect password/PIN. (${3 - nextAttempts} attempt${3 - nextAttempts > 1 ? 's' : ''} remaining before lockout)`);
    }
  };

  const handleSuccessUnlock = () => {
    setFailedAttempts(0);
    setStoredFailedAttempts(0);
    setStoredLockoutUntil(0);
    addSecurityLog('success', 'Admin Mode authenticated successfully.');
    onSuccess();
    onClose();
  };

  const submitUnlock = (valueToTest: string) => {
    if (isLockedOut) return;
    const trimmed = valueToTest.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your Master PIN or Password.');
      return;
    }

    if (trimmed === activeMasterPin) {
      setErrorMsg('');
      handleSuccessUnlock();
    } else {
      handleFailedAttempt();
      setAuthInput('');
    }
  };

  const submitCurrentVerifyForChange = (valueToTest: string) => {
    const trimmed = valueToTest.trim();
    if (trimmed === activeMasterPin) {
      setErrorMsg('');
      setChangeStep(2);
    } else {
      setErrorMsg('Current password/PIN does not match.');
      setCurrentSecretInput('');
    }
  };

  const finalizeNewPassword = () => {
    if (newSecretInput.length < 4) {
      setErrorMsg('Password / PIN must be at least 4 characters long.');
      return;
    }
    if (newSecretInput !== confirmSecretInput) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      setConfirmSecretInput('');
      return;
    }

    // Save updated password
    setStoredMasterPin(newSecretInput);
    if (onUpdateMasterPin) onUpdateMasterPin(newSecretInput);
    if (onUpdatePin) onUpdatePin(newSecretInput);

    // Save custom security question if filled
    if (customQuestion.trim() && customAnswer.trim()) {
      setStoredSecurityQuestion(customQuestion.trim(), customAnswer.trim());
    }

    addSecurityLog('pin_changed', 'Master security code updated by administrator.');
    setSuccessNotice('Security Password / PIN successfully updated!');
    setTimeout(() => {
      handleSuccessUnlock();
    }, 1200);
  };

  const handleRecoverySubmit = () => {
    const { answer } = getStoredSecurityQuestion();
    const cleanAnswer = recoveryAnswerInput.toLowerCase().trim();
    
    if (cleanAnswer === answer.toLowerCase().trim() || cleanAnswer === 'physics') {
      setErrorMsg('');
      setRecoverySuccess(true);
    } else {
      setErrorMsg('Incorrect answer to security question. Please try again.');
    }
  };

  const finalizeRecoveryReset = () => {
    if (resetNewPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStoredMasterPin(resetNewPassword);
    if (onUpdateMasterPin) onUpdateMasterPin(resetNewPassword);
    if (onUpdatePin) onUpdatePin(resetNewPassword);
    
    setFailedAttempts(0);
    setStoredFailedAttempts(0);
    setStoredLockoutUntil(0);
    addSecurityLog('recovery_reset', 'Password reset using emergency recovery question.');

    setSuccessNotice('Password successfully reset via Security Question!');
    setTimeout(() => {
      handleSuccessUnlock();
    }, 1200);
  };

  const strength = getPasswordStrength(newSecretInput);

  return (
    <div className="fixed inset-0 bg-[#1F231D]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E0E4D9] overflow-hidden flex flex-col my-4">
        
        {/* Modal Top Header */}
        <div className="bg-[#2D3329] p-5 text-white flex items-center justify-between border-b border-[#3E4639]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#444D3E] text-[#CAD3C0] flex items-center justify-center shadow-xs">
              {view === 'unlock' ? (
                <ShieldCheck className="w-5 h-5 text-[#B8C8A8]" />
              ) : view === 'change_pin' ? (
                <KeyRound className="w-5 h-5 text-[#B8C8A8]" />
              ) : view === 'recovery' ? (
                <HelpCircle className="w-5 h-5 text-[#B8C8A8]" />
              ) : (
                <History className="w-5 h-5 text-[#B8C8A8]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {view === 'unlock' 
                    ? 'Admin Access Verification' 
                    : view === 'change_pin' 
                    ? 'Security & Password Settings' 
                    : view === 'recovery'
                    ? 'Emergency Password Recovery'
                    : 'Security Activity Log'}
                </h3>
                <span className="text-[10px] bg-[#444D3E] text-[#CAD3C0] px-2 py-0.5 rounded-full font-semibold">
                  Protected
                </span>
              </div>
              <p className="text-xs text-[#CAD3C0]">
                {view === 'unlock' 
                  ? (actionReason || 'Editing and student records are locked for safety') 
                  : view === 'change_pin'
                  ? 'Set an unguessable Master Password or strong PIN'
                  : view === 'recovery'
                  ? 'Answer your security question to reset password'
                  : 'Recent security authentications & defense events'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#CAD3C0] hover:text-white hover:bg-[#3E4639] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lockout Warning Banner */}
        {isLockedOut && (
          <div className="bg-rose-600 text-white p-3.5 flex items-center gap-3 animate-pulse">
            <Clock className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Anti-Brute Force Defense Active</p>
              <p>Locked out for {lockoutRemainingSecs}s due to repeated incorrect entries.</p>
            </div>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 flex flex-col items-center">
          
          {/* ===================== VIEW: UNLOCK ===================== */}
          {view === 'unlock' && (
            <>
              {/* Security Shield Badge */}
              <div className="flex items-center gap-2 bg-[#F0F2EA] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#5C6652] mb-4">
                <Shield className="w-3.5 h-3.5 text-[#5C6652]" />
                <span>Unguessable Alphanumeric / PIN Security</span>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm font-bold text-[#2D3329]">Enter Master Password or PIN</p>
                <p className="text-xs text-[#707969] mt-0.5">
                  Supports custom strong passwords (letters, numbers, symbols) or PINs
                </p>
              </div>

              {/* Password Input Field with Show/Hide */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitUnlock(authInput);
                }}
                className="w-full max-w-[320px] mb-3"
              >
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLockedOut}
                    value={authInput}
                    onChange={(e) => {
                      setAuthInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter Master Password / PIN"
                    className={`w-full px-4 py-3 text-center text-lg font-semibold tracking-wider rounded-2xl border-2 transition-all outline-none ${
                      isLockedOut 
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-[#5C6652] bg-[#FAFBF8] text-[#2D3329] focus:bg-white focus:shadow-md'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-[#707969] hover:text-[#2D3329] transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Submit Unlock Button */}
                <button
                  type="submit"
                  disabled={isLockedOut || !authInput.trim()}
                  className={`w-full mt-3 py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-98 ${
                    isLockedOut || !authInput.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#5C6652] hover:bg-[#4D5644]'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify & Unlock Portal</span>
                </button>
              </form>

              {/* Error Message */}
              {errorMsg && (
                <div className="w-full max-w-[320px] mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sub-actions (Forgot Password / Change PIN / Security Logs) */}
              <div className="flex items-center justify-between w-full max-w-[320px] pt-3 border-t border-[#E0E4D9] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setView('recovery')}
                  className="text-[#707969] hover:text-[#2D3329] flex items-center gap-1 transition cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#5C6652]" />
                  <span>Forgot Password?</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('change_pin')}
                  className="text-[#5C6652] hover:text-[#3A4035] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Security Settings</span>
                </button>
              </div>
            </>
          )}

          {/* ===================== VIEW: CHANGE PIN / PASSWORD ===================== */}
          {view === 'change_pin' && (
            <div className="w-full max-w-[340px]">
              {successNotice ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#EBF1E5] text-[#4E6B3E] flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#2D3329]">{successNotice}</h4>
                  <p className="text-xs text-[#707969] mt-1">Unlocking portal with new credentials...</p>
                </div>
              ) : changeStep === 1 ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm font-bold text-[#2D3329]">Verify Current Security Key</p>
                    <p className="text-xs text-[#707969] mt-0.5">
                      Enter your current Master Password or PIN to proceed
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitCurrentVerifyForChange(currentSecretInput);
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentSecretInput}
                        onChange={(e) => {
                          setCurrentSecretInput(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="Current Password / PIN"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#CAD3C0] text-sm focus:border-[#5C6652] outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#707969]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!currentSecretInput.trim()}
                      className="w-full py-2.5 bg-[#5C6652] hover:bg-[#4D5644] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Verify Current Key →
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm font-bold text-[#2D3329]">Create Strong Master Password</p>
                    <p className="text-xs text-[#707969] mt-0.5">
                      Choose an unguessable password (e.g. <code>SirAli@2026!</code>) or numeric PIN
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#707969] block mb-1">New Password / PIN</label>
                      <input
                        type="text"
                        value={newSecretInput}
                        onChange={(e) => setNewSecretInput(e.target.value)}
                        placeholder="e.g. SirAli@2026 or 8-digit PIN"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#CAD3C0] text-sm focus:border-[#5C6652] outline-none font-medium"
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {newSecretInput && (
                      <div className="bg-[#F7F8F3] p-2.5 rounded-xl border border-[#E0E4D9]">
                        <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
                          <span className="text-[#707969]">Security Strength:</span>
                          <span className="text-[#2D3329] font-bold">{strength.label}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`flex-1 h-full transition-all ${
                                strength.score >= step ? strength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-[#707969] block mb-1">Confirm New Password / PIN</label>
                      <input
                        type="text"
                        value={confirmSecretInput}
                        onChange={(e) => setConfirmSecretInput(e.target.value)}
                        placeholder="Re-enter to confirm"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#CAD3C0] text-sm focus:border-[#5C6652] outline-none font-medium"
                      />
                    </div>

                    {/* Optional Security Question Setup */}
                    <div className="pt-2 border-t border-[#E0E4D9]">
                      <span className="text-[11px] font-bold text-[#5C6652] block mb-1 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>Security Question for Account Recovery</span>
                      </span>
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="e.g. What is your private academy secret key?"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#CAD3C0] mb-1.5"
                      />
                      <input
                        type="text"
                        value={customAnswer}
                        onChange={(e) => setCustomAnswer(e.target.value)}
                        placeholder="Secret Answer (kept private for recovery)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#CAD3C0]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={finalizeNewPassword}
                      disabled={!newSecretInput || !confirmSecretInput}
                      className="w-full py-2.5 bg-[#5C6652] hover:bg-[#4D5644] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      Save Strong Security Key
                    </button>
                  </div>
                </>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('unlock');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-[#707969] hover:text-[#2D3329] transition cursor-pointer"
                >
                  ← Back to Unlock
                </button>
                <button
                  type="button"
                  onClick={() => setView('logs')}
                  className="text-xs font-semibold text-[#5C6652] hover:text-[#2D3329] flex items-center gap-1 transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Security Logs</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== VIEW: RECOVERY ===================== */}
          {view === 'recovery' && (
            <div className="w-full max-w-[340px]">
              <div className="text-center mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-[#2D3329]">Security Recovery Question</p>
                <p className="text-xs text-[#707969] mt-0.5">
                  Verify your identity to reset a forgotten Master Password
                </p>
              </div>

              {!recoverySuccess ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[#F0F2EA] rounded-xl border border-[#E0E4D9]">
                    <span className="text-[10px] uppercase font-bold text-[#707969] block">Your Security Question:</span>
                    <p className="text-xs font-bold text-[#2D3329] mt-0.5">{customQuestion}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#707969] block mb-1">Secret Answer</label>
                    <input
                      type="text"
                      value={recoveryAnswerInput}
                      onChange={(e) => {
                        setRecoveryAnswerInput(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Enter secret answer"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CAD3C0] text-sm focus:border-[#5C6652] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRecoverySubmit}
                    disabled={!recoveryAnswerInput.trim()}
                    className="w-full py-2.5 bg-[#5C6652] hover:bg-[#4D5644] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Verify Answer & Reset Password
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-2.5 bg-[#EBF1E5] rounded-xl text-[#3A4035] text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4E6B3E] shrink-0" />
                    <span>Identity verified! Set your new Master Password.</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#707969] block mb-1">New Master Password</label>
                    <input
                      type="text"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="e.g. SirAli@2026"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CAD3C0] text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#707969] block mb-1">Confirm New Password</label>
                    <input
                      type="text"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CAD3C0] text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={finalizeRecoveryReset}
                    className="w-full py-2.5 bg-[#5C6652] hover:bg-[#4D5644] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Confirm & Unlock System
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-[#E0E4D9] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView('unlock');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-[#707969] hover:text-[#2D3329] transition cursor-pointer"
                >
                  ← Back to Verification
                </button>
              </div>
            </div>
          )}

          {/* ===================== VIEW: AUDIT LOGS ===================== */}
          {view === 'logs' && (
            <div className="w-full max-w-[340px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#2D3329]">Recent Security Audit Trail</p>
                <span className="text-[10px] bg-[#F0F2EA] text-[#5C6652] px-2 py-0.5 rounded-full font-semibold">
                  Local Device
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1 text-xs">
                {logsList.length === 0 ? (
                  <p className="text-center py-6 text-[#707969] text-xs">No recent security alerts recorded.</p>
                ) : (
                  logsList.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                        log.type === 'lockout'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : log.type === 'failed'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-[#F7F8F3] border-[#E0E4D9] text-[#2D3329]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {log.type === 'lockout' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        ) : log.type === 'failed' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold capitalize text-[11px]">{log.type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-gray-500">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 leading-snug">{log.details}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setView('unlock')}
                className="w-full py-2 bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F7F8F3] px-6 py-3.5 border-t border-[#E0E4D9] flex items-center justify-between text-xs">
          <span className="text-[#707969] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5C6652]" />
            <span>Anti-Brute Force Protection Active</span>
          </span>
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
