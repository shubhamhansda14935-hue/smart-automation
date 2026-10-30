import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'automation.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create tables according to production PostgreSQL specifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      solution_description TEXT,
      is_active INTEGER DEFAULT 0,
      definition TEXT NOT NULL, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
      status TEXT NOT NULL, -- 'success', 'failed', 'running'
      input_payload TEXT, -- JSON string
      output_payload TEXT, -- JSON string
      error_message TEXT,
      execution_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
    CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
  `);

  // Seed default demo user and workflows if not exists
  seedDefaultData();
}

function seedDefaultData() {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@smartauto.io') as { id: number } | undefined;
  let demoUserId: number;

  if (!existingUser) {
    const passwordHash = bcrypt.hashSync('demo1234', 10);
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('demo@smartauto.io', passwordHash, 'Alex Rivera', 'admin');
    demoUserId = Number(result.lastInsertRowid);
  } else {
    demoUserId = existingUser.id;
  }

  // Check if demo workflows exist
  const countWorkflows = db.prepare('SELECT COUNT(*) as count FROM workflows WHERE user_id = ?').get(demoUserId) as { count: number };
  if (countWorkflows.count === 0) {
    const defaultWorkflows = [
      {
        name: 'Automated Invoice Matching & ERP Sync',
        problem_statement: 'Finance team spends 15+ hours weekly manually extracting invoice PDF line items, cross-referencing purchase orders, and routing for VP approval.',
        solution_description: 'An AI-orchestrated pipeline that extracts structured line items from vendor invoices, cross-references with ERP purchase orders, flags discrepancies >5%, and auto-routes for payment.',
        is_active: 1,
        definition: JSON.stringify({
          steps: [
            {
              step_order: 1,
              type: 'trigger',
              name: 'Invoice Upload Webhook',
              config: {
                trigger_type: 'webhook',
                endpoint: '/api/v1/inbound/invoices',
                method: 'POST',
                description: 'Receives vendor invoice payload with PDF attachment or JSON fields'
              }
            },
            {
              step_order: 2,
              type: 'ai_transform',
              name: 'Gemini Document Extraction',
              config: {
                prompt: 'Extract vendor_name, invoice_number, total_amount, line_items, tax_id, and currency from raw invoice text.',
                temperature: 0.1,
                output_schema: 'invoice_extraction'
              }
            },
            {
              step_order: 3,
              type: 'condition',
              name: 'Policy Compliance Check',
              config: {
                field: 'total_amount',
                operator: 'less_than_or_equal',
                value: 5000,
                else_action: 'require_manual_signoff'
              }
            },
            {
              step_order: 4,
              type: 'action',
              name: 'ERP General Ledger Post & Notification',
              config: {
                action_type: 'webhook_dispatch',
                url: 'https://erp.internal.company.com/api/v2/payable-vouchers',
                notify_channel: '#finance-ops',
                template: 'Invoice {{invoice_number}} for ${{total_amount}} processed successfully.'
              }
            }
          ]
        })
      },
      {
        name: 'Customer Support Priority Triage & Routing',
        problem_statement: 'Customer support inbox receives 500+ tickets daily without categorization, delaying critical tier-1 VIP escalations and SLA breaches.',
        solution_description: 'Analyzes incoming customer tickets in real-time using Gemini sentiment analysis, determines urgency, enriches with customer CRM tier, and routes directly to on-call specialists.',
        is_active: 1,
        definition: JSON.stringify({
          steps: [
            {
              step_order: 1,
              type: 'trigger',
              name: 'Zendesk Ticket Webhook',
              config: {
                trigger_type: 'event',
                source: 'support_portal',
                event_name: 'ticket.created'
              }
            },
            {
              step_order: 2,
              type: 'ai_transform',
              name: 'Sentiment & Intent Classification',
              config: {
                prompt: 'Classify ticket urgency (P1/P2/P3/P4), sentiment (negative/neutral/positive), and issue domain (billing, technical, feature_request).',
                output_schema: 'ticket_classification'
              }
            },
            {
              step_order: 3,
              type: 'condition',
              name: 'P1 / High Urgency Routing Gate',
              config: {
                field: 'urgency',
                operator: 'equals',
                value: 'P1',
                else_action: 'standard_queue'
              }
            },
            {
              step_order: 4,
              type: 'action',
              name: 'Slack Urgent Dispatch & PagerDuty Alert',
              config: {
                action_type: 'slack_dispatch',
                channel: '#critical-escalations',
                priority: 'urgent',
                message: 'URGENT: Ticket #{{ticket_id}} from {{customer_email}} flagged as P1 outage.'
              }
            }
          ]
        })
      },
      {
        name: 'Employee Onboarding Provisioning Pipeline',
        problem_statement: 'HR and IT teams coordinate across 6 spreadsheets to collect candidate credentials, order hardware, and provision SaaS accounts, leading to first-day delays.',
        solution_description: 'Synchronizes Workday offer signatures with Google Workspace, GitHub, Slack, and AWS IAM provisioning, sending automated welcome kits and tracking compliance.',
        is_active: 0,
        definition: JSON.stringify({
          steps: [
            {
              step_order: 1,
              type: 'trigger',
              name: 'HR Offer Acceptance Event',
              config: {
                trigger_type: 'event',
                source: 'workday_hcm',
                event_name: 'candidate.accepted_offer'
              }
            },
            {
              step_order: 2,
              type: 'ai_transform',
              name: 'Role & Entitlement Synthesis',
              config: {
                prompt: 'Based on job title, department, and seniority, determine required software licenses, security groups, and equipment specs.',
                output_schema: 'it_entitlements'
              }
            },
            {
              step_order: 3,
              type: 'condition',
              name: 'Manager Approval Check',
              config: {
                field: 'requires_hardware_laptop',
                operator: 'equals',
                value: true
              }
            },
            {
              step_order: 4,
              type: 'action',
              name: 'Okta & Workspace Provisioning Request',
              config: {
                action_type: 'api_call',
                url: 'https://identity.company.com/api/v1/users',
                method: 'POST'
              }
            }
          ]
        })
      }
    ];

    const insertWf = db.prepare(`
      INSERT INTO workflows (user_id, name, problem_statement, solution_description, is_active, definition)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertExec = db.prepare(`
      INSERT INTO executions (workflow_id, status, input_payload, output_payload, error_message, execution_time_ms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    for (let i = 0; i < defaultWorkflows.length; i++) {
      const wf = defaultWorkflows[i];
      const result = insertWf.run(demoUserId, wf.name, wf.problem_statement, wf.solution_description, wf.is_active, wf.definition);
      const wfId = Number(result.lastInsertRowid);

      // Seed 4-6 historical executions for telemetry charts
      if (i === 0) {
        insertExec.run(wfId, 'success', JSON.stringify({ vendor: 'Acme Corp', invoice_num: 'INV-8891', amount: 3450.00 }), JSON.stringify({ matched_po: 'PO-2024-91', approval_status: 'AUTO_APPROVED', ledger_id: 'GL-98214' }), null, 420, '-10 minutes');
        insertExec.run(wfId, 'success', JSON.stringify({ vendor: 'CloudNet Inc', invoice_num: 'INV-4011', amount: 1200.50 }), JSON.stringify({ matched_po: 'PO-2024-52', approval_status: 'AUTO_APPROVED', ledger_id: 'GL-98215' }), null, 380, '-2 hours');
        insertExec.run(wfId, 'failed', JSON.stringify({ vendor: 'Unknown LLC', invoice_num: 'INV-0012', amount: 9800.00 }), null, 'Vendor tax ID mismatch against internal vendor master registry', 650, '-1 day');
        insertExec.run(wfId, 'success', JSON.stringify({ vendor: 'Datadog EMEA', invoice_num: 'DD-9812', amount: 4890.00 }), JSON.stringify({ matched_po: 'PO-2024-33', approval_status: 'AUTO_APPROVED', ledger_id: 'GL-98216' }), null, 490, '-2 days');
      } else if (i === 1) {
        insertExec.run(wfId, 'success', JSON.stringify({ customer: 'enterprise@fintech.com', issue: 'Payment gateway timeout in EU region' }), JSON.stringify({ urgency: 'P1', sentiment: 'negative', routed_to: 'Tier-3 Infrastructure Specialist' }), null, 310, '-35 minutes');
        insertExec.run(wfId, 'success', JSON.stringify({ customer: 'user@startup.co', issue: 'How to update billing credit card' }), JSON.stringify({ urgency: 'P4', sentiment: 'neutral', routed_to: 'Billing FAQ Bot' }), null, 250, '-5 hours');
        insertExec.run(wfId, 'success', JSON.stringify({ customer: 'cto@scaleup.io', issue: 'API rate limits hitting 429' }), JSON.stringify({ urgency: 'P2', sentiment: 'negative', routed_to: 'Developer Support Lead' }), null, 340, '-1 day');
      }
    }
  }
}
