export type ObjectionCategory =
  | 'clarification'
  | 'cosmetic'
  | 'gap'
  | 'error'
  | 'disagreement';

export type ObjectionSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ResponseType =
  | 'fix'
  | 'defend'
  | 'concede'
  | 'partial'
  | 'escalate';

export type ResolutionStatus = 'resolved' | 'unresolved' | 'escalated';

export type DocumentType =
  | 'exec-summary'
  | 'full-summary'
  | 'demand-validation'
  | 'competitor-analysis'
  | 'market-research';

export interface DebateConfig {
  document: string;
  documentType: DocumentType;
  clientCompany: string;
  clientIndustry: string;
  clientRole: string;
  clientContext?: string;
  eslEnabled: boolean;
  redTeamModel: string;
  blueTeamModel: string;
  maxRounds: number;
  searchEnabled: boolean;
}

export interface Objection {
  id: string;
  category: ObjectionCategory;
  severity: ObjectionSeverity;
  quote: string;
  objection: string;
  suggestedResolution?: string;
  requiresSearch?: boolean;
}

export interface Response {
  objectionId: string;
  responseType: ResponseType;
  explanation: string;
  proposedChange?: string;
  status: ResolutionStatus;
}

export interface RedTeamOutput {
  objections: Objection[];
  resolvedFromPrior?: string[];
  summary: string;
}

export interface BlueTeamOutput {
  responses: Response[];
  summary: string;
}

export interface DebateRound {
  roundNumber: number;
  redTeam: RedTeamOutput;
  blueTeam: BlueTeamOutput;
  // UI-only hint for rounds streamed before Blue Team completes.
  streamStatus?: 'red-complete' | 'complete';
}

export interface FinalSummary {
  totalObjections: number;
  resolved: number;
  unresolved: number;
  escalated: number;
  byCategory: Record<ObjectionCategory, number>;
  topUnresolved: Objection[];
  recommendation: string;
}

export interface RevisionItem {
  id: string;
  category: ObjectionCategory;
  severity: ObjectionSeverity;
  quote: string;
  issue: string;
  fix: string;
}

export interface DocumentChange {
  location: string;
  original: string;
  revised: string;
  reason: string;
  objectionIds: string[];
}

export interface RevisedDocument {
  rewrittenDocument: string;
  changes: DocumentChange[];
  summary: string;
}

export interface DebateResult {
  config: DebateConfig;
  rounds: DebateRound[];
  finalSummary: FinalSummary;
  revisedDocument?: RevisedDocument;
}
