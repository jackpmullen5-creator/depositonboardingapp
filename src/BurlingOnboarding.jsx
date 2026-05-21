import { useState, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&display=swap');`;

const T = {
  navy: "#0A1E3D", navyLight: "#122D54", navyMid: "#1A3A6B",
  sky: "#4BA3D9", skyLight: "#D6EBF7", skyPale: "#EDF5FB",
  bg: "#F6F8FA", surface: "#FFFFFF", surfaceAlt: "#F0F3F6",
  border: "#DAE0E8", borderLight: "#E8ECF1",
  text: "#0A1E3D", textSecondary: "#4A5568", textMuted: "#8694A7",
  success: "#1B7A4A", successBg: "#E6F4ED",
  warning: "#C4953A", warningBg: "#FBF5E9",
  danger: "#C53030", dangerBg: "#FEE2E2",
  pending: "#5A6577", pendingBg: "#F0F3F6",
  compBg: "#FFF8F0", compBorder: "#F0D9B5", compText: "#8B5E2B",
  hold: "#7C5CBA", holdBg: "#F3F0FA",
  white: "#FFFFFF",
};

const ENTITY_DOCS = {
  "Sole Proprietor": ["SSN or EIN Verification"],
  "Sole Proprietor - DBA": ["Certificate of Assumed Name", "SSN or EIN Verification"],
  "Partnership": ["Partnership Agreement", "Certificate of Limited Partnership", "Verification of Good Standing", "EIN Verification", "Documentation of Ownership in Entity"],
  "LLC - Sole Member": ["Articles of Organization / Certificate of Formation", "Operating Agreement", "Verification of Good Standing", "EIN Verification", "Documentation of Ownership in Entity"],
  "LLC - Multiple Member": ["Articles of Organization / Certificate of Formation", "Operating Agreement", "Verification of Good Standing", "EIN Verification", "Documentation of Ownership in Entity"],
  "Corporation": ["Articles of Incorporation", "Corporation By-Laws", "Verification of Good Standing", "EIN Verification", "Documentation of Ownership in Entity"],
  "Trust": ["Trust Agreement"],
  "IOLTA": ["EIN Verification"],
  "Nonprofit": ["Articles of Incorporation", "EIN Verification", "IRS Determination Letter (501(c)(3))", "Verification of Good Standing"],
};
const ENTITY_TYPES = Object.keys(ENTITY_DOCS);

const USER_ROLES = ["employee", "client", "compliance", "admin"];

const PROCESS_DOCS = [
  { id: "doc-app", name: "Account Application", category: "Account Forms", fileUrl: "/docs/account-application.pdf" },
  { id: "doc-cma", name: "Cash Management Agreement", category: "Account Forms", fileUrl: "/docs/cash-management-agreement.pdf" },
  { id: "doc-pp", name: "Positive Pay Form", category: "Account Forms", fileUrl: "/docs/positive-pay-form.pdf" },
  { id: "doc-sig", name: "Signature Card", category: "Account Forms", fileUrl: null },
  { id: "doc-wp", name: "Compliance Welcome Packet", category: "Compliance", fileUrl: null },
];

const IC = {
  Plus: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Upload: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Lock: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Pen: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  Trash: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Send: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  File: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Mail: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Home: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Pause: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Play: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Arrow: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

const btnBase = { display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, transition: "all 0.15s ease" };
const btnPri = { ...btnBase, background: T.navy, color: T.white, padding: "10px 18px" };
const btnSky = { ...btnBase, background: T.sky, color: T.white, padding: "8px 16px" };
const btnComp = { ...btnBase, background: "#7A4D1E", color: T.white, padding: "10px 18px" };
const btnS = { ...btnBase, background: T.surfaceAlt, color: T.textSecondary, padding: "7px 14px", fontSize: 11 };
const btnDanger = { ...btnBase, background: T.dangerBg, color: T.danger, padding: "7px 14px", fontSize: 11 };
const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: T.white, color: T.text };
const sel = { ...inp, cursor: "pointer" };
const labelSm = { fontSize: 11, fontWeight: 700, color: T.navy, display: "block", marginBottom: 5 };

const ROLE_STYLE = {
  admin: { bg: "#ECE7F8", color: "#5B3FA8" },
  employee: { bg: "#EDF5FB", color: "#2A6FA8" },
  client: { bg: "#E6F4ED", color: "#1B7A4A" },
  compliance: { bg: "#FFF8F0", color: "#8B5E2B" },
};

const RolePill = ({ role }) => {
  const s = ROLE_STYLE[role] || { bg: "#F0F3F6", color: "#5A6577" };
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{role}</span>;
};

const STATUS_MAP = {
  action_needed: { label: "Action Needed", bg: T.warningBg, color: T.warning },
  uploaded: { label: "Uploaded — Pending Review", bg: T.pendingBg, color: T.pending },
  approved: { label: "Approved", bg: T.successBg, color: T.success },
  rejected: { label: "Rejected — Reupload", bg: T.dangerBg, color: T.danger },
  pending_signature: { label: "Pending Signature", bg: T.warningBg, color: T.warning },
  signed: { label: "Signed", bg: T.successBg, color: T.success },
  pending_compliance: { label: "Pending Compliance", bg: T.compBg, color: T.compText },
  compliance_ready: { label: "Compliance Approved", bg: T.successBg, color: T.success },
  no_packet_needed: { label: "No Packet Needed", bg: T.pendingBg, color: T.pending },
  on_hold: { label: "On Hold", bg: T.holdBg, color: T.hold },
  ready_for_action: { label: "Ready for Action", bg: "#E8F5E9", color: "#2E7D32" },
};

const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, bg: T.pendingBg, color: T.pending };
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, letterSpacing: "0.02em" }}>{s.label}</span>;
};

const Card = ({ children, s }) => (
  <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 14, overflow: "hidden", ...s }}>{children}</div>
);

const CH = ({ icon, title, accent, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: accent || T.surfaceAlt, borderBottom: `1px solid ${T.borderLight}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: T.navy }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{title}</span>
    </div>
    {right}
  </div>
);

const Query = ({ label, value, options, onChange, sub }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: T.navy, display: "block", marginBottom: 8 }}>{label}</label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{ ...btnBase, padding: "7px 16px", fontSize: 12, background: value === o ? T.navy : T.surfaceAlt, color: value === o ? T.white : T.textSecondary, border: `1px solid ${value === o ? T.navy : T.border}` }}>{o}</button>
      ))}
    </div>
    {sub && <div style={{ fontSize: 11, color: T.sky, marginTop: 5, fontWeight: 500 }}>{sub}</div>}
  </div>
);

const SigPad = ({ onSign, name }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - rect.left, y: t.clientY - rect.top }; };
  const start = (e) => { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext("2d"); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); hasDrawn.current = true; const ctx = canvasRef.current.getContext("2d"); const p = getPos(e); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = T.navy; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const end = () => { drawing.current = false; };
  const clear = () => { const ctx = canvasRef.current.getContext("2d"); ctx.clearRect(0, 0, 400, 120); hasDrawn.current = false; };
  return (
    <div style={{ background: T.skyPale, borderRadius: 10, padding: 14, border: `1px solid ${T.skyLight}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.navy, marginBottom: 6 }}>Sign: {name}</div>
      <canvas ref={canvasRef} width={400} height={120} style={{ width: "100%", height: 120, background: T.white, borderRadius: 8, border: `1px solid ${T.border}`, cursor: "crosshair", touchAction: "none" }}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={clear} style={btnS}>Clear</button>
        <button onClick={() => { if (hasDrawn.current) onSign(); }} style={btnSky}>Apply Signature</button>
      </div>
    </div>
  );
};

const Toast = ({ msg, visible }) => (
  <div style={{ position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, opacity: visible ? 1 : 0, background: T.navy, color: T.white, padding: "10px 22px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.3s ease", pointerEvents: "none", zIndex: 999, whiteSpace: "nowrap" }}>{msg}</div>
);

// Helper: compute stage for an opp
const getOppStage = (opp) => {
  if (opp.onHold) return "on_hold";
  if (opp.compStatus === "pending_compliance") return "pending_compliance";
  if (!opp.sent && (opp.compStatus === "compliance_ready" || opp.compStatus === "no_packet")) return "ready_for_action";
  if (!opp.sent) return "configuring";
  const allClientApproved = opp.clientDocs.length > 0 && opp.clientDocs.every(d => d.status === "approved") && opp.compClientDocs.every(d => d.status === "approved");
  const allSigned = opp.bankDocs.length > 0 && opp.bankDocs.every(d => d.signed);
  if (allSigned && allClientApproved) return "complete";
  if (allClientApproved) return "signing";
  return "documents";
};

let nextId = 1;

export default function BurlingOnboarding() {
  const [role, setRole] = useState("employee");
  const [screen, setScreen] = useState("home"); // home | new | detail
  const [activeOppId, setActiveOppId] = useState(null);

  // All onboardings
  const [opps, setOpps] = useState([]);

  // New onboarding form (wizard state — not yet in opps array)
  const [nf, setNf] = useState({ client: "", needApp: "", appType: "", entity: "", onlineBanking: "", highCompliance: "" });
  const [extraDocs, setExtraDocs] = useState([]);
  const [extraDocInput, setExtraDocInput] = useState("");
  const [compWelcomePacket, setCompWelcomePacket] = useState(false);
  const [compDocRequests, setCompDocRequests] = useState([]);
  const [compDocInput, setCompDocInput] = useState("");
  const [compExplanation, setCompExplanation] = useState("");

  // Admin state
  const [users, setUsers] = useState([{ id: "u-admin", name: "Account Owner", email: "jackpmullen5@gmail.com", role: "admin", createdAt: new Date().toLocaleDateString() }]);
  const [uf, setUf] = useState({ name: "", email: "", role: "employee" });
  const [docLib, setDocLib] = useState(PROCESS_DOCS);
  const [docForm, setDocForm] = useState({ name: "", category: "Account Forms" });

  const [sigDoc, setSigDoc] = useState(null);
  const [toast, setToast] = useState({ msg: "", visible: false });
  const toastTimer = useRef(null);

  const show = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800);
  }, []);

  // Active opp
  const activeOpp = opps.find(o => o.id === activeOppId) || null;

  // Wizard derived
  const wizCompStatus = nf.highCompliance === "Yes" ? (opps.find(o => o.id === "__wizard__")?.compStatus || "pending_compliance") : "idle";
  const isHighComp = nf.highCompliance === "Yes";
  const entityDocs = nf.entity ? (ENTITY_DOCS[nf.entity] || []) : [];

  // For the wizard, we store a temp comp status
  const [wizComp, setWizComp] = useState("idle"); // idle | pending_compliance | compliance_ready | no_packet
  const compReady = wizComp === "compliance_ready" || wizComp === "no_packet";
  const canSend = nf.client.trim() && (nf.needApp === "No" || (nf.needApp === "Yes" && nf.appType && (nf.appType === "Personal" || nf.entity))) && nf.onlineBanking && nf.highCompliance && (!isHighComp || compReady);

  const isClient = role === "client";
  const isEmployee = role === "employee";
  const isAdmin = role === "admin";
  const isManager = isEmployee || isAdmin;

  // Update an opp in the array
  const updateOpp = (id, fn) => setOpps(prev => prev.map(o => o.id === id ? fn(o) : o));

  // Build & send — creates a new opp and adds it to the array
  const buildAndSend = () => {
    if (!canSend) return;
    let docs = [];
    if (nf.appType === "Business" && nf.entity) {
      docs = entityDocs.map((name, i) => ({ id: `ent-${i}`, name, category: "Entity Documents", status: "action_needed", file: null }));
    }
    docs.push({ id: "kyc-1", name: "Government-Issued Photo ID — Authorized Signer", category: "KYC / Identity", status: "action_needed", file: null });
    extraDocs.forEach((d, i) => docs.push({ id: `cust-${i}`, name: d, category: "Custom Request", status: "action_needed", file: null }));

    const cDocs = compDocRequests.map((d, i) => ({ id: `comp-${i}`, name: d, category: "Compliance Request", status: "action_needed", file: null }));

    let bDocs = [];
    if (nf.needApp === "Yes") bDocs.push({ id: "app-1", name: nf.appType === "Personal" ? "Personal Account Application" : "Business Account Application", signed: false, fileUrl: "/docs/account-application.pdf" });
    bDocs.push({ id: "sig-1", name: "Signature Card", signed: false });
    if (nf.onlineBanking === "Business") { bDocs.push({ id: "cma-1", name: "Cash Management Agreement", signed: false, fileUrl: "/docs/cash-management-agreement.pdf" }); bDocs.push({ id: "pp-1", name: "Positive Pay Form", signed: false, fileUrl: "/docs/positive-pay-form.pdf" }); }
    if (compWelcomePacket) bDocs.push({ id: "wp-1", name: "Compliance Welcome Packet", signed: false });

    const newOpp = {
      id: `opp-${nextId++}`,
      client: nf.client,
      needApp: nf.needApp,
      appType: nf.appType,
      entity: nf.entity,
      onlineBanking: nf.onlineBanking,
      highCompliance: nf.highCompliance,
      compStatus: wizComp,
      compWelcomePacket,
      compDocRequests: [...compDocRequests],
      compExplanation,
      sent: true,
      onHold: false,
      clientDocs: docs,
      bankDocs: bDocs,
      compClientDocs: cDocs,
      emails: [{ type: "sent", subject: `Onboarding initiated for ${nf.client}`, date: new Date().toLocaleDateString() }],
      createdAt: new Date().toLocaleDateString(),
    };

    setOpps(prev => [...prev, newOpp]);
    setActiveOppId(newOpp.id);
    setScreen("detail");
    show(`Onboarding sent to ${nf.client}`);

    // Reset wizard
    setNf({ client: "", needApp: "", appType: "", entity: "", onlineBanking: "", highCompliance: "" });
    setExtraDocs([]); setExtraDocInput("");
    setWizComp("idle"); setCompWelcomePacket(false); setCompDocRequests([]); setCompDocInput(""); setCompExplanation("");
  };

  // Send to EDD queue — preserves config for later sending to client
  const sendToCompliance = () => {
    if (!nf.client.trim() || nf.highCompliance !== "Yes") return;
    const newOpp = {
      id: `opp-${nextId++}`,
      client: nf.client,
      needApp: nf.needApp,
      appType: nf.appType,
      entity: nf.entity,
      onlineBanking: nf.onlineBanking,
      highCompliance: "Yes",
      compStatus: "pending_compliance",
      compWelcomePacket: false,
      compDocRequests: [],
      compExplanation: "",
      sent: false,
      onHold: false,
      clientDocs: [],
      bankDocs: [],
      compClientDocs: [],
      emails: [],
      createdAt: new Date().toLocaleDateString(),
      savedExtraDocs: [...extraDocs],
    };
    setOpps(prev => [...prev, newOpp]);
    setScreen("home");
    show(`${nf.client} sent to Compliance for EDD review`);
    setNf({ client: "", needApp: "", appType: "", entity: "", onlineBanking: "", highCompliance: "" });
    setExtraDocs([]); setExtraDocInput("");
    setWizComp("idle"); setCompWelcomePacket(false); setCompDocRequests([]); setCompDocInput(""); setCompExplanation("");
  };

  // Send onboarding to client — builds doc lists from opp config and marks sent
  const sendToClient = (id) => {
    const opp = opps.find(o => o.id === id);
    if (!opp) return;
    const entDocs = opp.entity ? (ENTITY_DOCS[opp.entity] || []) : [];
    let docs = [];
    if (opp.appType === "Business" && opp.entity) {
      docs = entDocs.map((name, i) => ({ id: `ent-${i}`, name, category: "Entity Documents", status: "action_needed", file: null }));
    }
    docs.push({ id: "kyc-1", name: "Government-Issued Photo ID — Authorized Signer", category: "KYC / Identity", status: "action_needed", file: null });
    if (opp.savedExtraDocs) {
      opp.savedExtraDocs.forEach((d, i) => docs.push({ id: `cust-${i}`, name: d, category: "Custom Request", status: "action_needed", file: null }));
    }
    const cDocs = (opp.compDocRequests || []).map((d, i) => ({ id: `comp-${i}`, name: d, category: "Compliance Request", status: "action_needed", file: null }));
    let bDocs = [];
    if (opp.needApp === "Yes") bDocs.push({ id: "app-1", name: opp.appType === "Personal" ? "Personal Account Application" : "Business Account Application", signed: false, fileUrl: "/docs/account-application.pdf" });
    bDocs.push({ id: "sig-1", name: "Signature Card", signed: false });
    if (opp.onlineBanking === "Business") { bDocs.push({ id: "cma-1", name: "Cash Management Agreement", signed: false, fileUrl: "/docs/cash-management-agreement.pdf" }); bDocs.push({ id: "pp-1", name: "Positive Pay Form", signed: false, fileUrl: "/docs/positive-pay-form.pdf" }); }
    if (opp.compWelcomePacket) bDocs.push({ id: "wp-1", name: "Compliance Welcome Packet", signed: false });
    updateOpp(id, o => ({
      ...o,
      sent: true,
      clientDocs: docs,
      compClientDocs: cDocs,
      bankDocs: bDocs,
      emails: [{ type: "sent", subject: `Onboarding initiated for ${opp.client}`, date: new Date().toLocaleDateString() }],
    }));
    show(`Onboarding email sent to ${opp.client}`);
  };

  // Doc actions on active opp
  const uploadDoc = (field, id) => updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => d.id === id ? { ...d, status: "uploaded", file: "document.pdf" } : d) }));
  const approveDoc = (field, id) => updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => d.id === id ? { ...d, status: "approved" } : d) }));
  const rejectDoc = (field, id) => updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => d.id === id ? { ...d, status: "rejected", file: null } : d) }));
  const signBankDoc = (id) => { updateOpp(activeOppId, o => ({ ...o, bankDocs: o.bankDocs.map(d => d.id === id ? { ...d, signed: true } : d) })); setSigDoc(null); show("Signature applied"); };

  const toggleHold = (id) => {
    const opp = opps.find(o => o.id === id);
    updateOpp(id, o => ({ ...o, onHold: !o.onHold }));
    show(opp.onHold ? `${opp.client} resumed` : `${opp.client} placed on hold`);
  };

  // Admin: user + document management
  const addUser = () => {
    if (!uf.name.trim() || !uf.email.trim()) return;
    setUsers(prev => [...prev, { id: `u-${Date.now()}`, name: uf.name.trim(), email: uf.email.trim(), role: uf.role, createdAt: new Date().toLocaleDateString() }]);
    show(`User ${uf.name.trim()} created`);
    setUf({ name: "", email: "", role: "employee" });
  };
  const removeUser = (id) => setUsers(prev => prev.filter(u => u.id !== id));
  const addDoc = () => {
    if (!docForm.name.trim()) return;
    setDocLib(prev => [...prev, { id: `d-${Date.now()}`, name: docForm.name.trim(), category: docForm.category, fileUrl: null }]);
    show(`Document "${docForm.name.trim()}" added to library`);
    setDocForm({ name: "", category: "Account Forms" });
  };

  // Filtered lists for home screen
  const currentlyOnboarding = opps.filter(o => {
    const stage = getOppStage(o);
    return !o.onHold && (stage === "documents" || stage === "signing" || stage === "ready_for_action");
  });
  const pendingEDD = opps.filter(o => o.compStatus === "pending_compliance" && !o.onHold);
  const onHold = opps.filter(o => o.onHold);

  // Detail view derived
  const detailStage = activeOpp ? getOppStage(activeOpp) : "none";
  const allDocsApproved = activeOpp ? (activeOpp.clientDocs.length > 0 && activeOpp.clientDocs.every(d => d.status === "approved") && activeOpp.compClientDocs.every(d => d.status === "approved")) : false;
  const allSigned = activeOpp ? (activeOpp.bankDocs.length > 0 && activeOpp.bankDocs.every(d => d.signed)) : false;
  const postSendStage = !activeOpp?.sent ? "none" : !allDocsApproved ? "documents" : !allSigned ? "signing" : "complete";

  // Wizard stepper
  const stepLabels = isHighComp ? ["Configure", "Compliance Review", "Send"] : ["Configure", "Send"];
  const currentStep = !isHighComp ? (canSend ? 1 : 0) : compReady ? 2 : wizComp === "pending_compliance" ? 1 : 0;

  const showHome = role === "employee" && screen === "home";
  const showNew = role === "employee" && screen === "new";
  const showDetail = screen === "detail" && activeOpp;
  const showClientEmpty = role === "client" && !activeOpp;
  const showClientSelect = role === "client" && screen !== "detail";
  const showCompliance = role === "compliance";

  const openOpp = (id) => { setActiveOppId(id); setScreen("detail"); };
  const goHome = () => { setScreen("home"); setActiveOppId(null); setSigDoc(null); };

  // Report table row
  const OppRow = ({ opp, onClick }) => {
    const stage = getOppStage(opp);
    const docsTotal = opp.clientDocs.length + opp.compClientDocs.length;
    const docsApproved = opp.clientDocs.filter(d => d.status === "approved").length + opp.compClientDocs.filter(d => d.status === "approved").length;
    return (
      <div onClick={onClick} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{opp.client}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>{opp.entity || opp.appType || "—"} · {opp.createdAt}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {docsTotal > 0 && <span style={{ fontSize: 10, color: T.textMuted }}>{docsApproved}/{docsTotal} docs</span>}
          <Badge status={stage === "on_hold" ? "on_hold" : stage === "pending_compliance" ? "pending_compliance" : stage === "ready_for_action" ? "ready_for_action" : stage === "signing" ? "pending_signature" : stage === "complete" ? "approved" : "action_needed"} />
          <span style={{ color: T.textMuted }}>{IC.Arrow()}</span>
        </div>
      </div>
    );
  };

  const EmptyReport = ({ msg }) => (
    <div style={{ padding: "20px 20px", textAlign: "center" }}>
      <p style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>{msg}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; }
        .doc-row:hover { background: ${T.surfaceAlt} !important; }
        input:focus, select:focus, textarea:focus { border-color: ${T.sky} !important; outline: none; }
        textarea { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, padding: "0 20px", borderBottom: `2px solid ${T.sky}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={goHome}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${T.sky}, #7CC4E8)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.navy }}>B</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.white, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>Burling Bank</div>
              <div style={{ fontSize: 9, color: T.skyLight, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Client Onboarding</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {["employee", "client", "compliance"].map(r => (
              <button key={r} onClick={() => { setRole(r); setScreen("home"); setActiveOppId(null); setSigDoc(null); }}
                style={{ ...btnBase, padding: "5px 12px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", background: role === r ? "rgba(75,163,217,0.2)" : "transparent", color: role === r ? T.skyLight : "rgba(255,255,255,0.5)", border: `1px solid ${role === r ? "rgba(75,163,217,0.3)" : "transparent"}` }}>
                {r}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", margin: "0 6px" }} />
            <button onClick={() => { setRole("admin"); setScreen("home"); setActiveOppId(null); setSigDoc(null); }}
              style={{ ...btnBase, padding: "5px 12px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", gap: 5, background: isAdmin ? "rgba(123,92,186,0.4)" : "rgba(255,255,255,0.08)", color: isAdmin ? "#DDD0F2" : "rgba(255,255,255,0.6)", border: `1px solid ${isAdmin ? "rgba(150,120,210,0.55)" : "rgba(255,255,255,0.12)"}` }}>
              {IC.Lock(11)} Admin
            </button>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "22px 20px 80px" }}>

        {/* ======== EMPLOYEE HOME ======== */}
        {showHome && isEmployee && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, borderRadius: 14, padding: "24px 28px", marginBottom: 20, color: T.white }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginBottom: 4 }}>Employee Portal</div>
              <h1 style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Deposit Onboarding</h1>
              <p style={{ fontSize: 12, opacity: 0.7 }}>Configure and send new client onboardings.</p>
            </div>

            <button onClick={() => setScreen("new")} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 14, marginBottom: 20 }}>{IC.Plus(16)} New Onboarding</button>

            {/* Currently Onboarding */}
            <Card>
              <CH icon={IC.File()} title="Currently Onboarding" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{currentlyOnboarding.length}</span>} />
              {currentlyOnboarding.length === 0 ? <EmptyReport msg="No active onboardings" /> : currentlyOnboarding.map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
            </Card>

            {/* Pending Compliance EDD */}
            <Card s={{ borderColor: T.compBorder }}>
              <CH icon={IC.Lock()} title="Pending Compliance EDD Requests" accent={T.compBg} right={<span style={{ fontSize: 10, color: T.compText, fontWeight: 600 }}>{pendingEDD.length}</span>} />
              {pendingEDD.length === 0 ? <EmptyReport msg="No pending EDD requests" /> : pendingEDD.map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
            </Card>

            {/* On Hold */}
            <Card s={{ borderColor: T.hold + "40" }}>
              <CH icon={IC.Pause()} title="On Hold Onboardings" accent={T.holdBg} right={<span style={{ fontSize: 10, color: T.hold, fontWeight: 600 }}>{onHold.length}</span>} />
              {onHold.length === 0 ? <EmptyReport msg="No onboardings on hold" /> : onHold.map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
            </Card>
          </div>
        )}

        {/* ======== EMPLOYEE NEW ONBOARDING ======== */}
        {showNew && (
          <div>
            <button onClick={goHome} style={{ ...btnS, marginBottom: 14 }}>{IC.Home()} Back</button>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20, padding: "0 4px" }}>
              {stepLabels.map((label, i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: i <= currentStep ? T.navy : T.surfaceAlt, color: i <= currentStep ? T.white : T.textMuted, border: `2px solid ${i <= currentStep ? T.navy : T.border}` }}>{i + 1}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: i <= currentStep ? T.navy : T.textMuted, whiteSpace: "nowrap" }}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStep ? T.navy : T.border, margin: "0 10px", minWidth: 20 }} />}
                </div>
              ))}
            </div>
            <Card>
              <CH icon={IC.File()} title="Configure Onboarding" />
              <div style={{ padding: "18px 20px" }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.navy, display: "block", marginBottom: 6 }}>Client Name</label>
                  <input value={nf.client} onChange={e => setNf(p => ({ ...p, client: e.target.value }))} style={{ ...inp, maxWidth: 300 }} placeholder="e.g. Acme Corp" />
                </div>
                <Query label="Need Account Application?" value={nf.needApp} options={["Yes", "No"]} onChange={v => setNf(p => ({ ...p, needApp: v, appType: "", entity: "" }))} />
                {nf.needApp === "Yes" && <Query label="Personal or Business?" value={nf.appType} options={["Personal", "Business"]} onChange={v => setNf(p => ({ ...p, appType: v, entity: "" }))} />}
                {nf.appType === "Business" && (
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: T.navy, display: "block", marginBottom: 6 }}>Entity Structure</label>
                    <select value={nf.entity} onChange={e => setNf(p => ({ ...p, entity: e.target.value }))} style={{ ...sel, maxWidth: 300 }}>
                      <option value="">Select entity type...</option>
                      {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    {nf.entity && (
                      <div style={{ marginTop: 10, background: T.skyPale, borderRadius: 8, padding: "10px 14px", border: `1px solid ${T.skyLight}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.navy, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Required docs for {nf.entity}:</div>
                        {entityDocs.map((d, i) => <div key={i} style={{ fontSize: 12, color: T.textSecondary, padding: "2px 0" }}><span style={{ color: T.sky }}>•</span> {d}</div>)}
                      </div>
                    )}
                  </div>
                )}
                <Query label="Online Banking" value={nf.onlineBanking} options={["Business", "Retail"]} onChange={v => setNf(p => ({ ...p, onlineBanking: v }))} sub={nf.onlineBanking === "Business" ? "→ Cash Management Agreement + Positive Pay Form will be included for signing" : null} />
                <Query label="High Compliance?" value={nf.highCompliance} options={["Yes", "No"]} onChange={v => { setNf(p => ({ ...p, highCompliance: v })); if (v === "Yes") { setWizComp("pending_compliance"); } else { setWizComp("idle"); setCompWelcomePacket(false); setCompDocRequests([]); } }} />
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.navy, display: "block", marginBottom: 6 }}>Additional Document Requests (Optional)</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input value={extraDocInput} onChange={e => setExtraDocInput(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="e.g. Board Resolution" onKeyDown={e => { if (e.key === "Enter" && extraDocInput.trim()) { setExtraDocs(p => [...p, extraDocInput.trim()]); setExtraDocInput(""); } }} />
                    <button onClick={() => { if (extraDocInput.trim()) { setExtraDocs(p => [...p, extraDocInput.trim()]); setExtraDocInput(""); } }} style={btnS}>{IC.Plus()} Add</button>
                  </div>
                  {extraDocs.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                      <span style={{ fontSize: 12, color: T.textSecondary }}>• {d}</span>
                      <button onClick={() => setExtraDocs(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}>{IC.Trash()}</button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            {isHighComp && (
              <Card s={{ borderColor: T.compBorder }}>
                <CH icon={IC.Lock()} title="Compliance Review Gate" accent={T.compBg} right={<Badge status={compReady ? "compliance_ready" : "action_needed"} />} />
                <div style={{ padding: "16px 20px" }}>
                  {wizComp === "pending_compliance" && <p style={{ fontSize: 12, color: T.compText }}>This onboarding is flagged high compliance. Send it to the <strong>EDD queue</strong> below to begin Compliance review before it can go to the client.</p>}
                  {wizComp === "compliance_ready" && <p style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>✓ Compliance approved. Welcome Packet uploaded{compDocRequests.length > 0 ? ` with ${compDocRequests.length} additional doc request${compDocRequests.length > 1 ? "s" : ""}` : ""}.</p>}
                  {wizComp === "no_packet" && <p style={{ fontSize: 12, color: T.textSecondary }}>Compliance: No packet needed. Reason: "{compExplanation}"</p>}
                </div>
              </Card>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {isHighComp && wizComp === "pending_compliance" && (
                <button onClick={sendToCompliance} disabled={!nf.client.trim()} style={{ ...btnComp, flex: 1, justifyContent: "center", padding: "14px", fontSize: 13, opacity: nf.client.trim() ? 1 : 0.4 }}>{IC.Lock(16)} Send to EDD Queue</button>
              )}
              <button onClick={buildAndSend} disabled={!canSend} style={{ ...btnPri, flex: 1, justifyContent: "center", padding: "14px", fontSize: 13, opacity: canSend ? 1 : 0.4, cursor: canSend ? "pointer" : "default", background: canSend ? T.navy : T.textMuted }}>{IC.Send(16)} Send Onboarding{nf.client ? ` to ${nf.client}` : ""}</button>
            </div>
          </div>
        )}

        {/* ======== DETAIL VIEW ======== */}
        {showDetail && (role === "employee" || role === "client" || role === "admin") && (
          <div>
            {isManager && <button onClick={goHome} style={{ ...btnS, marginBottom: 14 }}>{IC.Home()} Back to Dashboard</button>}
            <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, borderRadius: 14, padding: "20px 24px", marginBottom: 16, color: T.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginBottom: 2 }}>{isClient ? "Client Portal" : isAdmin ? "Admin View" : "Employee View"}</div>
                  <h1 style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", marginBottom: 2 }}>{activeOpp.client}</h1>
                  <p style={{ fontSize: 11, opacity: 0.7 }}>{activeOpp.onHold ? "On Hold" : !activeOpp.sent && (activeOpp.compStatus === "compliance_ready" || activeOpp.compStatus === "no_packet") ? "Ready for Action — Send to Client" : !activeOpp.sent ? "Pending Compliance Review" : postSendStage === "documents" ? "Document collection in progress" : postSendStage === "signing" ? "Ready for signatures" : postSendStage === "complete" ? "Onboarding complete" : "Pending"}</p>
                </div>
                {isManager && activeOpp.sent && postSendStage !== "complete" && (
                  <button onClick={() => toggleHold(activeOpp.id)} style={{ ...btnBase, padding: "6px 14px", fontSize: 10, background: activeOpp.onHold ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)", color: T.white, border: "1px solid rgba(255,255,255,0.2)" }}>
                    {activeOpp.onHold ? <>{IC.Play(12)} Resume</> : <>{IC.Pause(12)} Hold</>}
                  </button>
                )}
              </div>
            </div>

            {activeOpp.onHold && (
              <Card s={{ borderColor: T.hold + "40" }}>
                <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, background: T.holdBg }}>
                  {IC.Pause(16)}
                  <div><span style={{ fontSize: 12, fontWeight: 600, color: T.hold }}>This onboarding is on hold.</span><br /><span style={{ fontSize: 11, color: T.textSecondary }}>Click Resume above to reactivate.</span></div>
                </div>
              </Card>
            )}

            {!activeOpp.sent && activeOpp.compStatus === "pending_compliance" && (
              <Card s={{ borderColor: T.compBorder }}>
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <Badge status="pending_compliance" />
                  <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 8 }}>Awaiting Compliance EDD review before onboarding can be sent to client.</p>
                </div>
              </Card>
            )}

            {!activeOpp.sent && (activeOpp.compStatus === "compliance_ready" || activeOpp.compStatus === "no_packet") && (
              <Card s={{ borderColor: "#B8D4A8" }}>
                <CH icon={IC.Check()} title="Ready for Action" accent="#E8F5E9" />
                <div style={{ padding: "18px 20px" }}>
                  <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Compliance review is complete for <strong>{activeOpp.client}</strong>.</p>
                  {activeOpp.compStatus === "compliance_ready" && activeOpp.compWelcomePacket && (
                    <p style={{ fontSize: 11, color: T.success, marginBottom: 4 }}>✓ Welcome Packet uploaded</p>
                  )}
                  {activeOpp.compDocRequests.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 11, color: T.compText, fontWeight: 600, marginBottom: 4 }}>Compliance document requests ({activeOpp.compDocRequests.length}):</p>
                      {activeOpp.compDocRequests.map((d, i) => <div key={i} style={{ fontSize: 11, color: T.textSecondary, padding: "1px 0" }}>• {d}</div>)}
                    </div>
                  )}
                  {activeOpp.compStatus === "no_packet" && (
                    <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>No packet needed. Reason: "{activeOpp.compExplanation}"</p>
                  )}
                  <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 14 }}>Send the onboarding email to the client to begin document collection.</p>
                  <button onClick={() => sendToClient(activeOpp.id)} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "14px", fontSize: 14 }}>{IC.Send(16)} Send Onboarding to {activeOpp.client}</button>
                </div>
              </Card>
            )}

            {activeOpp.sent && (
              <>
                <Card>
                  <div style={{ padding: "14px 20px", display: "flex", gap: 8 }}>
                    {["Documents", "Signatures", "Complete"].map((label, i) => {
                      const stageIdx = postSendStage === "documents" ? 0 : postSendStage === "signing" ? 1 : 2;
                      return (<div key={label} style={{ flex: 1, textAlign: "center" }}><div style={{ height: 4, borderRadius: 2, background: i <= stageIdx ? T.sky : T.surfaceAlt, marginBottom: 6 }} /><span style={{ fontSize: 10, fontWeight: 600, color: i <= stageIdx ? T.navy : T.textMuted }}>{label}</span></div>);
                    })}
                  </div>
                </Card>
                {activeOpp.clientDocs.length > 0 && (
                  <Card>
                    <CH icon={IC.File()} title="Account Requests" accent={T.skyPale} right={<span style={{ fontSize: 10, color: T.textMuted }}>{activeOpp.clientDocs.filter(d => d.status === "approved").length}/{activeOpp.clientDocs.length} approved</span>} />
                    {activeOpp.clientDocs.map(doc => (
                      <div key={doc.id} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                          <span style={{ color: T.textMuted }}>{IC.File()}</span>
                          <div><div style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</div><div style={{ fontSize: 10, color: T.textMuted }}>{doc.category}</div></div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <Badge status={doc.status} />
                          {isClient && (doc.status === "action_needed" || doc.status === "rejected") && <button onClick={() => { uploadDoc("clientDocs", doc.id); show("Document uploaded"); }} style={btnSky}>{IC.Upload(12)} Upload</button>}
                          {isManager && doc.status === "uploaded" && (<><button onClick={() => { approveDoc("clientDocs", doc.id); show("Document approved"); }} style={{ ...btnS, color: T.success, background: T.successBg }}>{IC.Check(12)} Approve</button><button onClick={() => { rejectDoc("clientDocs", doc.id); show("Document rejected"); }} style={btnDanger}>{IC.X(12)} Reject</button></>)}
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
                {activeOpp.compClientDocs.length > 0 && (
                  <Card s={{ borderColor: T.compBorder }}>
                    <CH icon={IC.Lock()} title="Compliance Requests" accent={T.compBg} right={<span style={{ fontSize: 10, color: T.compText }}>{activeOpp.compClientDocs.filter(d => d.status === "approved").length}/{activeOpp.compClientDocs.length} approved</span>} />
                    {isClient && <div style={{ padding: "10px 20px", background: T.compBg, borderBottom: `1px solid ${T.compBorder}` }}><p style={{ fontSize: 11, color: T.compText }}>These documents have been requested by our compliance team as part of enhanced due diligence.</p></div>}
                    {activeOpp.compClientDocs.map(doc => (
                      <div key={doc.id} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                          <span style={{ color: T.textMuted }}>{IC.File()}</span>
                          <div><div style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</div><div style={{ fontSize: 10, color: T.textMuted }}>{doc.category}</div></div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <Badge status={doc.status} />
                          {isClient && (doc.status === "action_needed" || doc.status === "rejected") && <button onClick={() => { uploadDoc("compClientDocs", doc.id); show("Document uploaded"); }} style={btnSky}>{IC.Upload(12)} Upload</button>}
                          {isManager && doc.status === "uploaded" && (<><button onClick={() => { approveDoc("compClientDocs", doc.id); show("Document approved"); }} style={{ ...btnS, color: T.success, background: T.successBg }}>{IC.Check(12)} Approve</button><button onClick={() => { rejectDoc("compClientDocs", doc.id); show("Document rejected"); }} style={btnDanger}>{IC.X(12)} Reject</button></>)}
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
                {activeOpp.bankDocs.length > 0 && (
                  <Card>
                    <CH icon={IC.Pen()} title="Documents to Review &amp; Sign" accent={T.skyPale} right={<span style={{ fontSize: 10, color: T.textMuted }}>{activeOpp.bankDocs.filter(d => d.signed).length}/{activeOpp.bankDocs.length} signed</span>} />
                    {activeOpp.bankDocs.map(doc => (
                      <div key={doc.id}>
                        <div className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: T.textMuted }}>{IC.File()}</span><span style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Badge status={doc.signed ? "signed" : "pending_signature"} />
                            {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnS, textDecoration: "none", padding: "5px 13px", fontSize: 11 }}>{IC.File(12)} View</a>}
                            {isClient && !doc.signed && <button onClick={() => setSigDoc(sigDoc === doc.id ? null : doc.id)} style={{ ...btnSky, padding: "5px 13px", fontSize: 11 }}>{IC.Pen(12)} Sign</button>}
                          </div>
                        </div>
                        {sigDoc === doc.id && isClient && <div style={{ padding: "10px 20px" }}><SigPad onSign={() => signBankDoc(doc.id)} name={doc.name} /></div>}
                      </div>
                    ))}
                  </Card>
                )}
                {postSendStage === "complete" && (
                  <div style={{ background: `linear-gradient(135deg, ${T.success} 0%, #145A34 100%)`, borderRadius: 12, padding: 28, textAlign: "center", color: T.white, marginBottom: 16 }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>✓</div>
                    <h2 style={{ fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 4 }}>Onboarding Complete</h2>
                    <p style={{ fontSize: 12, opacity: 0.85 }}>All documents submitted, approved, and signed.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======== CLIENT SELECT / EMPTY ======== */}
        {role === "client" && screen !== "detail" && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, borderRadius: 14, padding: "24px 28px", marginBottom: 20, color: T.white }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginBottom: 4 }}>Client Portal</div>
              <h1 style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Your Onboardings</h1>
            </div>
            {opps.filter(o => o.sent).length === 0 ? (
              <Card><div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 8 }}>📬</div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 4 }}>No Active Onboarding</h3><p style={{ fontSize: 13, color: T.textSecondary }}>You'll receive an email when your onboarding is ready.</p></div></Card>
            ) : (
              <Card>
                {opps.filter(o => o.sent).map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
              </Card>
            )}
          </div>
        )}

        {/* ======== COMPLIANCE PORTAL ======== */}
        {showCompliance && screen !== "detail" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #3D2008 0%, #7A4D1E 100%)", borderRadius: 14, padding: "20px 24px", marginBottom: 18, color: T.white }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: 2 }}>Compliance Portal</div>
              <h1 style={{ fontSize: 18, fontFamily: "'Playfair Display', serif" }}>High Compliance Review</h1>
              <p style={{ fontSize: 11, opacity: 0.7 }}>Review flagged onboardings. Upload Welcome Packets and additional document requests.</p>
            </div>
            {pendingEDD.length === 0 ? (
              <Card><div style={{ padding: 32, textAlign: "center" }}><div style={{ fontSize: 28, marginBottom: 6 }}>📋</div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>No Pending Requests</h3><p style={{ fontSize: 12, color: T.textMuted }}>You'll be notified when a high compliance review is needed.</p></div></Card>
            ) : (
              pendingEDD.map(opp => (
                <Card key={opp.id} s={{ borderColor: T.compBorder }}>
                  <CH icon={IC.Lock()} title={`Review: ${opp.client}`} accent={T.compBg} right={<Badge status="pending_compliance" />} />
                  <div style={{ padding: "18px 20px" }}>
                    <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 16 }}>An employee has flagged <strong>{opp.client}</strong> as high compliance. Choose an option below:</p>
                    <div style={{ background: T.compBg, border: `1px solid ${T.compBorder}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.compText, marginBottom: 10 }}>Option A: Upload Welcome Packet</div>
                      <button onClick={() => { updateOpp(opp.id, o => ({ ...o, compWelcomePacket: true })); show("Welcome Packet uploaded"); }} style={{ ...btnComp, marginBottom: 12, opacity: opp.compWelcomePacket ? 0.5 : 1 }} disabled={opp.compWelcomePacket}>
                        {opp.compWelcomePacket ? <>{IC.Check(14)} Packet Uploaded</> : <>{IC.Upload(14)} Upload Welcome Packet</>}
                      </button>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: T.compText, display: "block", marginBottom: 5 }}>Additional Document Requests for Client</label>
                        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <input value={compDocInput} onChange={e => setCompDocInput(e.target.value)} style={inp} placeholder="e.g. Source of Funds Documentation" onKeyDown={e => { if (e.key === "Enter" && compDocInput.trim()) { updateOpp(opp.id, o => ({ ...o, compDocRequests: [...o.compDocRequests, compDocInput.trim()] })); setCompDocInput(""); } }} />
                          <button onClick={() => { if (compDocInput.trim()) { updateOpp(opp.id, o => ({ ...o, compDocRequests: [...o.compDocRequests, compDocInput.trim()] })); setCompDocInput(""); } }} style={btnS}>{IC.Plus()} Add</button>
                        </div>
                        {opp.compDocRequests.map((d, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                            <span style={{ fontSize: 12 }}>• {d}</span>
                            <button onClick={() => updateOpp(opp.id, o => ({ ...o, compDocRequests: o.compDocRequests.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}>{IC.Trash()}</button>
                          </div>
                        ))}
                        {opp.compDocRequests.length === 0 && <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>No additional requests yet.</div>}
                      </div>
                      <button onClick={() => { if (opp.compWelcomePacket) { updateOpp(opp.id, o => ({ ...o, compStatus: "compliance_ready" })); show(`Compliance approved for ${opp.client}`); } }} disabled={!opp.compWelcomePacket} style={{ ...btnComp, opacity: opp.compWelcomePacket ? 1 : 0.4 }}>{IC.Check(14)} Submit & Approve</button>
                    </div>
                    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 10 }}>Option B: No Welcome Packet Needed</div>
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>Explanation (required)</label>
                        <textarea value={compExplanation} onChange={e => setCompExplanation(e.target.value)} style={{ ...inp, minHeight: 60, resize: "vertical" }} placeholder="Explain why no Welcome Packet is needed..." />
                      </div>
                      <button onClick={() => { if (compExplanation.trim()) { updateOpp(opp.id, o => ({ ...o, compStatus: "no_packet", compExplanation: compExplanation })); setCompExplanation(""); show(`No packet needed for ${opp.client}`); } }} disabled={!compExplanation.trim()} style={{ ...btnS, opacity: compExplanation.trim() ? 1 : 0.4 }}>No Packet Needed</button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* ======== ADMIN CONSOLE ======== */}
        {role === "admin" && screen !== "detail" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #1B1438 0%, #3E2D78 100%)", borderRadius: 14, padding: "20px 24px", marginBottom: 18, color: T.white }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: 2 }}>Admin Console</div>
              <h1 style={{ fontSize: 18, fontFamily: "'Playfair Display', serif" }}>Onboarding Administration</h1>
              <p style={{ fontSize: 11, opacity: 0.7 }}>Manage users, process documents, and oversee every onboarding across all portals.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Total Onboardings", value: opps.length, color: T.navy },
                { label: "In Progress", value: currentlyOnboarding.length, color: T.sky },
                { label: "Pending Compliance", value: pendingEDD.length, color: T.compText },
                { label: "On Hold", value: onHold.length, color: T.hold },
                { label: "Completed", value: opps.filter(o => getOppStage(o) === "complete").length, color: T.success },
                { label: "Users", value: users.length, color: "#5B3FA8" },
              ].map(st => (
                <div key={st.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: st.color, fontFamily: "'Playfair Display', serif" }}>{st.value}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{st.label}</div>
                </div>
              ))}
            </div>

            {/* User Management */}
            <Card>
              <CH icon={IC.Plus()} title="User Management" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{users.length}</span>} />
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 160px" }}>
                    <label style={labelSm}>Name</label>
                    <input value={uf.name} onChange={e => setUf(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="Full name" />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={labelSm}>Email</label>
                    <input value={uf.email} onChange={e => setUf(p => ({ ...p, email: e.target.value }))} style={inp} placeholder="name@example.com" />
                  </div>
                  <div style={{ flex: "0 1 150px" }}>
                    <label style={labelSm}>Role</label>
                    <select value={uf.role} onChange={e => setUf(p => ({ ...p, role: e.target.value }))} style={sel}>
                      {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={addUser} disabled={!uf.name.trim() || !uf.email.trim()} style={{ ...btnPri, padding: "9px 16px", opacity: uf.name.trim() && uf.email.trim() ? 1 : 0.4 }}>{IC.Plus()} Create User</button>
                </div>
              </div>
              {users.map(u => (
                <div key={u.id} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{u.email} · since {u.createdAt}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <RolePill role={u.role} />
                    {u.role !== "admin" && <button onClick={() => removeUser(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}>{IC.Trash()}</button>}
                  </div>
                </div>
              ))}
            </Card>

            {/* Document Library */}
            <Card>
              <CH icon={IC.File()} title="Document Library" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{docLib.length}</span>} />
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                <p style={{ fontSize: 11, color: T.textSecondary, marginBottom: 10 }}>Documents pushed to clients during onboarding. Replace placeholders with official forms when ready.</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={labelSm}>Document Name</label>
                    <input value={docForm.name} onChange={e => setDocForm(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="e.g. Beneficial Ownership Form" />
                  </div>
                  <div style={{ flex: "0 1 170px" }}>
                    <label style={labelSm}>Category</label>
                    <select value={docForm.category} onChange={e => setDocForm(p => ({ ...p, category: e.target.value }))} style={sel}>
                      {["Account Forms", "Compliance", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={addDoc} disabled={!docForm.name.trim()} style={{ ...btnPri, padding: "9px 16px", opacity: docForm.name.trim() ? 1 : 0.4 }}>{IC.Plus()} Add Document</button>
                </div>
              </div>
              {docLib.map(d => (
                <div key={d.id} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: T.textMuted }}>{IC.File()}</span>
                    <div><div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 10, color: T.textMuted }}>{d.category}</div></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnS, textDecoration: "none" }}>{IC.File(12)} View</a> : <span style={{ fontSize: 10, color: T.textMuted, fontStyle: "italic" }}>No file yet</span>}
                  </div>
                </div>
              ))}
            </Card>

            {/* All Onboardings */}
            <Card>
              <CH icon={IC.Home()} title="All Onboardings" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{opps.length}</span>} />
              {opps.length === 0 ? <EmptyReport msg="No onboardings yet" /> : opps.map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
            </Card>
          </div>
        )}

      </main>
      <Toast {...toast} />
    </div>
  );
}
