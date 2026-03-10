import { useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// PE FUNDAMENTALS + MAYBERN PLATFORM TRAINING
// ═══════════════════════════════════════════════════════════

const MODULES = [
  { id: "welcome", title: "Start Here", icon: "◈", section: "intro" },
  { id: "what-is-pe", title: "What Is PE?", icon: "①", section: "foundations" },
  { id: "fund-structure", title: "Fund Structure", icon: "②", section: "foundations" },
  { id: "maybern-nav", title: "Navigating Maybern", icon: "③", section: "foundations" },
  { id: "fund-setup", title: "Fund Setup in Maybern", icon: "④", section: "setup" },
  { id: "entities", title: "Entities & Structure", icon: "⑤", section: "setup" },
  { id: "tx-codes", title: "Transaction Codes", icon: "⑥", section: "setup" },
  { id: "commitments", title: "Commitments & Closings", icon: "⑦", section: "operations" },
  { id: "capital-calls", title: "Capital Calls", icon: "⑧", section: "operations" },
  { id: "mgmt-fees", title: "Management Fees", icon: "⑨", section: "operations" },
  { id: "investments", title: "Investments & NAV", icon: "⑩", section: "operations" },
  { id: "distributions", title: "Distributions", icon: "⑪", section: "operations" },
  { id: "waterfalls", title: "The Waterfall", icon: "⑫", section: "advanced" },
  { id: "performance", title: "IRR & MOIC", icon: "⑬", section: "advanced" },
  { id: "credit-facility", title: "Credit Facilities", icon: "⑭", section: "advanced" },
];

const SECTIONS = {
  intro: "Getting Started",
  foundations: "PE Foundations",
  setup: "Setting Up in Maybern",
  operations: "Fund Operations",
  advanced: "Advanced Calculations",
};

const fmt = (n) => {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};
const pct = (n) => `${(n * 100).toFixed(1)}%`;

// ── Shared Components ──

function Callout({ type = "info", children }) {
  const c = { info: { bg: "#0c1426", border: "#1e3a5f", icon: "ℹ" }, key: { bg: "#1a0f00", border: "#5c3d00", icon: "★" }, warn: { bg: "#1a0a0a", border: "#5c1a1a", icon: "⚠" }, think: { bg: "#0a1a0a", border: "#1a5c1a", icon: "?" } }[type];
  return <div style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, padding: "14px 18px", borderRadius: "0 6px 6px 0", margin: "16px 0", fontSize: 14, lineHeight: 1.65 }}><span style={{ marginRight: 8, opacity: 0.7 }}>{c.icon}</span>{children}</div>;
}

function MaybernUI({ nav, children }) {
  return (
    <div style={{ background: "#0a0e18", border: "1px solid #e0c97f30", borderRadius: 10, margin: "20px 0", overflow: "hidden" }}>
      <div style={{ background: "#e0c97f15", borderBottom: "1px solid #e0c97f30", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#e0c97f", fontWeight: 600, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>IN MAYBERN</span>
        {nav && <span style={{ fontSize: 12, color: "#5a6a7a" }}>│</span>}
        {nav && <span style={{ fontSize: 12, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace" }}>{nav}</span>}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function NavPath({ steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "#111822", border: "1px solid #1e2a3a", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>{s}</span>
          {i < steps.length - 1 && <span style={{ color: "#3a4a5a" }}>›</span>}
        </div>
      ))}
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step = 1, format = fmt }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: "#8899aa" }}>{label}</span>
        <span style={{ color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: "#e0c97f" }} />
    </div>
  );
}

function Quiz({ question, options, correctIndex, explanation }) {
  const [sel, setSel] = useState(null);
  const done = sel !== null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: 8, padding: 20, margin: "20px 0" }}>
      <div style={{ fontSize: 12, color: "#e0c97f", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>CHECK UNDERSTANDING</div>
      <div style={{ fontSize: 15, marginBottom: 14, lineHeight: 1.5 }}>{question}</div>
      {options.map((o, i) => {
        let bg = "#111822", bdr = "#1e2a3a";
        if (done && i === sel && i === correctIndex) { bg = "#0a2a0a"; bdr = "#1a5c1a"; }
        else if (done && i === sel) { bg = "#2a0a0a"; bdr = "#5c1a1a"; }
        else if (done && i === correctIndex) { bg = "#0a2a0a"; bdr = "#1a5c1a"; }
        return <button key={i} onClick={() => !done && setSel(i)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 6, background: bg, border: `1px solid ${bdr}`, borderRadius: 6, color: "#c8d6e0", cursor: done ? "default" : "pointer", fontSize: 14, fontFamily: "inherit" }}><span style={{ color: "#5a6a7a", marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>{o}</button>;
      })}
      {done && <div style={{ marginTop: 12, padding: "10px 14px", background: "#0c1426", borderRadius: 6, fontSize: 13, lineHeight: 1.6, color: "#8899aa" }}>{sel === correctIndex ? "✓ " : "✗ "}{explanation}</div>}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 12px", borderBottom: "1px solid #1e2a3a", color: "#5a6a7a", fontWeight: 600, letterSpacing: 0.5, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>{r.map((c, ci) => <td key={ci} style={{ textAlign: ci === 0 ? "left" : "right", padding: "8px 12px", borderBottom: "1px solid #0d1520", color: ci === 0 ? "#c8d6e0" : "#e0c97f", fontFamily: ci > 0 ? "'JetBrains Mono', monospace" : "inherit" }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function SidebarMock({ items, active, label }) {
  return (
    <div style={{ background: "#080c14", border: "1px solid #1a2030", borderRadius: 8, padding: "8px", width: 220, fontSize: 13 }}>
      {label && <div style={{ padding: "6px 10px", fontSize: 10, color: "#5a6a7a", letterSpacing: 1, fontWeight: 600 }}>{label}</div>}
      {items.map((item, i) => (
        <div key={i} style={{ padding: "7px 12px", borderRadius: 5, background: item === active ? "#111822" : "transparent", color: item === active ? "#e0c97f" : "#5a6a7a", border: item === active ? "1px solid #1e2a3a" : "1px solid transparent", marginBottom: 2, cursor: "default" }}>{item}</div>
      ))}
    </div>
  );
}

function P({ children }) { return <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>{children}</p>; }
function H2({ children }) { return <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24, letterSpacing: -0.3 }}>{children}</h2>; }
function H3({ children }) { return <h3 style={{ fontSize: 17, color: "#c8d6e0", margin: "28px 0 12px", fontWeight: 600 }}>{children}</h3>; }
function Strong({ children }) { return <strong style={{ color: "#e0c97f" }}>{children}</strong>; }

function FlowBox({ items, color = "#e0c97f" }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6, margin: "16px 0" }}>
    {items.map((item, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 6, padding: "8px 14px", fontSize: 13, color, fontWeight: 500, textAlign: "center", minWidth: 70 }}>{item}</div>{i < items.length - 1 && <span style={{ color: "#3a4a5a", fontSize: 18 }}>→</span>}</div>)}
  </div>;
}

// ═══════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════

function WelcomeModule() {
  return <div>
    <H2>PE Fundamentals + Maybern Platform Training</H2>
    <P>This training teaches two things simultaneously: how private equity fund accounting works from the ground up, and how each concept maps to the Maybern platform — the actual UI, navigation, workflows, and terminology you'll encounter.</P>
    <P>Every module has two layers. First, the PE concept in plain language with interactive calculators. Then, a <span style={{ color: "#e0c97f", borderBottom: "1px dashed #e0c97f40" }}>gold-bordered "In Maybern" section</span> showing exactly where that concept lives in the product — the sidebar location, the navigation path, the configuration options, and the workflow steps.</P>
    <MaybernUI nav="Example format">
      <P>Gold-bordered sections like this show Maybern-specific content — navigation paths, UI locations, workflow steps, and platform terminology. Watch for these throughout every module.</P>
    </MaybernUI>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, marginTop: 24 }}>
      <div style={{ fontSize: 12, color: "#e0c97f", fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>MODULE MAP</div>
      {Object.entries(SECTIONS).map(([key, label]) => (
        <div key={key} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#5a6a7a", letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>{label.toUpperCase()}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {MODULES.filter(m => m.section === key).map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8899aa" }}>
                <span style={{ color: "#e0c97f", width: 20 }}>{m.icon}</span>{m.title}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>;
}

function WhatIsPEModule() {
  return <div>
    <H2>What Is Private Equity?</H2>
    <P>Private equity is a way of investing in companies that aren't publicly traded. A PE firm raises money from large institutional investors (pension funds, endowments, sovereign wealth funds) and pools it into a <Strong>fund</Strong>. The fund buys companies, improves them, and sells them for a profit.</P>
    <Callout type="key">The core transaction: Raise money from investors → Buy companies → Improve them → Sell them → Return profits (keeping a cut for yourself).</Callout>
    <H3>Two Key Players</H3>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
      <div style={{ background: "#0d1117", border: "1px solid #1e3a5f", borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 13, color: "#4a8fcc", fontWeight: 600, marginBottom: 8 }}>GENERAL PARTNER (GP)</div>
        <div style={{ fontSize: 14, color: "#c8d6e0", lineHeight: 1.6 }}>The PE firm that manages the fund, finds deals, and makes investment decisions. Paid through management fees and <em>carried interest</em> (their share of profits).</div>
      </div>
      <div style={{ background: "#0d1117", border: "1px solid #5c3d00", borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 13, color: "#e0c97f", fontWeight: 600, marginBottom: 8 }}>LIMITED PARTNER (LP)</div>
        <div style={{ fontSize: 14, color: "#c8d6e0", lineHeight: 1.6 }}>The investors who commit capital but don't manage the fund. "Limited" in involvement and liability. They earn returns minus fees and the GP's profit share.</div>
      </div>
    </div>
    <H3>The "2 and 20" Model</H3>
    <P>Standard PE fee structure: a <Strong>2% annual management fee</Strong> (to run the fund) and <Strong>20% carried interest</Strong> (GP's share of profits above a hurdle rate). Both are configurable — we'll break down every piece in later modules.</P>
    <H3>The LPA: The Fund's Constitution</H3>
    <P>The <Strong>Limited Partnership Agreement (LPA)</Strong> is the legal document governing everything — fee rates, profit splits, investment restrictions, fund term. Every calculation traces back to the LPA.</P>
    <MaybernUI>
      <P>In Maybern, LPA terms are encoded as <Strong>fund family configuration</Strong>. Fee rates, waterfall structures, allocation rules, and reporting settings are all configured to match the LPA exactly. When someone says "check the LPA," in Maybern terms that means: check the fund family's configuration settings.</P>
      <NavPath steps={["Fund Family", "Configuration", "LPA Config"]} />
    </MaybernUI>
    <Quiz question="A pension fund invests $100M into a PE fund. Which role is the pension fund playing?" options={["General Partner (GP)", "Limited Partner (LP)", "Fund Administrator", "Portfolio Company"]} correctIndex={1} explanation="The pension fund is a Limited Partner — they provide capital but don't manage the fund." />
  </div>;
}

function FundStructureModule() {
  return <div>
    <H2>Fund Structure</H2>
    <P>A PE fund is a web of legal structures designed for tax efficiency, regulatory compliance, and investor flexibility. Understanding the entities matters because Maybern mirrors this exact structure.</P>
    <Table headers={["Entity Type", "What It Is", "Example"]} rows={[
      ["Fund Family", "Top-level grouping for all related funds", "Apex Capital Partners"],
      ["Main Fund LP", "Primary vehicle holding investments", "Apex Fund III LP"],
      ["GP Entity", "Management company running the fund", "Apex GP III LLC"],
      ["Parallel Fund", "Mirror fund for tax purposes", "Apex III Offshore LP"],
      ["Feeder Fund", "Aggregates smaller investors", "Apex III Feeder LP"],
      ["Blocker", "Entity for tax-exempt investors", "Apex III Blocker Corp"],
    ]} />
    <MaybernUI nav="Funds › [Fund Family] › Configuration › Fund Structure">
      <P>Maybern mirrors this structure exactly. When you create a fund family, you then create entities within it. Each entity has a <Strong>Functional Type</Strong>:</P>
      <Table headers={["Functional Type", "Purpose in Maybern"]} rows={[
        ["Fund", "Main fund LP, parallel funds, feeders, AIVs"],
        ["GP", "General Partner entity"],
        ["Investor", "LP entities that hold commitments"],
        ["Investment", "Portfolio companies the fund buys"],
        ["Lender", "Banks providing credit facilities"],
      ]} />
      <P>You also configure <Strong>Security Classes</Strong> (what investors actually own — LP Interests, Preferred Shares) and <Strong>Entity Relationships</Strong> (how money flows between structures).</P>
      <NavPath steps={["Fund Family", "Configuration", "Fund Structure", "Add Entity"]} />
    </MaybernUI>
    <Quiz question="Why does a fund family often have multiple entities?" options={["To confuse auditors", "For tax efficiency across investor types", "Each company needs its own fund", "To avoid fees"]} correctIndex={1} explanation="Different investor types have different tax requirements. Parallel and feeder structures accommodate everyone." />
  </div>;
}

function MaybernNavModule() {
  return <div>
    <H2>Navigating Maybern</H2>
    <P>Maybern has two levels of navigation you need to understand before anything else.</P>
    <H3>Level 1: Top Navigation Bar (Global)</H3>
    <P>The top nav is always visible and provides access across all fund families:</P>
    <div style={{ display: "flex", gap: 6, margin: "16px 0", flexWrap: "wrap" }}>
      {["Funds", "Entities", "Investors", "Events", "Reports", "Pivots"].map(item => (
        <div key={item} style={{ background: "#111822", border: "1px solid #1e2a3a", borderRadius: 6, padding: "8px 16px", fontSize: 13, color: "#c8d6e0" }}>{item}</div>
      ))}
    </div>
    <Table headers={["Section", "What You Do There"]} rows={[
      ["Funds", "Select a fund family to work in"],
      ["Entities", "View/manage ALL entities across fund families"],
      ["Investors", "View ALL investor relationships across funds"],
      ["Events", "See event log — capital calls, distributions, closings, fees"],
      ["Reports", "Transaction reports and saved templates"],
      ["Pivots", "Cross-tabulate data by any dimension"],
    ]} />

    <H3>Level 2: Fund Family Sidebar (Contextual)</H3>
    <P>When you click into a fund family, the left sidebar changes based on whether the fund is in <Strong>Setup mode</Strong> or <Strong>Live mode</Strong>.</P>
    <div style={{ display: "flex", gap: 20, margin: "16px 0", flexWrap: "wrap" }}>
      <SidebarMock label="SETUP MODE (DRAFT)" items={["Profile", "Dates", "Fund Structure", "Transactions", "Calculations", "Default Fees", "Default Waterfalls", "Classes"]} active="Fund Structure" />
      <SidebarMock label="LIVE MODE (ACTIVE)" items={["Summary", "Commitments", "Capital Activity", "Fees", "Investments", "Credit Facility", "Financial Reporting", "Configuration"]} active="Capital Activity" />
    </div>
    <Callout type="key">Setup mode lets you configure freely. Once you click "Complete Setup," the fund goes live and some settings become read-only. The sidebar completely changes to show operational sections.</Callout>

    <MaybernUI nav="Configuration submenu">
      <P>In live mode, <Strong>Configuration</Strong> expands to reveal:</P>
      <Table headers={["Item", "Purpose"]} rows={[
        ["LPA Config", "Fund dates and key terms"],
        ["Fund Structure", "Entity hierarchy"],
        ["Calculations", "Performance and accounting formulas"],
        ["Transaction Codes", "How transactions are categorized"],
        ["Notices", "Notice template configuration"],
        ["Credit Facility", "Credit facility settings"],
      ]} />
    </MaybernUI>

    <H3>Permissions</H3>
    <Table headers={["Role", "Can Do"]} rows={[
      ["View Only", "See data, no changes"],
      ["User", "Create and edit events"],
      ["Power", "Create, edit, approve, rollback events"],
      ["Admin", "Full access to all data and settings"],
    ]} />
    <Quiz question="You need to post a management fee charge. Where in Maybern do you go?" options={["Top nav → Reports", "Fund Family sidebar → Fees → Postings", "Top nav → Events", "Fund Family sidebar → Configuration"]} correctIndex={1} explanation="Fee posting happens within a specific fund family. Navigate to the fund, then Fees → Postings in the sidebar." />
  </div>;
}

function FundSetupModule() {
  return <div>
    <H2>Fund Setup in Maybern</H2>
    <P>Setting up a fund in Maybern follows a specific sequence. This module walks through the 16-step setup checklist — the order matters because later steps depend on earlier configuration.</P>

    <MaybernUI nav="Funds › Add Fund Family">
      <H3>The Setup Sequence</H3>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 13 }}>
        {[
          ["1", "Create Fund Family — name, target raise, target close date"],
          ["2", "Configure Fund Structure — entities, security classes, relationships"],
          ["3", "Enable/Disable Transaction Codes — what types of money movement you use"],
          ["4", "Configure Calculations — unfunded commitment, fee basis, waterfall tiers"],
          ["5", "Set Up Allocation Rules — how transactions split among investors"],
          ["6", "Configure Equalization — catch-up settings for subsequent closings"],
          ["7", "Configure Syndication Interest — (optional) interest between call and funding"],
          ["8", "Set Up Management Fees — rates, cadence, basis, methodology"],
          ["9", "Configure Rounding — precision for all calculations"],
          ["10", "Configure Waterfall — tiers, hurdle, carry, catch-up"],
          ["11", "Configure P&L — buckets, NAV calculations, reporting cadence"],
          ["12", "Create Investor Classes — groups with shared economic terms"],
          ["13", "Configure Performance — IRR, MOIC settings"],
          ["14", "Configure Integrations — GL connections, imports/exports"],
          ["15", "Add Investors — investor records and entities"],
          ["16", "Run First Closing — commitments, class assignments, finalize"],
        ].map(([num, desc]) => (
          <div key={num} style={{ display: "contents" }}>
            <span style={{ color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>{num}</span>
            <span style={{ color: "#c8d6e0" }}>{desc}</span>
          </div>
        ))}
      </div>
    </MaybernUI>

    <H3>Setup vs. Live Mode</H3>
    <Table headers={["Mode", "What You Can Do", "Ends When"]} rows={[
      ["Setup (Draft)", "Configure all fund settings freely", "You click 'Complete Setup'"],
      ["Live", "Process capital activity; limited config changes", "Fund termination"],
    ]} />
    <Callout type="warn">Some configuration becomes read-only after completing setup. Verify all settings before transitioning. Have your LPA ready — every configuration decision should match the fund documents.</Callout>

    <H3>The Configuration Hierarchy</H3>
    <P>Maybern uses inheritance so you set defaults once and override only where needed:</P>
    <FlowBox items={["Fund Family (defaults)", "Fund Entity (override)", "Investor Class (override)", "Commitment (most specific)"]} />
    <P>When calculating fees or running waterfalls, Maybern applies the most specific configuration that matches each commitment.</P>

    <Quiz question="You're setting up a new fund. What must you create before adding investor commitments?" options={["Reports and pivots", "Entities, transaction codes, allocation rules, and investor classes", "Only the fund family name", "Nothing — commitments can be added immediately"]} correctIndex={1} explanation="Commitments require entities to exist, transaction codes to be configured, allocation rules defined, and investor classes created. Follow the 16-step checklist in order." />
  </div>;
}

function EntitiesModule() {
  return <div>
    <H2>Entities & Structure</H2>
    <P>In PE, entities are the legal structures that make up a fund. In Maybern, entities are first-class objects that you create, configure, and track activity against.</P>
    <H3>PE Concept: Investor vs. Investor Entity</H3>
    <P>One <Strong>investor</Strong> (a person or organization) can have multiple <Strong>investor entities</Strong> (legal structures they invest through):</P>
    <Table headers={["Investor", "Investor Entity", "Why"]} rows={[
      ["Smith Family", "Smith Family Trust", "Main vehicle"],
      ["Smith Family", "Smith IRA LLC", "Retirement account"],
      ["Smith Family", "Smith Foundation", "Charitable entity — tax-exempt"],
    ]} />

    <MaybernUI nav="Top Nav › Entities">
      <P>In Maybern, you create <Strong>Investors</Strong> (the relationship) and <Strong>Investor Entities</Strong> (the legal structures) separately, then link them. This lets you track commitments by legal entity while reporting across all entities for one investor.</P>
      <H3>Creating an Investor Entity</H3>
      <NavPath steps={["Top Nav", "Entities", "Create Entity"]} />
      <P>Key fields when creating an investor entity:</P>
      <Table headers={["Field", "Why It Matters"]} rows={[
        ["Legal Name", "Must match fund documents exactly"],
        ["External ID", "Your internal identifier — used for imports/exports"],
        ["Is Foreign", "Affects withholding calculations and tax reporting"],
        ["Is Tax Exempt", "Different allocation treatment"],
        ["ERISA Investor", "Subject to plan asset rules"],
        ["Affiliated with Sponsor", "May have different fee treatment"],
      ]} />
      <Callout type="info">Set entity attributes correctly during creation. These flags affect tax withholding, allocation eligibility, and reporting downstream.</Callout>
    </MaybernUI>

    <Quiz question="An investor has both a Family Trust and an IRA LLC invested in the same fund. In Maybern, how is this represented?" options={["One investor entity with two commitments", "Two separate investors", "One investor linked to two investor entities, each with their own commitment", "A single commitment split between two entities"]} correctIndex={2} explanation="Maybern separates the investor (the relationship) from investor entities (legal structures). One investor can have multiple entities, each holding separate commitments with potentially different terms." />
  </div>;
}

function TxCodesModule() {
  return <div>
    <H2>Transaction Codes</H2>
    <H3>PE Concept</H3>
    <P>Every dollar moving through a fund has a category — is it a contribution for an investment? A management fee? A return of capital distribution? A realized gain? These categories determine how the money is treated in waterfalls, IRR calculations, NAV, and reporting.</P>

    <MaybernUI nav="Fund Family › Configuration › Transaction Codes">
      <P>In Maybern, <Strong>transaction codes</Strong> categorize every financial movement. Each code has <Strong>configuration flags</Strong> that control how transactions affect downstream calculations. This is one of the most important configuration steps.</P>
      <H3>Configuration Flags</H3>
      <Table headers={["Flag", "What It Controls"]} rows={[
        ["Affects Waterfall", "Does this transaction flow through carry calculations?"],
        ["Affects Gross IRR", "Include in gross performance? (Actual / Equalized / Blank)"],
        ["Affects Net IRR", "Include in net performance?"],
        ["Affects NAV", "Does this change the fund's net asset value?"],
        ["Should Get Equalized", "Should late-joining investors catch up on this?"],
        ["Is Recallable", "Can distributed capital be called back?"],
      ]} />
      <Callout type="key">A common configuration: Management fees have Affects Waterfall = Yes, Affects Gross IRR = Blank (excluded from gross), Affects Net IRR = Actual (included in net). This is how "gross vs. net" performance works — fees reduce net returns but not gross.</Callout>
      <H3>Configuration Hierarchy</H3>
      <P>Transaction code settings cascade through four levels:</P>
      <FlowBox items={["Fund Family", "Entity", "Investor Class", "Commitment"]} />
      <P>Most funds only need fund-family-level configuration. Use lower levels when specific investors need different treatment (e.g., ERISA investors excluded from certain codes).</P>
      <H3>Common Classifications</H3>
      <Table headers={["Classification", "Examples"]} rows={[
        ["Commitment", "Capital contributions for investment, fees, expenses"],
        ["Management Fee", "Fee charges, fee breaks, fee waivers"],
        ["Carried Interest", "GP profit sharing transactions"],
        ["Equalization", "Catch-up adjustments for later closes"],
        ["Bridge Financing", "Credit facility drawdowns and paydowns"],
      ]} />
    </MaybernUI>

    <Quiz question="A transaction code for 'Expense Reimbursement' should NOT affect the waterfall (it's a pass-through). How would you configure it?" options={["Affects Waterfall: Yes, Affects Gross IRR: Actual", "Affects Waterfall: No, Affects Gross IRR: Blank, Affects Net IRR: Actual", "Affects Waterfall: No, Affects Gross IRR: Actual", "Delete the transaction code"]} correctIndex={1} explanation="Expense reimbursements are pass-through — they shouldn't affect carry (waterfall: No) or gross returns (blank), but they DO affect what investors actually paid (net IRR: Actual)." />
  </div>;
}

function CommitmentsModule() {
  const [first, setFirst] = useState(500);
  const [second, setSecond] = useState(300);
  const total = first + second;

  return <div>
    <H2>Commitments & Closings</H2>
    <H3>PE Concept</H3>
    <P>A <Strong>commitment</Strong> is an investor's legally binding promise to provide capital when called. A <Strong>closing</Strong> is the event when new investors formally join. Funds have multiple closings over 12-18 months.</P>
    <Table headers={["Term", "Definition"]} rows={[
      ["Committed Capital", "Total amount promised"],
      ["Called Capital", "Amount actually drawn down"],
      ["Unfunded Commitment", "Committed minus Called"],
      ["Pro-Rata", "Proportional share based on commitment"],
    ]} />

    <H3>Interactive: Closing Math</H3>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="First Close" value={first} onChange={setFirst} min={100} max={800} step={50} format={v => fmt(v * 1e6)} />
      <Slider label="Second Close" value={second} onChange={setSecond} min={50} max={500} step={50} format={v => fmt(v * 1e6)} />
      <Table headers={["Metric", "Value"]} rows={[
        ["Total Fund Size", fmt(total * 1e6)],
        ["First Close Share", pct(first / total)],
        ["Second Close Share", pct(second / total)],
      ]} />
    </div>

    <H3>Equalization</H3>
    <P>If capital was called before the second close, new investors must "catch up" — pay their share of prior activity plus interest. This is <Strong>equalization</Strong>.</P>

    <MaybernUI nav="Fund Family › Commitments › Closings">
      <H3>Running a Closing in Maybern</H3>
      <NavPath steps={["Sidebar", "Commitments", "Closings", "New Closing"]} />
      <P>The closing workflow:</P>
      <FlowBox items={["Create Closing", "Add Commitments", "Review Allocation", "Review Equalization", "Review Fee True-up", "Finalize"]} />
      <P>For each commitment, you specify: <Strong>Investor</Strong>, <Strong>Amount</Strong>, <Strong>Fund</Strong>, <Strong>Investor Class</Strong>, and <Strong>Share Class</Strong>.</P>
      <Callout type="info">First close skips equalization and fee true-up steps (there's no prior activity to catch up on). Subsequent closings trigger both automatically.</Callout>
      <H3>Investor Classes</H3>
      <NavPath steps={["Configuration", "Classes", "Create Class"]} />
      <P>Each commitment belongs to exactly one <Strong>investor class</Strong>, which determines fee rates, waterfall terms, and transaction code behavior. Create a new class for each unique set of terms — even for one investor.</P>
    </MaybernUI>

    <Quiz question="What happens when you finalize a subsequent closing in Maybern?" options={["Nothing — just a record", "Equalization amounts are calculated, fee true-ups posted, commitments activated", "Investors immediately wire money", "The fund goes live"]} correctIndex={1} explanation="Finalizing a closing activates the new commitments, calculates equalization, and posts fee true-ups. The equalization still needs to be settled via a capital event." />
  </div>;
}

function CapitalCallsModule() {
  const [fund, setFund] = useState(1000);
  const [deal, setDeal] = useState(150);
  const perLP = deal / 5;

  return <div>
    <H2>Capital Calls</H2>
    <H3>PE Concept</H3>
    <P>When the GP buys a company, they issue a <Strong>capital call</Strong> — a notice telling each LP how much to wire and by when. The amount is based on pro-rata share of unfunded commitments.</P>
    <FlowBox items={["GP Finds Deal", "Capital Call Notice", "LPs Wire Funds", "Fund Acquires Company"]} />

    <H3>Interactive Calculator</H3>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="Fund Size" value={fund} onChange={setFund} min={200} max={2000} step={100} format={v => fmt(v * 1e6)} />
      <Slider label="Deal Size" value={deal} onChange={setDeal} min={25} max={500} step={25} format={v => fmt(v * 1e6)} />
      <Table headers={["LP", "Commitment", "Pro-Rata", "Called"]} rows={
        Array.from({ length: 5 }, (_, i) => [`LP ${String.fromCharCode(65 + i)}`, fmt(fund / 5 * 1e6), "20.0%", fmt(perLP * 1e6)])
      } />
    </div>

    <H3>Capital Call Uses</H3>
    <Table headers={["Use", "Description"]} rows={[
      ["Investment", "Buying a portfolio company"],
      ["Management Fees", "Quarterly fee charges"],
      ["Fund Expenses", "Legal, audit, admin costs"],
      ["Credit Facility Paydown", "Repaying the fund's credit line"],
    ]} />

    <MaybernUI nav="Fund Family › Capital Activity › Run Capital Event">
      <H3>Maybern's Event-Driven Model</H3>
      <P>This is the core concept. In Maybern, you record an <Strong>Event</Strong> (a capital call), the system applies <Strong>Allocation Rules</Strong>, and automatically generates <Strong>Transactions</Strong> for every investor.</P>
      <FlowBox items={["Record Event", "Apply Rules", "Generate Transactions", "Produce Notices"]} />
      <NavPath steps={["Sidebar", "Capital Activity", "Run Capital Event"]} />
      <P>When creating a capital event, you set:</P>
      <Table headers={["Field", "What It Is"]} rows={[
        ["Notice Date", "Date shown on investor notices"],
        ["Due Date", "Payment due date"],
        ["Call Uses", "What the capital is for (investment, fees, expenses)"],
        ["Allocation Rule", "How to split among investors (default: pro-rata)"],
      ]} />
      <P>Each call "use" gets a <Strong>transaction tag</Strong> — this is the transaction code classifying the activity. The transaction code's flags then determine how it flows through waterfalls, IRR, NAV, and equalization.</P>
      <Callout type="key">You don't calculate each investor's share manually. You enter the total call amount and the use, and Maybern allocates it automatically based on allocation rules. This is the fundamental difference from Excel.</Callout>
    </MaybernUI>

    <Quiz question="In Maybern, what happens when you record a $50M capital call event for investments?" options={["You manually calculate each investor's share", "The system auto-generates individual transactions per investor based on allocation rules", "An email is sent to investors", "Nothing — you run a separate calculation"]} correctIndex={1} explanation="Maybern's event-driven engine applies allocation rules and generates transactions automatically. No manual calculation needed." />
  </div>;
}

function MgmtFeesModule() {
  const [commitment, setCommitment] = useState(100);
  const [rate, setRate] = useState(2.0);
  const [days, setDays] = useState(90);
  const fee = commitment * 1e6 * (rate / 100) * (days / 360);

  return <div>
    <H2>Management Fees</H2>
    <H3>PE Concept</H3>
    <P>The management fee funds the GP's operations. It's calculated as:</P>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 16, margin: "16px 0", textAlign: "center", fontSize: 15, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>Fee = Fee Basis × Fee Rate × (Days in Period ÷ Days in Year)</div>

    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="Commitment (Fee Basis)" value={commitment} onChange={setCommitment} min={10} max={500} step={10} format={v => fmt(v * 1e6)} />
      <Slider label="Annual Rate" value={rate} onChange={setRate} min={0.5} max={3} step={0.25} format={v => `${v.toFixed(2)}%`} />
      <Slider label="Days in Period" value={days} onChange={setDays} min={30} max={365} format={v => `${v} days`} />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "#5a6a7a" }}>QUARTERLY FEE</div>
        <div style={{ fontSize: 28, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(fee)}</div>
      </div>
    </div>

    <H3>Fee Modifiers</H3>
    <Table headers={["Modifier", "What It Does"]} rows={[
      ["Fee Break", "Reduced rate for large LPs (negotiated in side letters)"],
      ["Fee Offset", "Fund expenses above a cap reduce fees"],
      ["Fee Waiver", "GP/employee commitments pay zero fees"],
      ["Fee True-up", "Adjustment when new investors join mid-period"],
    ]} />

    <MaybernUI nav="Fund Family › Fees">
      <H3>Fee Configuration in Maybern</H3>
      <P>Fees are configured during setup and managed in the Fees section of the live sidebar.</P>
      <NavPath steps={["Configuration", "Default Fees"]} />
      <Table headers={["Setting", "Options"]} rows={[
        ["Cadence", "Quarterly or Monthly"],
        ["Charge Timing", "In Advance or In Arrears"],
        ["Day Count", "30/360, Actual/360, Actual/365, Actual"],
        ["Basis Determination", "Locked at start, Locked at end, Average during period"],
        ["Fee Methodology", "Net Fees (reductions at call) or Gross Fees (separate)"],
      ]} />
      <H3>Fee Basis Hierarchy</H3>
      <P>The fee basis can change over the fund's life. Configured using <Strong>named date periods</Strong>:</P>
      <Table headers={["Period", "Fee Basis", "Typical Rate"]} rows={[
        ["Investment Period", "Committed Capital", "2.0%"],
        ["Harvest Period", "Invested Capital", "1.5%"],
      ]} />
      <H3>Fee Posting Workflow</H3>
      <NavPath steps={["Sidebar", "Fees", "Postings", "New Posting"]} />
      <FlowBox items={["Review Basis", "Calculate Gross", "Apply Breaks", "Apply Offsets", "Apply Waivers", "Post"]} />
      <P>Maybern calculates fees <em>separately for each commitment</em> — different investor classes get different rates automatically.</P>
    </MaybernUI>
    <Quiz question="An LP committed $200M at a 2% annual rate. What's their quarterly fee?" options={["$4M", "$2M", "$1M", "$400K"]} correctIndex={2} explanation="$200M × 2% = $4M annually. Quarterly = $4M ÷ 4 = $1M." />
  </div>;
}

function InvestmentsModule() {
  const [cost, setCost] = useState(100);
  const [fv, setFv] = useState(150);
  const gain = fv - cost;

  return <div>
    <H2>Investments & NAV</H2>
    <H3>PE Concept</H3>
    <P>Each portfolio company has a <Strong>cost basis</Strong> (what the fund paid) and a <Strong>fair value</Strong> (estimated current worth). The difference is unrealized gain or loss.</P>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="Cost Basis" value={cost} onChange={setCost} min={25} max={300} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Fair Value" value={fv} onChange={setFv} min={0} max={600} step={25} format={v => fmt(v * 1e6)} />
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 16 }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#5a6a7a" }}>UNREALIZED</div><div style={{ fontSize: 24, color: gain >= 0 ? "#4acc4a" : "#cc4a4a", fontFamily: "'JetBrains Mono', monospace" }}>{gain >= 0 ? "+" : ""}{fmt(gain * 1e6)}</div></div>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#5a6a7a" }}>MOIC</div><div style={{ fontSize: 24, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>{(fv / cost).toFixed(2)}x</div></div>
      </div>
    </div>
    <Callout type="key"><strong>Unrealized</strong> = still held (paper value). <strong>Realized</strong> = sold (actual cash). Only realized gains generate distributable cash.</Callout>
    <H3>NAV</H3>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 16, margin: "16px 0", textAlign: "center", fontSize: 14, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>NAV = Investments (fair value) + Cash − Liabilities − Accrued Fees</div>

    <MaybernUI nav="Fund Family › Investments">
      <P>Investments are managed in the <Strong>Investments</Strong> section of the sidebar. You create investment entities, record acquisitions, update valuations quarterly, and record exits.</P>
      <NavPath steps={["Sidebar", "Investments"]} />
      <P>NAV is configured through P&L buckets and custom NAV calculations:</P>
      <NavPath steps={["Configuration", "Calculations", "NAV Custom Calculations"]} />
      <P>Valuations feed into <Strong>hypothetical waterfalls</Strong> for carry accrual reporting each quarter.</P>
    </MaybernUI>
  </div>;
}

function DistributionsModule() {
  const [proceeds, setProceeds] = useState(200);
  const [cost, setCost] = useState(100);
  const roc = Math.min(proceeds, cost);
  const gain = Math.max(0, proceeds - cost);

  return <div>
    <H2>Distributions</H2>
    <H3>PE Concept</H3>
    <P>When the fund sells a company, proceeds are distributed back to investors. Distributions are categorized:</P>
    <Table headers={["Category", "Meaning"]} rows={[
      ["Return of Capital (ROC)", "Giving investors back their original investment"],
      ["Realized Gain", "Profit above cost basis"],
      ["Dividend / Income", "Cash flow from portfolio companies while held"],
      ["Carried Interest", "GP's share of profits"],
    ]} />

    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="Exit Proceeds" value={proceeds} onChange={setProceeds} min={25} max={500} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Cost Basis" value={cost} onChange={setCost} min={25} max={300} step={25} format={v => fmt(v * 1e6)} />
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <div style={{ flex: roc, background: "#1e3a5f", borderRadius: "6px 0 0 6px", padding: 12, minWidth: 60 }}>
          <div style={{ fontSize: 10, color: "#6a9acc" }}>ROC</div><div style={{ fontSize: 16, color: "#4a8fcc", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(roc * 1e6)}</div>
        </div>
        {gain > 0 && <div style={{ flex: gain, background: "#1a3a1a", borderRadius: "0 6px 6px 0", padding: 12, minWidth: 60 }}>
          <div style={{ fontSize: 10, color: "#6acc6a" }}>GAIN</div><div style={{ fontSize: 16, color: "#4acc4a", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(gain * 1e6)}</div>
        </div>}
      </div>
    </div>

    <MaybernUI nav="Fund Family › Capital Activity › Run Capital Event › Add Distribution">
      <P>Distributions are created within a <Strong>capital event</Strong> (same as capital calls — one event can include both).</P>
      <NavPath steps={["Sidebar", "Capital Activity", "Run Capital Event", "Add Distribution"]} />
      <P>The distribution workflow:</P>
      <FlowBox items={["Input Amounts", "Assign Transaction Tags", "Link to Investment", "Review Investor Breakdown", "Run Waterfall", "Finalize"]} />
      <P>After adding distribution amounts, you <Strong>Run Waterfall</Strong> to calculate the carry allocation across tiers. The waterfall determines how much goes to LPs vs. GP.</P>
      <Callout type="info">Maybern also supports <Strong>management fee holdback</Strong> (retaining distribution proceeds to cover future fees) and <Strong>tax withholding</Strong> (uploading per-investor withholding amounts).</Callout>
    </MaybernUI>
  </div>;
}

function WaterfallModule() {
  const [dist, setDist] = useState(200);
  const [contrib, setContrib] = useState(100);
  const [pref, setPref] = useState(8);
  const [carry, setCarry] = useState(20);

  const prefAmt = contrib * (pref / 100);
  let rem = dist;
  const rocA = Math.min(rem, contrib); rem -= rocA;
  const prefA = Math.min(rem, prefAmt); rem -= prefA;
  const gpTarget = (rocA + prefA) * (carry / 100) / (1 - carry / 100);
  const catchGP = Math.min(rem, gpTarget); rem -= catchGP;
  const splitLP = rem * (1 - carry / 100);
  const splitGP = rem * (carry / 100);

  return <div>
    <H2>The Waterfall</H2>
    <H3>PE Concept</H3>
    <P>The waterfall is the most important calculation in PE. It determines how distributable proceeds are split between LPs and GP across structured tiers. Money flows through each tier in order.</P>

    <H3>The Four Tiers (European Waterfall)</H3>
    <Table headers={["Tier", "Goes To", "Purpose"]} rows={[
      ["1. Return of Capital", "100% LP", "LPs get their money back first"],
      ["2. Preferred Return", "100% LP", "LPs earn minimum return (typically 8%)"],
      ["3. GP Catch-up", "80-100% GP", "GP catches up to carry percentage"],
      ["4. Final Split", "80/20 LP/GP", "Remaining profit split per LPA"],
    ]} />

    <H3>Interactive Waterfall</H3>
    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="Distributable Proceeds" value={dist} onChange={setDist} min={25} max={500} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Total Contributed" value={contrib} onChange={setContrib} min={25} max={300} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Preferred Return" value={pref} onChange={setPref} min={0} max={15} step={0.5} format={v => `${v}%`} />
      <Slider label="Carry %" value={carry} onChange={setCarry} min={10} max={30} step={5} format={v => `${v}%`} />
      <Table headers={["Tier", "Amount", "To LP", "To GP"]} rows={[
        ["1. ROC", fmt(rocA * 1e6), fmt(rocA * 1e6), "$0"],
        ["2. Pref Return", fmt(prefA * 1e6), fmt(prefA * 1e6), "$0"],
        ["3. GP Catch-up", fmt(catchGP * 1e6), "$0", fmt(catchGP * 1e6)],
        ["4. Final Split", fmt((splitLP + splitGP) * 1e6), fmt(splitLP * 1e6), fmt(splitGP * 1e6)],
        ["TOTAL", fmt(dist * 1e6), fmt((rocA + prefA + splitLP) * 1e6), fmt((catchGP + splitGP) * 1e6)],
      ]} />
    </div>

    <MaybernUI nav="Fund Family › Configuration › Default Waterfalls">
      <H3>Waterfall Configuration in Maybern</H3>
      <P>Waterfalls are configured during setup and can be overridden at the investor class level.</P>
      <NavPath steps={["Configuration", "Default Waterfalls"]} />
      <P>Maybern supports two waterfall engines:</P>
      <Table headers={["Engine", "How Tier Max Is Calculated", "Flexibility"]} rows={[
        ["Basic", "Built-in formulas driven by transaction code flags", "Limited — predefined options"],
        ["MXL (recommended)", "Custom MXL formula per tier", "Nearly unlimited — any calculation"],
      ]} />
      <Callout type="key">MXL waterfalls are the recommended approach for all new configurations. You write formulas for each tier using Maybern Expression Language — like "Excel for your database."</Callout>
      <H3>Running a Waterfall</H3>
      <NavPath steps={["Capital Activity", "Distribution Event", "Run Waterfall", "View Waterfall"]} />
      <P>After running, you see the ITD (inception-to-date) breakdown across all tiers. Every number has a full <Strong>audit trail</Strong> — click any value to see exactly which transactions fed into the calculation.</P>
      <H3>Audit Views</H3>
      <P>Maybern generates audit views showing: the top-level result, the MXL formula that produced it, and data tables at each transformation step. These can be exported to Excel.</P>
    </MaybernUI>

    <Quiz question="In a European waterfall, when does the GP start receiving carried interest?" options={["After each profitable exit", "After LPs get all contributed capital back PLUS preferred return", "At the end of each quarter", "After the first year"]} correctIndex={1} explanation="In a European (whole-fund) waterfall, carry only kicks in after LPs receive 100% of contributions AND the preferred return hurdle." />
  </div>;
}

function PerformanceModule() {
  const [inv, setInv] = useState(100);
  const [dist, setDist] = useState(160);
  const [unreal, setUnreal] = useState(40);
  const [yrs, setYrs] = useState(5);

  return <div>
    <H2>IRR & MOIC</H2>
    <H3>PE Concept</H3>
    <P><Strong>MOIC</Strong> = Total Value ÷ Capital Invested. A 2.0x means you doubled your money.</P>
    <P><Strong>IRR</Strong> = Annualized return accounting for <em>when</em> cash flows happen. A 2x in 3 years has a much higher IRR than a 2x in 10 years.</P>

    <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
      <Slider label="Invested" value={inv} onChange={setInv} min={25} max={300} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Distributed" value={dist} onChange={setDist} min={0} max={600} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Remaining Value" value={unreal} onChange={setUnreal} min={0} max={300} step={25} format={v => fmt(v * 1e6)} />
      <Slider label="Years" value={yrs} onChange={setYrs} min={1} max={12} format={v => `${v} yrs`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16, textAlign: "center" }}>
        {[
          { l: "DPI", v: (dist / inv).toFixed(2) + "x", s: "Distributions / Paid-In" },
          { l: "RVPI", v: (unreal / inv).toFixed(2) + "x", s: "Remaining Value / Paid-In" },
          { l: "TVPI", v: ((dist + unreal) / inv).toFixed(2) + "x", s: "Total Value / Paid-In" },
          { l: "≈ IRR", v: pct(Math.pow(dist / inv, 1 / yrs) - 1), s: "Approx. annualized" },
        ].map((m, i) => <div key={i}><div style={{ fontSize: 11, color: "#5a6a7a" }}>{m.l}</div><div style={{ fontSize: 20, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>{m.v}</div><div style={{ fontSize: 10, color: "#3a4a5a" }}>{m.s}</div></div>)}
      </div>
    </div>

    <MaybernUI nav="Fund Family › Financial Reporting › Performance Metrics">
      <P>Performance metrics in Maybern are configured during setup and driven by MXL formulas or transaction code flags.</P>
      <NavPath steps={["Configuration", "Calculations", "Performance"]} />
      <P>The IRR calculation in Maybern uses the <Strong>Affects Gross IRR</Strong> and <Strong>Affects Net IRR</Strong> flags on transaction codes. Each code specifies Actual (use transaction date), Equalized (use equalized date), or Blank (exclude).</P>
      <Callout type="info">Most contribution and distribution codes use "Equalized" so IRR reflects when capital was <em>economically deployed</em>, not when catch-up payments occurred for late-joining investors.</Callout>
    </MaybernUI>
  </div>;
}

function CreditFacilityModule() {
  return <div>
    <H2>Credit Facilities</H2>
    <H3>PE Concept</H3>
    <P>A <Strong>credit facility</Strong> (subscription line) is a loan backed by LP commitments. Instead of calling capital for every expense, the fund borrows from a bank and issues consolidated capital calls later.</P>
    <Table headers={["Term", "Definition"]} rows={[
      ["Drawdown", "Borrowing money from the credit line"],
      ["Paydown", "Repaying borrowed amount (usually via capital call)"],
      ["Borrowing Base", "Maximum borrowable — based on unfunded commitments"],
      ["Unused Fee", "Fee on the unused portion of the facility"],
    ]} />

    <MaybernUI nav="Fund Family › Credit Facility">
      <P>Credit facilities are configured during fund setup and managed in the Credit Facility section of the sidebar.</P>
      <NavPath steps={["Configuration", "Credit Facility"]} />
      <H3>Setup Steps</H3>
      <FlowBox items={["Create Lender Entity", "Create Interest Rate Calc", "Configure Commitments", "Configure Loan Terms"]} />
      <P>Key configuration:</P>
      <Table headers={["Setting", "What It Controls"]} rows={[
        ["Total Commitment", "Maximum borrowable amount"],
        ["Entities Party to Facility", "Which fund entities can borrow"],
        ["Interest Rate Calculation", "MXL formula (e.g., SOFR + spread)"],
        ["Day Count Methodology", "Actual/360, Actual/365, 30/360"],
        ["Min Drawdown / Paydown", "Minimum transaction amounts"],
      ]} />
      <P>Once configured, the <Strong>Credit Facility</Strong> section appears in the live sidebar showing drawdowns, paydowns, interest accrual, and borrowing base status.</P>
    </MaybernUI>
  </div>;
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

const CONTENT = { "welcome": WelcomeModule, "what-is-pe": WhatIsPEModule, "fund-structure": FundStructureModule, "maybern-nav": MaybernNavModule, "fund-setup": FundSetupModule, "entities": EntitiesModule, "tx-codes": TxCodesModule, "commitments": CommitmentsModule, "capital-calls": CapitalCallsModule, "mgmt-fees": MgmtFeesModule, "investments": InvestmentsModule, "distributions": DistributionsModule, "waterfalls": WaterfallModule, "performance": PerformanceModule, "credit-facility": CreditFacilityModule };

export default function App() {
  const [active, setActive] = useState("welcome");
  const [open, setOpen] = useState(true);
  const ref = useRef(null);
  const idx = MODULES.findIndex(m => m.id === active);
  const Content = CONTENT[active];
  const go = id => { setActive(id); ref.current?.scrollTo({ top: 0, behavior: "smooth" }); };

  let lastSection = "";

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Crimson Pro', Georgia, serif", background: "#080c14", color: "#c8d6e0", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: open ? 270 : 0, minWidth: open ? 270 : 0, background: "#0a0e18", borderRight: "1px solid #1a2030", transition: "all 0.2s", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #1a2030" }}>
          <div style={{ fontSize: 10, color: "#5a6a7a", letterSpacing: 2, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>PE + MAYBERN</div>
          <div style={{ fontSize: 15, color: "#e0c97f", marginTop: 2, fontWeight: 300 }}>Training Environment</div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
          {MODULES.map(m => {
            const showHeader = m.section !== lastSection;
            lastSection = m.section;
            return (
              <div key={m.id}>
                {showHeader && <div style={{ padding: "10px 12px 4px", fontSize: 10, color: "#3a4a5a", letterSpacing: 1, fontWeight: 600 }}>{SECTIONS[m.section].toUpperCase()}</div>}
                <button onClick={() => go(m.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 12px", marginBottom: 1, background: m.id === active ? "#111822" : "transparent", border: m.id === active ? "1px solid #1e2a3a" : "1px solid transparent", borderRadius: 5, color: m.id === active ? "#e0c97f" : "#5a6a7a", cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "all 0.15s" }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{m.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span>
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid #1a2030", fontSize: 11, color: "#3a4a5a" }}>{idx + 1} / {MODULES.length}</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: "1px solid #1a2030", background: "#0a0e18", flexShrink: 0 }}>
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "1px solid #1e2a3a", borderRadius: 4, color: "#5a6a7a", cursor: "pointer", padding: "3px 8px", fontSize: 14, fontFamily: "inherit" }}>☰</button>
          <div style={{ display: "flex", gap: 4 }}>
            {MODULES.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i <= idx ? "#e0c97f" : "#1e2a3a" }} />)}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => idx > 0 && go(MODULES[idx - 1].id)} disabled={idx === 0} style={{ background: "none", border: "1px solid #1e2a3a", borderRadius: 4, color: idx > 0 ? "#5a6a7a" : "#1e2a3a", cursor: idx > 0 ? "pointer" : "default", padding: "3px 10px", fontSize: 12, fontFamily: "inherit" }}>← Prev</button>
            <button onClick={() => idx < MODULES.length - 1 && go(MODULES[idx + 1].id)} disabled={idx === MODULES.length - 1} style={{ background: idx < MODULES.length - 1 ? "#1a2030" : "none", border: "1px solid #1e2a3a", borderRadius: 4, color: idx < MODULES.length - 1 ? "#e0c97f" : "#1e2a3a", cursor: idx < MODULES.length - 1 ? "pointer" : "default", padding: "3px 10px", fontSize: 12, fontFamily: "inherit" }}>Next →</button>
          </div>
        </div>
        <div ref={ref} style={{ flex: 1, overflow: "auto", padding: "28px 44px 80px", maxWidth: 800, width: "100%" }}>
          <Content />
        </div>
      </div>
    </div>
  );
}
