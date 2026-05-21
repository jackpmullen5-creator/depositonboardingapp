import { useState, useRef, useCallback, useEffect } from "react";

// Lightweight client-side persistence (placeholder until a real backend is wired up)
const STORE_PREFIX = "bbob_v1_";
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota/availability errors */
  }
};
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const SEED_ADMIN = { id: "u-admin", name: "Jack Mullen", email: "jackpmullen5@gmail.com", role: "admin", username: "admin", password: "admin", activated: true, createdAt: new Date().toLocaleDateString() };

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
const ROLE_LABEL = { admin: "Admin", employee: "Client Services", client: "Client", compliance: "Compliance" };

const RolePill = ({ role }) => {
  const s = ROLE_STYLE[role] || { bg: "#F0F3F6", color: "#5A6577" };
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{ROLE_LABEL[role] || role}</span>;
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
  awaiting_client: { label: "Awaiting Client", bg: T.pendingBg, color: T.pending },
  awaiting_upload: { label: "Awaiting Upload", bg: T.pendingBg, color: T.pending },
  review_needed: { label: "Action Needed", bg: T.warningBg, color: T.warning },
  resume_requested: { label: "Resume Requested", bg: T.warningBg, color: T.warning },
  cancelled: { label: "Cancelled", bg: T.dangerBg, color: T.danger },
  closed: { label: "Closed", bg: T.successBg, color: T.success },
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

const Toast = ({ msg, visible }) => (
  <div style={{ position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, opacity: visible ? 1 : 0, background: T.navy, color: T.white, padding: "10px 22px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.3s ease", pointerEvents: "none", zIndex: 999, whiteSpace: "nowrap" }}>{msg}</div>
);

// Helper: every document across the initial collection (uploads + forms + welcome packet)
const initialDocsOf = (opp) => [...opp.clientDocs, ...opp.compClientDocs, ...opp.bankDocs, ...(opp.welcomePacketDocs || [])];
const allApproved = (arr) => arr.length > 0 && arr.every(d => d.status === "approved");
const bucketsFull = (arr) => arr.length > 0 && arr.every(d => d.status === "uploaded" || d.status === "approved");

const PHASE_LABEL = {
  documents: "Document collection in progress",
  pre_sig_card: "Documents approved — prepare & send signature card",
  signature_card: "Awaiting signed signature card",
  create_bolb: "Create BOLB before opening the account",
  open_account: "Ready to open account",
  risk_matrix: "Internal — risk rating matrix review",
  create_cip: "Internal — create and save CIP",
  review_cip: "Internal — compliance CIP review",
  assign_household: "Internal — assign household code",
  collect_fee: "Internal — collect onboarding fee",
  complete: "Onboarding closed",
  cancelled: "Cancelled",
};

// Whether the pre-signature-card checklist is satisfied (ACH memo only matters for Business banking)
const achSatisfied = (opp) => opp.onlineBanking !== "Business" || opp.achMemoCreated || opp.achMemoNotNeeded;
const preSigReady = (opp) => achSatisfied(opp) && opp.mgmtApproved && bucketsFull(opp.sigCardPrepDocs || []);

// Post-send phase progression (ignores hold). Returns the current step key.
const computePhase = (opp) => {
  if (!allApproved(initialDocsOf(opp))) return "documents";
  if (!opp.sigCardSent) return "pre_sig_card";
  if (!allApproved(opp.sigCardDocs || [])) return "signature_card";
  if (opp.onlineBanking === "Business" && !opp.bolbCreated) return "create_bolb";
  if (!opp.accountOpened) return "open_account";
  // internal-only stages, after the account-opened email
  if (!allApproved(opp.riskMatrixDocs || [])) return "risk_matrix";
  if (!opp.cipCreated) return "create_cip";
  if (!opp.cipReviewed) return "review_cip";
  if (opp.highCompliance === "Yes" && !opp.householdCodeAssigned) return "assign_household";
  if (opp.highCompliance === "Yes" && !opp.onboardingFeeCollected) return "collect_fee";
  return "complete";
};

// Helper: compute stage for an opp
const getOppStage = (opp) => {
  if (opp.cancelled) return "cancelled";
  if (opp.onHold) return "on_hold";
  if (opp.compStatus === "pending_compliance") return "pending_compliance";
  if (!opp.sent && (opp.compStatus === "compliance_ready" || opp.compStatus === "no_packet")) return "ready_for_action";
  if (!opp.sent) return "configuring";
  return computePhase(opp);
};

// Ordered milestone phases for a given opp (conditional steps included)
const phaseOrder = (opp) => {
  const arr = ["documents", "pre_sig_card", "signature_card"];
  if (opp.onlineBanking === "Business") arr.push("create_bolb");
  arr.push("open_account", "risk_matrix", "create_cip", "review_cip");
  if (opp.highCompliance === "Yes") arr.push("assign_household", "collect_fee");
  arr.push("complete");
  return arr;
};

// A plain-language description of where the opp sits + who is responsible next
const workflowStatus = (opp) => {
  if (opp.cancelled) return { text: "Onboarding cancelled", who: null };
  if (opp.onHold) return { text: opp.resumeRequested ? "On hold — client requested resume" : "On hold", who: opp.resumeRequested ? "employee" : null };
  if (!opp.sent && opp.compStatus === "pending_compliance") return { text: "Pending Compliance EDD review", who: "compliance" };
  if (!opp.sent && (opp.compStatus === "compliance_ready" || opp.compStatus === "no_packet")) return { text: "Compliance cleared — ready to send to client", who: "employee" };
  if (!opp.sent) return { text: "Being configured", who: "employee" };
  const ph = computePhase(opp);
  switch (ph) {
    case "documents": {
      const docs = initialDocsOf(opp);
      return (bucketsFull(docs) && docs.some(d => d.status === "uploaded"))
        ? { text: "Reviewing the client's submitted documents", who: "employee" }
        : { text: "Collecting documents from the client", who: "client" };
    }
    case "pre_sig_card": return { text: "Preparing & sending the signature card", who: "employee" };
    case "signature_card":
      return (opp.sigCardDocs || []).some(d => d.status === "uploaded")
        ? { text: "Reviewing the signed signature card", who: "employee" }
        : { text: "Awaiting the client's signed signature card", who: "client" };
    case "create_bolb": return { text: "Setting up Business Online Banking (BOLB)", who: "employee" };
    case "open_account": return { text: "Ready to open the account", who: "employee" };
    case "risk_matrix":
      return (opp.riskMatrixDocs || []).some(d => d.status === "uploaded")
        ? { text: "Compliance reviewing the risk rating matrix", who: "compliance" }
        : { text: "Client Services to upload the risk rating matrix", who: "employee" };
    case "create_cip": return { text: "Client Services to create & save the CIP", who: "employee" };
    case "review_cip": return { text: "Compliance to review the CIP", who: "compliance" };
    case "assign_household": return { text: "Compliance to assign the household code", who: "compliance" };
    case "collect_fee": return { text: "Compliance to collect the onboarding fee", who: "compliance" };
    case "complete": return { text: "Onboarding closed", who: null };
    default: return { text: "In progress", who: null };
  }
};

// "Step X of Y · description" when in an active sent phase, else just the description
const stepText = (opp) => {
  const ws = workflowStatus(opp);
  const order = phaseOrder(opp);
  const ph = computePhase(opp);
  if (opp.sent && !opp.cancelled && !opp.onHold && order.includes(ph) && ph !== "complete") {
    return `Step ${order.indexOf(ph) + 1} of ${order.length} · ${ws.text}`;
  }
  return ws.text;
};

// Bank-provided forms the client must download, sign, and upload (reviewed by employee)
const buildBankDocs = (cfg) => {
  const b = [];
  if (cfg.needApp === "Yes") b.push({ id: "app-1", name: cfg.appType === "Personal" ? "Personal Account Application" : "Business Account Application", category: "Account Forms", status: "action_needed", file: null, template: "/docs/account-application.pdf" });
  if (cfg.onlineBanking === "Business") {
    b.push({ id: "cma-1", name: "Cash Management Agreement", category: "Account Forms", status: "action_needed", file: null, template: "/docs/cash-management-agreement.pdf" });
    b.push({ id: "pp-1", name: "Positive Pay Form", category: "Account Forms", status: "action_needed", file: null, template: "/docs/positive-pay-form.pdf" });
  }
  return b;
};
const welcomePacketDoc = () => ({ id: "wp-1", name: "Compliance Welcome Packet", category: "Compliance", status: "action_needed", file: null, template: "/docs/welcome-packet.pdf", reviewer: "compliance" });
const sigCardDoc = () => ({ id: "sig-1", name: "Signature Card", category: "Account Forms", status: "action_needed", file: null, template: "/docs/signature-card.pdf" });
const sigCardPrepDoc = () => ({ id: "sigprep-1", name: "Signature Card", category: "Client Services", status: "action_needed", files: [], template: "/docs/signature-card.pdf" });


export default function BurlingOnboarding() {
  const [role, setRole] = useState(() => load("session", null)?.role || "employee");
  const [screen, setScreen] = useState("home"); // home | new | detail
  const [activeOppId, setActiveOppId] = useState(null);

  // All onboardings
  const [opps, setOpps] = useState(() => load("opps", []));

  // New onboarding form (wizard state — not yet in opps array)
  const [nf, setNf] = useState({ client: "", needApp: "", appType: "", entity: "", onlineBanking: "", highCompliance: "", contactEmail: "", summary: "" });
  const [extraDocs, setExtraDocs] = useState([]);
  const [extraDocInput, setExtraDocInput] = useState("");
  const [compWelcomePacket, setCompWelcomePacket] = useState(false);
  const [compDocRequests, setCompDocRequests] = useState([]);
  const [compDocInput, setCompDocInput] = useState("");
  const [compExplanation, setCompExplanation] = useState("");

  // Admin state
  const [users, setUsers] = useState(() => load("users", [SEED_ADMIN]));
  const [session, setSession] = useState(() => load("session", null));
  const [auth, setAuth] = useState({ mode: "signin", username: "", password: "", email: "", newUsername: "", newPassword: "" });
  const [uf, setUf] = useState({ name: "", email: "", role: "employee" });
  const [docLib, setDocLib] = useState(PROCESS_DOCS);
  const [docForm, setDocForm] = useState({ name: "", category: "Account Forms" });
  const [commentDraft, setCommentDraft] = useState({});
  const [editKey, setEditKey] = useState(null);

  const [toast, setToast] = useState({ msg: "", visible: false });
  const toastTimer = useRef(null);

  const show = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800);
  }, []);

  useEffect(() => save("opps", opps), [opps]);
  useEffect(() => save("users", users), [users]);
  useEffect(() => save("session", session), [session]);

  // Active opp
  const activeOpp = opps.find(o => o.id === activeOppId) || null;

  // Wizard derived
  const isHighComp = nf.highCompliance === "Yes";
  const entityDocs = nf.entity ? (ENTITY_DOCS[nf.entity] || []) : [];

  // For the wizard, we store a temp comp status
  const [wizComp, setWizComp] = useState("idle"); // idle | pending_compliance | compliance_ready | no_packet
  const compReady = wizComp === "compliance_ready" || wizComp === "no_packet";
  const canSend = nf.client.trim() && (nf.needApp === "No" || (nf.needApp === "Yes" && nf.appType && (nf.appType === "Personal" || nf.entity))) && nf.onlineBanking && nf.highCompliance && (!isHighComp || compReady);

  const isClient = role === "client";
  const isEmployee = role === "employee";
  const isAdmin = role === "admin";
  const isCompliance = role === "compliance";
  const isManager = isEmployee || isAdmin;
  // From a manager's view, a not-yet-uploaded document is the client's action, not theirs.

  // Update an opp in the array
  const updateOpp = (id, fn) => setOpps(prev => prev.map(o => o.id === id ? fn(o) : o));
  const logAudit = (id, action) => updateOpp(id, o => ({ ...o, audit: [...(o.audit || []), { id: newId("a"), ts: new Date().toLocaleString(), by: session ? session.name : "System", role, action }] }));

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

    const bDocs = buildBankDocs(nf);
    const wpDocs = compWelcomePacket ? [welcomePacketDoc()] : [];

    const newOpp = {
      id: newId("opp"),
      client: nf.client,
      contactEmail: nf.contactEmail,
      summary: nf.summary,
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
      welcomePacketDocs: wpDocs,
      comments: [],
      audit: [],
      riskMatrixDocs: [],
      sigCardPrepDocs: [sigCardPrepDoc()],
      sigCardSent: false,
      sigCardDocs: [],
      accountOpened: false,
      emails: [{ type: "sent", subject: `You've been invited to the onboarding portal for ${nf.client}`, date: new Date().toLocaleDateString() }],
      createdAt: new Date().toLocaleDateString(),
    };

    setOpps(prev => [...prev, newOpp]);
    inviteClient(newOpp);
    logAudit(newOpp.id, "Onboarding created and invite sent to client");
    setActiveOppId(newOpp.id);
    setScreen("detail");
    show(`Invite sent to ${nf.contactEmail || nf.client}`);

    // Reset wizard
    setNf({ client: "", needApp: "", appType: "", entity: "", onlineBanking: "", highCompliance: "", contactEmail: "", summary: "" });
    setExtraDocs([]); setExtraDocInput("");
    setWizComp("idle"); setCompWelcomePacket(false); setCompDocRequests([]); setCompDocInput(""); setCompExplanation("");
  };

  // Send to EDD queue — preserves config for later sending to client
  const sendToCompliance = () => {
    if (!nf.client.trim() || nf.highCompliance !== "Yes") return;
    const newOpp = {
      id: newId("opp"),
      client: nf.client,
      contactEmail: nf.contactEmail,
      summary: nf.summary,
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
      welcomePacketDocs: [],
      comments: [],
      audit: [],
      riskMatrixDocs: [],
      sigCardPrepDocs: [sigCardPrepDoc()],
      sigCardSent: false,
      sigCardDocs: [],
      accountOpened: false,
      emails: [],
      createdAt: new Date().toLocaleDateString(),
      savedExtraDocs: [...extraDocs],
    };
    setOpps(prev => [...prev, newOpp]);
    setScreen("home");
    show(`${nf.client} sent to Compliance for EDD review`);
    setNf({ client: "", needApp: "", appType: "", entity: "", onlineBanking: "", highCompliance: "", contactEmail: "", summary: "" });
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
    const bDocs = buildBankDocs(opp);
    const wpDocs = opp.compWelcomePacket ? [welcomePacketDoc()] : [];
    updateOpp(id, o => ({
      ...o,
      sent: true,
      clientDocs: docs,
      compClientDocs: cDocs,
      bankDocs: bDocs,
      welcomePacketDocs: wpDocs,
      sigCardPrepDocs: opp.sigCardPrepDocs && opp.sigCardPrepDocs.length ? opp.sigCardPrepDocs : [sigCardPrepDoc()],
      sigCardSent: false,
      sigCardDocs: [],
      accountOpened: false,
      emails: [{ type: "sent", subject: `You've been invited to the onboarding portal for ${opp.client}`, date: new Date().toLocaleDateString() }],
    }));
    inviteClient(opp);
    logAudit(id, "Onboarding sent to client");
    show(`Invite sent to ${opp.contactEmail || opp.client}`);
  };

  // Doc actions on active opp
  const docName = (field, id) => activeOpp?.[field]?.find(x => x.id === id)?.name || "document";
  const addFiles = (field, id, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const entry = { id: newId("f"), name: file.name, url: reader.result };
        updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => d.id === id ? { ...d, status: "uploaded", files: [...(d.files || []), entry] } : d) }));
      };
      reader.readAsDataURL(file);
    });
    logAudit(activeOppId, `Uploaded ${files.length} file${files.length > 1 ? "s" : ""} to "${docName(field, id)}"`);
  };
  const openUrl = (url) => {
    try {
      if (url && url.startsWith("data:")) {
        fetch(url).then(r => r.blob()).then(b => window.open(URL.createObjectURL(b), "_blank"));
      } else if (url) {
        window.open(url, "_blank");
      }
    } catch { /* ignore */ }
  };
  const viewFile = (f) => openUrl(f.url);
  const removeFile = (field, id, fileId) => updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => {
    if (d.id !== id) return d;
    const files = (d.files || []).filter(f => f.id !== fileId);
    return { ...d, files, status: files.length ? d.status : "action_needed" };
  }) }));
  const approveDoc = (field, id) => { updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => d.id === id ? { ...d, status: "approved" } : d) })); logAudit(activeOppId, `Approved "${docName(field, id)}"`); };
  const rejectDoc = (field, id) => { updateOpp(activeOppId, o => ({ ...o, [field]: o[field].map(d => d.id === id ? { ...d, status: "rejected", files: [] } : d) })); logAudit(activeOppId, `Rejected "${docName(field, id)}"`); };
  // Status update on an arbitrary opp (used by the compliance portal review surface)
  const setDocStatus = (oppId, field, docId, patch) => updateOpp(oppId, o => ({ ...o, [field]: o[field].map(d => d.id === docId ? { ...d, ...patch } : d) }));

  const postComment = (id) => {
    const text = (commentDraft[id] || "").trim();
    if (!text) return;
    updateOpp(id, o => ({ ...o, comments: [...(o.comments || []), { id: newId("c"), author: session ? session.name : "User", role, text, date: new Date().toLocaleString() }] }));
    setCommentDraft(p => ({ ...p, [id]: "" }));
    show("Comment added");
  };
  const completeTask = (id, field, msg) => {
    updateOpp(id, o => ({ ...o, [field]: true }));
    logAudit(id, msg);
    show(msg);
  };
  const requestResume = (id) => {
    updateOpp(id, o => ({ ...o, resumeRequested: true }));
    logAudit(id, "Client requested resume");
    show("Resume requested — your banker has been notified");
  };
  const resumeOpp = (id) => {
    const opp = opps.find(o => o.id === id);
    updateOpp(id, o => ({ ...o, onHold: false, resumeRequested: false }));
    logAudit(id, "Resumed onboarding");
    show(`${opp.client} resumed`);
  };
  const cancelOpp = (id) => {
    const opp = opps.find(o => o.id === id);
    if (typeof window !== "undefined" && !window.confirm(`Cancel onboarding for ${opp.client}? It will move to Past Onboardings.`)) return;
    updateOpp(id, o => ({ ...o, cancelled: true, onHold: false, resumeRequested: false }));
    logAudit(id, "Onboarding cancelled");
    show(`${opp.client} cancelled`);
    goHome();
  };

  // Auth
  const loginAs = (u) => {
    setSession(u);
    setRole(u.role);
    setAuth({ mode: "signin", username: "", password: "", email: "", newUsername: "", newPassword: "" });
    if (u.role === "client") { setActiveOppId(u.oppId); setScreen("detail"); }
    else { setScreen("home"); setActiveOppId(null); }
  };
  const signIn = () => {
    const u = users.find(x => x.activated && x.username === auth.username.trim() && x.password === auth.password);
    if (!u) { show("Invalid username or password"); return; }
    loginAs(u);
  };
  const activate = () => {
    const email = auth.email.trim().toLowerCase();
    const u = users.find(x => (x.email || "").toLowerCase() === email && !x.activated);
    if (!u) { show("No pending invite found for that email"); return; }
    if (!auth.newUsername.trim() || !auth.newPassword.trim()) { show("Choose a username and password"); return; }
    if (users.some(x => x.username && x.username === auth.newUsername.trim())) { show("That username is taken"); return; }
    const updated = { ...u, username: auth.newUsername.trim(), password: auth.newPassword, activated: true };
    setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
    loginAs(updated);
  };
  const logout = () => { setSession(null); setRole("employee"); setScreen("home"); setActiveOppId(null); };
  const inviteClient = (opp) => {
    if (!opp.contactEmail) return;
    setUsers(prev => prev.some(u => u.oppId === opp.id)
      ? prev.map(u => u.oppId === opp.id ? { ...u, company: opp.client, email: opp.contactEmail } : u)
      : [...prev, { id: `u-cli-${opp.id}`, name: opp.contactEmail, email: opp.contactEmail, role: "client", company: opp.client, oppId: opp.id, activated: false, createdAt: new Date().toLocaleDateString() }]);
  };
  const realClient = session?.role === "client";
  const sendSigCard = (id) => {
    updateOpp(id, o => {
      const prep = (o.sigCardPrepDocs?.[0]?.files || [])[0];
      const card = sigCardDoc();
      if (prep) card.template = prep.url;
      return { ...o, sigCardSent: true, sigCardDocs: [card], emails: [...o.emails, { type: "sent", subject: `Signature card sent to ${o.client}`, date: new Date().toLocaleDateString() }] };
    });
    logAudit(id, "Sent signature card to client");
    show("Signature card emailed to client");
  };
  const openAccount = (id) => {
    updateOpp(id, o => ({ ...o, accountOpened: true, riskMatrixDocs: (o.riskMatrixDocs && o.riskMatrixDocs.length) ? o.riskMatrixDocs : [{ id: "risk-1", name: "Risk Rating Matrix", category: "Internal — Compliance Review", status: "action_needed", files: [] }], emails: [...o.emails, { type: "sent", subject: `Account opened — welcome email sent to ${o.client}`, date: new Date().toLocaleDateString() }] }));
    logAudit(id, "Opened account and sent welcome email");
    show("Account opened — confirmation email sent to client");
  };

  const toggleHold = (id) => {
    const opp = opps.find(o => o.id === id);
    updateOpp(id, o => ({ ...o, onHold: !o.onHold, resumeRequested: false }));
    logAudit(id, opp.onHold ? "Resumed onboarding" : "Placed onboarding on hold");
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
    return !o.onHold && !o.cancelled && stage !== "complete" && stage !== "pending_compliance" && stage !== "configuring";
  });
  const pendingEDD = opps.filter(o => o.compStatus === "pending_compliance" && !o.onHold && !o.cancelled);
  const onHold = opps.filter(o => o.onHold && !o.cancelled);
  const wpPendingReview = opps.filter(o => !o.cancelled && (o.welcomePacketDocs || []).some(d => d.status === "uploaded"));
  const pastOnboardings = opps.filter(o => { const s = getOppStage(o); return s === "complete" || s === "cancelled"; });

  // Detail view derived
  const phase = activeOpp?.sent ? computePhase(activeOpp) : "none";

  // Wizard stepper
  const stepLabels = isHighComp ? ["Configure", "Compliance Review", "Send"] : ["Configure", "Send"];
  const currentStep = !isHighComp ? (canSend ? 1 : 0) : compReady ? 2 : wizComp === "pending_compliance" ? 1 : 0;

  const showHome = role === "employee" && screen === "home";
  const showNew = role === "employee" && screen === "new";
  const showDetail = screen === "detail" && activeOpp;
  const showCompliance = role === "compliance";

  const openOpp = (id) => { setActiveOppId(id); setScreen("detail"); };
  const goHome = () => { if (realClient) { setActiveOppId(session.oppId); setScreen("detail"); } else { setScreen("home"); setActiveOppId(null); } };

  // Report table row
  const OppRow = ({ opp, onClick }) => {
    const stage = getOppStage(opp);
    const allDocs = initialDocsOf(opp);
    const docsTotal = allDocs.length;
    const docsApproved = allDocs.filter(d => d.status === "approved").length;
    let rowStatus;
    if (stage === "cancelled") rowStatus = "cancelled";
    else if (stage === "on_hold") rowStatus = "on_hold";
    else if (stage === "pending_compliance") rowStatus = "pending_compliance";
    else if (stage === "complete") rowStatus = "closed";
    else if (stage === "documents") rowStatus = (bucketsFull(allDocs) && allDocs.some(d => d.status === "uploaded")) ? "review_needed" : "awaiting_client";
    else if (stage === "signature_card") rowStatus = (opp.sigCardDocs || []).some(d => d.status === "uploaded") ? "review_needed" : "awaiting_client";
    else rowStatus = "ready_for_action";
    // From the client's own perspective, "awaiting client" means they have an action.
    if (isClient) { if (rowStatus === "awaiting_client") rowStatus = "action_needed"; else if (rowStatus === "review_needed" || rowStatus === "ready_for_action") rowStatus = "uploaded"; }
    return (
      <div onClick={onClick} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{opp.client}</div>
            <div style={{ fontSize: 11, color: T.navy, fontWeight: 500, marginTop: 1 }}>{stepText(opp)}</div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{opp.entity || opp.appType || "—"} · {opp.createdAt}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {docsTotal > 0 && <span style={{ fontSize: 10, color: T.textMuted }}>{docsApproved}/{docsTotal} docs</span>}
          <Badge status={rowStatus} />
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

  // Internal comment thread — visible to employees, compliance, and admin (never the client)
  const CommentThread = ({ opp }) => {
    const list = opp.comments || [];
    const draft = commentDraft[opp.id] || "";
    return (
      <Card>
        <CH icon={IC.Mail()} title="Internal Comments" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{list.length}</span>} />
        <div style={{ padding: "8px 20px", background: T.warningBg, borderBottom: `1px solid ${T.borderLight}` }}>
          <span style={{ fontSize: 10, color: T.warning, fontWeight: 600 }}>Internal only — not visible to the client.</span>
        </div>
        {list.length === 0 && <EmptyReport msg="No internal comments yet." />}
        {list.map(c => (
          <div key={c.id} style={{ padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <RolePill role={c.role} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.author}</span>
              <span style={{ fontSize: 10, color: T.textMuted }}>{c.date}</span>
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, whiteSpace: "pre-wrap" }}>{c.text}</div>
          </div>
        ))}
        <div style={{ padding: "12px 20px", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea value={draft} onChange={e => setCommentDraft(p => ({ ...p, [opp.id]: e.target.value }))} style={{ ...inp, minHeight: 38, resize: "vertical", flex: 1 }} placeholder="Add an internal comment…" />
          <button onClick={() => postComment(opp.id)} disabled={!draft.trim()} style={{ ...btnPri, padding: "9px 16px", opacity: draft.trim() ? 1 : 0.4 }}>{IC.Send(12)} Post</button>
        </div>
      </Card>
    );
  };

  // A gated workflow task card (button shown only to the responsible role)
  const TaskCard = ({ title, actor, desc, actionLabel, onAction, waiting, waitingTitle }) => {
    const isActor = actor === "compliance" ? (isCompliance || isAdmin) : isManager;
    return (
      <Card s={{ borderColor: "#B8D4A8" }}>
        <CH icon={IC.Check()} title={isActor ? title : (waitingTitle || title)} accent="#E8F5E9" right={<RolePill role={actor} />} />
        <div style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 14 }}>{desc}</p>
          {isActor ? (
            <button onClick={onAction} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "14px", fontSize: 14 }}>{actionLabel}</button>
          ) : (
            <p style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>{waiting}</p>
          )}
        </div>
      </Card>
    );
  };

  // A document bucket with drag-and-drop upload + clickable files.
  // Called as a function (not <BucketRow/>) so its inputs don't remount on every keystroke/render.
  const bucketRow = (doc, field, { reviewer = "employee", uploader = "client" } = {}) => {
    const canReview = reviewer === "none" ? false : reviewer === "compliance" ? (isCompliance || isAdmin) : isManager;
    const canUpload = uploader === "employee" ? isManager : isClient;
    const files = doc.files || [];
    const needsUpload = doc.status === "action_needed" || doc.status === "rejected";
    const badgeStatus = needsUpload ? (canUpload ? doc.status : "awaiting_upload") : doc.status;
    const inputId = `up-${field}-${doc.id}`;
    const editing = editKey === `${field}:${doc.id}`;
    const showDrop = canUpload && (needsUpload || editing);
    return (
      <div key={doc.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
        <div className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ color: T.textMuted }}>{IC.File()}</span>
            <div><div style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</div><div style={{ fontSize: 10, color: T.textMuted }}>{doc.category}{files.length > 0 ? ` · ${files.length} file${files.length > 1 ? "s" : ""}` : ""}</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Badge status={badgeStatus} />
            {canUpload && doc.template && needsUpload && <button onClick={() => openUrl(doc.template)} style={btnS}>{IC.File(12)} Download &amp; Sign</button>}
            {canUpload && doc.status === "uploaded" && !editing && <button onClick={() => setEditKey(`${field}:${doc.id}`)} style={btnS}>{IC.Pen(12)} Edit</button>}
            {canUpload && editing && <button onClick={() => setEditKey(null)} style={{ ...btnS, color: T.success, background: T.successBg }}>{IC.Check(12)} Done</button>}
            {canReview && doc.status === "uploaded" && (<><button onClick={() => approveDoc(field, doc.id)} style={{ ...btnS, color: T.success, background: T.successBg }}>{IC.Check(12)} Approve</button><button onClick={() => rejectDoc(field, doc.id)} style={btnDanger}>{IC.X(12)} Reject</button></>)}
          </div>
        </div>
        {files.length > 0 && (
          <div style={{ padding: "0 20px 8px 44px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {files.map(f => (
              <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: T.sky, background: T.skyPale, border: `1px solid ${T.skyLight}`, borderRadius: 6, padding: "3px 8px" }}>
                <button onClick={() => viewFile(f)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", color: T.sky, cursor: "pointer", padding: 0, fontSize: 11 }}>{IC.File(11)} {f.name}</button>
                {editing && canUpload && <button onClick={() => removeFile(field, doc.id, f.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer", padding: 0, display: "inline-flex" }}>{IC.X(11)}</button>}
              </span>
            ))}
          </div>
        )}
        {showDrop && (
          <div style={{ padding: "0 20px 12px 44px" }}>
            <input id={inputId} type="file" multiple style={{ display: "none" }} onChange={e => { addFiles(field, doc.id, e.target.files); e.target.value = ""; }} />
            <div
              onClick={() => document.getElementById(inputId)?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = T.sky; e.currentTarget.style.background = T.skyPale; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surfaceAlt; }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surfaceAlt; addFiles(field, doc.id, e.dataTransfer.files); }}
              style={{ border: `1.5px dashed ${T.border}`, background: T.surfaceAlt, borderRadius: 8, padding: "10px 12px", textAlign: "center", cursor: "pointer", fontSize: 11, color: T.textSecondary }}>
              {IC.Upload(13)} {editing ? "Drag & drop to add or replace files, or click to browse" : "Drag & drop files here, or click to browse"}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!session) {
    const a = auth;
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <style>{FONTS}{`* { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: ${T.sky} !important; outline: none; }`}</style>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <img src="/burling-logo-white.png" alt="Burling Bank" style={{ height: 34, marginBottom: 12 }} />
            <div style={{ fontSize: 12, color: T.skyLight, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Deposit Onboarding Module</div>
          </div>
          <div style={{ background: T.surface, borderRadius: 14, padding: 26, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, background: T.surfaceAlt, borderRadius: 8, padding: 4 }}>
              {[["signin", "Sign In"], ["activate", "Activate Invite"]].map(([m, label]) => (
                <button key={m} onClick={() => setAuth(p => ({ ...p, mode: m }))} style={{ ...btnBase, flex: 1, justifyContent: "center", padding: "8px", fontSize: 12, background: a.mode === m ? T.navy : "transparent", color: a.mode === m ? T.white : T.textSecondary }}>{label}</button>
              ))}
            </div>
            {a.mode === "signin" ? (
              <div>
                <label style={labelSm}>Username</label>
                <input value={a.username} onChange={e => setAuth(p => ({ ...p, username: e.target.value }))} style={{ ...inp, marginBottom: 12 }} placeholder="username" />
                <label style={labelSm}>Password</label>
                <input type="password" value={a.password} onChange={e => setAuth(p => ({ ...p, password: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") signIn(); }} style={{ ...inp, marginBottom: 16 }} placeholder="password" />
                <button onClick={signIn} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}>{IC.Lock(15)} Sign In</button>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 14, textAlign: "center" }}>Setup admin — username <strong>admin</strong> / password <strong>admin</strong></div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 14 }}>Enter the email your invite was sent to, then choose a username and password.</p>
                <label style={labelSm}>Invite Email</label>
                <input value={a.email} onChange={e => setAuth(p => ({ ...p, email: e.target.value }))} style={{ ...inp, marginBottom: 12 }} placeholder="you@example.com" />
                <label style={labelSm}>Choose a Username</label>
                <input value={a.newUsername} onChange={e => setAuth(p => ({ ...p, newUsername: e.target.value }))} style={{ ...inp, marginBottom: 12 }} placeholder="username" />
                <label style={labelSm}>Choose a Password</label>
                <input type="password" value={a.newPassword} onChange={e => setAuth(p => ({ ...p, newPassword: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") activate(); }} style={{ ...inp, marginBottom: 16 }} placeholder="password" />
                <button onClick={activate} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}>{IC.Check(15)} Create Account &amp; Sign In</button>
              </div>
            )}
          </div>
        </div>
        <Toast {...toast} />
      </div>
    );
  }

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
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, padding: "0 24px", borderBottom: `2px solid ${T.sky}` }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer", minWidth: 0 }} onClick={goHome}>
            <img src="/burling-logo-white.png" alt="Burling Bank" style={{ height: 28, width: "auto", display: "block", flexShrink: 0 }} />
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>Deposit Onboarding Module</span>
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <RolePill role={role} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.white, whiteSpace: "nowrap" }}>{session.name}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {session.role === "admin" && (
              <>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, lineHeight: 1.2, textAlign: "right" }}>Setup<br />view&nbsp;as</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {["employee", "client", "compliance", "admin"].map(r => (
                    <button key={r} onClick={() => { setRole(r); setScreen("home"); setActiveOppId(null); }}
                      style={{ ...btnBase, padding: "5px 12px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", background: role === r ? "rgba(75,163,217,0.2)" : "transparent", color: role === r ? T.skyLight : "rgba(255,255,255,0.5)", border: `1px solid ${role === r ? "rgba(75,163,217,0.3)" : "transparent"}` }}>
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
              </>
            )}
            <button onClick={logout} style={{ ...btnBase, padding: "5px 12px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>Log Out</button>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "22px 20px 80px" }}>

        {/* ======== EMPLOYEE HOME ======== */}
        {showHome && isEmployee && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, borderRadius: 14, padding: "24px 28px", marginBottom: 20, color: T.white }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginBottom: 4 }}>Client Services Portal</div>
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
              {onHold.length === 0 ? <EmptyReport msg="No onboardings on hold" /> : onHold.map(o => (
                <div key={o.id} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                  <div onClick={() => openOpp(o.id)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{o.client}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{o.entity || o.appType || "—"} · {o.createdAt}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {o.resumeRequested ? <Badge status="resume_requested" /> : <Badge status="on_hold" />}
                    {o.resumeRequested && <button onClick={() => resumeOpp(o.id)} style={{ ...btnPri, padding: "7px 14px", fontSize: 11 }}>{IC.Play(12)} Resume</button>}
                  </div>
                </div>
              ))}
            </Card>

            {/* Past Onboardings */}
            <Card>
              <CH icon={IC.File()} title="Past Onboardings" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{pastOnboardings.length}</span>} />
              {pastOnboardings.length === 0 ? <EmptyReport msg="No closed or cancelled onboardings" /> : pastOnboardings.map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
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
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.navy, display: "block", marginBottom: 6 }}>Primary Contact Email</label>
                  <input value={nf.contactEmail} onChange={e => setNf(p => ({ ...p, contactEmail: e.target.value }))} style={{ ...inp, maxWidth: 300 }} placeholder="contact@acme.com" />
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>The client's onboarding invite will be sent here.</div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.navy, display: "block", marginBottom: 6 }}>Summary &amp; Relevant Information <span style={{ color: T.warning, fontWeight: 600 }}>(Internal)</span></label>
                  <textarea value={nf.summary} onChange={e => setNf(p => ({ ...p, summary: e.target.value }))} style={{ ...inp, minHeight: 70, resize: "vertical" }} placeholder="Describe the business, the relationship, and any relevant context. Internal only — never shown to the client." />
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
        {showDetail && (role === "employee" || role === "client" || role === "admin" || role === "compliance") && (
          <div>
            {(isManager || isCompliance) && <button onClick={goHome} style={{ ...btnS, marginBottom: 14 }}>{IC.Home()} Back to Dashboard</button>}
            <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, borderRadius: 14, padding: "20px 24px", marginBottom: 16, color: T.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginBottom: 2 }}>{isClient ? "Client Portal" : isAdmin ? "Admin View" : isCompliance ? "Compliance View" : "Client Services View"}</div>
                  <h1 style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", marginBottom: 2 }}>{activeOpp.client}</h1>
                  <p style={{ fontSize: 11, opacity: 0.7 }}>{isClient && activeOpp.accountOpened ? "Account opened" : workflowStatus(activeOpp).text}</p>
                </div>
                {isManager && phase !== "complete" && !activeOpp.cancelled && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {activeOpp.sent && (
                      <button onClick={() => toggleHold(activeOpp.id)} style={{ ...btnBase, padding: "6px 14px", fontSize: 10, background: activeOpp.onHold ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)", color: T.white, border: "1px solid rgba(255,255,255,0.2)" }}>
                        {activeOpp.onHold ? <>{IC.Play(12)} Resume</> : <>{IC.Pause(12)} Hold</>}
                      </button>
                    )}
                    <button onClick={() => cancelOpp(activeOpp.id)} style={{ ...btnBase, padding: "6px 14px", fontSize: 10, background: "rgba(197,48,48,0.25)", color: "#FFD7D7", border: "1px solid rgba(197,48,48,0.4)" }}>{IC.X(12)} Cancel</button>
                  </div>
                )}
              </div>
            </div>

            {!activeOpp.cancelled && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.skyPale, border: `1px solid ${T.skyLight}`, borderRadius: 10, padding: "10px 16px", marginBottom: 14 }}>
                <span style={{ color: T.sky, flexShrink: 0 }}>{IC.Arrow(16)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.textMuted }}>Current Step</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{isClient && activeOpp.accountOpened ? "Account opened — nothing further needed from you" : (isClient ? workflowStatus(activeOpp).text : stepText(activeOpp))}</div>
                </div>
                {(() => { const w = workflowStatus(activeOpp).who; return w ? <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}><span style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>With</span><RolePill role={w} /></span> : null; })()}
              </div>
            )}

            {activeOpp.onHold && (
              <Card s={{ borderColor: T.hold + "40" }}>
                <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: T.holdBg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {IC.Pause(16)}
                    <div><span style={{ fontSize: 12, fontWeight: 600, color: T.hold }}>This onboarding is on hold.</span><br /><span style={{ fontSize: 11, color: T.textSecondary }}>{isClient ? (activeOpp.resumeRequested ? "Resume requested — your banker will reactivate it." : "Request a resume from your banker to continue.") : activeOpp.resumeRequested ? "The client has requested a resume." : "Use Resume above to reactivate."}</span></div>
                  </div>
                  {isClient && !activeOpp.resumeRequested && <button onClick={() => requestResume(activeOpp.id)} style={{ ...btnSky, padding: "7px 14px" }}>{IC.Play(12)} Request Resume</button>}
                  {isManager && activeOpp.resumeRequested && <button onClick={() => resumeOpp(activeOpp.id)} style={{ ...btnPri, padding: "8px 14px" }}>{IC.Play(12)} Resume</button>}
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
                  {isManager ? (
                    <button onClick={() => sendToClient(activeOpp.id)} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "14px", fontSize: 14 }}>{IC.Send(16)} Send Onboarding to {activeOpp.client}</button>
                  ) : (
                    <p style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Client Services will send the onboarding to the client.</p>
                  )}
                </div>
              </Card>
            )}

            {(isManager || isCompliance) && activeOpp.summary && (
              <Card>
                <CH icon={IC.File()} title="Summary & Relevant Information" right={<span style={{ fontSize: 10, color: T.warning, fontWeight: 700 }}>INTERNAL</span>} />
                <div style={{ padding: "14px 20px", fontSize: 12, color: T.textSecondary, whiteSpace: "pre-wrap" }}>{activeOpp.summary}</div>
              </Card>
            )}

            {activeOpp.cancelled && (
              <Card s={{ borderColor: T.danger + "55" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, background: T.dangerBg }}>
                  {IC.X(16)}
                  <div><span style={{ fontSize: 12, fontWeight: 600, color: T.danger }}>This onboarding was cancelled.</span><br /><span style={{ fontSize: 11, color: T.textSecondary }}>It now lives in Past Onboardings.</span></div>
                </div>
              </Card>
            )}

            {(isManager || isCompliance) && CommentThread({ opp: activeOpp })}

            {activeOpp.sent && !activeOpp.cancelled && (
              <>
                <Card>
                  <div style={{ padding: "14px 20px", display: "flex", gap: 8 }}>
                    {(() => {
                      const g0 = ["documents", "pre_sig_card"];
                      const g1 = ["signature_card"];
                      const g2 = ["create_bolb", "open_account"];
                      let idx = g0.includes(phase) ? 0 : g1.includes(phase) ? 1 : g2.includes(phase) ? 2 : 3;
                      const steps = isClient ? ["Documents", "Signature Card", "Account Opened"] : ["Documents", "Signature Card", "Account", "Closeout"];
                      if (isClient) idx = activeOpp.accountOpened ? 2 : Math.min(idx, 2);
                      return steps.map((label, i) => (
                        <div key={label} style={{ flex: 1, textAlign: "center" }}><div style={{ height: 4, borderRadius: 2, background: i <= idx ? T.sky : T.surfaceAlt, marginBottom: 6 }} /><span style={{ fontSize: 10, fontWeight: 600, color: i <= idx ? T.navy : T.textMuted }}>{label}</span></div>
                      ));
                    })()}
                  </div>
                </Card>
                {phase === "pre_sig_card" && !isClient && (() => {
                  const achNeeded = activeOpp.onlineBanking === "Business";
                  const achDone = activeOpp.achMemoCreated || activeOpp.achMemoNotNeeded;
                  const Item = ({ done, label, detail, children }) => (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? T.success : T.border}`, background: done ? T.success : T.white, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{done ? IC.Check(13) : null}</span>
                        <div><div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{label}</div>{detail && <div style={{ fontSize: 11, color: T.textMuted }}>{detail}</div>}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>{children}</div>
                    </div>
                  );
                  return (
                    <Card s={{ borderColor: "#B8D4A8" }}>
                      <CH icon={IC.Check()} title="Signature Card Readiness" accent="#E8F5E9" right={<RolePill role="employee" />} />
                      <div style={{ padding: "6px 20px 0" }}>
                        {achNeeded && (
                          <Item done={achDone} label="ACH Memo" detail={activeOpp.achMemoNotNeeded ? "Marked not needed" : activeOpp.achMemoCreated ? "Created" : "Required for Business online banking"}>
                            {isManager && !achDone && <>
                              <button onClick={() => completeTask(activeOpp.id, "achMemoCreated", "ACH memo created")} style={btnSky}>{IC.Check(12)} Mark Created</button>
                              <button onClick={() => completeTask(activeOpp.id, "achMemoNotNeeded", "ACH memo marked not needed")} style={btnS}>Not Needed</button>
                            </>}
                          </Item>
                        )}
                        <Item done={activeOpp.mgmtApproved} label="Management Approval" detail="Confirm management approved this account">
                          {isManager && !activeOpp.mgmtApproved && <button onClick={() => completeTask(activeOpp.id, "mgmtApproved", "Management approval recorded")} style={btnSky}>{IC.Check(12)} Confirm</button>}
                        </Item>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, paddingTop: 12 }}>Signature Card</div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Upload the signature card to send to the client.</div>
                      </div>
                      {(activeOpp.sigCardPrepDocs || []).map(doc => bucketRow(doc, "sigCardPrepDocs", { uploader: "employee", reviewer: "none" }))}
                      <div style={{ padding: "14px 20px 18px" }}>
                        {isManager ? (
                          <button onClick={() => sendSigCard(activeOpp.id)} disabled={!preSigReady(activeOpp)} style={{ ...btnPri, width: "100%", justifyContent: "center", padding: "14px", fontSize: 14, opacity: preSigReady(activeOpp) ? 1 : 0.4 }}>{IC.Send(16)} Send Signature Card to Client</button>
                        ) : (
                          <p style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Client Services completes these tasks and sends the signature card.</p>
                        )}
                      </div>
                    </Card>
                  );
                })()}
                {phase === "pre_sig_card" && isClient && (
                  <Card><div style={{ padding: "18px 20px", fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Your documents have been approved. Your banker is preparing your signature card.</div></Card>
                )}

                {activeOpp.sigCardSent && activeOpp.sigCardDocs.length > 0 && (
                  <Card>
                    <CH icon={IC.Pen()} title="Signature Card" accent={T.skyPale} right={<span style={{ fontSize: 10, color: T.textMuted }}>{activeOpp.sigCardDocs.filter(d => d.status === "approved").length}/{activeOpp.sigCardDocs.length} approved</span>} />
                    {isClient && <div style={{ padding: "10px 20px", background: T.skyPale, borderBottom: `1px solid ${T.skyLight}` }}><p style={{ fontSize: 11, color: T.navy }}>Download the signature card, sign it, then upload the signed copy for review.</p></div>}
                    {activeOpp.sigCardDocs.map(doc => bucketRow(doc, "sigCardDocs"))}
                  </Card>
                )}

                {phase === "create_bolb" && !isClient && (
                  <TaskCard title="Create BOLB" waitingTitle="Waiting for BOLB Creation" actor="employee"
                    desc={<>The signed signature card is approved. Create BOLB (Business Online Banking) for <strong>{activeOpp.client}</strong> before opening the account.</>}
                    actionLabel={<>{IC.File(16)} Mark BOLB Created</>}
                    onAction={() => completeTask(activeOpp.id, "bolbCreated", "BOLB created")}
                    waiting="Your banker is finalizing your setup." />
                )}

                {phase === "open_account" && (
                  <TaskCard title="Open Account" actor="employee"
                    desc={<>BOLB is created and all approvals are in place. Open the account for <strong>{activeOpp.client}</strong>; a welcome email with account, online banking, and related details will be sent to the client.</>}
                    actionLabel={<>{IC.Check(16)} Open Account &amp; Notify Client</>}
                    onAction={() => openAccount(activeOpp.id)}
                    waiting="Your banker is opening your account. You'll receive a welcome email shortly." />
                )}

                {activeOpp.accountOpened && isClient && (
                  <div style={{ background: `linear-gradient(135deg, ${T.success} 0%, #145A34 100%)`, borderRadius: 12, padding: 28, textAlign: "center", color: T.white, marginBottom: 16 }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>✓</div>
                    <h2 style={{ fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 4 }}>Account Opened</h2>
                    <p style={{ fontSize: 12, opacity: 0.85 }}>Your account is open. A welcome email with your account and online banking details has been sent to you.</p>
                  </div>
                )}

                {activeOpp.accountOpened && !isClient && (
                  <>
                    <Card>
                      <div style={{ padding: "12px 20px", background: T.successBg }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>✓ Account opened — welcome email sent to {activeOpp.client}.</span>
                        <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 2 }}>Internal closeout below is not visible to the client.</div>
                      </div>
                    </Card>
                    {activeOpp.riskMatrixDocs && activeOpp.riskMatrixDocs.length > 0 && (
                      <Card>
                        <CH icon={IC.File()} title="Risk Rating Matrix" accent={T.skyPale} right={<span style={{ fontSize: 10, color: T.textMuted }}>Employee uploads · Compliance reviews</span>} />
                        {activeOpp.riskMatrixDocs.map(doc => bucketRow(doc, "riskMatrixDocs", { uploader: "employee", reviewer: "compliance" }))}
                      </Card>
                    )}
                    {phase === "create_cip" && (
                      <TaskCard title="Create and Save CIP" waitingTitle="Waiting for CIP Creation" actor="employee"
                        desc={<>Create and save the CIP for <strong>{activeOpp.client}</strong>. Compliance will review it next.</>}
                        actionLabel={<>{IC.File(16)} Mark CIP Created</>}
                        onAction={() => completeTask(activeOpp.id, "cipCreated", "CIP created and saved")}
                        waiting="Waiting for the banker to create and save the CIP." />
                    )}
                    {phase === "review_cip" && (
                      <TaskCard title="Review CIP" waitingTitle="Waiting for CIP Review" actor="compliance"
                        desc={<>Review the CIP saved for <strong>{activeOpp.client}</strong>.</>}
                        actionLabel={<>{IC.Check(16)} Approve CIP</>}
                        onAction={() => completeTask(activeOpp.id, "cipReviewed", "CIP reviewed by compliance")}
                        waiting="Awaiting compliance review of the CIP." />
                    )}
                    {phase === "assign_household" && (
                      <TaskCard title="Assign Household Code" waitingTitle="Waiting for Household Code" actor="compliance"
                        desc={<>This is a high-compliance account. Assign the household code for <strong>{activeOpp.client}</strong> before closing.</>}
                        actionLabel={<>{IC.Check(16)} Assign Household Code</>}
                        onAction={() => completeTask(activeOpp.id, "householdCodeAssigned", "Household code assigned")}
                        waiting="Awaiting compliance to assign the household code." />
                    )}
                    {phase === "collect_fee" && (
                      <TaskCard title="Collect Onboarding Fee" waitingTitle="Waiting for Onboarding Fee" actor="compliance"
                        desc={<>Collect the onboarding fee for high-compliance account <strong>{activeOpp.client}</strong> before closing.</>}
                        actionLabel={<>{IC.Check(16)} Mark Onboarding Fee Collected</>}
                        onAction={() => completeTask(activeOpp.id, "onboardingFeeCollected", "Onboarding fee collected")}
                        waiting="Awaiting compliance to collect the onboarding fee." />
                    )}
                    {phase === "complete" && (
                      <div style={{ background: `linear-gradient(135deg, ${T.success} 0%, #145A34 100%)`, borderRadius: 12, padding: 28, textAlign: "center", color: T.white, marginBottom: 16 }}>
                        <div style={{ fontSize: 32, marginBottom: 6 }}>✓</div>
                        <h2 style={{ fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 4 }}>Onboarding Closed</h2>
                        <p style={{ fontSize: 12, opacity: 0.85 }}>All internal closeout steps for {activeOpp.client} are complete{activeOpp.highCompliance === "Yes" ? ", including household code and onboarding fee" : ""}.</p>
                      </div>
                    )}
                  </>
                )}

                {(activeOpp.clientDocs.length > 0 || activeOpp.bankDocs.length > 0) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 2px 8px" }}>
                    <span style={{ width: 4, height: 14, borderRadius: 2, background: T.sky }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.navy }}>Client Services Documents</span>
                  </div>
                )}
                {activeOpp.clientDocs.length > 0 && (
                  <Card>
                    <CH icon={IC.File()} title="Account Requests" accent={T.skyPale} right={<span style={{ fontSize: 10, color: T.textMuted }}>{activeOpp.clientDocs.filter(d => d.status === "approved").length}/{activeOpp.clientDocs.length} approved</span>} />
                    {activeOpp.clientDocs.map(doc => bucketRow(doc, "clientDocs"))}
                  </Card>
                )}
                {activeOpp.bankDocs.length > 0 && (
                  <Card>
                    <CH icon={IC.Pen()} title="Forms to Download, Sign &amp; Return" accent={T.skyPale} right={<span style={{ fontSize: 10, color: T.textMuted }}>{activeOpp.bankDocs.filter(d => d.status === "approved").length}/{activeOpp.bankDocs.length} approved</span>} />
                    {isClient && <div style={{ padding: "10px 20px", background: T.skyPale, borderBottom: `1px solid ${T.skyLight}` }}><p style={{ fontSize: 11, color: T.navy }}>Download each form, sign it, then upload the signed copy.</p></div>}
                    {activeOpp.bankDocs.map(doc => bucketRow(doc, "bankDocs"))}
                  </Card>
                )}
                {(activeOpp.compClientDocs.length > 0 || (activeOpp.welcomePacketDocs && activeOpp.welcomePacketDocs.length > 0)) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 2px 8px" }}>
                    <span style={{ width: 4, height: 14, borderRadius: 2, background: T.compText }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.compText }}>Compliance Documents</span>
                  </div>
                )}
                {activeOpp.compClientDocs.length > 0 && (
                  <Card s={{ borderColor: T.compBorder }}>
                    <CH icon={IC.Lock()} title="Compliance Requests" accent={T.compBg} right={<span style={{ fontSize: 10, color: T.compText }}>{activeOpp.compClientDocs.filter(d => d.status === "approved").length}/{activeOpp.compClientDocs.length} approved</span>} />
                    {isClient && <div style={{ padding: "10px 20px", background: T.compBg, borderBottom: `1px solid ${T.compBorder}` }}><p style={{ fontSize: 11, color: T.compText }}>These documents have been requested by our compliance team as part of enhanced due diligence.</p></div>}
                    {activeOpp.compClientDocs.map(doc => bucketRow(doc, "compClientDocs"))}
                  </Card>
                )}
                {activeOpp.welcomePacketDocs && activeOpp.welcomePacketDocs.length > 0 && (
                  <Card s={{ borderColor: T.compBorder }}>
                    <CH icon={IC.Lock()} title="Compliance Welcome Packet" accent={T.compBg} right={<span style={{ fontSize: 10, color: T.compText }}>Reviewed by Compliance</span>} />
                    {isClient && <div style={{ padding: "10px 20px", background: T.compBg, borderBottom: `1px solid ${T.compBorder}` }}><p style={{ fontSize: 11, color: T.compText }}>Download, sign, and upload the compliance welcome packet. It will be reviewed by our compliance team.</p></div>}
                    {activeOpp.welcomePacketDocs.map(doc => bucketRow(doc, "welcomePacketDocs", { reviewer: "compliance" }))}
                  </Card>
                )}
              </>
            )}

            {(isManager || isCompliance) && (activeOpp.audit || []).length > 0 && (
              <Card>
                <CH icon={IC.File()} title="Audit Log" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{activeOpp.audit.length}</span>} />
                {[...activeOpp.audit].reverse().map(e => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <RolePill role={e.role} />
                      <span style={{ fontSize: 12, color: T.text }}>{e.action}</span>
                    </div>
                    <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>{e.by} · {e.ts}</span>
                  </div>
                ))}
              </Card>
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
            {opps.filter(o => o.sent && (!realClient || o.id === session.oppId)).length === 0 ? (
              <Card><div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 8 }}>📬</div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 4 }}>No Active Onboarding</h3><p style={{ fontSize: 13, color: T.textSecondary }}>You'll receive an email when your onboarding is ready.</p></div></Card>
            ) : (
              <Card>
                {opps.filter(o => o.sent && (!realClient || o.id === session.oppId)).map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
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
            <Card>
              <CH icon={IC.File()} title="Currently Onboarding" right={<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{currentlyOnboarding.length}</span>} />
              {currentlyOnboarding.length === 0 ? <EmptyReport msg="No active onboardings" /> : currentlyOnboarding.map(o => <OppRow key={o.id} opp={o} onClick={() => openOpp(o.id)} />)}
            </Card>
            {wpPendingReview.length > 0 && (
              <Card s={{ borderColor: T.compBorder }}>
                <CH icon={IC.Lock()} title="Welcome Packets — Pending Review" accent={T.compBg} right={<span style={{ fontSize: 10, color: T.compText, fontWeight: 600 }}>{wpPendingReview.length}</span>} />
                {wpPendingReview.map(opp => (
                  <div key={opp.id} className="doc-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{opp.client}</div>
                      <div style={{ fontSize: 10, color: T.textMuted }}>Signed compliance welcome packet uploaded</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => { setDocStatus(opp.id, "welcomePacketDocs", "wp-1", { status: "approved" }); show(`Welcome packet approved for ${opp.client}`); }} style={{ ...btnS, color: T.success, background: T.successBg }}>{IC.Check(12)} Approve</button>
                      <button onClick={() => { setDocStatus(opp.id, "welcomePacketDocs", "wp-1", { status: "rejected", file: null }); show(`Welcome packet rejected for ${opp.client}`); }} style={btnDanger}>{IC.X(12)} Reject</button>
                    </div>
                  </div>
                ))}
              </Card>
            )}
            {pendingEDD.length === 0 && wpPendingReview.length === 0 ? (
              <Card><div style={{ padding: 32, textAlign: "center" }}><div style={{ fontSize: 28, marginBottom: 6 }}>📋</div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>No Pending Requests</h3><p style={{ fontSize: 12, color: T.textMuted }}>You'll be notified when a high compliance review is needed.</p></div></Card>
            ) : (
              pendingEDD.map(opp => (
                <div key={opp.id}>
                <Card s={{ borderColor: T.compBorder }}>
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
                {CommentThread({ opp })}
                </div>
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
                      {USER_ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
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
                    <span style={{ fontSize: 10, fontWeight: 700, color: u.activated ? T.success : T.warning }}>{u.activated ? "Active" : "Invited"}</span>
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
