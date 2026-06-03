const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, LevelFormat, TabStopType
} = require('docx');
const fs = require('fs');

// ── Design tokens ──────────────────────────────────────────
const NAVY    = "0D1B2A";
const BLUE    = "1B4F8A";
const BLUE2   = "2E75B6";
const LBLUE   = "D6E8F7";
const ACCENT  = "B7292A";
const GRAY    = "F4F7FB";
const WHITE   = "FFFFFF";
const INK     = "1A1A2E";
const MID     = "4A5568";

// ── Borders & helpers ──────────────────────────────────────
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "C4CDD8" };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder    = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders   = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function hdr(text, level = 1) {
  const cfg = {
    1: { size: 36, color: NAVY, before: 440, after: 180, outlineLevel: 0, borderColor: BLUE2, borderSize: 8 },
    2: { size: 28, color: BLUE,  before: 300, after: 120, outlineLevel: 1, borderColor: null },
    3: { size: 24, color: BLUE2, before: 220, after: 90,  outlineLevel: 2, borderColor: null },
  }[level];
  const border = cfg.borderColor
    ? { bottom: { style: BorderStyle.SINGLE, size: cfg.borderSize, color: cfg.borderColor, space: 6 } }
    : undefined;
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: cfg.before, after: cfg.after },
    ...(border ? { border } : {}),
    children: [new TextRun({ text, bold: true, size: cfg.size, color: cfg.color, font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: opts.before || 80, after: opts.after || 140, line: 320 },
    children: [new TextRun({
      text, font: "Arial",
      size: opts.size || 22,
      color: opts.color || INK,
      bold: opts.bold || false,
      italics: opts.italic || false
    })]
  });
}

function b(text, level = 0) {
  const refs = ["bullets", "sub"];
  return new Paragraph({
    numbering: { reference: refs[level], level: 0 },
    spacing: { before: 55, after: 55 },
    children: [new TextRun({ text, size: 22, color: INK, font: "Arial" })]
  });
}

function n(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, color: INK, font: "Arial" })]
  });
}

function sp(n2 = 1) {
  return new Paragraph({ spacing: { before: 0, after: 140 * n2 }, children: [new TextRun({ text: "", size: 4 })] });
}

function pb() { return new Paragraph({ children: [new PageBreak()] }); }

function hCell(text, w) {
  return new TableCell({
    borders: cellBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 19, color: WHITE, font: "Arial" })] })]
  });
}

function dCell(text, w, shade = false, bold = false, color = INK) {
  return new TableCell({
    borders: cellBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: shade ? GRAY : WHITE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, color, bold, font: "Arial" })] })]
  });
}

function callout(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    shading: { fill: LBLUE, type: ShadingType.CLEAR },
    spacing: { before: 140, after: 140 },
    indent: { left: 360, right: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: BLUE2, space: 8 } },
    children: [new TextRun({ text, size: 22, color: NAVY, bold: true, italics: true, font: "Arial" })]
  });
}

function userStory(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    shading: { fill: GRAY, type: ShadingType.CLEAR },
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    children: [new TextRun({ text, size: 21, color: INK, italics: true, font: "Arial" })]
  });
}

// ───────────────────────────────────────────────
// DOCUMENT
// ───────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets",  levels: [{ level: 0, format: LevelFormat.BULLET,  text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720,  hanging: 360 } } } }] },
      { reference: "sub",      levels: [{ level: 0, format: LevelFormat.BULLET,  text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers",  levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720,  hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: INK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 440, after: 180 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: BLUE2 },
        paragraph: { spacing: { before: 220, after: 90 }, outlineLevel: 2 } },
    ]
  },
  sections: [

    // ══════════════════ COVER ══════════════════
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        sp(2),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, shading: { fill: NAVY, type: ShadingType.CLEAR }, children: [new TextRun({ text: " ", size: 4 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, shading: { fill: NAVY, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "COMPANY BRAIN", bold: true, size: 80, color: WHITE, font: "Arial" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, shading: { fill: NAVY, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "The Institutional Memory Engine for Modern Organizations", size: 32, color: LBLUE, italics: true, font: "Arial" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, shading: { fill: NAVY, type: ShadingType.CLEAR }, children: [new TextRun({ text: " ", size: 4 })] }),
        sp(2),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 6 } },
          children: [new TextRun({ text: "PRODUCT REQUIREMENTS DOCUMENT", bold: true, size: 30, color: BLUE2, font: "Arial" })] }),
        sp(2),
        new Table({
          width: { size: 6240, type: WidthType.DXA },
          columnWidths: [2400, 3840],
          rows: [
            new TableRow({ children: [ dCell("Document Type", 2400, true, true, BLUE), dCell("Product Requirements Document (PRD)", 3840) ] }),
            new TableRow({ children: [ dCell("Project",       2400, true, true, BLUE), dCell("Company Brain — Institutional Memory Engine", 3840) ] }),
            new TableRow({ children: [ dCell("Context",       2400, true, true, BLUE), dCell("OpenAI x Outskill AI Builders Hackathon", 3840) ] }),
            new TableRow({ children: [ dCell("Prepared by",   2400, true, true, BLUE), dCell("Krishil Agrawal", 3840) ] }),
            new TableRow({ children: [ dCell("Version",       2400, true, true, BLUE), dCell("1.0 — Final", 3840) ] }),
            new TableRow({ children: [ dCell("Classification",2400, true, true, BLUE), dCell("Confidential — Hackathon Submission", 3840) ] }),
          ]
        }),
        sp(4),
        callout("\"Modern organizations don't have a data problem. They have a memory problem.\""),
        pb()
      ]
    },

    // ══════════════════ MAIN BODY ══════════════════
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1260, left: 1440 } } },
      headers: {
        default: new Header({ children: [
          new Paragraph({ alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE2, space: 4 } },
            spacing: { after: 60 },
            children: [new TextRun({ text: "COMPANY BRAIN  |  Product Requirements Document  |  CONFIDENTIAL", size: 18, color: MID, font: "Arial" })]
          })
        ]})
      },
      footers: {
        default: new Footer({ children: [
          new Paragraph({ alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLUE2, space: 4 } },
            spacing: { before: 60 },
            children: [new TextRun({ text: "Krishil Agrawal  |  OpenAI x Outskill AI Builders Hackathon  |  Company Brain PRD", size: 18, color: MID, font: "Arial" })]
          })
        ]})
      },
      children: [

        // ─── 1. EXECUTIVE SUMMARY ──────────────────────────────
        hdr("1. EXECUTIVE SUMMARY"),
        hdr("1.1 Vision", 2),
        p("Company Brain is a purpose-built institutional memory infrastructure layer for modern, knowledge-intensive organizations. Its vision is to become the persistent cognitive substrate through which enterprises understand their own history, reconstruct their reasoning, and make decisions that are informed by everything they have collectively learned — across every tool, every team, and every point in time."),
        p("At the most fundamental level, Company Brain solves a problem that has grown invisibly alongside the explosion of enterprise software: as organizations adopt more tools, generate more information, and scale more rapidly, the organizational intelligence required to navigate that complexity becomes increasingly fragmented, stale, and inaccessible. Company Brain addresses this not as a search improvement, but as a new category of infrastructure — institutional memory infrastructure — that sits beneath all AI-native enterprise operations."),
        hdr("1.2 Why Now", 2),
        p("Three converging macro forces create an optimal launch window for Company Brain. First, the widespread adoption of large language models has shifted enterprise AI from novelty to operational expectation — organizations now expect AI systems to be deeply integrated with their proprietary knowledge, not just general world knowledge. Second, the normalization of distributed and asynchronous work since 2020 has dramatically accelerated knowledge fragmentation across tools and time zones, creating an acute, felt pain point that every enterprise team member experiences daily. Third, recent advances in retrieval-augmented generation (RAG), vector databases, and multi-modal embedding models now make it technically feasible to build an institutional memory system of this sophistication at hackathon pace — a capability threshold that simply did not exist eighteen months ago."),
        hdr("1.3 Strategic Opportunity", 2),
        p("The global enterprise knowledge management market is projected to reach $1.1 trillion by 2030 (Grand View Research). Within this market, no incumbent product addresses the institutional memory problem at the infrastructure level. Existing tools — Glean, Guru, Sana, Notion AI — are retrieval augmentations or wiki-centric tools that do not provide temporal intelligence, organizational reasoning reconstruction, or permission-aware cross-platform memory synthesis. Company Brain is not competing for a slice of an existing market. It is creating a new category."),
        hdr("1.4 Market Significance", 2),
        p("McKinsey estimates that knowledge workers spend 1.8 hours per day — 9.3 hours per week — searching for information. For a 500-person organization, this represents over 4,600 hours of productivity loss weekly, at an approximate annual cost of $18 million per organization at average fully-loaded knowledge worker rates. This loss is not a technology problem — organizations have more technology than ever. It is a memory architecture problem, and Company Brain is the solution."),
        sp(), pb(),

        // ─── 2. PROBLEM STATEMENT ──────────────────────────────
        hdr("2. PROBLEM STATEMENT"),
        hdr("2.1 Organizational Memory Fragmentation", 2),
        p("The modern enterprise operates across a fragmented landscape of specialized software tools. The average company deploys 254 SaaS applications (Okta, Business at Work 2023). Each application maintains its own data store, its own search index, and its own access model. There is no cross-platform semantic layer. There is no system that knows what all of these applications collectively know."),
        p("Enterprise Example: An engineering team at a Series B SaaS company makes a critical architectural decision to adopt a microservices pattern over a monolith. This decision is debated in a Slack thread, documented in a Notion page, reflected in a GitHub PR description, tracked as a Linear epic, and referenced in a Google Doc design document. Eighteen months later, a new VP of Engineering joins and asks why the company chose microservices. No single tool can answer this question. The knowledge lives across five systems, in fragments, with no system capable of synthesizing them into a coherent account."),
        hdr("2.2 Context Loss and Knowledge Decay", 2),
        p("Organizational knowledge is not static. It decays. A pricing strategy documented two years ago may have been superseded by three subsequent market entries. An API contract documented in a GitHub issue may have been deprecated in a PR description six months later. A sales playbook stored in a shared Drive folder may have been partially updated, leaving a dangerous mixture of current and outdated guidance that is indistinguishable to a reader without deep organizational context."),
        p("No existing enterprise system reasons about the temporal confidence of retrieved information. When a user queries a legacy knowledge management system and receives a result, they have no automated mechanism to assess whether the retrieved knowledge reflects the current state of the world or a state from eighteen months ago. This temporal blindness produces decisions based on stale intelligence, with no warning that the intelligence may have decayed."),
        hdr("2.3 Search Inefficiency", 2),
        p("Enterprise search tools surface documents. They do not surface institutional intelligence. When an employee searches for information about a past strategic decision, they receive links to documents that may or may not contain the relevant content. They must then open each document, read its contents, assess its relevance and freshness, cross-reference it with other documents, and synthesize a coherent picture manually. This process is slow, incomplete, and cognitively expensive."),
        p("Enterprise Example: A product manager preparing for a board presentation on competitive positioning needs to understand what the company knew about Competitor X eighteen months ago, what changed, and what the current strategic thesis is. To reconstruct this requires searching Slack, Notion, email, and Google Drive independently, interviewing colleagues, and spending multiple hours synthesizing a picture that a properly designed institutional memory system should be able to produce in seconds."),
        hdr("2.4 Institutional Intelligence Loss", 2),
        p("When a tenured employee leaves an organization, they take with them not just explicit knowledge but the organizational reasoning that makes that knowledge meaningful. They remember why decisions were made, not just what decisions were made. They know which approaches were considered and rejected, and why. They understand the informal relationships and political context that shaped organizational choices. This tacit, contextual intelligence is almost never captured in any documentation system, and is lost permanently upon departure."),
        p("According to Deloitte, organizations lose between 30% and 85% of role-specific institutional knowledge when a tenured employee departs. For organizations with 20%+ annual turnover — common in high-growth technology companies — this represents a continuous, compounding erosion of organizational intelligence that no existing tool is designed to address."),
        sp(), pb(),

        // ─── 3. PRODUCT VISION ──────────────────────────────────
        hdr("3. PRODUCT VISION"),
        callout("\"Company Brain becomes the Memory Infrastructure Layer for AI-Native Enterprises — the persistent cognitive substrate through which organizations understand their own history, reconstruct their reasoning, and make intelligence-informed decisions at every scale.\""),
        sp(),
        hdr("3.1 Future-State Transformation", 2),
        p("In the near term (Year 1–2), Company Brain transforms how individual knowledge workers access institutional intelligence. Instead of spending 1.8 hours per day searching for information across disconnected tools, they interact with a single, unified memory interface that synthesizes knowledge from all enterprise sources, reasons about its freshness, enforces their access permissions, and delivers citation-backed answers in seconds."),
        p("In the medium term (Year 3–4), Company Brain transforms how organizations manage their institutional knowledge as a strategic asset. Rather than passively losing knowledge through tool sprawl and employee attrition, organizations actively maintain and audit their institutional memory through Company Brain's knowledge health dashboard, decay detection alerts, and organizational context graph."),
        p("In the long term (Year 5+), Company Brain becomes infrastructure. It is embedded in every AI agent workflow across the enterprise, providing the persistent memory layer that allows AI agents to operate with full organizational context. It is to AI-native enterprises what cloud storage is to cloud-native enterprises: foundational, invisible, and indispensable. Organizations will no longer think about deploying Company Brain any more than they think about deploying S3 — it will simply be the memory layer that everything else depends on."),
        hdr("3.2 Category Definition", 2),
        p("Company Brain defines and leads a new product category: Institutional Memory Infrastructure. This category sits at the intersection of enterprise search, knowledge management, and AI-native infrastructure, but is none of these things. It is a new layer of the enterprise software stack — the memory layer — that exists above the data layer and below the application layer, providing all enterprise AI systems with the organizational context they need to operate effectively."),
        sp(), pb(),

        // ─── 4. PRODUCT GOALS ──────────────────────────────────
        hdr("4. PRODUCT GOALS"),
        hdr("4.1 Primary Goals (Hackathon MVP Scope)", 2),
        n("Build a functional, demo-ready institutional memory retrieval system with connectors to at least three enterprise platforms (GitHub, Slack, Notion/Google Drive)."),
        n("Implement permission-aware retrieval that enforces enterprise access controls at query time, with zero cross-permission data leakage."),
        n("Demonstrate temporal intelligence through a knowledge decay detection and confidence scoring model applied to all retrieved results."),
        n("Deliver citation-backed responses for every query, surfacing the source document, author, timestamp, and platform for every retrieved knowledge fragment."),
        n("Create a compelling, technically credible demonstration that communicates the full value proposition within a five-minute judging window."),
        sp(),
        hdr("4.2 Secondary Goals", 2),
        n("Implement a lightweight organizational context graph that maps relationships between knowledge artifacts, people, and decisions."),
        n("Build cross-platform memory synthesis capability that generates coherent responses drawing from multiple enterprise sources simultaneously."),
        n("Develop a clean, professional query UI that demonstrates enterprise product quality and design sensibility."),
        n("Produce architecture documentation and technical diagrams that support deep technical scrutiny from expert judges."),
        sp(),
        hdr("4.3 Long-Term Goals", 2),
        n("Establish Company Brain as the institutional memory infrastructure standard for AI-native organizations globally."),
        n("Build a connector ecosystem covering the top 25 enterprise platforms used by knowledge-intensive organizations."),
        n("Develop proprietary temporal reasoning algorithms that represent a defensible, long-term technical moat."),
        n("Achieve SOC 2 Type II and ISO 27001 certification to unlock enterprise sales channels in regulated industries."),
        n("Create network effects through organizational context graphs that become more valuable as organizational complexity grows over time."),
        sp(), pb(),

        // ─── 5. USER PERSONAS ──────────────────────────────────
        hdr("5. USER PERSONAS"),
        hdr("5.1 Engineering Teams", 2),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
          new TableRow({ children: [ hCell("Dimension", 2340), hCell("Detail", 7020) ] }),
          new TableRow({ children: [ dCell("Pain Points", 2340, true, true, BLUE), dCell("Cannot retrieve architectural decision history; rediscover solved problems; onboard to legacy codebases; lack visibility into why deprecated patterns exist; lose hours searching GitHub, Slack, and Confluence for context.", 7020) ] }),
          new TableRow({ children: [ dCell("Current Workflow", 2340, true, true, BLUE), dCell("Manual search across GitHub PR descriptions, Slack channel history, Confluence pages, and Linear tickets. Ask senior engineers. Read outdated wikis. Accept incomplete context as the cost of doing business.", 7020) ] }),
          new TableRow({ children: [ dCell("Desired Outcomes", 2340, true, true, BLUE), dCell("Instant retrieval of architectural reasoning with citations from GitHub, Slack, and documentation. Temporal confidence scores that prevent reliance on outdated decisions. Onboarding acceleration through on-demand institutional context.", 7020) ] }),
        ]}),
        sp(),
        hdr("5.2 Product Managers", 2),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
          new TableRow({ children: [ hCell("Dimension", 2340), hCell("Detail", 7020) ] }),
          new TableRow({ children: [ dCell("Pain Points", 2340, true, true, BLUE), dCell("Cannot reconstruct why product decisions were made. Lose strategic context during roadmap transitions. Struggle to maintain continuity when team composition changes. Cannot efficiently brief new stakeholders on prior decisions.", 7020) ] }),
          new TableRow({ children: [ dCell("Current Workflow", 2340, true, true, BLUE), dCell("Maintain personal notes and decision logs. Rely on colleagues who were present for past decisions. Search Notion, Linear, and email manually. Frequently re-litigate decisions that were already made.", 7020) ] }),
          new TableRow({ children: [ dCell("Desired Outcomes", 2340, true, true, BLUE), dCell("Cross-platform retrieval of product decision history with full reasoning context. Automated detection of knowledge staleness for roadmap assumptions. Rapid onboarding capability for incoming PMs joining mid-cycle.", 7020) ] }),
        ]}),
        sp(),
        hdr("5.3 Executive Leadership", 2),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
          new TableRow({ children: [ hCell("Dimension", 2340), hCell("Detail", 7020) ] }),
          new TableRow({ children: [ dCell("Pain Points", 2340, true, true, BLUE), dCell("Cannot get authoritative, traceable answers to strategic questions. Board preparation requires manual aggregation across teams. Due diligence processes are painful, slow, and incomplete. Decision accountability is difficult to establish retroactively.", 7020) ] }),
          new TableRow({ children: [ dCell("Current Workflow", 2340, true, true, BLUE), dCell("Commission manual reports from department heads. Hold preparatory review meetings. Rely on institutional knowledge of long-tenured executives who may be unavailable or have departed.", 7020) ] }),
          new TableRow({ children: [ dCell("Desired Outcomes", 2340, true, true, BLUE), dCell("Executive-grade query interface with citation-backed, temporally aware responses. Complete strategic decision audit trails. Regulatory documentation support for compliance obligations. Accelerated board and investor preparation.", 7020) ] }),
        ]}),
        sp(),
        hdr("5.4 Sales Teams", 2),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
          new TableRow({ children: [ hCell("Dimension", 2340), hCell("Detail", 7020) ] }),
          new TableRow({ children: [ dCell("Pain Points", 2340, true, true, BLUE), dCell("Cannot access institutional knowledge about past customer conversations, lost deals, competitor encounters, or pricing decisions. Repeat discovery work on known accounts. Lose deal context when account ownership transfers.", 7020) ] }),
          new TableRow({ children: [ dCell("Current Workflow", 2340, true, true, BLUE), dCell("Search CRM, email, and Slack. Ask outgoing account team members. Rely on personal memory. Accept institutional knowledge gaps as unavoidable.", 7020) ] }),
          new TableRow({ children: [ dCell("Desired Outcomes", 2340, true, true, BLUE), dCell("Permission-aware retrieval of customer interaction history across CRM, email, and Slack. Competitive intelligence synthesis. Institutional playbook retrieval for deal preparation. Continuous institutional context on managed accounts.", 7020) ] }),
        ]}),
        sp(),
        hdr("5.5 New Employees", 2),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
          new TableRow({ children: [ hCell("Dimension", 2340), hCell("Detail", 7020) ] }),
          new TableRow({ children: [ dCell("Pain Points", 2340, true, true, BLUE), dCell("3–12 month ramp time to full productivity. Cannot access organizational context without colleague availability. High risk of repeating past mistakes. Dependent on informal knowledge transfer from busy colleagues.", 7020) ] }),
          new TableRow({ children: [ dCell("Current Workflow", 2340, true, true, BLUE), dCell("Shadow colleagues. Attend redundant onboarding sessions. Read documentation of variable quality and freshness. Accumulate institutional knowledge through slow osmosis.", 7020) ] }),
          new TableRow({ children: [ dCell("Desired Outcomes", 2340, true, true, BLUE), dCell("On-demand institutional context retrieval. \"Why\" questions answered with citations. Knowledge decay flags that prevent onboarding to outdated information. Dramatically compressed ramp time to full productivity.", 7020) ] }),
        ]}),
        sp(), pb(),

        // ─── 6. CORE USER STORIES ───────────────────────────────
        hdr("6. CORE USER STORIES"),
        p("The following user stories define the primary interaction patterns that Company Brain must support. Each story is written from the perspective of a real organizational actor with a specific, measurable goal."),
        sp(),
        hdr("6.1 Engineering Stories", 2),
        userStory("US-01  |  As an engineering lead, I want to query the system for the reasoning behind our microservices adoption decision, so that I can brief a new VP of Engineering with full historical context without scheduling five interviews."),
        userStory("US-02  |  As a backend engineer, I want to find all previous attempts to solve our API rate-limiting problem, including approaches that were tried and abandoned, so that I do not repeat work that was already done."),
        userStory("US-03  |  As an engineering manager, I want to know which architectural decisions made in the past 24 months have been flagged as potentially stale by the knowledge decay engine, so that I can schedule a review before they cause operational risk."),
        userStory("US-04  |  As a security engineer, I want to retrieve the full audit trail of decisions made about our data encryption policy, with citations from Slack, GitHub, and Notion, so that I can produce compliant documentation for our SOC 2 audit."),
        sp(),
        hdr("6.2 Product Manager Stories", 2),
        userStory("US-05  |  As a product manager, I want to retrieve the complete reasoning behind the decision to deprioritize the mobile application last Q3, including the stakeholders involved, alternatives considered, and the final rationale, so that I can revisit that decision with full context in the current planning cycle."),
        userStory("US-06  |  As a product manager, I want to ask Company Brain what our organization's position on freemium pricing was twelve months ago and how it has evolved since, so that I can prepare a briefing for a board-level pricing discussion."),
        userStory("US-07  |  As a newly onboarded PM, I want to ask Company Brain about the competitive positioning decisions made in my product area over the past two years, so that I can develop strategic continuity within my first two weeks without relying exclusively on colleague availability."),
        sp(),
        hdr("6.3 Executive Stories", 2),
        userStory("US-08  |  As a CEO, I want to query the organizational memory for all strategic decisions made about our enterprise go-to-market motion in the past 18 months, with the reasoning and context behind each, so that I can prepare a coherent board narrative without manually aggregating information from six department heads."),
        userStory("US-09  |  As a CFO, I want to retrieve the full history of our pricing strategy evolution, with citations from all source documents, so that I can produce a defensible, auditable record for an M&A due diligence process."),
        userStory("US-10  |  As a VP of Engineering, I want to receive an automated weekly report of organizational knowledge that is flagging as high-decay across the engineering knowledge base, so that I can prioritize documentation and review efforts proactively."),
        sp(),
        hdr("6.4 Sales Team Stories", 2),
        userStory("US-11  |  As an account executive, I want to retrieve the complete interaction history for Enterprise Account X, including call notes from Slack, email summaries, and CRM entries, so that I can re-engage a lapsed account with full context on the relationship history."),
        userStory("US-12  |  As a sales enablement manager, I want to retrieve all instances where the company has addressed a specific competitive objection in the past, across Slack, email, and recorded call notes, so that I can synthesize the most effective institutional response into the sales playbook."),
        sp(),
        hdr("6.5 New Employee Stories", 2),
        userStory("US-13  |  As a new employee in my first week, I want to ask Company Brain about the organizational culture, key historical decisions, and team structure, so that I can develop organizational context in days rather than months."),
        userStory("US-14  |  As a new engineer, I want to query the system for any known issues, past failures, or institutional warnings about the codebase area I have been assigned to, so that I can avoid repeating past mistakes that are not documented anywhere obvious."),
        userStory("US-15  |  As a new employee, I want Company Brain to surface knowledge with temporal confidence scores, so that when it retrieves information about company policies or processes, I can assess whether that information is likely still current or may have been superseded."),
        sp(), pb(),

        // ─── 7. FUNCTIONAL REQUIREMENTS ────────────────────────
        hdr("7. FUNCTIONAL REQUIREMENTS"),
        hdr("7.1 Data Connectors", 2),
        p("The connector layer is responsible for authenticating with source enterprise systems and ingesting content in a normalized format that supports downstream processing. Each connector must implement a standard interface that abstracts source-system differences from the ingestion pipeline."),
        b("GitHub Connector: Ingest pull requests, issues, issue comments, discussion threads, commit messages, code review comments, and README documents. Capture author metadata, timestamps, and associated repository and branch context."),
        b("Slack Connector: Ingest messages, threaded replies, reactions, channel metadata, and pinned items. Respect channel privacy settings and direct message exclusions. Capture user identity, channel name, and message timestamps."),
        b("Notion Connector: Ingest pages, databases, database entries, and comments. Capture page hierarchy, author, last-modified timestamp, and workspace membership for permission inference."),
        b("Google Drive Connector: Ingest Google Docs, Sheets, Slides, and PDF files. Capture file ownership, sharing settings, last-modified metadata, and version history where available."),
        b("Gmail Connector: Ingest email threads for users who have granted access, with strict consent-based scoping. Capture sender, recipients, subject, timestamp, and thread structure."),
        b("Linear Connector: Ingest issues, projects, cycles, and comments. Capture assignee, status, priority, and project hierarchy metadata."),
        b("Connector Interface Standard: Each connector must implement ingest(), listUpdates(), and checkPermissions() methods. Connectors must support incremental ingestion via change detection APIs or webhook subscription where available."),
        sp(),
        hdr("7.2 Ingestion Pipeline", 2),
        p("The ingestion pipeline transforms raw connector output into normalized, enriched knowledge fragments ready for embedding and indexing."),
        b("Document normalization: Standardize all ingested content into a uniform schema with fields for: content text, source platform, source URL, author identity, creation timestamp, last-modified timestamp, document type, and raw permission metadata."),
        b("Chunking strategy: Implement semantic chunking that preserves contextual integrity — chunks should not break mid-sentence, mid-argument, or mid-decision context. Target chunk sizes of 256–512 tokens with 50-token overlap for continuity."),
        b("Metadata enrichment: At ingestion time, extract and attach: entity mentions (people, teams, products, dates), document classification (decision, discussion, specification, reference), and initial temporal confidence baseline."),
        b("Deduplication: Detect and deduplicate content that appears in multiple source systems (e.g., a decision documented in both Slack and Notion). Maintain provenance links to all original sources for multi-source citation."),
        b("Ingestion queue: Implement an async, queue-based ingestion pipeline with backpressure management to support large-volume initial ingestion without degrading retrieval performance."),
        sp(),
        hdr("7.3 Semantic Processing", 2),
        b("Entity extraction: Identify and tag named entities within ingested content including: person names, team names, product names, technology names, dates, and project references."),
        b("Document classification: Classify each ingested document into one of: Decision Record, Discussion Thread, Technical Specification, Reference Documentation, Policy Document, or Unknown."),
        b("Relationship inference: Infer semantic relationships between documents based on shared entity mentions, temporal proximity, and cross-references. Store inferred relationships in the organizational context graph."),
        b("Sentiment and confidence markers: Identify linguistic markers of certainty, uncertainty, decision finality, and proposal status within document content to inform temporal confidence scoring."),
        sp(),
        hdr("7.4 Embedding Layer", 2),
        b("Embedding model: Use OpenAI text-embedding-3-large for all document chunk embeddings. This model provides 3072-dimensional embeddings with strong semantic retrieval performance across domain-specific enterprise content."),
        b("Metadata embeddings: Generate separate, lightweight embeddings for document metadata fields to enable metadata-filtered retrieval without full semantic search overhead."),
        b("Embedding storage: Store all embeddings in a vector database (Pinecone or pgvector) with associated metadata including: chunk ID, document ID, source platform, author, timestamp, permission metadata, and temporal confidence score."),
        b("Re-embedding triggers: Trigger re-embedding when a document is significantly revised, when the source document's permission settings change, or when the temporal confidence score drops below a defined threshold."),
        sp(),
        hdr("7.5 Retrieval Engine", 2),
        b("Semantic search: Implement dense retrieval using cosine similarity search over the embedding space with configurable top-k and minimum similarity threshold parameters."),
        b("Hybrid retrieval: Augment semantic search with keyword-based BM25 retrieval for high-precision lookups on specific terms, names, or technical identifiers."),
        b("Metadata filtering: Apply pre-retrieval filters for: source platform, date range, document type, author, team, and user-accessible sources (permission gate)."),
        b("Re-ranking: Apply a cross-encoder re-ranking step to the top-k semantic results to improve final precision before passing results to the generation layer."),
        b("Result diversity: Implement result diversity enforcement to prevent the returned context from being dominated by content from a single source or time period."),
        sp(),
        hdr("7.6 Temporal Intelligence Engine", 2),
        p("The Temporal Intelligence Engine is Company Brain's primary technical differentiator. It reasons about the freshness, reliability, and current validity of all retrieved knowledge fragments."),
        b("Decay model: Assign each knowledge fragment a temporal confidence score (0.0–1.0) computed from: document age, domain volatility classification, observed revision frequency, and presence of explicit deprecation or supersession markers."),
        b("Domain volatility classification: Classify each document type into a volatility tier: Static (policies, foundational architecture), Moderate (strategic decisions, product specs), Volatile (pricing, competitive analysis, active projects). Apply tier-specific decay rate parameters."),
        b("Deprecation detection: Identify explicit deprecation signals within document content (\"this has been superseded,\" \"deprecated as of,\" \"no longer applies\") and apply immediate confidence penalties."),
        b("Contradiction detection: Flag when newly ingested content directly contradicts existing indexed content on the same topic, surfacing potential knowledge conflicts for human review."),
        b("Freshness scoring in retrieval: Surface temporal confidence scores alongside every retrieved result. Provide visual indicators (fresh, aging, stale, flagged) in the query UI to enable users to make informed decisions about retrieved intelligence."),
        sp(),
        hdr("7.7 Citation System", 2),
        b("Mandatory citation: Every LLM-generated response must include explicit citations for every factual claim. Citations must include: source document title, source platform, author name, creation or last-modified timestamp, and direct URL to the source document."),
        b("Citation confidence: Attach the temporal confidence score of the cited source to every citation, giving users immediate visibility into the freshness of the evidence supporting each claim."),
        b("Multi-source attribution: When a response synthesizes information from multiple sources, each contributing source must be individually cited. The system must not aggregate claims from multiple sources under a single citation."),
        b("Citation verification: Implement a post-generation verification step that confirms each citation in the response traces to an actual indexed document that supports the specific claim being made."),
        sp(),
        hdr("7.8 Query Engine", 2),
        b("Natural language query interface: Accept free-form natural language queries with no query syntax requirements. Support both simple factual queries and complex multi-part reasoning queries."),
        b("Query expansion: Automatically expand user queries with related terminology, synonyms, and organizational entity aliases to improve retrieval recall."),
        b("Query routing: Classify incoming queries by type (factual lookup, decision reconstruction, competitive intelligence, policy retrieval, historical analysis) and route to optimized retrieval strategies for each type."),
        b("Context-aware follow-up: Support multi-turn conversational queries where subsequent questions build on the context of prior responses within the same session."),
        b("Response streaming: Stream LLM responses token-by-token to minimize perceived latency and provide immediate feedback to the user while the full response is generated."),
        sp(),
        hdr("7.9 Decision Reconstruction", 2),
        b("Multi-source synthesis: When a decision reconstruction query is received, retrieve and synthesize relevant content from all accessible source platforms, constructing a chronological account of the decision-making process."),
        b("Stakeholder identification: Extract and surface the identities of all individuals who contributed to the decision, with their roles, timestamps, and specific contributions."),
        b("Alternative capture: Identify and surface alternatives that were explicitly considered and rejected during the decision process, providing a complete view of the reasoning landscape."),
        b("Decision timeline: Construct a temporal narrative of the decision from initial proposal through final resolution, surfacing how the decision evolved over time."),
        sp(),
        hdr("7.10 Knowledge Decay Detection", 2),
        b("Proactive decay alerts: Generate proactive alerts when high-importance knowledge fragments cross defined temporal confidence thresholds, notifying document owners or designated knowledge stewards."),
        b("Decay dashboard: Provide a knowledge health dashboard that visualizes the decay state of the organizational knowledge base by domain, document type, and team."),
        b("Validation workflow: Enable knowledge stewards to mark documents as validated and current, resetting their temporal confidence baseline with a human confirmation timestamp."),
        b("Stale knowledge quarantine: Optionally suppress retrieval of documents whose temporal confidence falls below a defined minimum threshold, preventing the system from serving potentially harmful outdated guidance."),
        sp(),
        hdr("7.11 Permission System", 2),
        b("Permission metadata ingestion: At ingestion time, capture the access control settings of every source document exactly as they exist in the source system. Store permission metadata as immutable, versioned records associated with each indexed document."),
        b("User identity resolution: Resolve the querying user's identity to their organizational roles, team memberships, and individual document access rights across all connected source systems."),
        b("Pre-retrieval permission gate: Before surfacing any retrieval result to the querying user, verify that the user has access to the source document in the source system. Results the user cannot access are excluded before reaching the generation layer."),
        b("Permission change propagation: When a document's access permissions change in the source system, propagate that change to the indexed permission metadata within a defined SLA (target: within 15 minutes of source system change)."),
        b("Audit logging: Log all permission enforcement events for compliance and auditability purposes, capturing: querying user identity, query content, results evaluated, results surfaced, and results suppressed due to permission enforcement."),
        sp(),
        hdr("7.12 Dashboard UI", 2),
        b("Query interface: A clean, professional natural language query input with streaming response display. Support for query history, saved queries, and response bookmarking."),
        b("Citation panel: A dedicated panel displaying all citations for the current response, with source metadata, temporal confidence indicators, and direct links to source documents."),
        b("Knowledge health dashboard: Visualizations of organizational knowledge coverage, decay distribution, connector sync status, and knowledge gap identification."),
        b("Admin configuration panel: Connector management, permission model configuration, decay threshold settings, and ingestion monitoring."),
        sp(), pb(),

        // ─── 8. NON-FUNCTIONAL REQUIREMENTS ────────────────────
        hdr("8. NON-FUNCTIONAL REQUIREMENTS"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1980, 3240, 4140], rows: [
          new TableRow({ children: [ hCell("Category", 1980), hCell("Requirement", 3240), hCell("Implementation Specification", 4140) ] }),
          new TableRow({ children: [ dCell("Performance",       1980, true, true, BLUE), dCell("P95 query response latency < 3 seconds", 3240), dCell("Pre-computed embeddings; ANN search; LLM streaming. Cold-start warm-up prior to demo.", 4140) ] }),
          new TableRow({ children: [ dCell("Scalability",       1980, true, true, BLUE), dCell("Support indexing of up to 10M documents", 3240), dCell("Horizontally sharded vector store; async ingestion queue; stateless retrieval API.", 4140) ] }),
          new TableRow({ children: [ dCell("Reliability",       1980, true, true, BLUE), dCell("99.9% uptime SLA for production deployments", 3240), dCell("Multi-region deployment; automatic failover; health monitoring with automated alerting.", 4140) ] }),
          new TableRow({ children: [ dCell("Security",          1980, true, true, BLUE), dCell("End-to-end encryption at rest and in transit", 3240), dCell("AES-256 at rest; TLS 1.3 in transit. Zero-trust architecture with principle of least privilege.", 4140) ] }),
          new TableRow({ children: [ dCell("Permission Integrity", 1980, true, true, BLUE), dCell("Zero cross-permission data leakage", 3240), dCell("Permission metadata immutably stored at ingestion; enforced before result delivery; audited continuously.", 4140) ] }),
          new TableRow({ children: [ dCell("Explainability",    1980, true, true, BLUE), dCell("All responses must include source citations", 3240), dCell("Citation extraction enforced at generation layer; temporal confidence displayed per citation.", 4140) ] }),
          new TableRow({ children: [ dCell("Observability",     1980, true, true, BLUE), dCell("Full query, retrieval, and permission logging", 3240), dCell("Structured logging; distributed tracing across ingestion and retrieval; latency telemetry per pipeline stage.", 4140) ] }),
          new TableRow({ children: [ dCell("Compliance",        1980, true, true, BLUE), dCell("GDPR and enterprise data residency requirements", 3240), dCell("Region-scoped deployments; data deletion on request; no cross-region replication of customer content.", 4140) ] }),
        ]}),
        sp(), pb(),

        // ─── 9. MVP SCOPE ───────────────────────────────────────
        hdr("9. MVP SCOPE"),
        hdr("9.1 What Will Be Built", 2),
        b("Multi-platform ingestion connectors: GitHub (PRs, issues, discussions), Slack (messages, threads), and Notion or Google Drive (pages, documents)."),
        b("Embedding pipeline: Chunk normalization, OpenAI text-embedding-3-large embedding generation, and Pinecone or pgvector storage with full metadata."),
        b("Permission-aware retrieval: Role-based access control metadata ingested and enforced at query time with zero cross-permission leakage."),
        b("Temporal confidence scoring: Basic decay model applied to all retrieved results based on document age and domain volatility classification."),
        b("Citation-backed response generation: GPT-4o synthesis with mandatory per-claim citation including source, author, timestamp, and platform."),
        b("Query UI: Professional web interface with streaming response display, citation panel, and temporal confidence indicators."),
        b("Demo seed data: Pre-curated realistic enterprise dataset enabling compelling multi-scenario demo across engineering, product, and executive use cases."),
        sp(),
        hdr("9.2 What Will Not Be Built (MVP Exclusions)", 2),
        b("Real-time streaming ingestion (MVP uses scheduled batch ingestion)."),
        b("Full graph database organizational context graph (MVP uses lightweight metadata relationship tagging)."),
        b("Proactive knowledge surfacing and alert notifications (MVP is query-driven only)."),
        b("Mobile application interface."),
        b("Enterprise SSO and identity provider federation."),
        b("Connector SDK for third-party developer integration."),
        b("Gmail connector (deferred to post-MVP due to OAuth consent complexity)."),
        b("Linear connector (deferred to post-MVP; GitHub covers core engineering workflow)."),
        sp(),
        hdr("9.3 Success Boundaries", 2),
        p("The MVP is considered successful if it demonstrates, in a live judging environment: (1) a query answered with citations from at least two different source platforms; (2) a temporal confidence score applied to at least one retrieved result; (3) a permission enforcement demonstration where a query returns different results based on the simulated user identity; and (4) a decision reconstruction scenario where the system synthesizes a coherent account of an organizational decision from multiple sources."),
        sp(), pb(),

        // ─── 10. SUCCESS METRICS ────────────────────────────────
        hdr("10. SUCCESS METRICS"),
        hdr("10.1 Technical KPIs", 2),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3120, 2340, 3900], rows: [
          new TableRow({ children: [ hCell("Metric", 3120), hCell("Target", 2340), hCell("Measurement Method", 3900) ] }),
          new TableRow({ children: [ dCell("P95 query response latency", 3120, true), dCell("< 3.0 seconds", 2340), dCell("End-to-end timing: query submission → full response displayed", 3900) ] }),
          new TableRow({ children: [ dCell("Retrieval precision @ top-5", 3120, true), dCell("> 85%", 2340), dCell("Manual relevance evaluation against 25 curated test queries", 3900) ] }),
          new TableRow({ children: [ dCell("Citation accuracy", 3120, true), dCell("> 90%", 2340), dCell("% of citations verified to trace to stated source and support claimed fact", 3900) ] }),
          new TableRow({ children: [ dCell("Permission enforcement accuracy", 3120, true), dCell("100%", 2340), dCell("Zero cross-permission retrievals across 20 controlled test scenarios", 3900) ] }),
          new TableRow({ children: [ dCell("Cross-platform synthesis rate", 3120, true), dCell("> 70%", 2340), dCell("% of complex queries returning results from 2+ source platforms", 3900) ] }),
          new TableRow({ children: [ dCell("Demo environment uptime", 3120, true), dCell("100% during judging", 2340), dCell("Zero unplanned downtime during hackathon judging window", 3900) ] }),
        ]}),
        sp(),
        hdr("10.2 Business Impact KPIs", 2),
        b("Search-time reduction: Target 70% reduction in time-to-insight for complex institutional questions versus manual search baseline (measured in controlled user study with curated tasks)."),
        b("Onboarding acceleration: Demonstrate ability to answer 80%+ of typical new-hire contextual questions from institutional memory alone, without colleague intervention."),
        b("Decision context recovery: Successfully reconstruct reasoning context for 3+ historical organizational decisions in live demo scenarios with full source citations."),
        b("Knowledge staleness detection: Flag 90%+ of artificially aged test documents as potentially stale through the temporal confidence decay model."),
        sp(),
        hdr("10.3 Hackathon-Specific KPIs", 2),
        b("Demo readiness: Full demo scenario executable in under 5 minutes with zero setup steps required during judging."),
        b("Technical credibility: Architecture documentation sufficient to withstand expert technical scrutiny. Code quality sufficient for open-source review."),
        b("Differentiation clarity: Judges can articulate 3+ specific capabilities that distinguish Company Brain from generic RAG or enterprise search alternatives within 2 minutes of demo."),
        b("Narrative power: Judges recall the core Company Brain value proposition (institutional memory infrastructure) unprompted 24 hours after the presentation."),
        sp(), pb(),

        // ─── 11. RISKS & MITIGATIONS ────────────────────────────
        hdr("11. RISKS & MITIGATIONS"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 1170, 1170, 4680], rows: [
          new TableRow({ children: [ hCell("Risk", 2340), hCell("Prob.", 1170), hCell("Impact", 1170), hCell("Mitigation Strategy", 4680) ] }),
          new TableRow({ children: [ dCell("Connector OAuth / API complexity exceeds hackathon time budget", 2340, true), dCell("4/5", 1170), dCell("4/5", 1170), dCell("Pre-build connector auth flows before hackathon start. Maintain mock data adapters for each connector as fallback. Prioritize most stable APIs (GitHub, GDrive) first.", 4680) ] }),
          new TableRow({ children: [ dCell("System perceived as generic RAG application by judges", 2340, true), dCell("3/5", 1170), dCell("5/5", 1170), dCell("Lead every demo with temporal intelligence and permission-enforcement features. Prepare explicit differentiation narrative. Open-source competitor comparison table visible in demo.", 4680) ] }),
          new TableRow({ children: [ dCell("Retrieval quality insufficient for live demo quality bar", 2340, true), dCell("3/5", 1170), dCell("5/5", 1170), dCell("Use carefully curated seed dataset that maximizes retrieval performance. Tune chunking strategy and re-ranker before demo. Prepare fallback queries with verified-good retrieval paths.", 4680) ] }),
          new TableRow({ children: [ dCell("Scope overrun due to feature ambition", 2340, true), dCell("4/5", 1170), dCell("3/5", 1170), dCell("Enforce strict MVP scope definition. Time-box all secondary features. Demo readiness gates every 24-hour sprint. Cut secondary features ruthlessly if behind schedule.", 4680) ] }),
          new TableRow({ children: [ dCell("Demo environment instability during judging", 2340, true), dCell("2/5", 1170), dCell("5/5", 1170), dCell("Deploy on stable cloud infrastructure (not local laptop). Pre-warm all services. Record fallback demo video. Test full demo script 10+ times before judging window.", 4680) ] }),
          new TableRow({ children: [ dCell("LLM hallucination in citation generation", 2340, true), dCell("2/5", 1170), dCell("4/5", 1170), dCell("Implement post-generation citation verification step. Use structured output format with explicit citation fields. Pre-test all demo query scenarios for citation accuracy.", 4680) ] }),
          new TableRow({ children: [ dCell("Temporal decay model too simplistic for credibility", 2340, true), dCell("3/5", 1170), dCell("3/5", 1170), dCell("Implement at minimum three decay parameters (age, domain volatility, revision frequency). Document model assumptions explicitly. Frame as v1 foundation for more sophisticated future model.", 4680) ] }),
        ]}),
        sp(), pb(),

        // ─── 12. COMPETITIVE POSITIONING ────────────────────────
        hdr("12. COMPETITIVE POSITIONING"),
        p("Company Brain operates in a competitive landscape that includes enterprise search tools, AI copilots, knowledge management platforms, and general-purpose RAG systems. While each category addresses a subset of the problem, none provides the complete institutional memory infrastructure layer that Company Brain is designed to deliver."),
        sp(),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1872, 1248, 1248, 1248, 1248, 1248, 1248], rows: [
          new TableRow({ children: [
            hCell("Capability", 1872), hCell("Company Brain", 1248), hCell("Glean", 1248), hCell("Guru", 1248), hCell("Sana AI", 1248), hCell("Notion AI", 1248), hCell("Generic RAG", 1248)
          ]}),
          new TableRow({ children: [ dCell("Cross-platform retrieval", 1872, true), dCell("Yes", 1248), dCell("Yes", 1248), dCell("Partial", 1248), dCell("Partial", 1248), dCell("No", 1248), dCell("Variable", 1248) ] }),
          new TableRow({ children: [ dCell("Temporal intelligence", 1872, true), dCell("Yes (core)", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248) ] }),
          new TableRow({ children: [ dCell("Permission-aware retrieval", 1872, true), dCell("Yes (enforced)", 1248), dCell("Partial", 1248), dCell("Partial", 1248), dCell("Partial", 1248), dCell("No", 1248), dCell("No", 1248) ] }),
          new TableRow({ children: [ dCell("Knowledge decay detection", 1872, true), dCell("Yes", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248) ] }),
          new TableRow({ children: [ dCell("Decision reconstruction", 1872, true), dCell("Yes", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248) ] }),
          new TableRow({ children: [ dCell("Citation-backed responses", 1872, true), dCell("Yes", 1248), dCell("Partial", 1248), dCell("Partial", 1248), dCell("Partial", 1248), dCell("Partial", 1248), dCell("Variable", 1248) ] }),
          new TableRow({ children: [ dCell("Org context graph", 1872, true), dCell("Yes", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248) ] }),
          new TableRow({ children: [ dCell("Infrastructure positioning", 1872, true), dCell("Yes", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248), dCell("No", 1248) ] }),
        ]}),
        sp(),
        p("The competitive analysis reveals a consistent pattern: existing tools optimize for retrieval quality within defined ecosystems but do not address the temporal, organizational, and architectural dimensions that Company Brain targets. Glean provides broad connector coverage but no temporal reasoning. Guru provides curated knowledge with verification workflows but no AI synthesis or cross-platform memory. Sana AI focuses on learning and knowledge bases but not enterprise memory infrastructure. Notion AI is constrained to the Notion ecosystem. Generic RAG systems lack the permission architecture, connector breadth, and temporal intelligence required for enterprise deployment at scale."),
        p("Company Brain is uniquely positioned to occupy the Institutional Memory Infrastructure category — a position no current competitor owns or is racing to occupy."),
        sp(), pb(),

        // ─── 13. TECHNICAL CONSTRAINTS ──────────────────────────
        hdr("13. TECHNICAL CONSTRAINTS"),
        hdr("13.1 Hackathon Time Constraints", 2),
        p("The hackathon time window imposes hard constraints on scope, integration depth, and optimization effort. The following constraints govern all technical decisions in the MVP:"),
        b("Connector depth: Connectors will implement read-only ingestion via REST APIs. Real-time webhook-based streaming ingestion is deferred. Batch ingestion on a fixed schedule is the MVP approach."),
        b("Permission model: The MVP implements a simplified permission model based on ingestion-time metadata capture and user-level access simulation. Full RBAC inheritance graph computation is deferred to post-MVP."),
        b("Temporal decay model: The MVP implements a three-parameter decay model (document age, domain volatility class, explicit deprecation markers). Multi-factor Bayesian decay modeling is deferred."),
        b("Organizational context graph: The MVP implements lightweight entity tagging and co-occurrence relationships. A full property graph database implementation is deferred."),
        hdr("13.2 Integration Limitations", 2),
        b("API rate limits: All connector implementations must respect source system API rate limits. Ingestion pipelines must implement exponential backoff and rate limit awareness to prevent API quota exhaustion."),
        b("OAuth consent flows: OAuth-based connectors require user consent flows that may be complex to implement and demo in a hackathon context. Gmail is deferred. Slack and GitHub use app-level tokens where possible."),
        b("Data freshness: Due to batch ingestion, the MVP system will have a data freshness lag of up to 15 minutes for new content. Real-time freshness is a post-MVP capability."),
        hdr("13.3 Retrieval Complexity", 2),
        b("Multi-source synthesis quality: Synthesizing coherent responses from content across multiple source systems with different structural characteristics and semantic conventions is a non-trivial NLP challenge. Prompt engineering and retrieval pipeline tuning will be required to achieve consistent quality."),
        b("Chunking strategy trade-offs: Aggressive chunking increases retrieval precision but may break contextual integrity for decision reconstruction queries. Conservative chunking preserves context but increases retrieval noise. The MVP will use a hybrid approach with document-type-specific chunking parameters."),
        sp(), pb(),

        // ─── 14. OPENAI / CODEX USAGE ───────────────────────────
        hdr("14. OPENAI / CODEX USAGE"),
        p("Company Brain is architecturally dependent on OpenAI's model ecosystem at multiple layers of the technical stack. The following documents the specific OpenAI and Codex integrations and the value each contributes to the system."),
        hdr("14.1 GPT-4o: Response Synthesis and Reasoning", 2),
        p("GPT-4o serves as Company Brain's primary synthesis and reasoning engine. It is responsible for generating citation-backed institutional memory responses from retrieved context. The use of GPT-4o — rather than a generic open-source alternative — is justified by three specific capabilities: (1) superior instruction-following for structured citation output; (2) long-context window support for synthesis across large multi-source retrieval contexts; and (3) native function-calling support for structured extraction of citation metadata."),
        hdr("14.2 text-embedding-3-large: Semantic Foundation", 2),
        p("OpenAI's text-embedding-3-large model provides the semantic foundation for all retrieval operations. Its 3072-dimensional embedding space provides high-fidelity semantic representation of enterprise content, including technical documentation, conversational Slack messages, and structured product specifications — a domain diversity that benefits from a model trained on broad, high-quality text corpora."),
        hdr("14.3 Codex / GPT-4o: Connector Scaffolding Acceleration", 2),
        p("Codex and GPT-4o are used within the development process to accelerate connector implementation. Given the hackathon's time constraint, using Codex to scaffold the boilerplate of each connector — OAuth flows, API pagination logic, error handling patterns, and data normalization schemas — dramatically compresses development time without sacrificing code quality. Codex-generated scaffolding is reviewed and refined by the developer, but the generation step eliminates the most time-consuming portions of connector implementation."),
        hdr("14.4 OpenAI Function Calling: Structured Output", 2),
        p("The OpenAI function-calling API is used to enforce structured citation output from the generation layer. Rather than parsing citation metadata from free-text LLM responses — a fragile approach — Company Brain uses function definitions to instruct GPT-4o to return citation metadata in a typed, verifiable JSON format that can be programmatically validated and rendered in the UI."),
        hdr("14.5 Assistants API: Multi-Turn Session Management", 2),
        p("The OpenAI Assistants API is evaluated for multi-turn session management in the query interface. The Assistants API's thread management capability provides native support for context-aware follow-up queries, which is a key user experience requirement for the decision reconstruction and historical analysis query types."),
        sp(), pb(),

        // ─── 15. HACKATHON JUDGING ALIGNMENT ────────────────────
        hdr("15. HACKATHON JUDGING ALIGNMENT"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 3510, 3510], rows: [
          new TableRow({ children: [ hCell("Judging Criterion", 2340), hCell("Company Brain Position", 3510), hCell("Specific Evidence", 3510) ] }),
          new TableRow({ children: [
            dCell("Technical Execution", 2340, true, true, BLUE),
            dCell("Multi-source ingestion pipeline, permission-enforcement architecture, temporal decay model, and citation verification all require original engineering beyond prompt wrapping.", 3510),
            dCell("Live demo of permission-aware retrieval. Architecture diagram walkthrough. Code review readiness. Three-platform ingestion in production.", 3510)
          ]}),
          new TableRow({ children: [
            dCell("Usefulness", 2340, true, true, BLUE),
            dCell("Addresses a quantified, universal enterprise pain point: 1.8 hours/day lost per knowledge worker, $18M+ annual productivity loss per 500-person organization.", 3510),
            dCell("Live demo solving real organizational scenarios. Quantified business impact framing. User persona-grounded demonstration.", 3510)
          ]}),
          new TableRow({ children: [
            dCell("Creativity and Originality", 2340, true, true, BLUE),
            dCell("Introduces a new product category — Institutional Memory Infrastructure — with temporal intelligence as a genuinely novel capability not present in any existing commercial system.", 3510),
            dCell("Competitive comparison table showing unique capabilities. Temporal intelligence live demo. Knowledge decay detection demonstration.", 3510)
          ]}),
          new TableRow({ children: [
            dCell("OpenAI / Codex Usage", 2340, true, true, BLUE),
            dCell("GPT-4o for synthesis, text-embedding-3-large for retrieval, function calling for citation structure, Assistants API for multi-turn sessions, Codex for connector scaffolding.", 3510),
            dCell("Documented API integration at 5 distinct layers. Code walkthrough showing OpenAI dependency at each layer. Codex-generated connector code examples.", 3510)
          ]}),
          new TableRow({ children: [
            dCell("Presentation Clarity", 2340, true, true, BLUE),
            dCell("Single-sentence core insight (\"Organizations don't have a data problem — they have a memory problem\") creates immediate, universal resonance. Three-act demo structure: problem, solution, differentiation.", 3510),
            dCell("Rehearsed 5-minute demo script. Visual demonstration of all key capabilities. Closing vision statement. Q&A preparation for technical depth questions.", 3510)
          ]}),
        ]}),
        sp(), pb(),

        // ─── 16. FINAL POSITIONING ──────────────────────────────
        hdr("16. FINAL PRODUCT POSITIONING STATEMENT"),
        p("Company Brain stands at the intersection of two defining enterprise transitions: the shift from tool-centric to AI-native organizational operations, and the shift from information access to institutional intelligence. These transitions are not hypothetical — they are underway in every knowledge-intensive organization on the planet."),
        p("The products and categories that exist today were built to solve the information access problem: how do we store, organize, and retrieve the information our organizations generate? That problem has been adequately addressed. Terabytes of organizational information are already accessible. The new problem — the problem that no existing product category was designed to solve — is the institutional intelligence problem: how do organizations make sense of everything they know, understand how that knowledge has evolved over time, and access it in a form that supports real decisions by real people in real organizational contexts?"),
        p("Company Brain is the answer to that question. It is not an incremental improvement on enterprise search. It is not a more sophisticated knowledge base. It is a new layer of the enterprise software stack — the memory layer — built specifically for the AI-native era, designed to serve as the cognitive substrate that makes every other enterprise AI capability more intelligent, more contextual, and more organizationally aware."),
        sp(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          spacing: { before: 160, after: 40 },
          children: [new TextRun({ text: " ", size: 4, font: "Arial" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: "Software changed how companies operate.", size: 28, bold: true, color: WHITE, italics: true, font: "Arial" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: "Cloud changed where software runs.", size: 28, bold: true, color: WHITE, italics: true, font: "Arial" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: "AI will change who does the work.", size: 28, bold: true, color: WHITE, italics: true, font: "Arial" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          spacing: { before: 60, after: 160 },
          children: [new TextRun({ text: "Company Brain ensures organizations never lose the intelligence that powers that work.", size: 22, color: LBLUE, italics: true, font: "Arial" })]
        }),
        sp(2),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLUE2, space: 6 } },
          spacing: { before: 100, after: 80 },
          children: [new TextRun({ text: "Krishil Agrawal  |  OpenAI x Outskill AI Builders Hackathon  |  Company Brain PRD v1.0", size: 18, color: MID, italics: true, font: "Arial" })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Materials/Company_Brain_PRD.docx", buf);
  console.log("PRD generated successfully.");
});