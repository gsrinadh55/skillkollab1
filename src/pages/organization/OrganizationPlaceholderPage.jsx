import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { OrganizationLayout } from '../../layouts/OrganizationLayout';

export function OrganizationPlaceholderPage({ title = "Page" }) {
  return (
    <OrganizationLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[70vh] text-center px-4"
      >
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <Construction size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-strong)] mb-3">{title}</h1>
        <p className="text-[var(--text-secondary)] max-w-md">
          This section of the Organization Portal is currently under construction. Check back soon for updates!
        </p>
      </motion.div>
    </OrganizationLayout>
  );
}
