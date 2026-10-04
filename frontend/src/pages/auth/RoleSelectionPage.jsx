import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, User, Building } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';

export function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (rolePath, roleKey) => {
    if (roleKey) {
      sessionStorage.setItem('skillkollab_selected_role', roleKey);
    }
    navigate(rolePath);
  };

  return (
    <div className="app-shell flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="ambient ambient-right" aria-hidden="true" />
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-[var(--text-strong)] tracking-tight sm:text-4xl">
            Who are you?
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Choose the role that best describes you to get started with SkillKollab.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Student / Contributor */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => handleSelect('/register?role=student', 'STUDENT')}
            className="cursor-pointer bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-8 hover:border-[var(--color-primary)] hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(109,93,246,0.1)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)] transition-colors">
              <GraduationCap className="w-8 h-8 text-[var(--color-primary)] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-strong)] mb-3">Student / Contributor</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Discover challenges, build solutions and collaborate.
            </p>
          </motion.div>



          {/* University / Organization */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => handleSelect('/register?role=organization', 'ORGANIZATION_ADMIN')}
            className="cursor-pointer bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-8 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
              <Building className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-strong)] mb-3">University / Organization</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Create challenges, evaluate applications and manage innovation programs.
            </p>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
