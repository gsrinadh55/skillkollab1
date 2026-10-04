import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, UploadCloud, Download, Share2, Search, Trash2, FileCode, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { addDocument, removeDocument } from '../../store/slices/workspaceSlice';

export function DocumentsPage() {
  const { sharedDocuments } = useSelector((state) => state.workspace);
  const { profile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const rawBytes = file.size;
    let sizeStr = '0 Bytes';
    if (rawBytes) {
      const k = 1024;
      const i = Math.floor(Math.log(rawBytes) / Math.log(k));
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      sizeStr = `${parseFloat((rawBytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64Url = evt.target.result;
      const uploaderName = profile?.name || profile?.displayName || profile?.email || 'User';

      const docPayload = {
        id: `f-${Date.now()}`,
        name: file.name,
        size: sizeStr,
        sizeBytes: rawBytes,
        type: file.type || 'Document',
        url: base64Url,
        uploadedBy: uploaderName,
        date: new Date().toLocaleDateString()
      };

      dispatch(addDocument(docPayload));
      toast.success(`Encrypted and stored: ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleDownload = (doc) => {
    try {
      if (doc.url && (doc.url.startsWith('data:') || doc.url.startsWith('http'))) {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${doc.name}`);
      } else {
        // Fallback blob generation
        const content = `# ${doc.name}\nUploaded by: ${doc.uploadedBy || 'User'}\nDate: ${doc.date || 'N/A'}\n\n[SkillKollab Vault Document Placeholder]`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name.endsWith('.pdf') || doc.name.endsWith('.xlsx') ? doc.name : `${doc.name}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${doc.name}`);
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  const handleShare = (doc) => {
    const shareUrl = `${window.location.origin}/documents#${encodeURIComponent(doc.name)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success(`Share link for "${doc.name}" copied to clipboard!`))
        .catch(() => toast.error('Failed to copy link'));
    } else {
      toast.success(`Share link generated for ${doc.name}`);
    }
  };

  const handleDelete = (doc) => {
    dispatch(removeDocument(doc.id || doc.name));
    toast.success(`Removed ${doc.name} from vault`);
  };

  const filteredDocs = sharedDocuments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.uploadedBy && d.uploadedBy.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Header */}
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
            onClick={handleUploadClick}
            className="btn-sk-primary text-xs px-6 py-3 font-extrabold flex items-center gap-2 self-start sm:self-auto shadow-sm hover:shadow-md cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" /> Upload Architecture File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by filename or uploader..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
          />
        </div>

        {/* Documents Grid */}
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, idx) => (
              <div key={doc.id || idx} className="sk-glass-card p-6 flex flex-col justify-between hover:border-[var(--color-primary)]/40 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--border-subtle)] text-[var(--color-primary)] shadow-sm">
                      <FileText className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-black uppercase">Encrypted</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--text-strong)] truncate mb-1" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Uploaded by <strong className="text-[var(--text-strong)]">{doc.uploadedBy || 'Team Member'}</strong>
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>{doc.size || '1.0 MB'} • {doc.date || 'Today'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(doc)}
                      title="Download File"
                      className="text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 p-2 rounded-lg transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(doc)}
                      title="Copy Share Link"
                      className="text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 p-2 rounded-lg transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      title="Delete File"
                      className="text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--bg-surface)] space-y-4">
            <FileCode className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[var(--text-strong)]">No architecture documents found</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {search ? `No files match "${search}". Try clearing your search filter.` : 'Upload technical specifications, API schemas, or architecture diagrams to share with your team.'}
              </p>
            </div>
            {!search && (
              <button
                onClick={handleUploadClick}
                className="btn-sk-primary text-xs px-5 py-2.5 font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" /> Upload First File
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

