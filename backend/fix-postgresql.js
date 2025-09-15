#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixSupportController() {
  const filePath = path.join(__dirname, 'controllers', 'SupportController.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix parameter placeholders systematically
  const fixes = [
    // Fix INSERT queries with RETURNING
    {
      from: /INSERT INTO support_tickets \(user_id, subject, description, priority, category\)\s*VALUES \(\?, \?, \?, \?, \?\)/g,
      to: 'INSERT INTO support_tickets (user_id, subject, description, priority, category) VALUES ($1, $2, $3, $4, $5) RETURNING id'
    },
    {
      from: /INSERT INTO user_analytics \(user_id, action, metadata, ip_address, user_agent\)\s*VALUES \(\?, \?, \?, \?, \?\)/g,
      to: 'INSERT INTO user_analytics (user_id, action, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)'
    },
    {
      from: /INSERT INTO ticket_comments \(ticket_id, user_id, comment, is_internal\)\s*VALUES \(\?, \?, \?, \?\)/g,
      to: 'INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal) VALUES ($1, $2, $3, $4) RETURNING id'
    },
    // Fix WHERE clauses
    {
      from: /WHERE st\.id = \?/g,
      to: 'WHERE st.id = $1'
    },
    {
      from: /WHERE id = \?/g,
      to: 'WHERE id = $1'
    },
    {
      from: /WHERE ticket_id = \?/g,
      to: 'WHERE ticket_id = $1'
    },
    {
      from: /WHERE st\.user_id = \?/g,
      to: 'WHERE st.user_id = $1'
    },
    {
      from: /WHERE tc\.ticket_id = \?/g,
      to: 'WHERE tc.ticket_id = $1'
    },
    // Fix datetime functions
    {
      from: /datetime\('now', '([^']+)'\)/g,
      to: (match, offset) => `NOW() - INTERVAL '${offset.replace('-', '')}'`
    },
    {
      from: /datetime\('now'\)/g,
      to: 'NOW()'
    },
    // Fix date functions
    {
      from: /date\(created_at\)/g,
      to: 'DATE(created_at)'
    },
    // Fix julianday date arithmetic
    {
      from: /\(julianday\(([^)]+)\) - julianday\(([^)]+)\)\) \* 24/g,
      to: 'EXTRACT(EPOCH FROM ($1 - $2)) / 3600'
    },
    // Fix boolean values
    {
      from: /is_internal = 0/g,
      to: 'is_internal = false'
    },
    {
      from: /is_internal = 1/g,
      to: 'is_internal = true'
    },
    {
      from: /\? = 1/g,
      to: '$1 = true'
    },
    {
      from: /\? = 0/g,
      to: '$1 = false'
    },
    // Fix result access
    {
      from: /result\.id/g,
      to: 'result.rows[0].id'
    }
  ];

  fixes.forEach(fix => {
    content = content.replace(fix.from, fix.to);
  });

  // Manual fixes for complex parameter patterns
  content = content.replace(
    /query \+= ' AND st\.status = \?';/g,
    "query += ' AND st.status = $' + (params.length + 1);"
  );
  
  content = content.replace(
    /query \+= ' AND st\.priority = \?';/g,
    "query += ' AND st.priority = $' + (params.length + 1);"
  );

  content = content.replace(
    /LIMIT \? OFFSET \?/g,
    "LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2) + '"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Fixed SupportController.js');
}

function fixCVController() {
  const filePath = path.join(__dirname, 'controllers', 'CVController.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix remaining SQLite syntax
  const fixes = [
    {
      from: /SET status = 'completed', candidate_count = \?, processing_time = \?, updated_at = CURRENT_TIMESTAMP\s*WHERE id = \?/g,
      to: 'SET status = \'completed\', candidate_count = $1, processing_time = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3'
    },
    {
      from: /SELECT \* FROM cv_batches WHERE id = \?/g,
      to: 'SELECT * FROM cv_batches WHERE id = $1'
    },
    {
      from: /SET status = 'failed', updated_at = CURRENT_TIMESTAMP\s*WHERE id = \?/g,
      to: 'SET status = \'failed\', updated_at = CURRENT_TIMESTAMP WHERE id = $1'
    }
  ];

  fixes.forEach(fix => {
    content = content.replace(fix.from, fix.to);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Fixed CVController.js');
}

function fixAnalyticsController() {
  const filePath = path.join(__dirname, 'controllers', 'AnalyticsController.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix remaining datetime issues
  content = content.replace(
    /WHERE created_at > NOW\(\) - INTERVAL '\$\{timeFrame\}'/g,
    "WHERE created_at > NOW() - INTERVAL '30 days'"
  );

  content = content.replace(
    /WHERE date > CURRENT_DATE - INTERVAL '\$\{timeFrame\}'/g,
    "WHERE date > CURRENT_DATE - INTERVAL '30 days'"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Fixed AnalyticsController.js');
}

console.log('Fixing PostgreSQL compatibility issues...\n');

fixSupportController();
fixCVController();
fixAnalyticsController();

console.log('\n✓ All controllers fixed for PostgreSQL compatibility!');
