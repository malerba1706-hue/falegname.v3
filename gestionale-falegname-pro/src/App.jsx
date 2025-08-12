import React from "react";
import AuthGate from "./components/AuthGate.jsx";
import GestionaleFalegname from "./Gestionale.jsx";

export default function App() {
  return (
    <AuthGate>
      <GestionaleFalegname />
    </AuthGate>
  );
}
