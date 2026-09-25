"use client";
import { useConfirmation } from "@/components/confirmation-provider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import {
  attemptSchema,
  newAttempt,
  type Attempt,
} from "@/lib/assessment/engine";
import { firebaseConfigured, getClientAuth } from "@/lib/firebase/client";
import { readApiResponse } from "@/lib/api-response";
type Saved = { attempt: Attempt; owner: string | null; dirty?: boolean };
type Session = {
  attempt: Attempt | null;
  user: User | null;
  ready: boolean;
  error: string;
  saveStatus: string;
  start: () => void;
  update: (a: Attempt) => void;
  clear: () => void;
  login: () => Promise<void>;
  redirect: () => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
  api: <T>(path: string, method?: string, body?: unknown) => Promise<T>;
  load: (a: Attempt) => void;
  deleteAccount: () => Promise<void>;
};
const Context = createContext<Session | null>(null);
const KEY = "ruang-eq-session-v1";
export function SessionProvider({ children }: { children: ReactNode }) {
  const confirmAction = useConfirmation();
  const [attempt, setAttempt] = useState<Attempt | null>(null),
    [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [saveStatus, setSaveStatus] = useState("");
  const current = useRef<Saved | null>(null),
    pending = useRef(false),
    busy = useRef(false),
    generation = useRef(0);
  const persist = useCallback((value: Saved | null) => {
    current.current = value;
    setAttempt(value?.attempt ?? null);
    try {
      if (value) sessionStorage.setItem(KEY, JSON.stringify(value));
      else sessionStorage.removeItem(KEY);
    } catch {
      setError(
        "Penyimpanan sesi browser tidak tersedia. Pertahankan tab ini dan unduh hasil sebelum menutupnya.",
      );
    }
  }, []);
  useEffect(() => {
    let stored: Saved | null = null;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const value = JSON.parse(raw);
        const parsed = attemptSchema.safeParse(value.attempt);
        if (
          parsed.success &&
          (value.owner === null || typeof value.owner === "string")
        )
          stored = {
            attempt: parsed.data,
            owner: value.owner,
            dirty: value.dirty === true,
          };
        else sessionStorage.removeItem(KEY);
      }
    } catch {
      setError("Sesi sebelumnya tidak dapat dibaca. Silakan mulai tes baru.");
    }
    if (!firebaseConfigured) {
      if (stored?.owner === null) persist(stored);
      setReady(true);
      return;
    }
    const auth = getClientAuth();
    getRedirectResult(auth).catch(() =>
      setError("Login belum berhasil. Coba lagi atau gunakan mode guest."),
    );
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (
        stored &&
        ((stored.owner === null && !u) || stored.owner === u?.uid)
      ) {
        persist(stored);
        pending.current = Boolean(stored.owner && stored.dirty);
        if (stored.owner)
          setSaveStatus(
            stored.dirty ? "Menunggu penyimpanan" : "Tersimpan di akun",
          );
      } else if (current.current?.owner !== (u?.uid ?? null)) {
        generation.current++;
        persist(null);
      }
      stored = null;
      setReady(true);
    });
  }, [persist]);
  const api = useCallback(
    async <T,>(path: string, method = "GET", body?: unknown): Promise<T> => {
      const u = getClientAuth().currentUser;
      if (!u) throw new Error("Silakan masuk untuk membuka data akun.");
      const res = await fetch(path, {
        method,
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${await u.getIdToken()}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return readApiResponse<T>(res);
    },
    [],
  );
  const sync = useCallback(async () => {
    if (busy.current || !current.current?.owner || !pending.current) return;
    busy.current = true;
    const g = generation.current;
    try {
      while (
        pending.current &&
        current.current?.owner &&
        generation.current === g
      ) {
        pending.current = false;
        setSaveStatus("Menyimpan...");
        const sent: Saved = current.current;
        const saved = await api<Attempt>(
          `/api/attempts/${sent.attempt.id}`,
          "PUT",
          { attempt: sent.attempt },
        );
        if (
          generation.current === g &&
          current.current?.attempt.id === sent.attempt.id
        ) {
          persist({
            ...current.current,
            dirty: pending.current,
            attempt: {
              ...current.current.attempt,
              revision: saved.revision,
              completedAt:
                sent.attempt.status === "completed"
                  ? saved.completedAt
                  : current.current.attempt.completedAt,
            },
          });
          setSaveStatus(pending.current ? "Menyimpan..." : "Tersimpan di akun");
          setError("");
        }
      }
    } catch (e) {
      if (generation.current === g) {
        pending.current = true;
        setSaveStatus("Gagal menyimpan");
        setError(
          e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi.",
        );
      }
    } finally {
      busy.current = false;
    }
  }, [api, persist]);
  useEffect(() => {
    if (!attempt || !user) return;
    const timer = setTimeout(() => void sync(), 750);
    return () => clearTimeout(timer);
  }, [attempt, user, sync]);
  const clear = () => {
    generation.current++;
    pending.current = false;
    persist(null);
    setError("");
    setSaveStatus("");
  };
  const update = (a: Attempt) => {
    persist({ attempt: a, owner: user?.uid ?? null, dirty: Boolean(user) });
    if (user) {
      pending.current = true;
      setSaveStatus("Menunggu penyimpanan");
    }
  };
  const login = async () => {
    if (
      current.current?.owner === null &&
      Object.keys(current.current.attempt.responsesByItemId).length > 0 &&
      !(await confirmAction(
        "Masuk ke akun akan membersihkan sesi guest, tanpa mengunggahnya. Unduh hasil terlebih dahulu jika diperlukan. Lanjutkan masuk?",
        { title: "Masuk dengan Google?", action: "Lanjutkan masuk" },
      ))
    )
      return;
    setError("");
    try {
      await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(
        code === "auth/popup-blocked"
          ? "Popup diblokir. Gunakan tombol masuk melalui pengalihan."
          : code === "auth/popup-closed-by-user"
            ? "Login dibatalkan. Anda dapat mencoba lagi atau melanjutkan sebagai guest."
            : code === "auth/unauthorized-domain"
              ? "Domain ini belum diizinkan di Firebase. Hubungi pengelola atau gunakan mode guest."
              : code === "auth/network-request-failed"
                ? "Login gagal terhubung. Periksa koneksi dan coba lagi."
                : e instanceof Error
                  ? e.message
                  : "Login gagal. Coba lagi.",
      );
    }
  };
  const logout = async () => {
    await signOut(getClientAuth());
    clear();
    setUser(null);
  };
  return (
    <Context.Provider
      value={{
        attempt,
        user,
        ready,
        error,
        saveStatus,
        start: () => {
          clear();
          update(newAttempt());
        },
        update,
        clear,
        login,
        redirect: async () => {
          try {
            await signInWithRedirect(getClientAuth(), new GoogleAuthProvider());
          } catch {
            setError(
              "Pengalihan login gagal. Periksa domain Firebase atau gunakan guest.",
            );
          }
        },
        logout,
        retry: () => {
          setError("");
          void sync();
        },
        api,
        load: (a) => {
          clear();
          persist({
            attempt: attemptSchema.parse(a),
            owner: user?.uid ?? null,
          });
          setSaveStatus("Dimuat dari akun");
        },
        deleteAccount: async () => {
          if (!user) return;
          await reauthenticateWithPopup(user, new GoogleAuthProvider());
          await api("/api/account", "DELETE");
          await logout();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error("SessionProvider diperlukan");
  return value;
}
