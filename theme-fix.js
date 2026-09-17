const fs = require('fs');
let content = fs.readFileSync('src/pages/onboarding/OnboardingWizardPage.jsx', 'utf8');

const replacements = [
  { search: /bg-\[\#09090B\]/g, replace: 'bg-[var(--bg-main)]' },
  { search: /text-slate-100/g, replace: 'text-[var(--text-primary)]' },
  { search: /bg-\[\#18181B\]/g, replace: 'bg-[var(--bg-card)]' },
  { search: /text-white/g, replace: 'text-[var(--text-strong)]' },
  { search: /text-slate-400/g, replace: 'text-[var(--text-secondary)]' },
  { search: /text-slate-500/g, replace: 'text-[var(--text-muted)]' },
  { search: /text-slate-300/g, replace: 'text-[var(--text-secondary)]' },
  { search: /text-slate-200/g, replace: 'text-[var(--text-primary)]' },
  { search: /border-white\/10/g, replace: 'border-[var(--border-subtle)]' },
  { search: /border-white\/30/g, replace: 'border-[var(--border-strong)]' },
  { search: /bg-white\/10/g, replace: 'bg-[var(--bg-surface)]' },
  { search: /bg-white\/20/g, replace: 'bg-[var(--bg-card-hover)]' },
  { search: /bg-white\/5/g, replace: 'bg-[var(--bg-surface)]' }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync('src/pages/onboarding/OnboardingWizardPage.jsx', content);
