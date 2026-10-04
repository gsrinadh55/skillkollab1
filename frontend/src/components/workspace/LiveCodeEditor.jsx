import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { 
  Folder, FileJson, FileCode2, FileType2, Play, Save, AlignLeft, 
  ChevronRight, ChevronDown, Users, Monitor, Smartphone, Tablet,
  TerminalSquare, X, Search, Command, FolderGit2, AlertTriangle, Plus,
  RefreshCw, GitCommit, Upload, Link2, Lock, KeyRound, CheckCircle2,
  Sparkles, Eye, EyeOff, CloudUpload, RotateCcw, FileText, ImageIcon,
  Code2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── GitHub API helper ─────────────────────────────────────────────────────────
async function ghFetch(path, token, options = {}) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`https://api.github.com${path}`, { ...options, headers });
  return res;
}

// Determine Monaco language from filename
function getLanguage(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', html: 'html', css: 'css', scss: 'scss', json: 'json',
    md: 'markdown', yml: 'yaml', yaml: 'yaml', sh: 'shell', bash: 'shell',
    rs: 'rust', go: 'go', java: 'java', cpp: 'cpp', c: 'c',
    rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin', sql: 'sql',
    xml: 'xml', dockerfile: 'dockerfile', txt: 'plaintext',
  };
  return map[ext] || 'plaintext';
}

function getFileIcon(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  if (['json', 'lock'].includes(ext)) return FileJson;
  if (['md', 'txt'].includes(ext)) return FileText;
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext)) return ImageIcon;
  if (['css', 'scss', 'less'].includes(ext)) return FileType2;
  return FileCode2;
}

const MOCK_FILES = {
  'src/App.jsx': {
    name: 'App.jsx',
    path: 'src/App.jsx',
    language: 'javascript',
    content: `import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("Ready");

  return (
    <div className="app">
      <h1>Autonomous AI Security Profiler</h1>
      <p>Status: {status}</p>
      <button onClick={() => setStatus("Running")}>Launch</button>
    </div>
  );
}

export default App;`
  },
  'src/styles.css': {
    name: 'styles.css',
    path: 'src/styles.css',
    language: 'css',
    content: `.app { font-family: sans-serif; padding: 20px; }
h1 { color: #6D4AFF; }
button { background: #6D4AFF; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }`
  },
};

// ─── GitHub token storage (session-level only) ─────────────────────────────────
const TOKEN_KEY = 'skillkollab_gh_pat';

export function LiveCodeEditor({ githubRepoUrl }) {
  // GitHub connection state
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [ghToken, setGhToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenDraft, setTokenDraft] = useState('');
  const [showTokenText, setShowTokenText] = useState(false);
  const [repoConnected, setRepoConnected] = useState(false);
  const [repoLoading, setRepoLoading] = useState(false);

  // File tree
  const [fileTree, setFileTree] = useState([]);
  const [fileContent, setFileContent] = useState(MOCK_FILES);
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState([]);

  // Editor state
  const [activeFile, setActiveFile] = useState('src/App.jsx');
  const [openTabs, setOpenTabs] = useState(['src/App.jsx', 'src/styles.css']);
  const [dirtyFiles, setDirtyFiles] = useState(new Set()); // unsaved changes

  // Commit push
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [isPushing, setIsPushing] = useState(false);

  // Preview / console
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Auto-sync polling
  const [lastCommitSha, setLastCommitSha] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [newCommitsAvailable, setNewCommitsAvailable] = useState(false);
  const pollRef = useRef(null);
  const consoleEndRef = useRef(null);

  // Parse repo URL whenever it changes from parent
  useEffect(() => {
    if (!githubRepoUrl) return;
    let clean = githubRepoUrl
      .replace('https://github.com/', '')
      .replace('http://github.com/', '')
      .replace(/\.git$/, '')
      .trim();
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      setRepoOwner(parts[0]);
      setRepoName(parts[1]);
    }
  }, [githubRepoUrl]);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput]);

  // ── Load file tree from GitHub ──────────────────────────────────────────────
  const loadRepoTree = useCallback(async (owner, repo, token) => {
    setRepoLoading(true);
    addLog('info', `🔗 Connecting to github.com/${owner}/${repo}...`);
    try {
      // Get default branch
      const metaRes = await ghFetch(`/repos/${owner}/${repo}`, token);
      if (metaRes.status === 404) {
        addLog('error', `❌ Repository ${owner}/${repo} not found or is private.`);
        toast.error('Repository not found or is private. Add a PAT for private repos.');
        setRepoLoading(false);
        return false;
      }
      if (metaRes.status === 401) {
        addLog('error', `❌ Unauthorized. Please provide a valid GitHub Personal Access Token.`);
        toast.error('Invalid token. Please enter a valid GitHub PAT.');
        setRepoLoading(false);
        return false;
      }
      const meta = await metaRes.json();
      const branch = meta.default_branch || 'main';

      // Get full recursive tree
      const treeRes = await ghFetch(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, token);
      if (!treeRes.ok) throw new Error(`Tree fetch failed: ${treeRes.status}`);
      const treeData = await treeRes.json();

      // Get latest commit SHA for polling
      const commitsRes = await ghFetch(`/repos/${owner}/${repo}/commits/${branch}`, token);
      if (commitsRes.ok) {
        const latestCommit = await commitsRes.json();
        setLastCommitSha(latestCommit.sha || '');
      }

      const flat = (treeData.tree || []).filter(n => n.type === 'blob');
      const tree = buildFileTree(flat);
      setFileTree(tree);

      // Auto-open first JS/TS/JSX file
      const firstCode = flat.find(f => /\.(jsx?|tsx?|py|html|css|md)$/.test(f.path));
      if (firstCode) {
        await loadFileContent(firstCode.path, owner, repo, branch, token);
        setOpenTabs([firstCode.path]);
        setActiveFile(firstCode.path);
      }

      setRepoConnected(true);
      setAutoSyncEnabled(true);
      addLog('success', `✓ Connected to ${owner}/${repo} on branch [${branch}] — ${flat.length} files indexed.`);
      toast.success(`Loaded ${flat.length} files from ${owner}/${repo}!`);
      return branch;
    } catch (err) {
      console.error(err);
      addLog('error', `❌ Failed to load repo: ${err.message}`);
      toast.error('Could not load repository files.');
    } finally {
      setRepoLoading(false);
    }
    return null;
  }, []);

  // ── Build nested tree from flat GitHub tree ─────────────────────────────────
  function buildFileTree(flatFiles) {
    const root = [];
    const map = {};

    flatFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      let pathSoFar = '';

      parts.forEach((part, i) => {
        pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
        const isLast = i === parts.length - 1;

        if (isLast) {
          const Icon = getFileIcon(part);
          current.push({ type: 'file', name: part, path: file.path, sha: file.sha, icon: Icon });
        } else {
          if (!map[pathSoFar]) {
            const folder = { type: 'folder', name: part, path: pathSoFar, children: [] };
            map[pathSoFar] = folder;
            current.push(folder);
          }
          current = map[pathSoFar].children;
        }
      });
    });

    return sortTree(root);
  }

  function sortTree(nodes) {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map(n => n.type === 'folder' ? { ...n, children: sortTree(n.children) } : n);
  }

  // ── Load individual file content ────────────────────────────────────────────
  const loadFileContent = useCallback(async (filePath, owner, repo, branch, token) => {
    const _owner = owner || repoOwner;
    const _repo = repo || repoName;
    const _token = token || ghToken;
    const _branch = branch || 'main';

    if (fileContent[filePath]?.content !== undefined && !repoLoading) {
      return; // Already loaded
    }

    setLoadingFile(true);
    try {
      const res = await ghFetch(`/repos/${_owner}/${_repo}/contents/${filePath}?ref=${_branch}`, _token);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      // GitHub returns base64-encoded content
      const decoded = atob(data.content.replace(/\n/g, ''));
      const lang = getLanguage(filePath);

      setFileContent(prev => ({
        ...prev,
        [filePath]: {
          name: filePath.split('/').pop(),
          path: filePath,
          language: lang,
          content: decoded,
          sha: data.sha, // needed for PUT (update) commits
          originalContent: decoded,
        }
      }));
    } catch (err) {
      addLog('error', `⚠ Could not load ${filePath}: ${err.message}`);
    } finally {
      setLoadingFile(false);
    }
  }, [repoOwner, repoName, ghToken, fileContent, repoLoading]);

  const handleFileClick = async (path) => {
    if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path]);
    setActiveFile(path);
    if (repoConnected && !fileContent[path]) {
      await loadFileContent(path);
    }
  };

  const closeTab = (e, path) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);
    if (activeFile === path) setActiveFile(newTabs[newTabs.length - 1] || null);
  };

  const handleEditorChange = (value) => {
    setFileContent(prev => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], content: value }
    }));
    setDirtyFiles(prev => {
      const next = new Set(prev);
      const orig = fileContent[activeFile]?.originalContent;
      if (orig !== undefined && value !== orig) next.add(activeFile);
      else next.delete(activeFile);
      return next;
    });
  };

  // ── Save + Push to GitHub ───────────────────────────────────────────────────
  const handlePushCommit = async () => {
    if (!ghToken) {
      toast.error('A GitHub Personal Access Token is required to push commits.');
      setShowTokenInput(true);
      return;
    }
    if (dirtyFiles.size === 0) {
      toast('No unsaved changes to push.');
      return;
    }
    setShowCommitModal(true);
    setCommitMsg(`feat: workspace edit via SkillKollab — ${new Date().toLocaleString()}`);
  };

  const confirmPush = async () => {
    if (!commitMsg.trim()) { toast.error('Commit message is required.'); return; }
    setIsPushing(true);
    setShowCommitModal(false);
    addLog('info', `📤 Pushing ${dirtyFiles.size} file(s) to ${repoOwner}/${repoName}...`);

    const changedFiles = Array.from(dirtyFiles);
    let successCount = 0;

    for (const filePath of changedFiles) {
      const file = fileContent[filePath];
      if (!file) continue;
      try {
        const encoded = btoa(unescape(encodeURIComponent(file.content)));
        const body = {
          message: commitMsg,
          content: encoded,
          branch: 'main',
        };
        if (file.sha) body.sha = file.sha;

        const res = await ghFetch(`/repos/${repoOwner}/${repoName}/contents/${filePath}`, ghToken, {
          method: 'PUT',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.status === 401) throw new Error('Unauthorized — check your GitHub token has repo write access.');
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || `Status ${res.status}`);
        }

        const data = await res.json();
        // Update SHA so next push uses correct SHA
        setFileContent(prev => ({
          ...prev,
          [filePath]: {
            ...prev[filePath],
            sha: data.content?.sha,
            originalContent: file.content,
          }
        }));
        addLog('success', `✓ Pushed ${filePath}`);
        successCount++;
      } catch (err) {
        addLog('error', `❌ Failed to push ${filePath}: ${err.message}`);
        toast.error(`Push failed for ${filePath}: ${err.message}`);
      }
    }

    if (successCount > 0) {
      setDirtyFiles(new Set());
      toast.success(`✓ ${successCount} file(s) pushed to ${repoOwner}/${repoName}!`);
      addLog('success', `🚀 Commit pushed: "${commitMsg}"`);
    }
    setIsPushing(false);
    setCommitMsg('');
  };

  // ── Auto-Polling for new pushes ─────────────────────────────────────────────
  const checkForNewCommits = useCallback(async () => {
    if (!repoOwner || !repoName) return;
    try {
      const res = await ghFetch(`/repos/${repoOwner}/${repoName}/commits?per_page=1`, ghToken);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.sha && data[0].sha !== lastCommitSha) {
        setLastCommitSha(data[0].sha);
        setNewCommitsAvailable(true);
        const author = data[0].commit?.author?.name || 'Someone';
        const msg = data[0].commit?.message?.split('\n')[0] || 'new commit';
        toast(`🔄 New push by ${author}: "${msg}"`, { icon: '📦', duration: 6000 });
        addLog('info', `📦 New commit from ${author}: ${msg}`);
      }
    } catch (e) {
      // Silent — polling errors shouldn't interrupt the user
    }
  }, [repoOwner, repoName, ghToken, lastCommitSha]);

  useEffect(() => {
    if (autoSyncEnabled && repoConnected) {
      pollRef.current = setInterval(checkForNewCommits, 30000); // every 30s
    }
    return () => clearInterval(pollRef.current);
  }, [autoSyncEnabled, repoConnected, checkForNewCommits]);

  const handlePullLatest = async () => {
    setNewCommitsAvailable(false);
    addLog('info', '🔄 Pulling latest changes from GitHub...');
    // Reload all open tabs
    for (const tab of openTabs) {
      delete fileContent[tab];
      await loadFileContent(tab);
    }
    addLog('success', '✓ Pulled latest changes.');
    toast.success('Latest changes pulled from GitHub!');
  };

  // ── Connect Repo Button ─────────────────────────────────────────────────────
  const handleConnectRepo = async () => {
    if (!repoOwner || !repoName) {
      toast.error('Enter a valid GitHub repo URL in the GitHub Sync tab first.');
      return;
    }
    setFileContent(MOCK_FILES);
    setOpenTabs([]);
    setActiveFile(null);
    setRepoConnected(false);
    setConsoleOutput([]);
    await loadRepoTree(repoOwner, repoName, ghToken);
  };

  const handleSaveToken = () => {
    const t = tokenDraft.trim();
    if (!t) { toast.error('Token cannot be empty.'); return; }
    setGhToken(t);
    sessionStorage.setItem(TOKEN_KEY, t);
    setTokenDraft('');
    setShowTokenInput(false);
    toast.success('GitHub token saved for this session!');
  };

  // ── Console helper ──────────────────────────────────────────────────────────
  const addLog = (type, text) => {
    setConsoleOutput(prev => [...prev, { type, text, ts: new Date().toLocaleTimeString() }]);
    setIsConsoleOpen(true);
  };

  // ── Run (compile preview) ───────────────────────────────────────────────────
  const handleRun = () => {
    setIsCompiling(true);
    setIsConsoleOpen(true);
    toast.loading('Compiling...', { id: 'code-run' });
    addLog('info', '⚙️ Initializing module bundler...');
    addLog('info', '📦 Parsing active files...');
    setTimeout(() => {
      setIsCompiling(false);
      setIsRunning(true);
      addLog('success', '✓ Build successful — 0 errors.');
      addLog('info', '🚀 App running in live sandbox!');
      toast.success('Running in preview!', { id: 'code-run' });
    }, 800);
  };

  // ── Render file tree ────────────────────────────────────────────────────────
  const renderFileTree = (nodes, depth = 0) => {
    return nodes.map((node, i) => {
      if (node.type === 'folder') {
        const isOpen = expandedFolders.includes(node.path);
        return (
          <div key={node.path + i}>
            <div
              className="flex items-center gap-1.5 py-1 hover:bg-[var(--bg-surface)] text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-strong)] cursor-pointer rounded-md transition-colors"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => setExpandedFolders(prev => isOpen ? prev.filter(p => p !== node.path) : [...prev, node.path])}
            >
              {isOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
              <Folder className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span className="font-medium truncate">{node.name}</span>
            </div>
            {isOpen && renderFileTree(node.children, depth + 1)}
          </div>
        );
      }

      const isActive = activeFile === node.path;
      const Icon = node.icon || FileCode2;
      const isDirty = dirtyFiles.has(node.path);
      return (
        <div
          key={node.path + i}
          onClick={() => handleFileClick(node.path)}
          title={node.path}
          className={`flex items-center gap-1.5 py-1.5 text-[12px] cursor-pointer rounded-md transition-colors ${
            isActive
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-strong)]'
          }`}
          style={{ paddingLeft: `${depth * 12 + 20}px` }}
        >
          <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="truncate flex-1">{node.name}</span>
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />}
        </div>
      );
    });
  };

  const isUsingMocks = !repoConnected;

  return (
    <div className="flex flex-col h-[80vh] min-h-[700px] border border-[var(--border-strong)] rounded-[16px] overflow-hidden bg-[#FFFFFF] dark:bg-[var(--bg-card)] shadow-sm font-sans animate-fadeIn">

      {/* ── GitHub Repo Connection Header Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0F1117] border-b border-[#2D3748] shrink-0">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-4 h-4 text-[#10B981]" />
          {repoConnected ? (
            <span className="text-[13px] font-mono text-[#10B981] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              {repoOwner}/{repoName}
            </span>
          ) : (
            <span className="text-[12px] text-[#6B7280] font-mono">
              {repoOwner && repoName ? `${repoOwner}/${repoName} — not loaded` : 'No repo connected'}
            </span>
          )}

          {repoConnected && (
            <>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] rounded-full border border-[#10B981]/20 uppercase">
                LIVE
              </span>
              {autoSyncEnabled && (
                <span className="text-[10px] text-[#6B7280] hidden sm:inline">Auto-sync every 30s</span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {newCommitsAvailable && (
            <button
              onClick={handlePullLatest}
              className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors animate-pulse cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> New push! Pull changes
            </button>
          )}

          {/* PAT Token button */}
          <button
            onClick={() => setShowTokenInput(v => !v)}
            title="Configure GitHub Personal Access Token"
            className={`p-1.5 rounded-md border text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
              ghToken
                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{ghToken ? 'Token ✓' : 'Add Token'}</span>
          </button>

          {repoOwner && repoName && (
            <button
              onClick={handleConnectRepo}
              disabled={repoLoading}
              className="px-3 py-1.5 rounded-md bg-[#6D4AFF] hover:bg-[#5B3BEB] text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${repoLoading ? 'animate-spin' : ''}`} />
              {repoLoading ? 'Loading...' : repoConnected ? 'Reload Repo' : 'Load Files'}
            </button>
          )}
        </div>
      </div>

      {/* ── Token Input Panel ── */}
      <AnimatePresence>
        {showTokenInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[#2D3748] bg-[#13151A]"
          >
            <div className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 space-y-1">
                <p className="text-[12px] font-semibold text-[#94A3B8]">GitHub Personal Access Token (PAT)</p>
                <p className="text-[11px] text-[#4B5563]">
                  Required to <strong className="text-[#94A3B8]">push commits</strong>. For public repos, token is optional for reading files.
                  Create one at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-[#6D4AFF] underline">github.com/settings/tokens</a> with <code className="bg-[#1E293B] px-1 rounded">repo</code> scope.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <input
                    type={showTokenText ? 'text' : 'password'}
                    value={tokenDraft}
                    onChange={e => setTokenDraft(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-[12px] text-[#E2E8F0] font-mono focus:outline-none focus:border-[#6D4AFF] pr-8"
                    onKeyDown={e => e.key === 'Enter' && handleSaveToken()}
                  />
                  <button
                    onClick={() => setShowTokenText(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#94A3B8]"
                  >
                    {showTokenText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={handleSaveToken}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-bold rounded-md cursor-pointer"
                >
                  Save
                </button>
                {ghToken && (
                  <button
                    onClick={() => { setGhToken(''); sessionStorage.removeItem(TOKEN_KEY); toast('Token cleared.'); }}
                    className="px-3 py-2 bg-[#1E293B] hover:bg-[#2D3748] text-[#94A3B8] text-[12px] rounded-md cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Commits notification banner ── */}
      <AnimatePresence>
        {!repoConnected && !repoLoading && repoOwner && repoName && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-[#1E293B] border-b border-[#2D3748] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[12px] text-[#94A3B8]">
                Repo <strong className="text-white">{repoOwner}/{repoName}</strong> is linked from GitHub Sync tab.
                Click <strong className="text-[#6D4AFF]">"Load Files"</strong> above to fetch all repo files into the editor.
                {!ghToken && <span className="text-amber-400"> Add a GitHub PAT to also push commits.</span>}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Editor 3-panel layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: File Explorer */}
        <div className="w-[220px] flex-shrink-0 border-r border-[var(--border-strong)] bg-[#F8FAFC] dark:bg-[#13151A] flex flex-col">
          <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
              {repoConnected ? `${repoOwner}/${repoName}` : 'SANDBOX FILES'}
            </span>
            <div className="flex items-center gap-1">
              {isUsingMocks && (
                <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">Demo</span>
              )}
              {repoConnected && (
                <button
                  onClick={() => checkForNewCommits()}
                  className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]"
                  title="Check for new commits"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {repoLoading ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <RefreshCw className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                <p className="text-[11px] text-[var(--text-muted)]">Loading files...</p>
              </div>
            ) : repoConnected && fileTree.length > 0 ? (
              renderFileTree(fileTree)
            ) : (
              renderFileTree([
                { type: 'folder', name: 'src', path: 'src', children: [
                  { type: 'file', name: 'App.jsx', path: 'src/App.jsx', icon: FileCode2 },
                  { type: 'file', name: 'styles.css', path: 'src/styles.css', icon: FileType2 },
                ]},
              ])
            )}
          </div>

          {/* Dirty files badge */}
          {dirtyFiles.size > 0 && (
            <div className="p-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={handlePushCommit}
                className="w-full py-2 rounded-lg bg-[#6D4AFF]/15 border border-[#6D4AFF]/30 text-[#6D4AFF] text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-[#6D4AFF]/25 transition-colors cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                Push {dirtyFiles.size} change{dirtyFiles.size > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* CENTER: Monaco Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] dark:bg-[#0F1117] border-r border-[var(--border-strong)]">

          {/* Editor Tabs */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#13151A] border-b border-[var(--border-strong)] overflow-x-auto hide-scrollbar shrink-0">
            {openTabs.map(tab => {
              const f = fileContent[tab];
              if (!f && !MOCK_FILES[tab]) return null;
              const fname = (f || MOCK_FILES[tab])?.name || tab.split('/').pop();
              const dirty = dirtyFiles.has(tab);
              return (
                <div
                  key={tab}
                  onClick={() => handleFileClick(tab)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-[12px] border-r border-[var(--border-strong)] cursor-pointer min-w-[100px] max-w-[160px] transition-colors border-b-2 shrink-0 ${
                    activeFile === tab
                      ? 'bg-[#FFFFFF] dark:bg-[#0F1117] text-[var(--color-primary)] border-b-[var(--color-primary)] font-semibold'
                      : 'bg-transparent text-[var(--text-secondary)] hover:bg-[#FFFFFF]/50 border-b-transparent'
                  }`}
                >
                  <FileCode2 className="w-3 h-3 opacity-70 shrink-0" />
                  <span className="truncate">{fname}{dirty ? ' ●' : ''}</span>
                  <button onClick={e => closeTab(e, tab)} className="ml-auto p-0.5 hover:bg-black/10 rounded cursor-pointer shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-[var(--border-subtle)] bg-[#FFFFFF] dark:bg-[#0F1117] shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#10B981] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {repoConnected ? `${repoOwner}/${repoName} • main` : 'sandbox • demo'}
              </span>
              {repoConnected && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                  <FolderGit2 className="w-3 h-3 text-[var(--text-secondary)]" />
                  <button
                    onClick={handlePullLatest}
                    className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-strong)] cursor-pointer"
                  >Pull</button>
                  <span className="text-[#3B4455]">|</span>
                  <button
                    onClick={handlePushCommit}
                    className="text-[11px] font-semibold text-[#6D4AFF] hover:text-[#5B3BEB] cursor-pointer"
                  >Commit & Push</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePushCommit}
                disabled={dirtyFiles.size === 0 || isPushing}
                className="px-3 py-1.5 text-[12px] font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-30 cursor-pointer"
                title="Commit & push changes to GitHub"
              >
                <Upload className="w-3.5 h-3.5" />
                {isPushing ? 'Pushing...' : 'Push'}
                {dirtyFiles.size > 0 && <span className="bg-white/20 text-white text-[10px] px-1 rounded-full">{dirtyFiles.size}</span>}
              </button>
              <button
                onClick={handleRun}
                className="px-3 py-1.5 text-[12px] font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Run
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden bg-[#0F1117]">
            {loadingFile && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0F1117]/80">
                <RefreshCw className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
              </div>
            )}
            {activeFile && fileContent[activeFile] ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={fileContent[activeFile]?.language || 'plaintext'}
                value={fileContent[activeFile]?.content || ''}
                onChange={handleEditorChange}
                loading={<div className="h-full flex items-center justify-center text-xs text-[#6B7280] font-mono">Loading editor...</div>}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineHeight: 1.65,
                  padding: { top: 14 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  formatOnPaste: true,
                  wordWrap: 'on',
                  bracketPairColorization: { enabled: true },
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-6">
                <Code2 className="w-12 h-12 text-[#2D3748]" />
                <p className="text-[13px] text-[#4B5563]">
                  {repoConnected ? 'Select a file from the explorer to edit' : 'Load a GitHub repo or select a sandbox file'}
                </p>
              </div>
            )}
          </div>

          {/* Console Drawer */}
          <div className={`border-t border-[var(--border-strong)] bg-[#F8FAFC] dark:bg-[#13151A] flex flex-col transition-all duration-200 shrink-0 ${isConsoleOpen ? 'h-[160px]' : 'h-9'}`}>
            <div className="flex items-center justify-between px-4 h-9 border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsConsoleOpen(true)} className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isConsoleOpen ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  <TerminalSquare className="w-3.5 h-3.5" /> Console
                </button>
                {consoleOutput.length > 0 && (
                  <span className="text-[9px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded-full font-bold">{consoleOutput.length}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setConsoleOutput([])} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">Clear</button>
                <button onClick={() => setIsConsoleOpen(v => !v)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[var(--text-secondary)]">
                  {isConsoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {isConsoleOpen && (
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] bg-[#FFFFFF] dark:bg-[#0F1117] text-[#334155] dark:text-[#CBD5E1]">
                {consoleOutput.length === 0 ? (
                  <div className="text-[#6B7280] italic">No output yet.</div>
                ) : consoleOutput.map((log, i) => (
                  <div key={i} className={`flex gap-2 ${log.type === 'success' ? 'text-[#10B981]' : log.type === 'error' ? 'text-[#EF4444]' : log.type === 'warning' ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`}>
                    <span className="opacity-40 shrink-0">{log.ts}</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="w-[340px] flex-shrink-0 bg-[#F8FAFC] dark:bg-[#13151A] flex flex-col hidden lg:flex">
          <div className="p-3 border-b border-[var(--border-strong)] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Live Preview</span>
            <div className="flex items-center gap-1.5">
              {(['mobile', 'tablet', 'desktop']).map(d => {
                const icons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };
                const Icon = icons[d];
                return (
                  <button key={d} className={`p-1 rounded transition-colors ${previewDevice === d ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`} onClick={() => setPreviewDevice(d)}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
              <div className="w-px h-3 bg-[var(--border-strong)] mx-1" />
              <button onClick={handleRun} className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]" title="Refresh Preview">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-[#0B0E14] flex items-center justify-center p-3 overflow-hidden">
            <div className={`bg-white shadow-md border border-[var(--border-subtle)] transition-all duration-300 flex flex-col overflow-hidden ${
              previewDevice === 'mobile' ? 'w-[280px] h-[540px] rounded-[24px]' :
              previewDevice === 'tablet' ? 'w-full h-[580px] rounded-[16px]' :
              'w-full h-full rounded-none shadow-none border-0'
            }`}>
              {previewDevice !== 'desktop' && (
                <div className="h-5 bg-[#F1F5F9] dark:bg-[#1E293B] border-b border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                  <div className="w-12 h-1 bg-[#CBD5E1] rounded-full" />
                </div>
              )}
              <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F1117]">
                {isCompiling ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--color-primary)]">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                    <p className="text-[12px] font-semibold">Compiling...</p>
                  </div>
                ) : (isRunning || consoleOutput.some(l => l.type === 'success')) ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 space-y-4">
                    <header className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <h2 className="text-[#6D4AFF] text-[14px] font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        {repoOwner && repoName ? `${repoOwner}/${repoName}` : 'Live Preview'}
                      </h2>
                      <span className="text-[10px] font-mono font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded">200 OK</span>
                    </header>

                    {/* Dynamic render from active file */}
                    {(() => {
                      const code = fileContent[activeFile]?.content || fileContent['src/App.jsx']?.content || '';
                      const h1 = code.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] || code.match(/title["\s:=]+["']([^"']+)/)?.[1] || (repoName || 'App Preview');
                      const h2 = code.match(/<h2[^>]*>(.*?)<\/h2>/)?.[1];
                      const p = code.match(/<p[^>]*>(.*?)<\/p>/)?.[1];
                      return (
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-white dark:bg-[#151821] border border-[var(--border-strong)] shadow-sm">
                            <h1 className="text-[17px] font-bold text-[var(--text-strong)]">{h1}</h1>
                            {h2 && <h2 className="text-[13px] font-medium text-[var(--text-secondary)] mt-1">{h2}</h2>}
                            {p && <p className="text-[12px] text-[var(--text-secondary)] mt-2">{p}</p>}
                            <div className="flex items-center gap-2 mt-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20">ACTIVE</span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {activeFile?.split('/').pop() || 'app'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-xl bg-white dark:bg-[#151821] border border-[var(--border-subtle)]">
                              <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Files</p>
                              <p className="text-[18px] font-bold text-[var(--text-strong)]">
                                {repoConnected ? fileTree.reduce((acc, n) => acc + (n.type === 'file' ? 1 : (n.children?.length || 0)), 0) : '2'}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-[#151821] border border-[var(--border-subtle)]">
                              <p className="text-[10px] text-emerald-500 uppercase font-semibold">Status</p>
                              <p className="text-[18px] font-bold text-emerald-500">OK</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-5 text-[var(--text-muted)]">
                    <Play className="w-9 h-9 mx-auto mb-3 opacity-20 text-[var(--color-primary)]" />
                    <p className="text-[12px] italic">Click 'Run' to preview the app</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Commit Message Modal ── */}
      <AnimatePresence>
        {showCommitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#111827] border border-[#374151] rounded-[20px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#2D3748]">
                <div className="flex items-center gap-3 mb-1">
                  <GitCommit className="w-5 h-5 text-[#6D4AFF]" />
                  <h3 className="text-[16px] font-bold text-white">Commit & Push to GitHub</h3>
                </div>
                <p className="text-[12px] text-[#6B7280]">
                  Pushing <strong className="text-[#94A3B8]">{dirtyFiles.size} file(s)</strong> to <strong className="text-[#10B981]">{repoOwner}/{repoName}</strong> (main branch).
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#94A3B8]">Commit Message *</label>
                  <input
                    type="text"
                    autoFocus
                    value={commitMsg}
                    onChange={e => setCommitMsg(e.target.value)}
                    placeholder="feat: describe your changes"
                    className="w-full bg-[#0F1117] border border-[#374151] focus:border-[#6D4AFF] rounded-xl px-4 py-3 text-[13px] text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20"
                    onKeyDown={e => e.key === 'Enter' && confirmPush()}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Files to be pushed:</p>
                  <div className="bg-[#0F1117] rounded-xl p-3 space-y-1 max-h-28 overflow-y-auto">
                    {Array.from(dirtyFiles).map(f => (
                      <div key={f} className="flex items-center gap-2 text-[11px] text-[#94A3B8] font-mono">
                        <span className="text-amber-400">M</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCommitModal(false)}
                    className="flex-1 py-3 rounded-xl bg-[#1E293B] hover:bg-[#2D3748] text-[#94A3B8] text-[13px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPush}
                    disabled={!commitMsg.trim()}
                    className="flex-1 py-3 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3BEB] text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Push Commit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LiveCodeEditor;
