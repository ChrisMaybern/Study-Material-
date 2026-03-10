import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// PE FUNDAMENTALS — Interactive Training Environment
// ═══════════════════════════════════════════════════════════

const MODULES = [
  { id: "welcome", title: "Start Here", icon: "◈" },
  { id: "what-is-pe", title: "What Is PE?", icon: "①" },
  { id: "fund-structure", title: "Fund Structure", icon: "②" },
  { id: "fund-lifecycle", title: "Fund Lifecycle", icon: "③" },
  { id: "commitments", title: "Commitments & Closings", icon: "④" },
  { id: "capital-calls", title: "Capital Calls", icon: "⑤" },
  { id: "mgmt-fees", title: "Management Fees", icon: "⑥" },
  { id: "investments", title: "Investments & NAV", icon: "⑦" },
  { id: "distributions", title: "Distributions", icon: "⑧" },
  { id: "waterfalls", title: "The Waterfall", icon: "⑨" },
  { id: "performance", title: "IRR & MOIC", icon: "⑩" },
  { id: "maybern", title: "How Maybern Works", icon: "⑪" },
];

const fmt = (n) => {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const pct = (n) => `${(n * 100).toFixed(1)}%`;

// ── Shared Components ──────────────────────────────────────

function Callout({ type = "info", children }) {
  const colors = {
    info: { bg: "#0c1426", border: "#1e3a5f", icon: "ℹ" },
    key: { bg: "#1a0f00", border: "#5c3d00", icon: "★" },
    warn: { bg: "#1a0a0a", border: "#5c1a1a", icon: "⚠" },
    think: { bg: "#0a1a0a", border: "#1a5c1a", icon: "?" },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, padding: "14px 18px", borderRadius: "0 6px 6px 0", margin: "16px 0", fontSize: 14, lineHeight: 1.65 }}>
      <span style={{ marginRight: 8, opacity: 0.7 }}>{c.icon}</span>
      {children}
    </div>
  );
}

function InteractiveSlider({ label, value, onChange, min, max, step = 1, format = fmt }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: "#8899aa" }}>{label}</span>
        <span style={{ color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: "#e0c97f" }} />
    </div>
  );
}

function MiniQuiz({ question, options, correctIndex, explanation }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: 8, padding: 20, margin: "20px 0" }}>
      <div style={{ fontSize: 13, color: "#e0c97f", marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>CHECK YOUR UNDERSTANDING</div>
      <div style={{ fontSize: 15, marginBottom: 14, lineHeight: 1.5 }}>{question}</div>
      {options.map((opt, i) => {
        const isCorrect = i === correctIndex;
        const isSelected = i === selected;
        let bg = "#111822";
        let border = "#1e2a3a";
        if (answered && isSelected && isCorrect) { bg = "#0a2a0a"; border = "#1a5c1a"; }
        else if (answered && isSelected && !isCorrect) { bg = "#2a0a0a"; border = "#5c1a1a"; }
        else if (answered && isCorrect) { bg = "#0a2a0a"; border = "#1a5c1a"; }
        return (
          <button key={i} onClick={() => !answered && setSelected(i)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 6, background: bg, border: `1px solid ${border}`, borderRadius: 6, color: "#c8d6e0", cursor: answered ? "default" : "pointer", fontSize: 14, transition: "all 0.15s" }}>
            <span style={{ color: "#5a6a7a", marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>{opt}
          </button>
        );
      })}
      {answered && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#0c1426", borderRadius: 6, fontSize: 13, lineHeight: 1.6, color: "#8899aa" }}>
          {selected === correctIndex ? "✓ Correct. " : "✗ Not quite. "}{explanation}
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 12px", borderBottom: "1px solid #1e2a3a", color: "#5a6a7a", fontWeight: 600, letterSpacing: 0.5, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              {row.map((cell, ci) => <td key={ci} style={{ textAlign: ci === 0 ? "left" : "right", padding: "8px 12px", borderBottom: "1px solid #0d1520", color: ci === 0 ? "#c8d6e0" : "#e0c97f", fontFamily: ci > 0 ? "'JetBrains Mono', monospace" : "inherit", fontSize: ci > 0 ? 13 : 14 }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VisualDiagram({ children, caption }) {
  return (
    <div style={{ background: "#080c14", border: "1px solid #1a2030", borderRadius: 10, padding: "24px 20px 16px", margin: "20px 0", textAlign: "center" }}>
      {children}
      {caption && <div style={{ fontSize: 12, color: "#5a6a7a", marginTop: 12, fontStyle: "italic" }}>{caption}</div>}
    </div>
  );
}

function FlowBox({ items, color = "#e0c97f" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 6, padding: "8px 14px", fontSize: 13, color, fontWeight: 500, textAlign: "center", minWidth: 80 }}>{item}</div>
          {i < items.length - 1 && <span style={{ color: "#3a4a5a", fontSize: 18 }}>→</span>}
        </div>
      ))}
    </div>
  );
}

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", margin: "12px 0" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= current ? "#e0c97f" : "#1e2a3a", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MODULE CONTENT
// ═══════════════════════════════════════════════════════════

function WelcomeModule() {
  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 300, color: "#e0c97f", marginBottom: 8, letterSpacing: -0.5 }}>Private Equity Fund Accounting</h2>
      <h3 style={{ fontSize: 16, fontWeight: 400, color: "#5a6a7a", marginBottom: 32 }}>From zero to waterfall — an interactive guide</h3>
      <p style={{ lineHeight: 1.8, color: "#8899aa", marginBottom: 20 }}>
        This training assumes you know nothing about private equity, fund structures, or the calculations that power them. By the end, you'll understand every concept that Maybern automates — from how a fund is formed, to how investors commit capital, to how profits cascade through a waterfall distribution.
      </p>
      <p style={{ lineHeight: 1.8, color: "#8899aa", marginBottom: 20 }}>
        Each module builds on the last. Interactive calculators let you experiment with real numbers. Quizzes check your understanding before you move on.
      </p>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, marginTop: 24 }}>
        <div style={{ fontSize: 12, color: "#e0c97f", fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>WHAT YOU'LL LEARN</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {MODULES.slice(1).map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14, color: "#8899aa" }}>
              <span style={{ color: "#e0c97f", fontSize: 16, width: 24 }}>{m.icon}</span>{m.title}
            </div>
          ))}
        </div>
      </div>
      <Callout type="info">Navigate using the sidebar. Each module takes 5-10 minutes. Work through them in order for the best experience.</Callout>
    </div>
  );
}

function WhatIsPEModule() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>What Is Private Equity?</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Private equity is a way of investing in companies that aren't publicly traded on a stock exchange. Instead of buying shares of Apple on the NYSE, a PE firm buys entire companies (or large stakes in them), works to make them more valuable, and then sells them for a profit.
      </p>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        But PE firms don't use their own money. They raise money from large institutional investors — pension funds, endowments, sovereign wealth funds, wealthy individuals — and pool it into a <strong style={{ color: "#e0c97f" }}>fund</strong>.
      </p>

      <Callout type="key">
        The core transaction: Raise money from investors → Buy companies → Improve them → Sell them → Return profits to investors (keeping a cut for yourself).
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Two Key Players</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
        <div style={{ background: "#0d1117", border: "1px solid #1e3a5f", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#4a8fcc", fontWeight: 600, marginBottom: 8 }}>GENERAL PARTNER (GP)</div>
          <div style={{ fontSize: 14, color: "#c8d6e0", lineHeight: 1.6 }}>
            The PE firm. They manage the fund, find deals, operate the companies, and make investment decisions. They get paid through management fees and a share of profits called <em>carried interest</em>.
          </div>
        </div>
        <div style={{ background: "#0d1117", border: "1px solid #5c3d00", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#e0c97f", fontWeight: 600, marginBottom: 8 }}>LIMITED PARTNER (LP)</div>
          <div style={{ fontSize: 14, color: "#c8d6e0", lineHeight: 1.6 }}>
            The investors. They commit capital to the fund but don't manage it. They're "limited" in both their involvement and their liability. They earn returns on their investment minus fees and the GP's profit share.
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Why Not Just Buy Stocks?</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        PE funds aim for higher returns than public markets. The tradeoff: your money is locked up for 7-12 years, it's illiquid (you can't easily sell your position), and the fees are much higher. Institutional investors like pension funds allocate a percentage of their portfolio to PE because the long-term returns have historically outperformed public equities.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>The "2 and 20" Model</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The standard PE fee structure is "2 and 20" — a 2% annual management fee (to run the fund) and 20% carried interest (the GP's share of profits above a hurdle rate). We'll break down every piece of this in later modules.
      </p>

      <MiniQuiz
        question="A pension fund invests $100M into a PE fund. Which role is the pension fund playing?"
        options={["General Partner (GP)", "Limited Partner (LP)", "Fund Administrator", "Portfolio Company"]}
        correctIndex={1}
        explanation="The pension fund is a Limited Partner — they provide the capital but don't manage the fund. The PE firm is the General Partner."
      />
    </div>
  );
}

function FundStructureModule() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>Fund Structure</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        A PE fund isn't just one entity — it's a web of legal structures designed for tax efficiency, regulatory compliance, and investor flexibility. Here's how the pieces fit together.
      </p>

      <VisualDiagram caption="Simplified PE fund structure — money flows down, returns flow up">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
            <div style={{ background: "#1a0f00", border: "1px solid #5c3d00", borderRadius: 8, padding: "12px 20px", fontSize: 13, color: "#e0c97f" }}>LP₁ Pension Fund</div>
            <div style={{ background: "#1a0f00", border: "1px solid #5c3d00", borderRadius: 8, padding: "12px 20px", fontSize: 13, color: "#e0c97f" }}>LP₂ Endowment</div>
            <div style={{ background: "#1a0f00", border: "1px solid #5c3d00", borderRadius: 8, padding: "12px 20px", fontSize: 13, color: "#e0c97f" }}>LP₃ SWF</div>
          </div>
          <span style={{ color: "#3a4a5a", fontSize: 20 }}>↓ commitments ↓</span>
          <div style={{ background: "#0c1426", border: "2px solid #1e3a5f", borderRadius: 10, padding: "16px 32px", fontSize: 15, color: "#4a8fcc", fontWeight: 600 }}>Main Fund LP</div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ background: "#0a0f1a", border: "1px solid #1e2a3a", borderRadius: 6, padding: "8px 16px", fontSize: 12, color: "#5a6a7a" }}>GP Entity</div>
            <span style={{ color: "#3a4a5a" }}>manages →</span>
          </div>
          <span style={{ color: "#3a4a5a", fontSize: 20 }}>↓ invests ↓</span>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#4acc4a" }}>Company A</div>
            <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#4acc4a" }}>Company B</div>
            <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#4acc4a" }}>Company C</div>
          </div>
        </div>
      </VisualDiagram>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Key Entities</h3>
      <DataTable
        headers={["Entity", "What It Is", "Example"]}
        rows={[
          ["Fund Family", "The top-level grouping for all related funds", "Apex Capital Partners"],
          ["Main Fund LP", "The primary vehicle that holds investments", "Apex Fund III LP"],
          ["GP Entity", "The management company that runs the fund", "Apex GP III LLC"],
          ["Parallel Fund", "A mirror fund for specific investor types (tax)", "Apex Fund III Offshore LP"],
          ["Feeder Fund", "Aggregates smaller investors into the main fund", "Apex Fund III Feeder LP"],
          ["Co-Invest Vehicle", "One-off entity for a specific deal", "Apex Co-Invest (WidgetCo) LP"],
        ]}
      />

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>The LPA: The Fund's Constitution</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The <strong style={{ color: "#e0c97f" }}>Limited Partnership Agreement (LPA)</strong> is the legal document that governs everything — fee rates, profit splits, investment restrictions, reporting obligations, fund term, and extension rights. Every calculation in Maybern traces back to terms defined in the LPA.
      </p>

      <Callout type="key">
        When someone in fund accounting says "check the LPA," they mean: what did the legal documents say about how this should be calculated? The LPA is the single source of truth for every economic term.
      </Callout>

      <MiniQuiz
        question="Why does a fund family often have multiple entities (main fund, parallel, feeders)?"
        options={["To confuse auditors", "For tax efficiency and regulatory compliance across investor types", "Because each company needs its own fund", "To avoid management fees"]}
        correctIndex={1}
        explanation="Different investor types (US pensions, foreign sovereigns, tax-exempt endowments) have different tax and regulatory requirements. Parallel and feeder structures let them all participate in the same investments with appropriate tax treatment."
      />
    </div>
  );
}

function FundLifecycleModule() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>The Fund Lifecycle</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        A PE fund has a finite lifespan — typically 10-12 years. It goes through distinct phases, each with different activities and economics.
      </p>

      <VisualDiagram caption="Typical 10-year fund lifecycle">
        <div style={{ position: "relative", height: 120, margin: "0 10px" }}>
          {[
            { label: "Fundraising", start: 0, end: 15, color: "#5c3d00" },
            { label: "Investment Period", start: 10, end: 55, color: "#1e3a5f" },
            { label: "Harvest Period", start: 50, end: 90, color: "#1a3a1a" },
            { label: "Wind-down", start: 85, end: 100, color: "#3a1a1a" },
          ].map((phase, i) => (
            <div key={i} style={{ position: "absolute", left: `${phase.start}%`, width: `${phase.end - phase.start}%`, top: i * 28, height: 24, background: `${phase.color}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#c8d6e0", fontWeight: 500, border: `1px solid ${phase.color}` }}>
              {phase.label}
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a4a5a" }}>
            <span>Year 0</span><span>Year 3</span><span>Year 5</span><span>Year 7</span><span>Year 10</span>
          </div>
        </div>
      </VisualDiagram>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Phase 1: Fundraising (Years 0-2)</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The GP pitches institutional investors and raises <em>commitments</em> — promises to provide capital when called. The fund typically holds multiple <strong style={{ color: "#e0c97f" }}>closings</strong>: a first close (enough capital to start investing), followed by subsequent closes that bring in more investors. The fund doesn't receive all the money upfront — it "calls" capital as needed.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Phase 2: Investment Period (Years 1-5)</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The GP deploys capital by acquiring companies. Each acquisition triggers a <strong style={{ color: "#e0c97f" }}>capital call</strong> — a notice to LPs to wire their share of the purchase price. The GP charges management fees (typically 2% of committed capital) during this period.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Phase 3: Harvest Period (Years 5-10)</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The GP begins selling (or "exiting") portfolio companies and distributing proceeds back to LPs through a <strong style={{ color: "#e0c97f" }}>waterfall</strong> — a structured sequence that determines who gets paid first and how profits are split. Management fees typically step down (e.g., from 2% on committed capital to 1.5% on invested capital).
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Phase 4: Wind-down (Years 10-12)</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Final exits, final distributions, fund termination. The GP provides final accounting, and the fund is dissolved.
      </p>

      <MiniQuiz
        question="During the investment period, when an LP 'commits' $50M, how much money do they wire to the fund upfront?"
        options={["$50M — the full commitment", "$25M — half the commitment", "$0 — capital is called as needed for investments", "$10M — 20% as a deposit"]}
        correctIndex={2}
        explanation="Commitments are promises, not immediate payments. The GP 'calls' capital from LPs as investments are made. An LP might not have their full commitment called until several years into the fund."
      />
    </div>
  );
}

function CommitmentsModule() {
  const [firstClose, setFirstClose] = useState(500);
  const [secondClose, setSecondClose] = useState(300);
  const totalRaise = firstClose + secondClose;
  const lp1Share = firstClose / totalRaise;
  const lp2Share = secondClose / totalRaise;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>Commitments & Closings</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        A <strong style={{ color: "#e0c97f" }}>commitment</strong> is an investor's legally binding promise to provide capital when the fund calls for it. The total of all commitments is the fund's size.
      </p>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        A <strong style={{ color: "#e0c97f" }}>closing</strong> is the event when new investors formally join the fund. Funds typically have multiple closings over 12-18 months.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Closing Mechanics</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="First Close commitments" value={firstClose} onChange={setFirstClose} min={100} max={800} step={50} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Second Close commitments" value={secondClose} onChange={setSecondClose} min={50} max={500} step={50} format={(v) => fmt(v * 1e6)} />

        <div style={{ marginTop: 20 }}>
          <DataTable
            headers={["Metric", "Value"]}
            rows={[
              ["Total Fund Size", fmt(totalRaise * 1e6)],
              ["First Close Investors' Share", pct(lp1Share)],
              ["Second Close Investors' Share", pct(lp2Share)],
            ]}
          />
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Equalization: Catching Up New Investors</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        If the fund called capital between the first and second close, new investors in the second close must "catch up" — they pay their pro-rata share of prior activity plus interest. This is called <strong style={{ color: "#e0c97f" }}>equalization</strong>. It ensures all investors are in the same economic position regardless of when they joined.
      </p>

      <Callout type="think">
        Think of it like joining a dinner party after the appetizers have been ordered. You still owe your share of the appetizers — plus maybe a little interest for being late.
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Key Terms</h3>
      <DataTable
        headers={["Term", "Definition"]}
        rows={[
          ["Committed Capital", "Total amount an investor promised to the fund"],
          ["Called Capital", "Amount actually drawn down so far"],
          ["Unfunded Commitment", "Committed minus Called — what's still available to call"],
          ["Pro-Rata", "Proportional share based on commitment size"],
        ]}
      />

      <MiniQuiz
        question="A $1B fund has called $200M so far. LP Alpha committed $100M. What is LP Alpha's unfunded commitment?"
        options={["$100M", "$80M", "$20M", "$0"]}
        correctIndex={1}
        explanation="LP Alpha committed $100M. The fund called 20% ($200M / $1B). LP Alpha's share of that call is $20M (20% × $100M). Unfunded = $100M - $20M = $80M."
      />
    </div>
  );
}

function CapitalCallsModule() {
  const [fundSize, setFundSize] = useState(1000);
  const [dealSize, setDealSize] = useState(150);
  const [numLPs, setNumLPs] = useState(5);
  const perLP = dealSize / numLPs;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>Capital Calls</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        When the GP finds a company to buy, they issue a <strong style={{ color: "#e0c97f" }}>capital call</strong> — a formal notice telling each LP how much to wire and when. The amount each LP owes is based on their <em>pro-rata share</em> of the fund.
      </p>

      <FlowBox items={["GP Finds Deal", "Capital Call Notice", "LPs Wire Funds", "Fund Acquires Company"]} />

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Capital Call Calculator</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="Fund Size (total commitments)" value={fundSize} onChange={setFundSize} min={200} max={2000} step={100} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Deal Size (acquisition cost)" value={dealSize} onChange={setDealSize} min={25} max={500} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Number of Equal LPs" value={numLPs} onChange={setNumLPs} min={2} max={10} format={(v) => `${v} LPs`} />

        <div style={{ marginTop: 16 }}>
          <DataTable
            headers={["LP", "Commitment", "Pro-Rata %", "Capital Called"]}
            rows={Array.from({ length: numLPs }, (_, i) => [
              `LP ${String.fromCharCode(65 + i)}`,
              fmt((fundSize / numLPs) * 1e6),
              pct(1 / numLPs),
              fmt(perLP * 1e6),
            ])}
          />
          <div style={{ textAlign: "right", fontSize: 13, color: "#5a6a7a", marginTop: 8 }}>
            Total Called: <span style={{ color: "#e0c97f" }}>{fmt(dealSize * 1e6)}</span> ({pct(dealSize / fundSize)} of commitments)
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Capital Call Uses</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Capital calls aren't just for buying companies. A single call might fund:
      </p>
      <DataTable
        headers={["Use", "Description"]}
        rows={[
          ["Investment", "To buy a portfolio company"],
          ["Management Fees", "Quarterly fees owed to the GP"],
          ["Fund Expenses", "Legal, audit, admin costs"],
          ["Credit Facility Paydown", "Repaying the fund's credit line"],
        ]}
      />

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Credit Facilities: The Short-Term Bridge</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Many funds have a <strong style={{ color: "#e0c97f" }}>credit facility</strong> (subscription line) — a loan backed by LP commitments. Instead of calling capital for every small expense, the fund borrows from a bank and then issues a consolidated capital call later. This smooths operations and avoids sending LPs a notice every week.
      </p>

      <MiniQuiz
        question="Why might a fund use a credit facility instead of calling capital directly from LPs?"
        options={["To avoid paying management fees", "To consolidate multiple small expenses into fewer capital calls", "Because LPs refuse to pay", "To reduce the fund size"]}
        correctIndex={1}
        explanation="Credit facilities let the fund borrow short-term and then repay via fewer, larger capital calls. This is more efficient for LPs and the GP — nobody wants to wire $50K for a legal bill every other week."
      />
    </div>
  );
}

function MgmtFeesModule() {
  const [commitment, setCommitment] = useState(100);
  const [feeRate, setFeeRate] = useState(2.0);
  const [days, setDays] = useState(90);
  const fee = commitment * 1e6 * (feeRate / 100) * (days / 360);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>Management Fees</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The management fee is how the GP funds the operations of the firm — salaries, office rent, travel, due diligence costs. It's typically charged quarterly and funded via capital calls.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>The Formula</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
          Fee = Fee Basis × Fee Rate × (Days in Period ÷ Days in Year)
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Fee Calculator</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="Commitment (Fee Basis)" value={commitment} onChange={setCommitment} min={10} max={500} step={10} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Annual Fee Rate" value={feeRate} onChange={setFeeRate} min={0.5} max={3.0} step={0.25} format={(v) => `${v.toFixed(2)}%`} />
        <InteractiveSlider label="Days in Period" value={days} onChange={setDays} min={30} max={365} step={1} format={(v) => `${v} days`} />
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#5a6a7a", marginBottom: 4 }}>FEE FOR THIS PERIOD</div>
          <div style={{ fontSize: 28, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(fee)}</div>
          <div style={{ fontSize: 12, color: "#5a6a7a", marginTop: 4 }}>
            {fmt(commitment * 1e6)} × {feeRate}% × {days}/360
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Fee Basis Changes Over Time</h3>
      <DataTable
        headers={["Period", "Fee Basis", "Typical Rate"]}
        rows={[
          ["Investment Period (Years 1-5)", "Committed Capital", "2.0%"],
          ["Harvest Period (Years 5-10)", "Invested Capital or NAV", "1.5%"],
        ]}
      />
      <Callout type="info">
        The fee basis often shifts from "committed capital" to "invested capital" after the investment period ends. Since invested capital shrinks as exits happen, fees naturally decrease over the fund's life.
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Fee Modifiers</h3>
      <DataTable
        headers={["Modifier", "What It Does"]}
        rows={[
          ["Fee Break", "Reduced rate for large LPs (e.g., $50M+ gets 1.75% instead of 2%)"],
          ["Fee Offset", "Fund expenses above a cap reduce fees owed"],
          ["Fee Waiver", "GP/employee commitments may pay zero fees"],
          ["Fee True-up", "Adjustment when new investors join mid-period"],
        ]}
      />

      <MiniQuiz
        question="An LP committed $200M to a fund with a 2% annual management fee. What is their quarterly fee during the investment period?"
        options={["$4M", "$2M", "$1M", "$400K"]}
        correctIndex={2}
        explanation="$200M × 2% = $4M annually. Quarterly = $4M ÷ 4 = $1M. (Or more precisely: $200M × 0.02 × 90/360 = $1M.)"
      />
    </div>
  );
}

function InvestmentsModule() {
  const [costBasis, setCostBasis] = useState(100);
  const [fairValue, setFairValue] = useState(150);
  const unrealizedGain = fairValue - costBasis;
  const moic = fairValue / costBasis;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>Investments & NAV</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The fund's portfolio consists of the companies it has acquired. Each investment has a <strong style={{ color: "#e0c97f" }}>cost basis</strong> (what the fund paid) and a <strong style={{ color: "#e0c97f" }}>fair value</strong> (what it's estimated to be worth today).
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Unrealized vs. Realized</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="Cost Basis (what we paid)" value={costBasis} onChange={setCostBasis} min={25} max={300} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Current Fair Value" value={fairValue} onChange={setFairValue} min={0} max={600} step={25} format={(v) => fmt(v * 1e6)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20, textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#5a6a7a", marginBottom: 4 }}>UNREALIZED GAIN/LOSS</div>
            <div style={{ fontSize: 22, color: unrealizedGain >= 0 ? "#4acc4a" : "#cc4a4a", fontFamily: "'JetBrains Mono', monospace" }}>{unrealizedGain >= 0 ? "+" : ""}{fmt(unrealizedGain * 1e6)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#5a6a7a", marginBottom: 4 }}>GROSS MOIC</div>
            <div style={{ fontSize: 22, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>{moic.toFixed(2)}x</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#5a6a7a", marginBottom: 4 }}>STATUS</div>
            <div style={{ fontSize: 22, color: "#4a8fcc" }}>Unrealized</div>
          </div>
        </div>
      </div>

      <Callout type="key">
        <strong>Unrealized</strong> = the investment is still held (paper gain/loss). <strong>Realized</strong> = the investment has been sold (actual cash). Only realized gains generate distributable cash.
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Net Asset Value (NAV)</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The fund's <strong style={{ color: "#e0c97f" }}>NAV</strong> is the total value of all its assets minus liabilities. It's reported quarterly and is the basis for performance reporting.
      </p>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>
          NAV = Investments (at fair value) + Cash − Liabilities − Accrued Fees
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Valuations: Who Decides Fair Value?</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Quarterly, the GP's deal teams estimate fair values for each portfolio company using comparable transactions, discounted cash flows, or earnings multiples. These valuations drive NAV, carry accruals, and performance metrics. They're typically reviewed by auditors annually.
      </p>

      <MiniQuiz
        question="A fund owns Company X (cost: $50M, fair value: $120M) and Company Y (cost: $80M, fair value: $60M). What is the total unrealized gain/loss?"
        options={["+$50M (only Company X counts)", "+$70M gain on X, -$20M loss on Y = +$50M net", "-$20M (only losses matter)", "+$120M"]}
        correctIndex={1}
        explanation="Total unrealized = ($120M - $50M) + ($60M - $80M) = $70M + (-$20M) = $50M net unrealized gain. Both gains and losses are tracked."
      />
    </div>
  );
}

function DistributionsModule() {
  const [exitProceeds, setExitProceeds] = useState(200);
  const [costBasis, setCostBasis] = useState(100);
  const roc = Math.min(exitProceeds, costBasis);
  const gain = Math.max(0, exitProceeds - costBasis);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>Distributions</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        When the fund sells a company, the proceeds are distributed back to investors. But it's not just "divide by headcount." Distributions are categorized and flow through a structured <em>waterfall</em>.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Types of Distribution</h3>
      <DataTable
        headers={["Category", "What It Means"]}
        rows={[
          ["Return of Capital (ROC)", "Giving investors back the money they put in"],
          ["Realized Gain", "Profit above the cost basis"],
          ["Dividend / Income", "Cash flow from portfolio companies while held"],
          ["Carried Interest", "GP's share of profits (after hurdle is met)"],
        ]}
      />

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Distribution Breakdown</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="Exit Proceeds (sale price)" value={exitProceeds} onChange={setExitProceeds} min={25} max={500} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Cost Basis (what we paid)" value={costBasis} onChange={setCostBasis} min={25} max={300} step={25} format={(v) => fmt(v * 1e6)} />
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          <div style={{ flex: roc, background: "#1e3a5f", borderRadius: "6px 0 0 6px", padding: "14px 12px", minWidth: 60, transition: "flex 0.3s" }}>
            <div style={{ fontSize: 10, color: "#6a9acc", letterSpacing: 0.5 }}>ROC</div>
            <div style={{ fontSize: 16, color: "#4a8fcc", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(roc * 1e6)}</div>
          </div>
          {gain > 0 && (
            <div style={{ flex: gain, background: "#1a3a1a", borderRadius: "0 6px 6px 0", padding: "14px 12px", minWidth: 60, transition: "flex 0.3s" }}>
              <div style={{ fontSize: 10, color: "#6acc6a", letterSpacing: 0.5 }}>GAIN</div>
              <div style={{ fontSize: 16, color: "#4acc4a", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(gain * 1e6)}</div>
            </div>
          )}
          {exitProceeds < costBasis && (
            <div style={{ position: "absolute", right: 24, fontSize: 12, color: "#cc4a4a" }}>
              Loss: {fmt((costBasis - exitProceeds) * 1e6)}
            </div>
          )}
        </div>
        {exitProceeds < costBasis && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#cc4a4a" }}>
            Loss of {fmt((costBasis - exitProceeds) * 1e6)} — investors don't get all their capital back from this deal.
          </div>
        )}
      </div>

      <Callout type="info">
        Distributions are allocated to investors based on their pro-rata share — the same way capital calls work, but in reverse. Each investor gets their proportional piece of the pie.
      </Callout>

      <MiniQuiz
        question="A fund sells Company A for $300M. The cost basis was $120M. How much is 'Return of Capital' and how much is 'Realized Gain'?"
        options={["ROC: $300M, Gain: $0", "ROC: $120M, Gain: $180M", "ROC: $150M, Gain: $150M", "ROC: $0, Gain: $300M"]}
        correctIndex={1}
        explanation="Return of Capital = the original investment ($120M). Realized Gain = what's above that ($300M - $120M = $180M). LPs get their money back first, then share in the profits."
      />
    </div>
  );
}

function WaterfallModule() {
  const [distributable, setDistributable] = useState(200);
  const [totalContributed, setTotalContributed] = useState(100);
  const [prefRate, setPrefRate] = useState(8);
  const [catchupPct, setCatchupPct] = useState(100);
  const [carryPct, setCarryPct] = useState(20);

  const prefAmount = totalContributed * (prefRate / 100);
  const totalROCandPref = totalContributed + prefAmount;

  let remaining = distributable;
  const rocActual = Math.min(remaining, totalContributed);
  remaining -= rocActual;

  const prefActual = Math.min(remaining, prefAmount);
  remaining -= prefActual;

  const gpTargetCarry = (rocActual + prefActual) * (carryPct / 100) / (1 - carryPct / 100);
  const catchupLP = 0;
  const catchupGP = Math.min(remaining, gpTargetCarry) * (catchupPct / 100);
  remaining -= catchupGP;

  const splitLP = remaining * (1 - carryPct / 100);
  const splitGP = remaining * (carryPct / 100);

  const totalLP = rocActual + prefActual + splitLP;
  const totalGP = catchupGP + splitGP;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>The Waterfall</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        The waterfall is the most important calculation in PE fund accounting. It determines how distributable proceeds are split between LPs and the GP across structured tiers. Money "falls" through each tier in order — a tier must be fully satisfied before the next one begins.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>The Four Tiers (European Waterfall)</h3>

      <VisualDiagram caption="Proceeds flow through each tier top to bottom — like a waterfall">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {[
            { tier: "Tier 1: Return of Capital", split: "100% → LP", color: "#1e3a5f", desc: "LPs get their money back first" },
            { tier: "Tier 2: Preferred Return", split: "100% → LP", color: "#1e3a5f", desc: "LPs earn a minimum return (typically 8%)" },
            { tier: "Tier 3: GP Catch-up", split: "80-100% → GP", color: "#3a1e00", desc: "GP catches up to their carry %" },
            { tier: "Tier 4: Final Split", split: "80% LP / 20% GP", color: "#1a2a1a", desc: "Remaining profit split per the LPA" },
          ].map((t, i) => (
            <div key={i} style={{ width: "100%", maxWidth: 420, background: t.color, borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#c8d6e0", fontWeight: 600 }}>{t.tier}</div>
                <div style={{ fontSize: 11, color: "#5a6a7a" }}>{t.desc}</div>
              </div>
              <div style={{ fontSize: 12, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace", textAlign: "right", minWidth: 100 }}>{t.split}</div>
            </div>
          ))}
        </div>
      </VisualDiagram>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Waterfall Calculator</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="Distributable Proceeds" value={distributable} onChange={setDistributable} min={25} max={500} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Total Contributed Capital" value={totalContributed} onChange={setTotalContributed} min={25} max={300} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Preferred Return Rate" value={prefRate} onChange={setPrefRate} min={0} max={15} step={0.5} format={(v) => `${v}%`} />
        <InteractiveSlider label="Carry Percentage" value={carryPct} onChange={setCarryPct} min={10} max={30} step={5} format={(v) => `${v}%`} />

        <div style={{ marginTop: 20 }}>
          <DataTable
            headers={["Tier", "Amount", "To LP", "To GP"]}
            rows={[
              ["1. Return of Capital", fmt(rocActual * 1e6), fmt(rocActual * 1e6), "$0"],
              ["2. Preferred Return", fmt(prefActual * 1e6), fmt(prefActual * 1e6), "$0"],
              ["3. GP Catch-up", fmt(catchupGP * 1e6), "$0", fmt(catchupGP * 1e6)],
              ["4. Final Split", fmt((splitLP + splitGP) * 1e6), fmt(splitLP * 1e6), fmt(splitGP * 1e6)],
              ["TOTAL", fmt(distributable * 1e6), fmt(totalLP * 1e6), fmt(totalGP * 1e6)],
            ]}
          />
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>European vs. American Waterfalls</h3>
      <DataTable
        headers={["Feature", "European (Whole-Fund)", "American (Deal-by-Deal)"]}
        rows={[
          ["Carry calculated on", "Entire fund's performance", "Each deal individually"],
          ["GP gets carry when", "After ALL capital is returned", "After EACH profitable deal"],
          ["Risk to LP", "Lower — fund-level hurdle", "Higher — GP may get carry on early wins"],
          ["Clawback needed", "Rarely", "Often (if later deals lose money)"],
        ]}
      />

      <Callout type="key">
        The waterfall is the calculation that matters most in fund accounting. Every dollar that flows through it touches every stakeholder. Getting it wrong means LPs get the wrong distributions, the GP gets the wrong carry, and someone has to explain it. This is the core problem Maybern solves.
      </Callout>

      <MiniQuiz
        question="In a European waterfall, when does the GP start receiving carried interest?"
        options={["After each profitable investment is sold", "After LPs have received all their contributed capital back PLUS the preferred return", "At the end of each quarter", "After the first year"]}
        correctIndex={1}
        explanation="In a European (whole-fund) waterfall, carry only kicks in after LPs have received 100% of contributed capital AND their preferred return (typically 8%). This is the 'hurdle' the GP must clear."
      />
    </div>
  );
}

function PerformanceModule() {
  const [invested, setInvested] = useState(100);
  const [returned, setReturned] = useState(160);
  const [years, setYears] = useState(5);
  const [unrealized, setUnrealized] = useState(40);

  const moic = returned / invested;
  const tvpi = (returned + unrealized) / invested;
  const dpi = returned / invested;
  const approxIRR = Math.pow(returned / invested, 1 / years) - 1;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>IRR & MOIC</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Performance metrics tell investors how well the fund is doing. The two most important are <strong style={{ color: "#e0c97f" }}>IRR</strong> (Internal Rate of Return) and <strong style={{ color: "#e0c97f" }}>MOIC</strong> (Multiple on Invested Capital).
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>MOIC: How Many Times Your Money</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 20, margin: "16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>MOIC = Total Value Returned ÷ Total Capital Invested</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#5a6a7a" }}>A 2.0x MOIC means you doubled your money. A 3.0x means you tripled it.</div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>IRR: Annualized Return (Time Matters)</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 20, margin: "16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#c8d6e0", lineHeight: 1.8 }}>
          IRR accounts for <strong style={{ color: "#e0c97f" }}>when</strong> cash flows happen. A 2x return in 3 years is a much better IRR than a 2x in 10 years. IRR is solved by finding the discount rate that makes the NPV of all cash flows equal zero.
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Interactive: Performance Calculator</h3>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 24, margin: "16px 0" }}>
        <InteractiveSlider label="Total Invested" value={invested} onChange={setInvested} min={25} max={300} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Total Distributed (realized)" value={returned} onChange={setReturned} min={0} max={600} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Remaining Value (unrealized)" value={unrealized} onChange={setUnrealized} min={0} max={300} step={25} format={(v) => fmt(v * 1e6)} />
        <InteractiveSlider label="Years" value={years} onChange={setYears} min={1} max={12} format={(v) => `${v} years`} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginTop: 20, textAlign: "center" }}>
          {[
            { label: "DPI", value: dpi.toFixed(2) + "x", sub: "Distributions to Paid-In" },
            { label: "RVPI", value: (unrealized / invested).toFixed(2) + "x", sub: "Remaining Value to Paid-In" },
            { label: "TVPI", value: tvpi.toFixed(2) + "x", sub: "Total Value to Paid-In" },
            { label: "≈ IRR", value: pct(approxIRR), sub: "Approximate (simplified)" },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: "#5a6a7a", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, color: "#e0c97f", fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "#3a4a5a", marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="info">
        <strong>TVPI = DPI + RVPI.</strong> DPI measures what's been actually distributed (cash in hand). RVPI measures what's still held (paper value). Investors care most about DPI because it's real money.
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Gross vs. Net</h3>
      <DataTable
        headers={["Metric", "Gross", "Net"]}
        rows={[
          ["What it includes", "Returns before fees & carry", "Returns after fees & carry"],
          ["Who cares", "GP (tracks deal quality)", "LP (tracks actual return)"],
          ["Typically higher?", "Yes — always", "No — this is what LPs actually earn"],
        ]}
      />

      <MiniQuiz
        question="A fund invested $200M, distributed $300M, and still holds investments worth $100M. What is the TVPI?"
        options={["1.5x", "2.0x", "3.0x", "1.0x"]}
        correctIndex={1}
        explanation="TVPI = ($300M distributed + $100M remaining) ÷ $200M invested = $400M ÷ $200M = 2.0x"
      />
    </div>
  );
}

function MaybernModule() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: "#e0c97f", marginBottom: 24 }}>How Maybern Works</h2>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Everything you've learned in this training — commitments, capital calls, fees, waterfalls, performance metrics — traditionally lives in <strong style={{ color: "#cc4a4a" }}>Excel spreadsheets</strong>. Massive, fragile, person-dependent Excel files where one wrong formula can misallocate millions.
      </p>

      <Callout type="warn">
        The status quo at most PE firms: a senior accountant maintains a master Excel workbook. When they leave, the firm has to reverse-engineer the logic. When something breaks, unwinding takes days. When an LP asks "show me how my carry was calculated," someone rebuilds the math from scratch.
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Maybern's Architecture: Event → Rules → Transactions</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Maybern is an <strong style={{ color: "#e0c97f" }}>event-driven system</strong>. Instead of manually calculating everything in a spreadsheet, you record <em>what happened</em> (an event), and the system automatically generates all the correct financial transactions.
      </p>

      <FlowBox items={["Record Event", "Apply Rules", "Generate Transactions", "Produce Reports"]} />

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>What Maybern Automates</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
        {[
          { title: "Capital Activity", desc: "Capital calls, distributions, and equalizations allocated across the fund structure automatically" },
          { title: "Management Fees", desc: "Fee basis, fee breaks, offsets, waivers, true-ups — all calculated per commitment" },
          { title: "Waterfall Distributions", desc: "European, American, or hybrid waterfalls with full audit trail" },
          { title: "Credit Facilities", desc: "Drawdowns, paydowns, interest accrual, borrowing base calculations" },
          { title: "Performance Metrics", desc: "IRR, MOIC, TVPI, DPI — gross and net — at every level" },
          { title: "Investor Reporting", desc: "Notices, capital account statements, NAV reports, and custom analytics" },
        ].map((item, i) => (
          <div key={i} style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 13, color: "#e0c97f", fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#8899aa", lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>MXL: The Formula Engine</h3>
      <p style={{ lineHeight: 1.8, color: "#c8d6e0", marginBottom: 16 }}>
        Maybern Expression Language (MXL) is like "Excel for your database." Instead of formulas referencing cells, MXL formulas reference transaction data, investor records, and fund configuration. Every waterfall tier, fee calculation, and performance metric can be defined in MXL.
      </p>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>The Key Insight</h3>
      <Callout type="key">
        Maybern replaces the logic layer between your General Ledger (system of record) and your Investor Portal (system of communication). It replaces the Excel files where waterfall logic, fee calculations, and allocation rules currently live — with a governed, auditable, event-driven calculation engine.
      </Callout>

      <h3 style={{ fontSize: 18, color: "#c8d6e0", margin: "28px 0 12px" }}>Why It Matters</h3>
      <DataTable
        headers={["Dimension", "Excel / Status Quo", "Maybern"]}
        rows={[
          ["Auditability", "Trace a formula through nested tabs", "Every number links to the event that created it"],
          ["Key-Person Risk", "2 people understand the waterfall file", "Logic is in the system, not someone's head"],
          ["Scalability", "New fund = clone and pray", "Configure once, run across all funds"],
          ["Error Correction", "Unwind and rebuild manually", "Roll back an event, system recalculates"],
          ["LP Transparency", "Rebuild the math per request", "Drill down from any number in real time"],
        ]}
      />

      <MiniQuiz
        question="In Maybern's event-driven architecture, what happens when you record a $50M capital call event?"
        options={[
          "You manually calculate each investor's share and enter it",
          "The system automatically generates individual transactions for each investor based on allocation rules",
          "An email is sent to investors",
          "Nothing — you have to run a separate calculation"
        ]}
        correctIndex={1}
        explanation="When you record an event (like a capital call), Maybern's engine automatically applies the fund's allocation rules to generate the correct transactions for every investor. No manual calculation needed."
      />

      <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 10, padding: 24, marginTop: 32, textAlign: "center" }}>
        <div style={{ fontSize: 20, color: "#4acc4a", marginBottom: 8 }}>✓ Training Complete</div>
        <div style={{ fontSize: 14, color: "#8899aa", lineHeight: 1.6 }}>
          You now understand the fundamentals of PE fund accounting — from fund formation through waterfall distributions. Each concept maps directly to a feature in Maybern. Go back to any module to review or experiment with the calculators.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

const MODULE_MAP = {
  "welcome": WelcomeModule,
  "what-is-pe": WhatIsPEModule,
  "fund-structure": FundStructureModule,
  "fund-lifecycle": FundLifecycleModule,
  "commitments": CommitmentsModule,
  "capital-calls": CapitalCallsModule,
  "mgmt-fees": MgmtFeesModule,
  "investments": InvestmentsModule,
  "distributions": DistributionsModule,
  "waterfalls": WaterfallModule,
  "performance": PerformanceModule,
  "maybern": MaybernModule,
};

export default function App() {
  const [activeModule, setActiveModule] = useState("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef(null);

  const currentIndex = MODULES.findIndex((m) => m.id === activeModule);
  const ActiveContent = MODULE_MAP[activeModule];

  const goTo = (id) => {
    setActiveModule(id);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Crimson Pro', 'Georgia', serif", background: "#080c14", color: "#c8d6e0", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 260 : 0, minWidth: sidebarOpen ? 260 : 0, background: "#0a0e18", borderRight: "1px solid #1a2030", transition: "all 0.2s", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #1a2030" }}>
          <div style={{ fontSize: 11, color: "#5a6a7a", letterSpacing: 2, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>PE FUNDAMENTALS</div>
          <div style={{ fontSize: 16, color: "#e0c97f", marginTop: 4, fontWeight: 300 }}>Training Environment</div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "12px 8px" }}>
          {MODULES.map((m, i) => {
            const isActive = m.id === activeModule;
            return (
              <button key={m.id} onClick={() => goTo(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 2, background: isActive ? "#111822" : "transparent", border: isActive ? "1px solid #1e2a3a" : "1px solid transparent", borderRadius: 6, color: isActive ? "#e0c97f" : "#5a6a7a", cursor: "pointer", fontSize: 14, transition: "all 0.15s", fontFamily: "inherit" }}>
                <span style={{ fontSize: 15, width: 22, textAlign: "center", flexShrink: 0 }}>{m.icon}</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</span>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #1a2030", fontSize: 11, color: "#3a4a5a" }}>
          {currentIndex + 1} of {MODULES.length} modules
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #1a2030", background: "#0a0e18", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "1px solid #1e2a3a", borderRadius: 4, color: "#5a6a7a", cursor: "pointer", padding: "4px 8px", fontSize: 14, fontFamily: "inherit" }}>☰</button>
            <ProgressDots total={MODULES.length} current={currentIndex} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => currentIndex > 0 && goTo(MODULES[currentIndex - 1].id)} disabled={currentIndex === 0} style={{ background: "none", border: "1px solid #1e2a3a", borderRadius: 4, color: currentIndex > 0 ? "#5a6a7a" : "#1e2a3a", cursor: currentIndex > 0 ? "pointer" : "default", padding: "4px 12px", fontSize: 13, fontFamily: "inherit" }}>← Prev</button>
            <button onClick={() => currentIndex < MODULES.length - 1 && goTo(MODULES[currentIndex + 1].id)} disabled={currentIndex === MODULES.length - 1} style={{ background: currentIndex < MODULES.length - 1 ? "#1a2030" : "none", border: "1px solid #1e2a3a", borderRadius: 4, color: currentIndex < MODULES.length - 1 ? "#e0c97f" : "#1e2a3a", cursor: currentIndex < MODULES.length - 1 ? "pointer" : "default", padding: "4px 12px", fontSize: 13, fontFamily: "inherit" }}>Next →</button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "32px 48px 80px", maxWidth: 780, width: "100%" }}>
          <ActiveContent />
        </div>
      </div>
    </div>
  );
}
