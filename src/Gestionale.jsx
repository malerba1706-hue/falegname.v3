// src/Gestionale.jsx
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { db } from "./firebase";
import {
  collection, getDocs, addDoc, updateDoc, doc
} from "firebase/firestore";

// Icone (emoji)
const Users = ({ className = "" }) => <span className={className}>👥</span>;
const Calendar = ({ className = "" }) => <span className={className}>📅</span>;
const Package = ({ className = "" }) => <span className={className}>📦</span>;
const FileText = ({ className = "" }) => <span className={className}>📄</span>;
const Plus = ({ className = "" }) => <span className={className}>➕</span>;
const Phone = ({ className = "" }) => <span className={className}>📞</span>;
const Mail = ({ className = "" }) => <span className={className}>✉️</span>;
const MapPin = ({ className = "" }) => <span className={className}>📍</span>;
const Clock = ({ className = "" }) => <span className={className}>⏰</span>;
const Euro = ({ className = "" }) => <span className={className}>💰</span>;
const Search = ({ className = "" }) => <span className={className}>🔍</span>;
const Send = ({ className = "" }) => <span className={className}>📤</span>;
const Download = ({ className = "" }) => <span className={className}>📥</span>;
const CreditCard = ({ className = "" }) => <span className={className}>💳</span>;
const Receipt = ({ className = "" }) => <span className={className}>🧾</span>;

export default function GestionaleFalegname() {
  // NAV
  const [activeTab, setActiveTab] = useState("dashboard");

  // Funzione per uscire e tornare al login
  const esci = () => {
    // Qui puoi anche cancellare dati di autenticazione se necessario
    window.location.href = "/login";
  };

  // DATI
  const [clienti, setClienti] = useState([]);
  const [fornitori, setFornitori] = useState([
    { id: 1, nome: "Legni Italiani SRL", telefono: "+39 02 123456", email: "info@legniitaliani.it", prodotti: "Tavole, Travi, Compensato", piva: "IT11111111111" },
    { id: 2, nome: "Ferramenta Moderna", telefono: "+39 02 654321", email: "vendite@ferramenta.it", prodotti: "Viti, Cerniere, Maniglie", piva: "IT22222222222" }
  ]);

  const [appuntamenti, setAppuntamenti] = useState([
    { id: 1, clienteId: 1, data: "2025-08-15", ora: "09:00", tipo: "Sopralluogo", note: "Cucina su misura", stato: "Confermato" },
    { id: 2, clienteId: 2, data: "2025-08-16", ora: "14:30", tipo: "Consegna", note: "Armadio camera da letto", stato: "Completato" }
  ]);

  const [preventivi, setPreventivi] = useState([
    { id: 1, clienteId: 1, data: "2025-08-10", descrizione: "Cucina su misura in rovere", importo: 3500, stato: "In attesa", validita: "2025-09-10", dettagli: "Cucina completa con ante in rovere massello, top in quarzo" },
    { id: 2, clienteId: 2, data: "2025-08-12", descrizione: "Armadio 3 ante scorrevoli", importo: 1200, stato: "Approvato", validita: "2025-09-12", dettagli: "Armadio h.240 cm con specchio centrale" }
  ]);

  const [contratti, setContratti] = useState([
    { id: 1, clienteId: 1, preventivoId: 1, data: "2025-08-13", numeroContratto: "CTR-2025-001", stato: "In attesa firma", importo: 3500, acconto: 1000, scadenza: "2025-09-15" },
    { id: 2, clienteId: 2, preventivoId: 2, data: "2025-08-14", numeroContratto: "CTR-2025-002", stato: "Firmato", importo: 1200, acconto: 400, scadenza: "2025-09-20" }
  ]);

  const [fatture, setFatture] = useState([
    { id: 1, clienteId: 1, numero: "FAT-2025-001", data: "2025-08-15", importo: 1000, tipo: "Acconto", stato: "Pagata", scadenza: "2025-08-30", contratto: "CTR-2025-001" },
    { id: 2, clienteId: 2, numero: "FAT-2025-002", data: "2025-08-16", importo: 400, tipo: "Acconto", stato: "In attesa", scadenza: "2025-09-01", contratto: "CTR-2025-002" },
    { id: 3, clienteId: 1, numero: "FAT-2025-003", data: "2025-08-20", importo: 2500, tipo: "Saldo", stato: "Scaduta", scadenza: "2025-08-25", contratto: "CTR-2025-001" }
  ]);

  // Stato UI
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Config azienda (ora modificabile)
  const [configAzienda, setConfigAzienda] = useState({
    nome: "Falegnameria Artigiana",
    titolare: "Giuseppe Legnami",
    indirizzo: "Via dei Falegnami, 15",
    citta: "12345 Cittàlegno (TO)",
    telefono: "+39 011 123456",
    email: "info@falegnameriaartigiana.it",
    piva: "IT98765432109",
    codiceFiscale: "LGNGGS75M15L219X",
  });

  // UTILS
  const getClienteNome = (clienteId) => clienti.find((c) => c.id === clienteId)?.nome || "Cliente non trovato";
  const getCliente = (clienteId) => clienti.find((c) => c.id === clienteId);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // PDF CONTRATTO
  const generaContratttoPDF = (contratto) => {
    const cliente = getCliente(contratto.clienteId);
    const preventivo = preventivi.find((p) => p.id === contratto.preventivoId);
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(configAzienda.nome, 20, 20);
    doc.setFontSize(12);
    doc.text(configAzienda.indirizzo, 20, 30);
    doc.text(configAzienda.citta, 20, 36);
    doc.text(`Tel: ${configAzienda.telefono} - Email: ${configAzienda.email}`, 20, 42);
    doc.text(`P.IVA: ${configAzienda.piva}`, 20, 48);

    // Titolo
    doc.setFontSize(16);
    doc.text("CONTRATTO DI LAVORO ARTIGIANALE", 20, 70);
    doc.setFontSize(12);
    doc.text(`Contratto N: ${contratto.numeroContratto}`, 20, 80);
    doc.text(`Data: ${new Date(contratto.data).toLocaleDateString("it-IT")}`, 20, 86);

    // Cliente
    doc.text("CLIENTE:", 20, 100);
    doc.text(cliente?.nome || "", 30, 106);
    doc.text(cliente?.indirizzo || "", 30, 112);
    if (cliente?.piva) doc.text(`P.IVA: ${cliente.piva}`, 30, 118);
    if (cliente?.codiceFiscale) doc.text(`C.F: ${cliente.codiceFiscale}`, 30, 124);

    // Descrizione
    doc.text("DESCRIZIONE LAVORI:", 20, 140);
    const baseDesc = preventivo ? `${preventivo.descrizione}` : "Lavori di falegnameria";
    doc.text(baseDesc, 30, 146);
    if (preventivo?.dettagli) {
      const chunks = preventivo.dettagli.match(/.{1,60}/g) || [];
      chunks.forEach((linea, i) => doc.text(linea, 30, 152 + i * 6));
    }

    // Economiche
    doc.text("CONDIZIONI ECONOMICHE:", 20, 180);
    doc.text(`Importo totale: € ${contratto.importo.toLocaleString("it-IT")}`, 30, 186);
    doc.text(`Acconto: € ${contratto.acconto.toLocaleString("it-IT")}`, 30, 192);
    doc.text(`Saldo: € ${(contratto.importo - contratto.acconto).toLocaleString("it-IT")}`, 30, 198);
    doc.text(`Scadenza lavori: ${new Date(contratto.scadenza).toLocaleDateString("it-IT")}`, 30, 204);

    // Firme
    doc.text("Il Cliente", 30, 240);
    doc.text("_____________________", 30, 250);
    doc.text("Il Fornitore", 120, 240);
    doc.text("_____________________", 120, 250);

    doc.save(`Contratto_${contratto.numeroContratto}_${(cliente?.nome || "Cliente").replace(/\s+/g, "_")}.pdf`);
  };
  const generaContrattoPDF = generaContratttoPDF; // alias

  // PDF FATTURA
  const generaFatturaPDF = (fattura) => {
    const cliente = getCliente(fattura.clienteId);
    const doc = new jsPDF();

    // Header azienda
    doc.setFontSize(16);
    doc.text(configAzienda.nome, 20, 20);
    doc.setFontSize(10);
    doc.text(configAzienda.indirizzo, 20, 28);
    doc.text(configAzienda.citta, 20, 33);
    doc.text(`Tel: ${configAzienda.telefono}`, 20, 38);
    doc.text(`Email: ${configAzienda.email}`, 20, 43);
    doc.text(`P.IVA: ${configAzienda.piva}`, 20, 48);

    // Titolo
    doc.setFontSize(18);
    doc.text("FATTURA", 140, 30);
    doc.setFontSize(12);
    doc.text(`N: ${fattura.numero}`, 140, 38);
    doc.text(`Data: ${new Date(fattura.data).toLocaleDateString("it-IT")}`, 140, 44);
    doc.text(`Scadenza: ${new Date(fattura.scadenza).toLocaleDateString("it-IT")}`, 140, 50);

    // Cliente
    doc.setFontSize(12);
    doc.text("FATTURARE A:", 20, 70);
    doc.text(cliente?.nome || "", 20, 78);
    doc.text(cliente?.indirizzo || "", 20, 84);
    if (cliente?.piva) doc.text(`P.IVA: ${cliente.piva}`, 20, 90);
    if (cliente?.codiceFiscale) doc.text(`C.F: ${cliente.codiceFiscale}`, 20, 96);

    // Dettagli
    doc.text("DESCRIZIONE", 20, 120);
    doc.text("IMPORTO", 160, 120);
    doc.line(20, 122, 190, 122);
    doc.text(`${fattura.tipo} - Contratto ${fattura.contratto || "-"}`, 20, 130);
    doc.text(`€ ${fattura.importo.toLocaleString("it-IT")}`, 160, 130);

    // Totale
    doc.line(20, 140, 190, 140);
    doc.setFontSize(14);
    doc.text(`TOTALE: € ${fattura.importo.toLocaleString("it-IT")}`, 140, 150);

    // Note
    doc.setFontSize(10);
    doc.text("Pagamento: Bonifico bancario", 20, 200);
    doc.text("IBAN: IT60 X054 2811 1010 0000 0123 456", 20, 206);
    if (fattura.stato === "Scaduta") {
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(12);
      doc.text("FATTURA SCADUTA", 20, 220);
    }

    doc.save(`Fattura_${fattura.numero}_${(cliente?.nome || "Cliente").replace(/\s+/g, "_")}.pdf`);
  };

  // MODALI
  const ClienteModal = () => {
    const [formData, setFormData] = useState(
      editingItem || { nome: "", telefono: "", email: "", indirizzo: "", piva: "", codiceFiscale: "" }
    );
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (editingItem) {
        await updateDoc(doc(db, "clienti", editingItem.id), formData);
        setClienti(clienti.map((c) => (c.id === editingItem.id ? { ...formData, id: editingItem.id } : c)));
      } else {
        const docRef = await addDoc(collection(db, "clienti"), formData);
        setClienti([...clienti, { ...formData, id: docRef.id }]);
      }
      closeModal();
    };
    return (
      <Modal title={editingItem ? "Modifica Cliente" : "Nuovo Cliente"} onClose={closeModal} onSubmit={handleSubmit}>
        <Input value={formData.nome} onChange={(v) => setFormData({ ...formData, nome: v })} required placeholder="Nome/Ragione sociale" />
        <Input value={formData.telefono} onChange={(v) => setFormData({ ...formData, telefono: v })} placeholder="Telefono" />
        <Input value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} type="email" placeholder="Email" />
        <Textarea value={formData.indirizzo} onChange={(v) => setFormData({ ...formData, indirizzo: v })} placeholder="Indirizzo completo" />
        <Input value={formData.piva} onChange={(v) => setFormData({ ...formData, piva: v })} placeholder="P.IVA (per aziende)" />
        <Input value={formData.codiceFiscale} onChange={(v) => setFormData({ ...formData, codiceFiscale: v })} placeholder="Codice Fiscale" />
      </Modal>
    );
  };

  const AppuntamentoModal = () => {
    const [formData, setFormData] = useState(
      editingItem || { clienteId: "", data: "", ora: "", tipo: "Sopralluogo", note: "", stato: "Programmato" }
    );
    const handleSubmit = async (e) => {
      e.preventDefault();
      const dataToSave = { ...formData, clienteId: Number(formData.clienteId) || formData.clienteId };
      if (editingItem) {
        await updateDoc(doc(db, "appuntamenti", editingItem.id), dataToSave);
        setAppuntamenti(appuntamenti.map((a) => (a.id === editingItem.id ? { ...dataToSave, id: editingItem.id } : a)));
      } else {
        const docRef = await addDoc(collection(db, "appuntamenti"), dataToSave);
        setAppuntamenti([...appuntamenti, { ...dataToSave, id: docRef.id }]);
      }
      closeModal();
    };
    const aggiungiACalendario = () => {
      const cliente = clienti.find((c) => c.id == formData.clienteId);
      const startDate = new Date(`${formData.data}T${formData.ora}`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const toGCal = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `${formData.tipo} - ${cliente?.nome || "Cliente"}`
      )}&dates=${toGCal(startDate)}/${toGCal(endDate)}&details=${encodeURIComponent(formData.note)}&location=${encodeURIComponent(
        cliente?.indirizzo || ""
      )}`;
      window.open(googleUrl, "_blank");
    };
    return (
      <Modal
        title={editingItem ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        extraActions={<button type="button" onClick={aggiungiACalendario} className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600">📅</button>}
      >
        <Select
          value={formData.clienteId}
          onChange={(v) => setFormData({ ...formData, clienteId: v })}
          required
          options={[["", "Seleziona cliente"], ...clienti.map((c) => [c.id, c.nome])]}
        />
        <Input type="date" value={formData.data} onChange={(v) => setFormData({ ...formData, data: v })} required />
        <Input type="time" value={formData.ora} onChange={(v) => setFormData({ ...formData, ora: v })} required />
        <Select
          value={formData.tipo}
          onChange={(v) => setFormData({ ...formData, tipo: v })}
          options={[["Sopralluogo", "Sopralluogo"], ["Consegna", "Consegna"], ["Installazione", "Installazione"], ["Riparazione", "Riparazione"], ["Ritiro misure", "Ritiro misure"]]}
        />
        <Select
          value={formData.stato}
          onChange={(v) => setFormData({ ...formData, stato: v })}
          options={[["Programmato", "Programmato"], ["Confermato", "Confermato"], ["Completato", "Completato"], ["Annullato", "Annullato"]]}
        />
        <Textarea value={formData.note} onChange={(v) => setFormData({ ...formData, note: v })} placeholder="Note aggiuntive" rows={3} />
      </Modal>
    );
  };

  const ContrattoModal = () => {
    const preventiviApprovati = preventivi.filter((p) => p.stato === "Approvato");
    const [formData, setFormData] = useState(
      editingItem || {
        clienteId: "",
        preventivoId: "",
        numeroContratto: `CTR-${new Date().getFullYear()}-${String(contratti.length + 1).padStart(3, "0")}`,
        importo: "",
        acconto: "",
        stato: "In attesa firma",
        data: new Date().toISOString().split("T")[0],
        scadenza: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }
    );
    const handleSubmit = async (e) => {
      e.preventDefault();
      const newData = {
        ...formData,
        clienteId: Number(formData.clienteId) || formData.clienteId,
        preventivoId: Number(formData.preventivoId) || formData.preventivoId,
        importo: parseFloat(formData.importo),
        acconto: parseFloat(formData.acconto),
      };
      if (editingItem) {
        await updateDoc(doc(db, "contratti", editingItem.id), newData);
        setContratti(contratti.map((c) => (c.id === editingItem.id ? { ...newData, id: editingItem.id } : c)));
      } else {
        const docRef = await addDoc(collection(db, "contratti"), newData);
        setContratti([...contratti, { ...newData, id: docRef.id }]);
      }
      closeModal();
    };
    return (
      <Modal title={editingItem ? "Modifica Contratto" : "Nuovo Contratto"} onClose={closeModal} onSubmit={handleSubmit}>
        <Input value={formData.numeroContratto} onChange={(v) => setFormData({ ...formData, numeroContratto: v })} required placeholder="Numero contratto" />
        <Select
          value={formData.clienteId}
          onChange={(v) => setFormData({ ...formData, clienteId: v })}
          required
          options={[["", "Seleziona cliente"], ...clienti.map((c) => [c.id, c.nome])]}
        />
        <Select
          value={formData.preventivoId}
          onChange={(v) => {
            const p = preventiviApprovati.find((x) => x.id == v);
            setFormData({
              ...formData,
              preventivoId: v,
              importo: p ? p.importo : "",
              clienteId: p ? p.clienteId : formData.clienteId,
            });
          }}
          required
          options={[["", "Seleziona preventivo approvato"], ...preventiviApprovati.map((p) => [p.id, `${p.descrizione} - €${p.importo}`])]}
        />
        <Input type="number" step="0.01" value={formData.importo} onChange={(v) => setFormData({ ...formData, importo: v })} required placeholder="Importo totale (€)" />
        <Input type="number" step="0.01" value={formData.acconto} onChange={(v) => setFormData({ ...formData, acconto: v })} required placeholder="Acconto richiesto (€)" />
        <Input type="date" value={formData.scadenza} onChange={(v) => setFormData({ ...formData, scadenza: v })} required title="Scadenza consegna" />
        <Select
          value={formData.stato}
          onChange={(v) => setFormData({ ...formData, stato: v })}
          options={[["In attesa firma", "In attesa firma"], ["Firmato", "Firmato"], ["In lavorazione", "In lavorazione"], ["Completato", "Completato"], ["Annullato", "Annullato"]]}
        />
      </Modal>
    );
  };

  const FatturaModal = () => {
    const [formData, setFormData] = useState(
      editingItem || {
        clienteId: "",
        numero: `FAT-${new Date().getFullYear()}-${String(fatture.length + 1).padStart(3, "0")}`,
        importo: "",
        tipo: "Acconto",
        stato: "In attesa",
        data: new Date().toISOString().split("T")[0],
        scadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        contratto: "",
      }
    );
    const handleSubmit = async (e) => {
      e.preventDefault();
      const newData = {
        ...formData,
        clienteId: Number(formData.clienteId) || formData.clienteId,
        importo: parseFloat(formData.importo),
      };
      if (editingItem) {
        await updateDoc(doc(db, "fatture", editingItem.id), newData);
        setFatture(fatture.map((f) => (f.id === editingItem.id ? { ...newData, id: editingItem.id } : f)));
      } else {
        const docRef = await addDoc(collection(db, "fatture"), newData);
        setFatture([...fatture, { ...newData, id: docRef.id }]);
      }
      closeModal();
    };
    return (
      <Modal title={editingItem ? "Modifica Fattura" : "Nuova Fattura"} onClose={closeModal} onSubmit={handleSubmit}>
        <Input value={formData.numero} onChange={(v) => setFormData({ ...formData, numero: v })} required placeholder="Numero fattura" />
        <Select
          value={formData.clienteId}
          onChange={(v) => setFormData({ ...formData, clienteId: v })}
          required
          options={[["", "Seleziona cliente"], ...clienti.map((c) => [c.id, c.nome])]}
        />
        <Select value={formData.tipo} onChange={(v) => setFormData({ ...formData, tipo: v })} options={[["Acconto", "Fattura di acconto"], ["Saldo", "Fattura di saldo"], ["Unica", "Fattura unica"]]} />
        <Input value={formData.contratto} onChange={(v) => setFormData({ ...formData, contratto: v })} placeholder="Riferimento contratto" />
        <Input type="number" step="0.01" value={formData.importo} onChange={(v) => setFormData({ ...formData, importo: v })} required placeholder="Importo (€)" />
        <Input type="date" value={formData.scadenza} onChange={(v) => setFormData({ ...formData, scadenza: v })} required title="Scadenza pagamento" />
        <Select value={formData.stato} onChange={(v) => setFormData({ ...formData, stato: v })} options={[["In attesa", "In attesa"], ["Pagata", "Pagata"], ["Scaduta", "Scaduta"], ["Annullata", "Annullata"]]} />
      </Modal>
    );
  };

  const FornitoreModal = () => {
    const [formData, setFormData] = useState(editingItem || { nome: "", telefono: "", email: "", prodotti: "", piva: "" });
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (editingItem) {
        await updateDoc(doc(db, "fornitori", editingItem.id), formData);
        setFornitori(fornitori.map((f) => (f.id === editingItem.id ? { ...formData, id: editingItem.id } : f)));
      } else {
        const docRef = await addDoc(collection(db, "fornitori"), formData);
        setFornitori([...fornitori, { ...formData, id: docRef.id }]);
      }
      closeModal();
    };
    return (
      <Modal title={editingItem ? "Modifica Fornitore" : "Nuovo Fornitore"} onClose={closeModal} onSubmit={handleSubmit}>
        <Input value={formData.nome} onChange={(v) => setFormData({ ...formData, nome: v })} required placeholder="Nome fornitore/azienda" />
        <Input value={formData.telefono} onChange={(v) => setFormData({ ...formData, telefono: v })} placeholder="Telefono" />
        <Input value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} type="email" placeholder="Email" />
        <Input value={formData.piva} onChange={(v) => setFormData({ ...formData, piva: v })} placeholder="P.IVA" />
        <Textarea value={formData.prodotti} onChange={(v) => setFormData({ ...formData, prodotti: v })} placeholder="Prodotti/Servizi offerti" rows={3} />
      </Modal>
    );
  };

  const PreventivoModal = () => {
    const [formData, setFormData] = useState(
      editingItem || {
        clienteId: "",
        descrizione: "",
        dettagli: "",
        importo: "",
        stato: "In attesa",
        data: new Date().toISOString().split("T")[0],
        validita: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }
    );
    const handleSubmit = async (e) => {
      e.preventDefault();
      const dataToSave = {
        ...formData,
        clienteId: Number(formData.clienteId) || formData.clienteId,
        importo: parseFloat(formData.importo),
      };
      if (editingItem) {
        await updateDoc(doc(db, "preventivi", editingItem.id), dataToSave);
        setPreventivi(preventivi.map((p) => (p.id === editingItem.id ? { ...dataToSave, id: editingItem.id } : p)));
      } else {
        const docRef = await addDoc(collection(db, "preventivi"), dataToSave);
        setPreventivi([...preventivi, { ...dataToSave, id: docRef.id }]);
      }
      closeModal();
    };
    const inviaWhatsApp = () => {
      const cliente = clienti.find((c) => c.id == formData.clienteId);
      if (cliente?.telefono) {
        const messaggio = `Salve ${cliente.nome}, le invio il preventivo per ${formData.descrizione}.\n\nImporto: €${formData.importo}\nValidità: ${new Date(formData.validita).toLocaleDateString("it-IT")}\n\nPer ulteriori informazioni non esiti a contattarmi.`;
        const phoneNumber = cliente.telefono.replace(/\s+/g, "").replace("+", "");
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messaggio)}`;
        window.open(url, "_blank");
      }
    };
    return (
      <Modal
        title={editingItem ? "Modifica Preventivo" : "Nuovo Preventivo"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        extraActions={<button type="button" onClick={inviaWhatsApp} className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600">📱</button>}
      >
        <Select
          value={formData.clienteId}
          onChange={(v) => setFormData({ ...formData, clienteId: v })}
          required
          options={[["", "Seleziona cliente"], ...clienti.map((c) => [c.id, c.nome])]}
        />
        <Input value={formData.descrizione} onChange={(v) => setFormData({ ...formData, descrizione: v })} required placeholder="Descrizione breve" />
        <Textarea value={formData.dettagli} onChange={(v) => setFormData({ ...formData, dettagli: v })} placeholder="Dettagli tecnici e specifiche" rows={4} />
        <Input type="number" step="0.01" value={formData.importo} onChange={(v) => setFormData({ ...formData, importo: v })} required placeholder="Importo (€)" />
        <Input type="date" value={formData.validita} onChange={(v) => setFormData({ ...formData, validita: v })} title="Validità preventivo" />
        <Select value={formData.stato} onChange={(v) => setFormData({ ...formData, stato: v })} options={[["In attesa", "In attesa"], ["Approvato", "Approvato"], ["Rifiutato", "Rifiutato"], ["Scaduto", "Scaduto"]]} />
      </Modal>
    );
  };

  const ProfiloAziendaModal = () => {
    const [formData, setFormData] = useState(configAzienda);
    const handleSubmit = (e) => {
      e.preventDefault();
      setConfigAzienda(formData);
      closeModal();
    };
    return (
      <Modal title="Profilo Azienda" onClose={closeModal} onSubmit={handleSubmit}>
        <Input value={formData.nome} onChange={(v) => setFormData({ ...formData, nome: v })} required placeholder="Nome azienda" />
        <Input value={formData.titolare} onChange={(v) => setFormData({ ...formData, titolare: v })} required placeholder="Titolare" />
        <Input value={formData.indirizzo} onChange={(v) => setFormData({ ...formData, indirizzo: v })} required placeholder="Indirizzo" />
        <Input value={formData.citta} onChange={(v) => setFormData({ ...formData, citta: v })} required placeholder="Città" />
        <Input value={formData.telefono} onChange={(v) => setFormData({ ...formData, telefono: v })} required placeholder="Telefono" />
        <Input value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required placeholder="Email" />
        <Input value={formData.piva} onChange={(v) => setFormData({ ...formData, piva: v })} required placeholder="P.IVA" />
        <Input value={formData.codiceFiscale} onChange={(v) => setFormData({ ...formData, codiceFiscale: v })} required placeholder="Codice Fiscale" />
      </Modal>
    );
  };

  // DASHBOARD
  const Dashboard = () => {
    const oggi = new Date().toISOString().split("T")[0];
    const appuntamentiOggi = appuntamenti.filter((app) => app.data === oggi);
    const fattureScadute = fatture.filter((f) => f.stato === "Scaduta");
    const contrattiInCorso = contratti.filter((c) => ["In lavorazione", "Firmato"].includes(c.stato));
    const fatturato = fatture.filter((f) => f.stato === "Pagata").reduce((s, f) => s + f.importo, 0);
    const daIncassare = fatture.filter((f) => f.stato === "In attesa").reduce((s, f) => s + f.importo, 0);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Clienti Attivi" value={clienti.length} color="blue" icon={<Users className="text-3xl" />} />
          <StatCard title="Appuntamenti Oggi" value={appuntamentiOggi.length} color="green" icon={<Calendar className="text-3xl" />} />
          <StatCard title="Fatturato" value={`€${fatturato.toLocaleString("it-IT")}`} color="purple" icon={<Euro className="text-3xl" />} />
          <StatCard title="Da Incassare" value={`€${daIncassare.toLocaleString("it-IT")}`} color="orange" icon={<CreditCard className="text-3xl" />} />
        </div>

        {fattureScadute.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>⚠️ Attenzione!</strong> Hai {fattureScadute.length} fatture scadute da sollecitare.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Appuntamenti di Oggi</h3>
            </div>
            <div className="p-4">
              {appuntamentiOggi.length === 0 ? (
                <p className="text-gray-500">Nessun appuntamento per oggi</p>
              ) : (
                <div className="space-y-3">
                  {appuntamentiOggi.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{getClienteNome(app.clienteId)}</p>
                        <p className="text-sm text-gray-600">
                          {app.tipo} - {app.ora}
                        </p>
                        <p className="text-sm text-gray-500">{app.note}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          app.stato === "Confermato" ? "bg-green-100 text-green-800" : app.stato === "Completato" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {app.stato}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Contratti Attivi</h3>
            </div>
            <div className="p-4">
              {contrattiInCorso.length === 0 ? (
                <p className="text-gray-500">Nessun contratto in corso</p>
              ) : (
                <div className="space-y-3">
                  {contrattiInCorso.slice(0, 3).map((contratto) => (
                    <div key={contratto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{contratto.numeroContratto}</p>
                        <p className="text-sm text-gray-600">{getClienteNome(contratto.clienteId)}</p>
                        <p className="text-sm text-gray-500">Scadenza: {new Date(contratto.scadenza).toLocaleDateString("it-IT")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">€{contratto.importo.toLocaleString("it-IT")}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${contratto.stato === "In lavorazione" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>{contratto.stato}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER PRINCIPALE
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🔨 {configAzienda.nome} - Gestionale Pro</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal("profilo")}
              className="ml-4 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full"
              title="Profilo azienda"
            >
              <span role="img" aria-label="Profilo" className="text-xl">👤</span>
            </button>
            <button
              onClick={esci}
              className="ml-2 flex items-center gap-2 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-full text-red-700"
              title="Esci"
            >
              <span role="img" aria-label="Esci" className="text-xl">🚪</span>
              Esci
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm">
        <div className="px-6">
          <nav className="flex space-x-4 overflow-x-auto">
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "clienti", label: "Clienti" },
              { key: "appuntamenti", label: "Appuntamenti" },
              { key: "preventivi", label: "Preventivi" },
              { key: "contratti", label: "Contratti" },
              { key: "fatture", label: "Fatture" },
              { key: "fornitori", label: "Fornitori" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === "dashboard" && <Dashboard />}

        {activeTab === "clienti" && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Clienti</h2>
              <button onClick={() => openModal("cliente")} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
                <Plus className="text-sm" />
                Nuovo Cliente
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca clienti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border rounded-md"
                  />
                </div>
              </div>
              <div className="divide-y">
                {clienti
                  .filter((c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((cliente) => (
                    <div key={cliente.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{cliente.nome}</h3>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cliente.telefono && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="mr-2" />
                                {cliente.telefono}
                              </div>
                            )}
                            {cliente.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="mr-2" />
                                {cliente.email}
                              </div>
                            )}
                            {cliente.indirizzo && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="mr-2" />
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.indirizzo)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-blue-600"
                                  title="Apri in Google Maps"
                                >
                                  {cliente.indirizzo}
                                </a>
                              </div>
                            )}
                            {cliente.piva && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">🏢</span>
                                P.IVA: {cliente.piva}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              const messaggio = `Salve ${cliente.nome}, la contatto per...`;
                              const phoneNumber = cliente.telefono.replace(/\s+/g, "").replace("+", "");
                              window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(messaggio)}`, "_blank");
                            }}
                            className="text-green-600 hover:text-green-800 p-2"
                            title="Invia WhatsApp"
                          >
                            <Send />
                          </button>
                          <button onClick={() => openModal("cliente", cliente)} className="text-blue-600 hover:text-blue-800 p-2" title="Modifica">
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "appuntamenti" && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Appuntamenti</h2>
              <button onClick={() => openModal("appuntamento")} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
                <Plus className="text-sm" />
                Nuovo Appuntamento
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="divide-y">
                {appuntamenti
                  .slice()
                  .sort((a, b) => {
                    const dA = new Date(`${a.data}T${a.ora || "00:00"}`);
                    const dB = new Date(`${b.data}T${b.ora || "00:00"}`);
                    return dA - dB;
                  })
                  .map((app) => (
                    <div key={app.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{getClienteNome(app.clienteId)}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar /> {new Date(app.data).toLocaleDateString("it-IT")} <Clock /> {app.ora} • {app.tipo}
                        </p>
                        {app.note && <p className="text-sm text-gray-500">{app.note}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            app.stato === "Confermato"
                              ? "bg-green-100 text-green-800"
                              : app.stato === "Completato"
                              ? "bg-blue-100 text-blue-800"
                              : app.stato === "Annullato"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {app.stato}
                        </span>
                        <button onClick={() => openModal("appuntamento", app)} className="text-blue-600 hover:text-blue-800 p-2" title="Modifica">
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "preventivi" && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Preventivi</h2>
              <button onClick={() => openModal("preventivo")} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
                <Plus className="text-sm" />
                Nuovo Preventivo
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md divide-y">
              {preventivi
                .slice()
                .sort((a, b) => new Date(a.data) - new Date(b.data))
                .map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{p.descrizione}</p>
                      <p className="text-sm text-gray-600">
                        Cliente: {getClienteNome(p.clienteId)} • Data: {new Date(p.data).toLocaleDateString("it-IT")} • Valido fino al{" "}
                        {new Date(p.validita).toLocaleDateString("it-IT")}
                      </p>
                      {p.dettagli && <p className="text-sm text-gray-500">{p.dettagli}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{p.importo.toLocaleString("it-IT")}</p>
                      <div className="flex gap-2 justify-end mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            p.stato === "Approvato" ? "bg-green-100 text-green-800" : p.stato === "Rifiutato" ? "bg-red-100 text-red-800" : p.stato === "Scaduto" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {p.stato}
                        </span>
                        <button onClick={() => openModal("preventivo", p)} className="text-blue-600 hover:text-blue-800 p-2" title="Modifica">
                          ✏️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === "contratti" && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Contratti</h2>
              <button onClick={() => openModal("contratto")} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
                <Plus className="text-sm" />
                Nuovo Contratto
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md divide-y">
              {contratti
                .slice()
                .sort((a, b) => new Date(a.data) - new Date(b.data))
                .map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium">
                        {c.numeroContratto} • {getClienteNome(c.clienteId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Data: {new Date(c.data).toLocaleDateString("it-IT")} • Scadenza: {new Date(c.scadenza).toLocaleDateString("it-IT")}
                      </p>
                      <p className="text-sm text-gray-500">
                        Importo: €{c.importo.toLocaleString("it-IT")} • Acconto: €{c.acconto.toLocaleString("it-IT")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          c.stato === "Firmato" ? "bg-green-100 text-green-800" : c.stato === "In lavorazione" ? "bg-blue-100 text-blue-800" : c.stato === "Completato" ? "bg-purple-100 text-purple-800" : c.stato === "Annullato" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {c.stato}
                      </span>
                      <button onClick={() => generaContrattoPDF(c)} className="text-gray-700 hover:text-black p-2" title="Scarica PDF contratto">
                        <Download />
                      </button>
                      <button onClick={() => openModal("contratto", c)} className="text-blue-600 hover:text-blue-800 p-2" title="Modifica">
                        ✏️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === "fatture" && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Fatture</h2>
              <button onClick={() => openModal("fattura")} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
                <Plus className="text-sm" />
                Nuova Fattura
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md divide-y">
              {fatture
                .slice()
                .sort((a, b) => new Date(a.data) - new Date(b.data))
                .map((f) => (
                  <div key={f.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium">
                        {f.numero} • {getClienteNome(f.clienteId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Data: {new Date(f.data).toLocaleDateString("it-IT")} • Scadenza: {new Date(f.scadenza).toLocaleDateString("it-IT")} • Tipo: {f.tipo} • Contratto: {f.contratto || "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">€{f.importo.toLocaleString("it-IT")}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          f.stato === "Pagata" ? "bg-green-100 text-green-800" : f.stato === "Scaduta" ? "bg-red-100 text-red-800" : f.stato === "Annullata" ? "bg-gray-200 text-gray-700" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {f.stato}
                      </span>
                      <button onClick={() => generaFatturaPDF(f)} className="text-gray-700 hover:text-black p-2" title="Scarica PDF fattura">
                        <Receipt />
                      </button>
                      <button onClick={() => openModal("fattura", f)} className="text-blue-600 hover:text-blue-800 p-2" title="Modifica">
                        ✏️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === "fornitori" && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Fornitori</h2>
              <button
                onClick={() => openModal("fornitore")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus className="text-sm" />
                Nuovo Fornitore
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="divide-y">
                {fornitori.length === 0 ? (
                  <div className="p-4 text-gray-500">Nessun fornitore presente.</div>
                ) : (
                  fornitori.map((fornitore) => (
                    <div key={fornitore.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{fornitore.nome}</h3>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {fornitore.telefono && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="mr-2" />
                              {fornitore.telefono}
                            </div>
                          )}
                          {fornitore.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="mr-2" />
                              {fornitore.email}
                            </div>
                          )}
                          {fornitore.piva && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">🏢</span>
                              P.IVA: {fornitore.piva}
                            </div>
                          )}
                          {fornitore.indirizzo && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="mr-2" />
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fornitore.indirizzo)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600"
                                title="Apri in Google Maps"
                              >
                                {fornitore.indirizzo}
                              </a>
                            </div>
                          )}
                          {fornitore.prodotti && (
                            <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                              <Package className="mr-2" />
                              {fornitore.prodotti}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openModal("fornitore", fornitore)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Modifica"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* MODALS */}
      {showModal && modalType === "cliente" && <ClienteModal />}
      {showModal && modalType === "appuntamento" && <AppuntamentoModal />}
      {showModal && modalType === "preventivo" && <PreventivoModal />}
      {showModal && modalType === "contratto" && <ContrattoModal />}
      {showModal && modalType === "fattura" && <FatturaModal />}
      {showModal && modalType === "fornitore" && <FornitoreModal />}
      {showModal && modalType === "profilo" && <ProfiloAziendaModal />}
    </div>
  );
}

/* ========== UI helper components ========== */
function Modal({ title, children, onClose, onSubmit, extraActions = null }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
              Salva
            </button>
            {extraActions}
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400">
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function Input({ value, onChange, type = "text", placeholder = "", required = false, title, step }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      step={step}
      placeholder={placeholder}
      title={title}
      required={required}
      className="w-full p-2 border rounded-md"
    />
  );
}
function Textarea({ value, onChange, placeholder = "", rows = 2 }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full p-2 border rounded-md" rows={rows} />;
}
function Select({ value, onChange, options = [], required = false, className = "" }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className={`w-full p-2 border rounded-md ${className}`}>
      {options.map(([val, label]) => (
        <option key={`${val}`} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}
function StatCard({ title, value, icon, color }) {
  const colors =
    color === "blue"
      ? "bg-blue-100"
      : color === "green"
      ? "bg-green-100"
      : color === "purple"
      ? "bg-purple-100"
      : color === "orange"
      ? "bg-orange-100"
      : "bg-gray-100";
  const text =
    color === "blue"
      ? "text-blue-800"
      : color === "green"
      ? "text-green-800"
      : color === "purple"
      ? "text-purple-800"
      : color === "orange"
      ? "text-orange-800"
      : "text-gray-800";
  return (
    <div className={`${colors} p-6 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${text}`}>{title}</p>
          <p className={`text-2xl font-bold ${text}`}>{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

// 1. Carica clienti da Firestore all'avvio
useEffect(() => {
  async function fetchClienti() {
    const querySnapshot = await getDocs(collection(db, "clienti"));
    setClienti(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
  fetchClienti();
}, []);
