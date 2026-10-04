const fs = require('fs');
const path = 'd:/pbl/SkillKollab/backend/src/services/store.service.js';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('getProjectFiles')) {
  const insertIndex = content.indexOf('// Connection Methods');
  if (insertIndex !== -1) {
    const fileMethods = `
  // File Methods
  async getProjectFiles(projectId) {
    if (!this.useMemory) {
      try {
        return await prisma.projectFile.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, include: { uploadedBy: true } })
      } catch (e) {
        console.warn('Prisma query failed, falling back to memory for this request');
      }
    }
    return [];
  }

  async createProjectFile(fileData) {
    if (!this.useMemory) {
      try {
        return await prisma.projectFile.create({ data: fileData, include: { uploadedBy: true } })
      } catch (e) {
        console.warn('Prisma query failed, falling back to memory for this request');
      }
    }
    return { id: \`file-\${Date.now()}\`, ...fileData, createdAt: new Date() };
  }

`;
    content = content.slice(0, insertIndex) + fileMethods + content.slice(insertIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added file methods to store.service.js');
  } else {
    console.log('Could not find injection point');
  }
} else {
  console.log('Methods already exist');
}
