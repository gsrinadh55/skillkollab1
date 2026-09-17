import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, UploadCloud, Download, Share2, Search, Trash2, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { addDocument } from '../../store/slices/workspaceSlice';

export function DocumentsPage() {
  const { sharedDocuments } = useSelector((state) => state.workspace);
  const { profile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');

  const handleUpload = () => {
    const fileName = `Venture_Technical_RFC_${Math.floor(Math.random() * 899 + 100)}.pdf`;
    dispatch(addDocument({
      name: fileName,
      uploadedBy: profile.name,
      size: '3.1 MB',
      date: 'Just now'
    }));
    toast.success(`Encrypted and published: ${fileName}`);
  };

  const filteredDocs = sharedDocuments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        <div className="border-b border-[var(--border-subtle)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="py-1 px-3 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Shared Architecture Vault
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-strong)] tracking-tight">
              Project RFCs & Technical Specifications
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Centralized repository for high-level diagrams, investor pitch decks, and automated Zod API contracts.
            </p>
          </div>

          <button
            onClick={handleUpload}
            className="btn-sk-primary text-xs px-6 py-3 font-extrabold flex items-center gap-2 self-start sm:self-auto shadow-sm hover:shadow-md"
          >
            <UploadCloud className="w-4 h-4" /> Upload Architecture File
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by filename or tag..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
          />
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc, idx) => (
            <div key={doc.id || idx} className="sk-glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--border-subtle)] text-[var(--color-primary)] shadow-sm">
                    <FileText className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-black uppercase">Encrypted</span>
                </div>
                <h3 className="text-sm font-extrabold text-[var(--text-strong)] truncate mb-1" title={doc.name}>{doc.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Uploaded by <strong className="text-[var(--text-strong)]">{doc.uploadedBy}</strong></p>
              </div>

              <div className="pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <span>{doc.size} • {doc.date}</span>
                <div className="flex gap-3">
                  <button onClick={() => toast.success(`Downloading ${doc.name}...`)} title="Download" className="text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 p-1.5 -m-1.5 rounded-lg transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => toast.success('Link copied to team clipboard')} title="Share" className="text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 p-1.5 -m-1.5 rounded-lg transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
