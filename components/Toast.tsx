// Design Ref: §7.2 round pages — submit success/failure toast.
// Auto-dismiss in ~3.5s; clickable to dismiss earlier.

'use client';

import * as React from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: number;
  kind: ToastKind;
  text: string;
};

let nextId = 1;
export function makeToast(kind: ToastKind, text: string): ToastMessage {
  return { id: nextId++, kind, text };
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--jnj-space-2)',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const palette = (() => {
    switch (toast.kind) {
      case 'success':
        return { bg: 'var(--jnj-green)', fg: 'var(--jnj-white)' };
      case 'error':
        return { bg: 'var(--jnj-red)', fg: 'var(--jnj-white)' };
      case 'info':
      default:
        return { bg: 'var(--jnj-black)', fg: 'var(--jnj-white)' };
    }
  })();

  return (
    <button
      type="button"
      onClick={() => onDismiss(toast.id)}
      style={{
        appearance: 'none',
        border: 'none',
        cursor: 'pointer',
        pointerEvents: 'auto',
        background: palette.bg,
        color: palette.fg,
        padding: 'var(--jnj-space-3) var(--jnj-space-5)',
        borderRadius: 'var(--jnj-radius-pill)',
        fontFamily: 'var(--jnj-font-text-medium)',
        fontSize: 'var(--jnj-size-link-sm)',
        fontWeight: 500,
        letterSpacing: '0.02em',
        boxShadow: 'none',
        maxWidth: 'min(92vw, 400px)',
      }}
    >
      {toast.text}
    </button>
  );
}

export function useToasts() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const push = React.useCallback((kind: ToastKind, text: string) => {
    setToasts((arr) => [...arr, makeToast(kind, text)]);
  }, []);
  const dismiss = React.useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);
  return { toasts, push, dismiss };
}
