import { z } from 'zod';

export const ObjectionCategorySchema = z.enum([
  'clarification',
  'cosmetic',
  'gap',
  'error',
  'disagreement',
]);

export const ObjectionSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const ResponseTypeSchema = z.enum([
  'fix',
  'defend',
  'concede',
  'partial',
  'escalate',
]);

export const ResolutionStatusSchema = z.enum([
  'resolved',
  'unresolved',
  'escalated',
]);

export const DocumentTypeSchema = z.enum([
  'exec-summary',
  'market-research',
  'demand-validation',
  'competitor-intelligence',
  'product-technology',
  'go-to-market',
  'business-model',
  'finance-operations',
  'unit-economics',
  'team-execution',
  'legal-ip',
  'full-summary',
]);

export const ObjectionSchema = z.object({
  id: z.string(),
  category: ObjectionCategorySchema,
  severity: ObjectionSeveritySchema,
  quote: z.string(),
  objection: z.string(),
  suggestedResolution: z.string().optional(),
  requiresSearch: z.boolean().optional(),
});

export const RedTeamOutputSchema = z.object({
  objections: z.array(ObjectionSchema),
  resolvedFromPrior: z.array(z.string()).optional(),
  summary: z.string(),
  earlyTermination: z.boolean().optional(),
  terminationReason: z.string().optional(),
});

export const ResponseSchema = z.object({
  objectionId: z.string(),
  responseType: ResponseTypeSchema,
  explanation: z.string(),
  proposedChange: z.string().optional(),
  status: ResolutionStatusSchema,
});

export const BlueTeamOutputSchema = z.object({
  responses: z.array(ResponseSchema),
  summary: z.string(),
});

export const DocumentChangeSchema = z.object({
  location: z.string(),
  original: z.string(),
  revised: z.string(),
  reason: z.string(),
  objectionIds: z.array(z.string()),
});

export const ChangelogSchema = z.object({
  changes: z.array(DocumentChangeSchema),
  summary: z.string(),
});

export const RevisedDocumentSchema = z.object({
  rewrittenDocument: z.string(),
  changes: z.array(DocumentChangeSchema),
  summary: z.string(),
});

export const DebateConfigSchema = z.object({
  document: z.string().min(1),
  documentType: DocumentTypeSchema,
  clientCompany: z.string().min(1),
  clientIndustry: z.string().min(1),
  clientRole: z.string().min(1),
  clientContext: z.string().optional(),
  eslEnabled: z.boolean(),
  redTeamModel: z.string().min(1),
  blueTeamModel: z.string().min(1),
  maxRounds: z.number().int().min(1).max(8),
  searchEnabled: z.boolean(),
});
