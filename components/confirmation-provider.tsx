"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type Options = { title: string; action: string; destructive?: boolean };
type Confirm = (message: string, options: Options) => Promise<boolean>;
const Context = createContext<Confirm | null>(null);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<
    (Options & { message: string }) | null
  >(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const resolve = useRef<((answer: boolean) => void) | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const finish = useCallback((answer: boolean) => {
    const pending = resolve.current;
    resolve.current = null;
    dialog.current?.close();
    setRequest(null);
    trigger.current?.focus();
    pending?.(answer);
  }, []);

  const confirm = useCallback<Confirm>((message, options) => {
    if (resolve.current) return Promise.resolve(false);
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return new Promise<boolean>((done) => {
      resolve.current = done;
      setRequest({ ...options, message });
    });
  }, []);

  useEffect(() => {
    if (request) {
      dialog.current?.showModal();
      cancel.current?.focus();
    }
  }, [request]);

  useEffect(
    () => () => {
      resolve.current?.(false);
      resolve.current = null;
    },
    [],
  );

  return (
    <Context.Provider value={confirm}>
      {children}
      <dialog
        ref={dialog}
        className="dialog confirmation-dialog"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
        onCancel={(event) => {
          event.preventDefault();
          finish(false);
        }}
        onClose={() => {
          if (resolve.current) finish(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          );
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="dialog-close">
          <button
            type="button"
            aria-label="Tutup konfirmasi"
            onClick={() => finish(false)}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="confirmation-title">{request?.title}</h2>
        <p id="confirmation-message">{request?.message}</p>
        <div className="confirmation-actions">
          <button
            ref={cancel}
            type="button"
            className="secondary"
            onClick={() => finish(false)}
          >
            Batal
          </button>
          <button
            type="button"
            className={request?.destructive ? "danger-primary" : "primary"}
            onClick={() => finish(true)}
          >
            {request?.action}
          </button>
        </div>
      </dialog>
    </Context.Provider>
  );
}

export function useConfirmation() {
  const confirm = useContext(Context);
  if (!confirm) throw new Error("ConfirmationProvider diperlukan");
  return confirm;
}
