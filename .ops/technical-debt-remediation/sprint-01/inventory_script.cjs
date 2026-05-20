const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../../src');
const apiDir = path.join(__dirname, '../../../api');
const migrationsDir = path.join(__dirname, '../../../supabase/migrations');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const codeFiles = [
  ...(fs.existsSync(srcDir) ? getAllFiles(srcDir) : []),
  ...(fs.existsSync(apiDir) ? getAllFiles(apiDir) : [])
].filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

const migrationFiles = fs.existsSync(migrationsDir) ? getAllFiles(migrationsDir).filter(f => f.endsWith('.sql')) : [];

const tablesUsed = new Set();
const rpcsUsed = new Set();

const tableRegex = /\.from\(['"]([^'"]+)['"]\)/g;
const rpcRegex = /\.rpc\(['"]([^'"]+)['"]/g;

codeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    tablesUsed.add(match[1]);
  }
  while ((match = rpcRegex.exec(content)) !== null) {
    rpcsUsed.add(match[1]);
  }
});

const tablesDefined = new Set();
const rpcsDefined = new Set();

const createTableRegex = /create table (if not exists )?([a-zA-Z0-9_]+)/gi;
const createFunctionRegex = /create (or replace )?function ([a-zA-Z0-9_]+)/gi;

migrationFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    tablesDefined.add(match[2].toLowerCase());
  }
  while ((match = createFunctionRegex.exec(content)) !== null) {
    rpcsDefined.add(match[2].toLowerCase());
  }
});

const usedTablesList = Array.from(tablesUsed);
const missingTables = usedTablesList.filter(t => !tablesDefined.has(t.toLowerCase()));

const usedRpcsList = Array.from(rpcsUsed);
const missingRpcs = usedRpcsList.filter(r => !rpcsDefined.has(r.toLowerCase()));

const report = `
# Schema Inventory Report

## Tables
* Found in migrations: ${tablesDefined.size}
* Used in code: ${usedTablesList.length}
* Missing from migrations: ${missingTables.length}

Missing Tables:
${missingTables.map(t => '- ' + t).join('\n')}

## RPCs
* Found in migrations: ${rpcsDefined.size}
* Used in code: ${usedRpcsList.length}
* Missing from migrations: ${missingRpcs.length}

Missing RPCs:
${missingRpcs.map(t => '- ' + t).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'schema-inventory.md'), report);

const missingReport = `
# Missing Schema Report

The following tables are used in the codebase but are missing from official migrations:
${missingTables.map(t => '- ' + t).join('\n')}

The following RPCs are used in the codebase but are missing from official migrations:
${missingRpcs.map(t => '- ' + t).join('\n')}
`;
fs.writeFileSync(path.join(__dirname, 'missing-schema-report.md'), missingReport);

console.log("Inventory completed. Missing tables: " + missingTables.length);
