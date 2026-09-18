'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-context';
import { useLanguage } from './language';

type Step = 'email' | 'code';

function AuthIcon({ kind }: { kind: Step }) {
  return <div className="modal-icon" aria-hidden="true">
    {kind === 'email' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </svg>}
  </div>;
}

export function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const { refresh } = useAuth();
  const { locale } = useLanguage();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Close on backdrop click
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Focus code input when step changes
  useEffect(() => {
    if (step === 'code') setTimeout(() => codeInputRef.current?.focus(), 50);
  }, [step]);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Ошибка отправки'); return; }
      setStep('code');
      setCountdown(60);
    } catch {
      setError('Проблема с соединением');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Неверный код'); return; }
      await refresh();
      onSuccess?.();
      onClose();
    } catch {
      setError('Проблема с соединением');
    } finally {
      setLoading(false);
    }
  }

  const labels = {
    title: { ru: 'Войти в аккаунт', en: 'Sign in', kk: 'Кіру' }[locale] ?? 'Войти',
    subtitle: { ru: 'Введи email — пришлём код подтверждения', en: 'Enter your email — we\'ll send a code', kk: 'Email енгізіңіз — код жібереміз' }[locale] ?? 'Введи email',
    emailLabel: { ru: 'Email', en: 'Email', kk: 'Email' }[locale] ?? 'Email',
    send: { ru: 'Получить код', en: 'Send code', kk: 'Код алу' }[locale] ?? 'Получить код',
    codeLabel: { ru: 'Код из письма', en: 'Code from email', kk: 'Хаттағы код' }[locale] ?? 'Код',
    codeHint: { ru: `Отправили на ${email}`, en: `Sent to ${email}`, kk: `${email} адресіне жіберілді` }[locale] ?? `Отправили на ${email}`,
    verify: { ru: 'Войти', en: 'Sign in', kk: 'Кіру' }[locale] ?? 'Войти',
    resend: countdown > 0
      ? ({ ru: `Повторить через ${countdown}с`, en: `Resend in ${countdown}s`, kk: `${countdown}с кейін` }[locale] ?? `${countdown}с`)
      : ({ ru: 'Отправить ещё раз', en: 'Resend code', kk: 'Қайта жіберу' }[locale] ?? 'Отправить ещё раз'),
    back: { ru: 'Другой email', en: 'Different email', kk: 'Басқа email' }[locale] ?? 'Другой email',
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={labels.title}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">×</button>

        {step === 'email' ? (
          <form onSubmit={sendCode}>
            <div className="modal-header">
              <AuthIcon kind="email" />
              <h2>{labels.title}</h2>
              <p>{labels.subtitle}</p>
            </div>
            <label className="field">
              {labels.emailLabel}
              <input
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </label>
            {error && <p className="modal-error" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={loading || !email}>
              {loading ? '...' : labels.send} <span aria-hidden="true">↗</span>
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <div className="modal-header">
              <AuthIcon kind="code" />
              <h2>{labels.codeLabel}</h2>
              <p>{labels.codeHint}</p>
            </div>
            <label className="field">
              {labels.codeLabel}
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                disabled={loading}
              />
            </label>
            {error && <p className="modal-error" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={loading || code.length !== 6}>
              {loading ? '...' : labels.verify} <span aria-hidden="true">↗</span>
            </button>
            <div className="modal-footer-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
              >{labels.back}</button>
              <button
                type="button"
                className="text-button"
                disabled={countdown > 0 || loading}
                onClick={() => { setCode(''); setError(''); void sendCode({ preventDefault: () => {} } as React.FormEvent); }}
              >{labels.resend}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
