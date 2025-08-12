// src/components/AuthGate.jsx
import React, { useEffect, useState } from "react";

/**
 * Autenticazione super-semplice lato client:
 * - utenti salvati in localStorage:  key "gf_users"
 * - sessione attiva in localStorage: key "gf_session"
 * - default tab: "login"
 * - registrazione fa AUTO-LOGIN e apre subito l'app
 */
export default function AuthGate({ children }) {
  const [mode, setMode] = useState("login"); // <-- default: Accedi
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  // all’avvio: se ho una sessione, entro direttamente
  useEffect(() => {
    const session = safeParse(localStorage.getItem("gf_session"));
    if (session?.email) setAuthed(true);
    setReady(true);
  }, []);

  function safeParse(v) {
    try { return JSON.parse(v || "null"); } catch { return null; }
  }

  function loadUsers() {
    return safeParse(localStorage.getItem("gf_users")) || [];
  }
  function saveUsers(users) {
    localStorage.setItem("gf_users", JSON.stringify(users));
  }
  function setSession(user) {
    localStorage.setItem("gf_session", JSON.stringify({ email: user.email, loginAt: Date.now() }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const users = loadUsers();
    const u = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!u || u.password !== password) {
      setError("Credenziali non valide.");
      return;
    }
    setSession(u);
    setAuthed(true);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Inserisci email e password.");
      return;
    }
    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError("Esiste già un account con questa email.");
      return;
    }
    const newUser = { email, password, createdAt: Date.now() };
    users.push(newUser);
    saveUsers(users);

    // 🔑 AUTO-LOGIN subito dopo la registrazione
    setSession(newUser);
    setAuthed(true);
  }

  function logout() {
    localStorage.removeItem("gf_session");
    setAuthed(false);
    setMode("login");
    setEmail("");
    setPassword("");
  }

  if (!ready) return null;

  if (authed) {
    // Rende disponibile il logout a chi serve (opzionale)
    return (
      <>
        {children}
        {/* Esempio di hook globale: window.gfLogout() */}
        <ScriptLogout logout={logout} />
      </>
    );
  }

  // UI Accedi/Registrati (mobile-friendly)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4 text-center">🔐 Gestionale Falegname – {mode === "login" ? "Accedi" : "Registrati"}</h1>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`py-2 rounded-md ${mode === "login" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            Accedi
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`py-2 rounded-md ${mode === "register" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            Registrati
          </button>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border rounded-md p-2"
            required
            inputMode="email"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border rounded-md p-2"
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
            {mode === "login" ? "Accedi" : "Crea account e accedi"}
          </button>
        </form>

        <p className="mt-3 text-xs text-gray-500 text-center">
          Demo locale: i dati restano sul tuo dispositivo.
        </p>
      </div>
    </div>
  );
}

function ScriptLogout({ logout }) {
  useEffect(() => {
    // opzionale: consente window.gfLogout() dall’app
    window.gfLogout = logout;
    return () => { delete window.gfLogout; };
  }, [logout]);
  return null;
}
