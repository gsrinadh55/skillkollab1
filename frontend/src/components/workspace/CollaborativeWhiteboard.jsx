import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, Square, Circle, Eraser, Download, Trash2, 
  Sparkles, RefreshCw, LayoutGrid, Layers, Palette
} from 'lucide-react';
import toast from 'react-hot-toast';
import socketService from '../../services/socket';

const COLORS = [
  { name: 'Purple', hex: '#7C5CFF' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Dark', hex: '#1E293B' },
  { name: 'White', hex: '#FFFFFF' },
];

export function CollaborativeWhiteboard({ projectId }) {
  const canvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState('pen'); // 'pen' | 'box' | 'circle' | 'erase'
  const [selectedColor, setSelectedColor] = useState('#7C5CFF');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Initialize Canvas Grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth || 900;
    canvas.height = 480;

    initGrid(ctx, canvas.width, canvas.height);
  }, []);

  // Socket.IO Real-time Sync across workspace users
  useEffect(() => {
    if (!projectId) return;

    const handleRemoteDraw = ({ canvasData }) => {
      if (!canvasData) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasData;
    };

    socketService.on('sync_whiteboard_draw', handleRemoteDraw);
    return () => {
      socketService.off('sync_whiteboard_draw', handleRemoteDraw);
    };
  }, [projectId]);

  const broadcastCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !projectId) return;
    const canvasData = canvas.toDataURL();
    socketService.emit('whiteboard_draw', { projectId, canvasData });
  };

  const initGrid = (ctx, w, h) => {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    const pos = getCanvasPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (activeTool === 'pen' || activeTool === 'erase') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (activeTool === 'pen') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (activeTool === 'erase') {
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, lineWidth * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleEnd = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // For non-continuous shapes (box / circle)
    if (activeTool === 'box') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(startPos.x, startPos.y, e.clientX - canvas.getBoundingClientRect().left - startPos.x, e.clientY - canvas.getBoundingClientRect().top - startPos.y);
    } else if (activeTool === 'circle') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      const endPos = getCanvasPos(e);
      const radius = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Broadcast stroke to teammates via Socket.IO
    broadcastCanvas();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    initGrid(ctx, canvas.width, canvas.height);
    broadcastCanvas();
    toast.success('Whiteboard cleared!');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'workspace-architecture-diagram.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Architecture diagram downloaded as PNG!');
  };

  const handleLoadTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    initGrid(ctx, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Node 1: React Client
    ctx.strokeStyle = '#7C5CFF';
    ctx.fillStyle = 'rgba(124, 92, 255, 0.15)';
    ctx.fillRect(60, 180, 160, 80);
    ctx.strokeRect(60, 180, 160, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('React Web App UI', 140, 220);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Port 3000 • Client Layer', 140, 240);

    // Arrow 1
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(220, 220);
    ctx.lineTo(360, 220);
    ctx.stroke();

    // Node 2: Express Backend API Gateway
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.strokeStyle = '#10B981';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(360, 180, 180, 80);
    ctx.strokeRect(360, 180, 180, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Express API Gateway', 450, 220);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Port 5000 • Socket.IO', 450, 240);

    // Arrow 2
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(540, 220);
    ctx.lineTo(680, 220);
    ctx.stroke();

    // Node 3: Database & Firebase Store
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.strokeStyle = '#F43F5E';
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.fillRect(680, 180, 160, 80);
    ctx.strokeRect(680, 180, 160, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Postgres & Firebase', 760, 220);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Database & Auth Layer', 760, 240);

    setTimeout(() => broadcastCanvas(), 50);
    toast.success('Loaded System Architecture Diagram template!');
  };

  return (
    <div className="p-6 sm:p-8 border border-[var(--border-strong)] rounded-[18px] space-y-5 shadow-sm bg-[var(--bg-card)] animate-fadeIn">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-[18px] font-bold text-[var(--text-strong)] flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[var(--color-primary)]" /> Collaborative Whiteboard
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Draw system architecture diagrams, sketch UI prototypes, and plan sprint workflows.
          </p>
        </div>

        {/* Tools & Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Shape / Pen Tools */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1.5 rounded-[12px] border border-[var(--border-strong)]">
            {[
              { id: 'pen', label: 'Pen', icon: PenTool },
              { id: 'box', label: 'Rectangle', icon: Square },
              { id: 'circle', label: 'Circle', icon: Circle },
              { id: 'erase', label: 'Eraser', icon: Eraser },
            ].map((toolItem) => {
              const ToolIcon = toolItem.icon;
              const isActive = activeTool === toolItem.id;
              return (
                <button
                  key={toolItem.id}
                  onClick={() => setActiveTool(toolItem.id)}
                  title={toolItem.label}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <ToolIcon size={16} />
                </button>
              );
            })}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] p-2 rounded-[12px] border border-[var(--border-strong)]">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setSelectedColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer border border-white/20 ${
                  selectedColor === c.hex ? 'scale-125 ring-2 ring-[var(--color-primary)] ring-offset-1' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-3 py-1.5 rounded-[12px] border border-[var(--border-strong)] text-xs text-[var(--text-secondary)]">
            <span>Size:</span>
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => setLineWidth(size)}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  lineWidth === size ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--bg-card)]'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadTemplate}
              className="bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--text-primary)] px-3.5 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" /> System Template
            </button>
            <button
              onClick={handleDownload}
              className="bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--text-primary)] px-3.5 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export PNG
            </button>
            <button
              onClick={handleClear}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 px-3.5 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* HTML5 Canvas Container */}
      <div className="relative rounded-[16px] overflow-hidden border border-[var(--border-strong)] shadow-inner bg-[#0F172A]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="w-full h-[480px] cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
}
