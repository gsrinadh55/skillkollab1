import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { 
  Folder, FileJson, FileCode2, FileType2, Play, Save, AlignLeft, 
  ChevronRight, ChevronDown, Users, Monitor, Smartphone, Tablet,
  TerminalSquare, X, Search, Command, FolderGit2, AlertTriangle, Plus,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_FILES = {
  'src/App.jsx': {
    name: 'App.jsx',
    language: 'javascript',
    content: `import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("Ready");

  return (
    <div className="app">
      <h1>Autonomous AI Security Profiler</h1>
      <p>Status: {status}</p>
    </div>
  );
}

export default App;`
  },
  'src/main.jsx': {
    name: 'main.jsx',
    language: 'javascript',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
  },
  'src/components/Header.jsx': {
    name: 'Header.jsx',
    language: 'javascript',
    content: `export default function Header() {
  return <header>SkillKollab</header>;
}`
  },
  'src/components/Dashboard.jsx': {
    name: 'Dashboard.jsx',
    language: 'javascript',
    content: `import Header from './Header';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <h1>Welcome to Live Preview</h1>
    </div>
  );
}`
  },
  'src/styles.css': {
    name: 'styles.css',
    language: 'css',
    content: `.app-container {
  font-family: sans-serif;
  padding: 20px;
}

h1 {
  color: #6D4AFF;
}`
  },
  'public/index.html': {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>SkillKollab Code</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
  },
  'package.json': {
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "skillkollab-demo",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`
  }
};

const FILE_TREE = [
  {
    type: 'folder',
    name: 'src',
    isOpen: true,
    children: [
      { type: 'file', path: 'src/App.jsx', name: 'App.jsx', icon: FileCode2 },
      { type: 'file', path: 'src/main.jsx', name: 'main.jsx', icon: FileCode2 },
      {
        type: 'folder',
        name: 'components',
        isOpen: true,
        children: [
          { type: 'file', path: 'src/components/Header.jsx', name: 'Header.jsx', icon: FileCode2 },
          { type: 'file', path: 'src/components/Dashboard.jsx', name: 'Dashboard.jsx', icon: FileCode2 },
        ]
      },
      { type: 'file', path: 'src/styles.css', name: 'styles.css', icon: FileType2 },
    ]
  },
  {
    type: 'folder',
    name: 'public',
    isOpen: false,
    children: [
      { type: 'file', path: 'public/index.html', name: 'index.html', icon: FileCode2 },
    ]
  },
  { type: 'file', path: 'package.json', name: 'package.json', icon: FileJson },
];

export function LiveCodeEditor() {
  const [activeFile, setActiveFile] = useState('src/App.jsx');
  const [openTabs, setOpenTabs] = useState(['src/App.jsx', 'src/styles.css']);
  const [fileContent, setFileContent] = useState(MOCK_FILES);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  
  // Track folder open state recursively would require more complex state,
  // For simplicity in this demo, we'll keep the tree static or just toggle local state.
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components']);

  const toggleFolder = (name) => {
    setExpandedFolders(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const handleFileClick = (path) => {
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
    setActiveFile(path);
  };

  const closeTab = (e, path) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);
    if (activeFile === path) {
      setActiveFile(newTabs[0] || null);
    }
  };

  const handleEditorChange = (value) => {
    setFileContent(prev => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        content: value
      }
    }));
  };

  const handleRun = () => {
    toast.success('Compiling and running project...');
    setConsoleOutput(prev => [
      ...prev,
      { type: 'info', text: 'Compiling project...' },
      { type: 'success', text: '✓ Build completed successfully' },
      { type: 'info', text: 'No errors detected. Live Preview updated.' }
    ]);
    setIsConsoleOpen(true);
  };

  const renderFileTree = (nodes, depth = 0) => {
    return nodes.map((node, index) => {
      if (node.type === 'folder') {
        const isOpen = expandedFolders.includes(node.name);
        return (
          <div key={index}>
            <div 
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-[var(--bg-surface)] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-strong)] cursor-pointer rounded-md transition-colors"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => toggleFolder(node.name)}
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <Folder className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="font-medium">{node.name}</span>
            </div>
            {isOpen && renderFileTree(node.children, depth + 1)}
          </div>
        );
      }
      
      const isSelected = activeFile === node.path;
      const Icon = node.icon;
      return (
        <div 
          key={index}
          onClick={() => handleFileClick(node.path)}
          className={`flex items-center gap-2 px-2 py-1.5 text-[13px] cursor-pointer rounded-md transition-colors ${
            isSelected 
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold' 
              : 'text-[var(--text-secondary)] hover:bg-[#F8F7FF] dark:hover:bg-[var(--bg-surface)] hover:text-[var(--text-strong)]'
          }`}
          style={{ paddingLeft: `${depth * 12 + 24}px` }}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[750px] border border-[var(--border-strong)] rounded-[16px] overflow-hidden bg-[#FFFFFF] dark:bg-[var(--bg-card)] shadow-sm font-sans animate-fadeIn">
      
      {/* LEFT: File Explorer */}
      <div className="w-full lg:w-[240px] flex-shrink-0 border-r border-[var(--border-strong)] bg-[#F8FAFC] dark:bg-[#13151A] flex flex-col">
        <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Files</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]"><Plus className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]"><Search className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {renderFileTree(FILE_TREE)}
        </div>
      </div>

      {/* CENTER: Code Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] dark:bg-[#0F1117] border-r border-[var(--border-strong)]">
        
        {/* Editor Tabs */}
        <div className="flex items-center bg-[#F8FAFC] dark:bg-[#13151A] border-b border-[var(--border-strong)] overflow-x-auto hide-scrollbar">
          {openTabs.map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveFile(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] border-r border-[var(--border-strong)] cursor-pointer min-w-[120px] transition-colors border-b-2 ${
                activeFile === tab 
                  ? 'bg-[#FFFFFF] dark:bg-[#0F1117] text-[var(--color-primary)] border-b-[var(--color-primary)] font-semibold' 
                  : 'bg-transparent text-[var(--text-secondary)] hover:bg-[#FFFFFF]/50 border-b-transparent'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 opacity-70" />
              <span className="truncate">{MOCK_FILES[tab].name}</span>
              <button 
                onClick={(e) => closeTab(e, tab)}
                className="ml-auto p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Editor Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-[var(--border-subtle)] bg-[#FFFFFF] dark:bg-[#0F1117]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              3 collaborators online
            </div>
            <div className="flex -space-x-1">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" className="w-5 h-5 rounded-full border border-[var(--bg-card)]" alt="collab" title="User" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50" className="w-5 h-5 rounded-full border border-[var(--bg-card)]" alt="collab" title="Collaborator 1" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50" className="w-5 h-5 rounded-full border border-[var(--bg-card)]" alt="collab" title="Collaborator 2" />
            </div>
            {/* Github Controls */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--bg-surface)] dark:bg-[#13151A] border border-[var(--border-strong)]">
              <FolderGit2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className="text-[11px] font-mono text-[#10B981]">main</span>
              <div className="w-px h-3 bg-[var(--border-strong)] mx-1" />
              <button className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-strong)]" title="Pull">Pull</button>
              <button className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-strong)] mx-1" title="Commit">Commit</button>
              <button className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-strong)]" title="Push">Push</button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select className="bg-[var(--bg-surface)] dark:bg-[#13151A] text-[12px] text-[var(--text-secondary)] font-medium border border-[var(--border-strong)] rounded-md px-2 py-1 outline-none">
              <option>JavaScript / JSX</option>
              <option>TypeScript</option>
              <option>Python</option>
              <option>HTML/CSS</option>
            </select>
            <div className="h-4 w-px bg-[var(--border-strong)] mx-1" />
            <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-surface)] rounded-md transition-colors" title="Format (Cmd/Ctrl + Shift + F)">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 text-[12px] font-semibold text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface)] rounded-md transition-colors flex items-center gap-1.5" title="Save (Cmd/Ctrl + S)">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={handleRun} className="px-4 py-1.5 text-[12px] font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md transition-colors flex items-center gap-1.5 shadow-sm" title="Run (Cmd/Ctrl + Enter)">
              <Play className="w-3.5 h-3.5" /> Run
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 relative overflow-hidden bg-[#0F1117]">
          {activeFile ? (
            <Editor
              height="100%"
              theme="vs-dark" // Keep editor dark for professional feel as requested
              language={fileContent[activeFile].language}
              value={fileContent[activeFile].content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 1.6,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
                formatOnPaste: true,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-[13px]">
              Select a file to edit
            </div>
          )}
        </div>

        {/* Console / Terminal Bottom Drawer */}
        <div className={`border-t border-[var(--border-strong)] bg-[#F8FAFC] dark:bg-[#13151A] flex flex-col transition-all duration-300 ${isConsoleOpen ? 'h-[180px]' : 'h-10'}`}>
          <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border-subtle)] shrink-0 bg-[#F8FAFC] dark:bg-[#13151A]">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsConsoleOpen(true)} className={`text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isConsoleOpen ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)]'}`}>
                <TerminalSquare className="w-3.5 h-3.5" /> Console
              </button>
              <button className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                <Command className="w-3.5 h-3.5" /> Terminal
              </button>
            </div>
            <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-[var(--text-secondary)]">
              {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          {isConsoleOpen && (
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] bg-[#FFFFFF] dark:bg-[#0F1117] text-[#334155] dark:text-[#E2E8F0]">
              {consoleOutput.length === 0 ? (
                <div className="text-[var(--text-muted)] italic">No output yet. Click 'Run' to compile the project.</div>
              ) : (
                <div className="space-y-1.5">
                  {consoleOutput.map((log, i) => (
                    <div key={i} className={`${
                      log.type === 'success' ? 'text-[#10B981]' : 
                      log.type === 'error' ? 'text-[#EF4444]' : 
                      log.type === 'warning' ? 'text-[#F59E0B]' : ''
                    }`}>
                      {log.text}
                    </div>
                  ))}
                  <div className="animate-pulse w-2 h-4 bg-[#6D4AFF] mt-1" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="w-full lg:w-[350px] flex-shrink-0 bg-[#F8FAFC] dark:bg-[#13151A] flex flex-col">
        <div className="p-3 border-b border-[var(--border-strong)] flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Live Preview</span>
          <div className="flex items-center gap-1.5">
            <button className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]" onClick={() => setPreviewDevice('mobile')}><Smartphone className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]" onClick={() => setPreviewDevice('tablet')}><Tablet className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]" onClick={() => setPreviewDevice('desktop')}><Monitor className="w-3.5 h-3.5" /></button>
            <div className="w-px h-3 bg-[var(--border-strong)] mx-1" />
            <button onClick={handleRun} className="p-1 hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)]" title="Refresh Preview"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-[#0B0E14] flex items-center justify-center p-4 relative">
          {/* Simulated Preview Iframe Area */}
          <div className={`bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[var(--border-subtle)] transition-all duration-300 flex flex-col overflow-hidden ${
            previewDevice === 'mobile' ? 'w-[320px] h-[568px] rounded-[24px]' :
            previewDevice === 'tablet' ? 'w-[100%] h-[600px] rounded-[16px]' :
            'w-full h-full rounded-none shadow-none border-0'
          }`}>
            {/* Fake browser bar for devices */}
            {previewDevice !== 'desktop' && (
              <div className="h-6 bg-[#F1F5F9] dark:bg-[#1E293B] border-b border-[var(--border-subtle)] flex items-center justify-center">
                <div className="w-16 h-1.5 bg-[#CBD5E1] dark:bg-[#334155] rounded-full" />
              </div>
            )}
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F1117] w-full text-left">
                {consoleOutput.length > 0 ? (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="p-5">
                    <header className="mb-6 flex items-center justify-between">
                      <h2 className="text-[#6D4AFF] text-[18px] font-bold tracking-tight">Project Preview</h2>
                      <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse" />
                      </div>
                    </header>
                    <h1 className="text-[20px] font-bold text-[var(--text-strong)] mb-1">AI Security Dashboard</h1>
                    <p className="text-[13px] text-[var(--text-secondary)] mb-6">Autonomous real-time threat analysis.</p>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-[12px] bg-white dark:bg-[#1A1D24] shadow-sm border border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Total Scans</p>
                          <p className="text-[24px] font-bold text-[var(--text-strong)]">14,209</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><Search size={18} /></div>
                      </div>
                      <div className="p-4 rounded-[12px] bg-white dark:bg-[#1A1D24] shadow-sm border border-red-500/20 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-red-500/70 uppercase">Threats Detected</p>
                          <p className="text-[24px] font-bold text-red-500">24</p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><AlertTriangle size={18} /></div>
                      </div>
                      <div className="p-4 rounded-[12px] bg-white dark:bg-[#1A1D24] shadow-sm border border-[var(--border-subtle)]">
                        <p className="text-[12px] font-semibold text-[var(--text-strong)] mb-2">Recent Activity</p>
                        <div className="space-y-2">
                          <div className="text-[11px] text-[var(--text-secondary)] flex justify-between"><span>AST Injection Blocked</span> <span>Just now</span></div>
                          <div className="text-[11px] text-[var(--text-secondary)] flex justify-between"><span>Dependency scanned</span> <span>2m ago</span></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)] text-[13px] italic">
                    <Play className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    Click 'Run' to compile and preview the application
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
