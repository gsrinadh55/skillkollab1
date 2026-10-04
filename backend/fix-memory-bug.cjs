const fs = require('fs');
const path = 'd:/pbl/SkillKollab/backend/src/services/store.service.js';

let content = fs.readFileSync(path, 'utf8');

// Replace this.useMemory = true inside catch blocks (except in checkDatabaseAvailability)
content = content.replace(/catch \([a-zA-Z]+\) {\s*this\.useMemory = true\s*}/g, (match) => {
  return match.replace('this.useMemory = true', 'console.warn("Prisma query failed, falling back to memory for this request");');
});

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed all useMemory assignments');
