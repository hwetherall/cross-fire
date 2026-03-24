import type { DocumentType } from './types';

/**
 * Each chapter's lens includes:
 * - reviewLens: what to focus on when reviewing this chapter
 * - scope: what this chapter covers (in scope)
 * - outOfScope: what belongs in other chapters (do NOT flag as gaps)
 */
interface ChapterLens {
  label: string;
  reviewLens: string;
  scope: string;
  outOfScope: string;
}

export const chapterLenses: Record<DocumentType, ChapterLens> = {
  'exec-summary': {
    label: 'Exec Summary',
    reviewLens: `This is an executive summary — a decision document. You expect: a clear recommendation, the 2-3 strongest supporting arguments, key risks with mitigations, and a concrete next-steps framework. You will be especially critical of: unsupported claims, missing decision frameworks, and anything that reads as analysis rather than recommendation.`,
    scope: `Strategic recommendation, key supporting evidence from across the memo, top risks, and next steps. This chapter synthesizes the entire investment memo into a decision-ready brief.`,
    outOfScope: `Detailed market sizing methodology, granular competitor profiles, financial model assumptions, unit economics breakdowns, team bios, legal specifics. These belong in their respective chapters — the exec summary should reference conclusions, not replicate analysis.`,
  },

  'market-research': {
    label: 'Market Research',
    reviewLens: `This is a market research chapter within a larger investment memo. You expect: defensible market sizing with clear methodology (TAM/SAM/SOM cascade), segment-level analysis with prioritization rationale, growth dynamics with structural vs. cyclical distinction, value chain mapping, buying cycle mechanics, policy/regulatory landscape, and entry conditions. You will be especially critical of: top-down TAM claims without bottom-up validation, unsubstantiated growth assumptions, geographic generalizations, and sizing methods that don't show their work.`,
    scope: `Market definition and boundaries, TAM/SAM/SOM sizing and methodology, segment attractiveness and demand structure, growth trends and drivers, value chain and whitespace, buying cycle and commercial dynamics, policy and regulatory environment, entry conditions and adoption constraints.`,
    outOfScope: `Detailed competitor profiles and head-to-head comparisons (Competitor Intelligence chapter), specific product features or technical architecture (Product & Technology chapter), go-to-market strategy and channel plans (Go To Market chapter), financial projections and P&L modeling (Finance & Operations chapter), unit economics and margin analysis (Unit Economics chapter), customer interview evidence and willingness-to-pay data (Demand Validation chapter). If the document references these topics at a high level to support market analysis, that is appropriate — do not flag the absence of deep dives that belong in other chapters.`,
  },

  'demand-validation': {
    label: 'Demand Validation',
    reviewLens: `This is a demand validation chapter. You expect: rigorous evidence of customer demand, clear methodology for how demand was assessed, specific customer segments with quantified opportunity, honest treatment of demand risks, and evidence distinguishing real purchase intent from casual interest. You will be especially critical of: confirmation bias in data interpretation, insufficient sample sizes, conflating interest with willingness to pay, and missing competitive alternatives.`,
    scope: `Customer discovery evidence, demand signals, willingness-to-pay analysis, customer segment prioritization, buyer personas, pain point validation, demand risks and assumptions.`,
    outOfScope: `Market sizing methodology and TAM/SAM (Market Research chapter), competitor product comparisons (Competitor Intelligence chapter), pricing model design and revenue projections (Business Model / Unit Economics chapters), product feature specifications (Product & Technology chapter).`,
  },

  'competitor-intelligence': {
    label: 'Competitor Intelligence',
    reviewLens: `This is a competitor intelligence chapter. You expect: comprehensive mapping of direct and indirect competitors, honest assessment of relative strengths and weaknesses, specific data on competitor capabilities, market positioning, and strategic trajectories. You will be especially critical of: missing competitors you know about, underestimating competitor capabilities, relying on outdated information, and failing to account for likely competitor responses.`,
    scope: `Competitor identification and categorization, capability assessments, market share estimates, strategic positioning, competitive dynamics, potential new entrants, substitution threats, and competitive response scenarios.`,
    outOfScope: `Overall market sizing and growth rates (Market Research chapter), detailed product/technology comparisons (Product & Technology chapter), go-to-market differentiation strategy (Go To Market chapter), financial benchmarking and valuation (Finance & Operations chapter).`,
  },

  'product-technology': {
    label: 'Product & Technology',
    reviewLens: `This is a product and technology assessment chapter. You expect: clear articulation of the product concept, technology readiness assessment, architecture decisions with rationale, build-vs-buy analysis, development roadmap, and honest treatment of technical risks. You will be especially critical of: hand-waving over technical complexity, missing integration risks, and vendor/technology bias.`,
    scope: `Product concept and value proposition, technology stack and architecture, technical feasibility, build-vs-buy decisions, development roadmap and milestones, technical risks and dependencies, IP and defensibility considerations.`,
    outOfScope: `Market sizing (Market Research chapter), customer demand evidence (Demand Validation chapter), detailed competitor product comparisons (Competitor Intelligence chapter), pricing strategy (Business Model chapter), team capability assessment (Team & Execution chapter), patent/legal analysis (Legal & IP chapter).`,
  },

  'go-to-market': {
    label: 'Go To Market',
    reviewLens: `This is a go-to-market strategy chapter. You expect: clear channel strategy, customer acquisition approach, launch sequencing, partnership strategy, and realistic sales cycle assumptions. You will be especially critical of: channel strategies that don't match actual buyer behavior, unrealistic customer acquisition assumptions, and missing distribution constraints.`,
    scope: `Channel strategy, customer acquisition, sales motion design, partnership and distribution strategy, launch sequencing, marketing approach, GTM metrics and milestones.`,
    outOfScope: `Market sizing and segment analysis (Market Research chapter), customer discovery evidence (Demand Validation chapter), competitor positioning (Competitor Intelligence chapter), revenue projections and financial modeling (Finance & Operations chapter), unit economics (Unit Economics chapter).`,
  },

  'business-model': {
    label: 'Business Model',
    reviewLens: `This is a business model chapter. You expect: clear revenue model design, pricing strategy with rationale, cost structure overview, value capture logic, and scalability assessment. You will be especially critical of: pricing assumptions disconnected from willingness-to-pay evidence, cost structures missing key items, and business models that don't match actual buying behavior.`,
    scope: `Revenue model and pricing strategy, cost structure, value capture mechanics, business model canvas or equivalent, scalability analysis, monetization phasing.`,
    outOfScope: `Detailed market sizing (Market Research chapter), customer demand evidence (Demand Validation chapter), financial projections and P&L (Finance & Operations chapter), unit-level economics (Unit Economics chapter), competitive pricing analysis (Competitor Intelligence chapter).`,
  },

  'finance-operations': {
    label: 'Finance & Operations',
    reviewLens: `This is a finance and operations chapter. You expect: credible financial projections, clearly stated assumptions, sensitivity analysis on key drivers, operational plan, resource requirements, and milestone-based funding logic. You will be especially critical of: assumptions that don't reconcile with earlier chapters, missing sensitivity analysis, and projections without clear derivation.`,
    scope: `Financial projections, P&L modeling, cash flow analysis, funding requirements, operational plan, resource allocation, key assumptions and sensitivity analysis, milestone definitions.`,
    outOfScope: `Market sizing methodology (Market Research chapter), demand evidence (Demand Validation chapter), unit economics detail (Unit Economics chapter), team composition and hiring plans (Team & Execution chapter), legal structure (Legal & IP chapter).`,
  },

  'unit-economics': {
    label: 'Unit Economics',
    reviewLens: `This is a unit economics chapter. You expect: clear unit definition, customer acquisition cost analysis, lifetime value modeling, margin structure, payback period analysis, and scaling assumptions. You will be especially critical of: blended metrics hiding segment variation, unrealistic retention assumptions, and CAC calculations missing key cost components.`,
    scope: `Unit definition, CAC analysis, LTV modeling, contribution margins, payback periods, cohort economics, scaling assumptions and their impact on unit economics.`,
    outOfScope: `Overall market sizing (Market Research chapter), P&L projections and aggregate financials (Finance & Operations chapter), pricing strategy design (Business Model chapter), channel cost details (Go To Market chapter).`,
  },

  'team-execution': {
    label: 'Team & Execution',
    reviewLens: `This is a team and execution chapter. You expect: honest assessment of current team capabilities, key hiring needs, organizational design, execution timeline, and risk mitigation for capability gaps. You will be especially critical of: overstating existing capabilities, missing critical skill gaps, and timelines disconnected from resource reality.`,
    scope: `Team composition and capabilities, key hires needed, organizational structure, execution roadmap, governance model, capability gaps and mitigation plans.`,
    outOfScope: `Product development roadmap (Product & Technology chapter), financial projections and compensation modeling (Finance & Operations chapter), legal entity structure (Legal & IP chapter).`,
  },

  'legal-ip': {
    label: 'Legal & IP',
    reviewLens: `This is a legal and IP chapter. You expect: clear IP landscape assessment, freedom-to-operate analysis, regulatory requirements, entity structure considerations, and key legal risks. You will be especially critical of: missing regulatory requirements, unaddressed IP risks, and incomplete freedom-to-operate analysis.`,
    scope: `IP landscape, patent analysis, freedom-to-operate, regulatory requirements, entity structure, licensing considerations, key legal risks and mitigations.`,
    outOfScope: `Technology architecture details (Product & Technology chapter), competitive IP comparisons beyond landscape mapping (Competitor Intelligence chapter), financial impact of legal costs (Finance & Operations chapter).`,
  },

  'full-summary': {
    label: 'Full Summary',
    reviewLens: `This is a comprehensive summary document spanning multiple areas of analysis. Review it holistically for internal consistency, narrative coherence, and whether conclusions follow from evidence. You will be especially critical of: contradictions between sections, conclusions not supported by the analysis presented, and logical gaps in the overall narrative.`,
    scope: `This is a standalone summary covering multiple dimensions of the analysis.`,
    outOfScope: `As a full summary, nothing is explicitly out of scope — but depth expectations should be calibrated to summary-level treatment, not chapter-level deep dives.`,
  },
};

// Convenience accessors
export function getReviewLens(docType: DocumentType): string {
  return chapterLenses[docType].reviewLens;
}

export function getChapterScope(docType: DocumentType): string {
  return chapterLenses[docType].scope;
}

export function getOutOfScope(docType: DocumentType): string {
  return chapterLenses[docType].outOfScope;
}

export function getChapterLabel(docType: DocumentType): string {
  return chapterLenses[docType].label;
}
