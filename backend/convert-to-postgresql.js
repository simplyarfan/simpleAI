#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Comprehensive SQLite to PostgreSQL conversion script
 */

function convertSQLiteToPostgreSQL(content) {
  let converted = content;

  // 1. Convert parameter placeholders (? to $1, $2, etc.)
  let paramCount = 0;
  converted = converted.replace(/\?/g, () => {
    paramCount++;
    return `$${paramCount}`;
  });

  // Reset param count for each query block (this is a simplified approach)
  // In practice, we need to handle each query separately
  
  // 2. Convert datetime functions
  converted = converted.replace(/datetime\('now',\s*'([^']+)'\)/g, (match, offset) => {
    return `NOW() + INTERVAL '${offset.replace('-', '').replace(' ', ' ')}'`;
  });
  
  converted = converted.replace(/datetime\('now'\)/g, 'NOW()');

  // 3. Convert date functions
  converted = converted.replace(/date\(/g, 'DATE(');

  // 4. Convert julianday date arithmetic to PostgreSQL
  converted = converted.replace(
    /\(julianday\(([^)]+)\)\s*-\s*julianday\(([^)]+)\)\)\s*\*\s*24/g,
    'EXTRACT(EPOCH FROM ($1 - $2)) / 3600'
  );

  // 5. Convert boolean values in SQL
  converted = converted.replace(/is_internal = 0/g, 'is_internal = false');
  converted = converted.replace(/is_internal = 1/g, 'is_internal = true');
  converted = converted.replace(/is_active = 0/g, 'is_active = false');
  converted = converted.replace(/is_active = 1/g, 'is_active = true');
  converted = converted.replace(/is_verified = 0/g, 'is_verified = false');
  converted = converted.replace(/is_verified = 1/g, 'is_verified = true');

  // 6. Fix CASE WHEN boolean conditions
  converted = converted.replace(/WHEN is_verified = 1 THEN 1/g, 'WHEN is_verified = true THEN 1');

  return converted;
}

function convertParameterPlaceholders(content) {
  // More sophisticated parameter placeholder conversion
  // Split by SQL query blocks and convert each separately
  const lines = content.split('\n');
  let result = [];
  let inQuery = false;
  let paramCount = 0;
  
  for (let line of lines) {
    if (line.trim().includes('await database.') || line.trim().includes('`')) {
      if (line.includes('`')) {
        paramCount = 0; // Reset for new query
      }
      inQuery = true;
    }
    
    if (inQuery && line.includes('?')) {
      line = line.replace(/\?/g, () => {
        paramCount++;
        return `$${paramCount}`;
      });
    }
    
    if (line.includes('`, [') || line.includes('`);')) {
      inQuery = false;
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  let converted = convertParameterPlaceholders(content);
  converted = convertSQLiteToPostgreSQL(converted);
  
  // Write back to file
  fs.writeFileSync(filePath, converted, 'utf8');
  console.log(`✓ Converted: ${filePath}`);
}

// Process all controller files
const controllersDir = path.join(__dirname, 'controllers');
const controllerFiles = fs.readdirSync(controllersDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(controllersDir, file));

console.log('Converting SQLite syntax to PostgreSQL...\n');

controllerFiles.forEach(processFile);

console.log('\n✓ All controllers converted to PostgreSQL syntax!');
