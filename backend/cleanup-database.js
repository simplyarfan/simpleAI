#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Comprehensive database cleanup script for PostgreSQL compatibility
 */

function cleanupFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Fix parameter placeholders - need to be careful with context
  const lines = content.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if this line contains SQL with parameters
    if (line.includes('`') && line.includes('?')) {
      // Find the SQL block and convert parameters
      let paramCount = 0;
      line = line.replace(/\?/g, () => {
        paramCount++;
        return `$${paramCount}`;
      });
      changes++;
    }
    
    processedLines.push(line);
  }
  
  content = processedLines.join('\n');

  // 2. Fix datetime functions
  const datetimeFixes = [
    {
      pattern: /datetime\('now',\s*'([^']+)'\)/g,
      replacement: (match, offset) => {
        const cleanOffset = offset.replace('-', '');
        return `NOW() - INTERVAL '${cleanOffset}'`;
      }
    },
    {
      pattern: /datetime\('now'\)/g,
      replacement: 'NOW()'
    }
  ];

  datetimeFixes.forEach(fix => {
    const before = content;
    if (typeof fix.replacement === 'function') {
      content = content.replace(fix.pattern, fix.replacement);
    } else {
      content = content.replace(fix.pattern, fix.replacement);
    }
    if (content !== before) changes++;
  });

  // 3. Fix date functions
  content = content.replace(/\bdate\(/g, 'DATE(');

  // 4. Fix julianday date arithmetic
  const julianDayPattern = /\(julianday\(([^)]+)\)\s*-\s*julianday\(([^)]+)\)\)\s*\*\s*24/g;
  if (julianDayPattern.test(content)) {
    content = content.replace(julianDayPattern, 'EXTRACT(EPOCH FROM ($1 - $2)) / 3600');
    changes++;
  }

  // 5. Fix boolean values
  const booleanFixes = [
    { from: /is_internal = 0/g, to: 'is_internal = false' },
    { from: /is_internal = 1/g, to: 'is_internal = true' },
    { from: /is_active = 0/g, to: 'is_active = false' },
    { from: /is_active = 1/g, to: 'is_active = true' },
    { from: /is_verified = 0/g, to: 'is_verified = false' },
    { from: /is_verified = 1/g, to: 'is_verified = true' },
    { from: /WHEN is_verified = 1 THEN 1/g, to: 'WHEN is_verified = true THEN 1' }
  ];

  booleanFixes.forEach(fix => {
    const before = content;
    content = content.replace(fix.from, fix.to);
    if (content !== before) changes++;
  });

  // 6. Fix RETURNING clauses for INSERT statements
  const insertFixes = [
    {
      from: /INSERT INTO ([^(]+)\([^)]+\)\s*VALUES\s*\([^)]+\)(?!\s*RETURNING)/g,
      to: (match) => match + ' RETURNING id'
    }
  ];

  insertFixes.forEach(fix => {
    const before = content;
    content = content.replace(fix.from, fix.to);
    if (content !== before) changes++;
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Applied ${changes} fixes to ${path.basename(filePath)}`);
  } else {
    console.log(`- No changes needed for ${path.basename(filePath)}`);
  }
}

// Process all controller files
const controllersDir = path.join(__dirname, 'controllers');
const files = [
  'SupportController.js',
  'CVController.js', 
  'AnalyticsController.js',
  'AuthController.js'
];

console.log('🔧 Starting comprehensive database cleanup...\n');

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  if (fs.existsSync(filePath)) {
    cleanupFile(filePath);
  }
});

console.log('\n✅ Database cleanup completed!');
