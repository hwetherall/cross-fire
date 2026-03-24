#!/bin/bash
# Crossfire Debate Engine — curl test
#
# Prerequisites:
#   1. Copy .env.local.example to .env.local and add your OPENROUTER_API_KEY
#   2. Start the dev server: pnpm dev
#   3. Run this script: bash test/curl-test.sh
#
# The response is streamed as newline-delimited JSON (NDJSON).
# Each line is a JSON object with type "round" or "summary".

curl -X POST http://localhost:3000/api/debate \
  -H "Content-Type: application/json" \
  -d '{
    "document": "# Acme Corp — Q3 Product Launch Strategy\n\n## Executive Summary\n\nAcme Corp should launch its new AI-powered inventory management system (\"AcmeFlow\") in Q3 2026, targeting mid-market retail chains with 50-500 locations. Our analysis indicates a $2.3B addressable market with 12% projected CAGR through 2030.\n\n## Key Recommendations\n\n1. **Pricing:** $15,000/month per enterprise license, with volume discounts starting at 10+ locations. This positions us 20% below Oracle and SAP but 35% above emerging competitors like ShelfAI.\n\n2. **Go-to-Market:** Lead with a pilot program targeting 3 anchor customers (we recommend Target, Kroger, and Costco). Use pilot results to build case studies for broader rollout in Q4.\n\n3. **Technical Differentiation:** AcmeFlow reduces inventory carrying costs by 18-23% through predictive demand modeling. Our proprietary transformer architecture processes point-of-sale data 4x faster than competing solutions.\n\n4. **Risk Factors:** Supply chain volatility remains elevated. If inflation exceeds 4.5% in H2, mid-market retailers may freeze IT budgets, delaying adoption. We recommend building a deferred-payment option to mitigate this.\n\n## Financial Projections\n\n- Year 1 ARR target: $8.5M (57 enterprise customers)\n- Break-even: Month 18\n- Required investment: $12M (split: $7M engineering, $3M sales, $2M marketing)\n- Projected ROI: 3.2x by Year 3",
    "documentType": "strategy",
    "clientCompany": "Acme Corp",
    "clientIndustry": "Enterprise SaaS / Retail Technology",
    "clientRole": "VP of Product and Chief Strategy Officer",
    "clientContext": "Acme Corp is a mid-size enterprise software company pivoting from legacy ERP to AI-native products. The board is cautious after a failed product launch 18 months ago.",
    "eslEnabled": false,
    "redTeamModel": "gpt-5.4",
    "blueTeamModel": "opus-4.6",
    "maxRounds": 2,
    "searchEnabled": false
  }' \
  --no-buffer
