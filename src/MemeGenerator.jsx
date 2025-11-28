import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Type, Smile, Download, Undo, Redo, 
  Trash2, Move, Layers, Image as ImageIcon,
  Search, RotateCw, Minimize, Maximize, Home
} from 'lucide-react';

// --- Constants & Utilities ---

const FONTS = [
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
  { name: 'Lobster', value: '"Lobster", cursive' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Courier', value: '"Courier New", monospace' },
];

const COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', 
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

const EMOJIS = ['😂', '🔥', '💯', '🤔', '😎', '🤡', '💩', '🍆', '👀', '🧠', '💀', '👽', '🚀', '💎', '🎉'];

const generateId = () => Math.random().toString(36).substr(2, 9);

function MemeGenerator({ onBack }) {
  // --- State ---
  const [image, setImage] = useState(null);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0, scale: 1 });
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('templates');
  
  // Template State
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Canvas Refs
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const draggingItem = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Resize State Ref to store initial values during a drag
  const resizeState = useRef(null);

  // --- Initial Load ---
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('https://api.imgflip.com/get_memes');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.memes);
      }
    } catch (error) {
      console.error("Failed to load memes", error);
    }
    setIsLoadingTemplates(false);
  };

  // --- History Management ---
  const addToHistory = useCallback((newItems, newImagePos) => {
    const currentState = { items: newItems, imagePos: newImagePos };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setItems(prevState.items);
      setImagePos(prevState.imagePos);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setItems(nextState.items);
      setImagePos(nextState.imagePos);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // --- Handlers ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => loadImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const loadImage = (src) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(src);
      setImagePos({ x: 0, y: 0, scale: 1 });
      setItems([]);
      setHistory([]);
      setHistoryIndex(-1);
      addToHistory([], { x: 0, y: 0, scale: 1 });
      setActiveTab('text');
    };
    img.src = src;
  };

  const addItem = (type, content) => {
    const newItem = {
      id: generateId(),
      type,
      content,
      x: 50, y: 50, rotation: 0, scale: 1,
      fontSize: 40, fontFamily: 'Impact, sans-serif',
      color: '#ffffff', strokeColor: '#000000', strokeWidth: 2,
      backgroundColor: 'transparent', 
      paddingX: 10, paddingY: 5, 
      width: 40, // Start with a reasonable width percentage
      fontWeight: 'bold', caps: true
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setSelectedId(newItem.id);
    addToHistory(newItems, imagePos);
  };

  const updateItem = (id, updates) => {
    const newItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
    setItems(newItems);
    if (!['x', 'y', 'width', 'scale'].some(k => Object.keys(updates).includes(k))) { 
       addToHistory(newItems, imagePos);
    }
  };

  const deleteItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    setSelectedId(null);
    addToHistory(newItems, imagePos);
  };

  // --- Dragging & Resizing Logic ---
  
  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    draggingItem.current = { id, type: 'item' };
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeStart = (e, id, handle) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    const item = items.find(i => i.id === id);
    setSelectedId(id);
    draggingItem.current = { id, type: 'resize', handle };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const itemCenterX = containerRect.left + (item.x / 100) * containerRect.width;
    const itemCenterY = containerRect.top + (item.y / 100) * containerRect.height;
    
    const dist = Math.sqrt(Math.pow(e.clientX - itemCenterX, 2) + Math.pow(e.clientY - itemCenterY, 2));

    resizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: item.width || 40,
      initialScale: item.scale || 1,
      initialDist: dist,
      centerX: itemCenterX,
      centerY: itemCenterY
    };
  };

  const handleBgMouseDown = (e) => {
    if (!image) return;
    draggingItem.current = { type: 'bg' };
    dragStart.current = { x: e.clientX, y: e.clientY };
    setSelectedId(null);
  };

  const handleMouseMove = (e) => {
    if (!draggingItem.current) return;
    
    // --- Resizing Logic ---
    if (draggingItem.current.type === 'resize') {
        const { id, handle } = draggingItem.current;
        const state = resizeState.current;
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // 1. Width Resizing (Side Handles: E, W)
        if (['e', 'w'].includes(handle)) {
            const distX = Math.abs(e.clientX - state.centerX);
            let newWidthPercent = (distX * 2 / containerRect.width) * 100;
            newWidthPercent = Math.max(10, Math.min(100, newWidthPercent));
            setItems(prev => prev.map(i => i.id === id ? { ...i, width: newWidthPercent } : i));
        }
        
        // 2. Scale Resizing (Corner Handles: NE, NW, SE, SW)
        if (['ne', 'nw', 'se', 'sw'].includes(handle)) {
             const currentDist = Math.sqrt(Math.pow(e.clientX - state.centerX, 2) + Math.pow(e.clientY - state.centerY, 2));
             const scaleFactor = currentDist / state.initialDist;
             let newScale = state.initialScale * scaleFactor;
             newScale = Math.max(0.1, Math.min(5, newScale));
             setItems(prev => prev.map(i => i.id === id ? { ...i, scale: newScale } : i));
        }
        return;
    }

    // --- Move Logic ---
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    if (draggingItem.current.type === 'item') {
      const containerRect = containerRef.current.getBoundingClientRect();
      const id = draggingItem.current.id;
      const dPercentX = (dx / containerRect.width) * 100;
      const dPercentY = (dy / containerRect.height) * 100;
      const newItems = items.map(i => i.id === id ? { ...i, x: i.x + dPercentX, y: i.y + dPercentY } : i);
      setItems(newItems);
    } else if (draggingItem.current.type === 'bg') {
      setImagePos(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleMouseUp = () => {
    if (draggingItem.current) addToHistory(items, imagePos);
    draggingItem.current = null;
    resizeState.current = null;
  };

  // --- Export ---
  const handleExport = async (format = 'png') => {
    if (!containerRef.current || !image) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const scaleFactor = 2; 
    const width = container.offsetWidth * scaleFactor;
    const height = container.offsetHeight * scaleFactor;
    canvas.width = width; canvas.height = height;

    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = image;
    await new Promise((resolve, reject) => {
        bgImg.onload = resolve; bgImg.onerror = reject;
    });

    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    ctx.translate(imagePos.x * scaleFactor, imagePos.y * scaleFactor);
    ctx.scale(imagePos.scale, imagePos.scale);
    ctx.drawImage(bgImg, -bgImg.width/2, -bgImg.height/2);
    ctx.restore();

    items.forEach(item => {
      ctx.save();
      const x = (item.x / 100) * width;
      const y = (item.y / 100) * height;
      ctx.translate(x, y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);

      if (item.type === 'text') {
        const fontSize = item.fontSize * scaleFactor;
        ctx.font = `${item.fontWeight} ${fontSize}px ${item.fontFamily.split(',')[0]}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const textContent = item.caps ? item.content.toUpperCase() : item.content;
        
        const maxWidth = (item.width / 100) * width * 0.8;
        const words = textContent.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const w = ctx.measureText(currentLine + " " + word).width;
            if (w < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        if (item.backgroundColor !== 'transparent') {
            const lineHeight = fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            let maxLineWidth = 0;
            lines.forEach(line => {
                const w = ctx.measureText(line).width;
                if (w > maxLineWidth) maxLineWidth = w;
            });
            
            const pX = (item.paddingX || 10) * scaleFactor;
            const pY = (item.paddingY || 5) * scaleFactor;
            
            ctx.fillStyle = item.backgroundColor;
            ctx.fillRect(
                -maxLineWidth/2 - pX, 
                -totalHeight/2 - pY, 
                maxLineWidth + (pX*2), 
                totalHeight + (pY*2)
            );
        }

        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = -(totalHeight / 2) + (lineHeight / 2);

        lines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);
            if (item.strokeWidth > 0) {
                ctx.strokeStyle = item.strokeColor;
                ctx.lineWidth = item.strokeWidth * scaleFactor;
                ctx.strokeText(line, 0, lineY);
            }
            ctx.fillStyle = item.color;
            ctx.fillText(line, 0, lineY);
        });

      } else if (item.type === 'emoji') {
        ctx.font = `${item.fontSize * scaleFactor}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(item.content, 0, 0);
      }
      ctx.restore();
    });

    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  };

  const selectedItem = items.find(i => i.id === selectedId);
  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden" 
         onMouseMove={handleMouseMove} 
         onMouseUp={handleMouseUp}
         onTouchMove={(e) => { 
             if(draggingItem.current) {
                 const touch = e.touches[0];
                 handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
             }
         }}
         onTouchEnd={handleMouseUp}
    >
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col z-20 shadow-2xl">
        <div className="p-4 border-b border-gray-800 font-bold text-xl flex items-center justify-between text-purple-500">
          <div className="flex items-center gap-2">
            <Smile className="w-7 h-7" /> MemeHub Pro
          </div>
          <button onClick={onBack} className="text-gray-500 hover:text-white" title="Back to Home">
            <Home size={20}/>
          </button>
        </div>

        <div className="flex border-b border-gray-800">
          {['templates', 'text', 'layers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 p-3 text-sm font-medium transition-colors flex flex-col items-center gap-1 capitalize ${
                activeTab === tab
                  ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {tab === 'templates' && <Layers size={16} />}
              {tab === 'text' && <Type size={16} />}
              {tab === 'layers' && <Layers size={16} />}
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'templates' && (
            <div className="p-4 space-y-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
                  />
               </div>
               {isLoadingTemplates ? (
                 <div className="flex justify-center py-10">
                   <RotateCw className="animate-spin text-purple-500" />
                 </div>
               ) : (
                  <div className="grid grid-cols-2 gap-2">
                     {filteredTemplates.map(t => (
                        <div
                          key={t.id}
                          onClick={() => loadImage(t.url)}
                          className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-purple-500 hover:scale-105 transition-all group relative border border-transparent"
                        >
                          <img src={t.url} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white font-medium line-clamp-2">{t.name}</span>
                          </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="p-4 space-y-6">
              {!selectedItem ? (
                <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                  <Move className="mb-2 opacity-50" size={32} />
                  <p>Select an item to edit.</p>
                </div>
              ) : (
                <>
                  {selectedItem.type === 'text' && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Content</label>
                      <textarea
                        value={selectedItem.content}
                        onChange={(e) => updateItem(selectedItem.id, { content: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none resize-none"
                        rows={2}
                      />
                      <button
                        onClick={() => updateItem(selectedItem.id, { caps: !selectedItem.caps })}
                        className={`w-full p-2 rounded-lg border text-xs font-bold ${
                          selectedItem.caps
                            ? 'bg-purple-600 border-purple-500'
                            : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
                      >
                        ALL CAPS
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                     <label className="text-xs font-semibold text-gray-400 uppercase">Layout</label>
                     <div className="space-y-3">
                        <div className="p-3 bg-gray-800/50 rounded border border-gray-700 text-xs text-gray-400">
                            💡 Drag the corner handles on the canvas to Scale, or side handles to resize Width.
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Width</span>
                                <span>{Math.round(selectedItem.width || 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={selectedItem.width || 100}
                              onChange={(e) => updateItem(selectedItem.id, { width: parseInt(e.target.value, 10) })}
                              className="w-full accent-purple-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Scale</label>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="3"
                                  step="0.1"
                                  value={selectedItem.scale}
                                  onChange={(e) => updateItem(selectedItem.id, { scale: parseFloat(e.target.value) })}
                                  className="w-full accent-purple-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Rotate</label>
                                <input
                                  type="range"
                                  min="-180"
                                  max="180"
                                  value={selectedItem.rotation}
                                  onChange={(e) => updateItem(selectedItem.id, { rotation: parseInt(e.target.value, 10) })}
                                  className="w-full accent-purple-500"
                                />
                            </div>
                        </div>
                     </div>
                  </div>

                  {selectedItem.type === 'text' && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Style</label>
                      <select
                        value={selectedItem.fontFamily}
                        onChange={(e) => updateItem(selectedItem.id, { fontFamily: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm focus:border-purple-500 outline-none"
                      >
                        {FONTS.map(f => (
                          <option key={f.name} value={f.value}>
                            {f.name}
                          </option>
                        ))}
                      </select>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Color</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
                          {COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              className={`w-6 h-6 rounded-full border ${
                                selectedItem.color === c
                                  ? 'border-2 border-purple-500 scale-110'
                                  : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: c }}
                              onClick={() => updateItem(selectedItem.id, { color: c })}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-gray-500">Outline</label>
                          <input
                            type="color"
                            value={selectedItem.strokeColor}
                            onChange={(e) => updateItem(selectedItem.id, { strokeColor: e.target.value })}
                            className="h-6 w-8 bg-transparent border-0 p-0 cursor-pointer"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={selectedItem.strokeWidth}
                          onChange={(e) => updateItem(selectedItem.id, { strokeWidth: parseInt(e.target.value, 10) })}
                          className="w-full accent-purple-500"
                        />
                      </div>
                      
                      {/* Background Controls */}
                      <div className="space-y-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Background</label>
                            <button
                              type="button"
                              onClick={() => updateItem(selectedItem.id, { backgroundColor: 'transparent' })}
                              className="text-[10px] px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600"
                            >
                              Clear
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={selectedItem.backgroundColor === 'transparent'
                                ? '#ffffff'
                                : selectedItem.backgroundColor}
                              onChange={(e) => updateItem(selectedItem.id, { backgroundColor: e.target.value })}
                              className="h-8 w-12 bg-gray-700 rounded border border-gray-600 cursor-pointer"
                            />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500 w-4">W</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="40"
                                      value={selectedItem.paddingX || 10}
                                      onChange={(e) => updateItem(selectedItem.id, { paddingX: parseInt(e.target.value, 10) })}
                                      className="flex-1 accent-purple-500 h-1"
                                      title="Horizontal Padding"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500 w-4">H</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="40"
                                      value={selectedItem.paddingY || 5}
                                      onChange={(e) => updateItem(selectedItem.id, { paddingY: parseInt(e.target.value, 10) })}
                                      className="flex-1 accent-purple-500 h-1"
                                      title="Vertical Padding"
                                    />
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-6 border-t border-gray-800 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase">Insert</h3>
                  <button
                    type="button"
                    onClick={() => addItem('text', 'TEXT')}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Type size={16} /> Add Text
                  </button>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 mt-2">Stickers</p>
                    <div className="grid grid-cols-5 gap-2">
                        {EMOJIS.map(e => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => addItem('emoji', e)}
                            className="text-xl hover:bg-gray-800 rounded-lg p-1.5"
                          >
                            {e}
                          </button>
                        ))}
                    </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
             <div className="p-4 space-y-2">
                {items.slice().reverse().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedId === item.id
                          ? 'bg-purple-900/30 border-purple-500/50'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                            {item.type === 'text'
                              ? <Type size={14} className="text-purple-400" />
                              : <Smile size={14} className="text-yellow-400" />
                            }
                            <span className="text-sm truncate w-32 font-medium">{item.content}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm italic">
                    No layers yet.
                  </div>
                )}
             </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-gray-900">
             <div className="flex items-center gap-2 mb-2">
               <ImageIcon size={14} className="text-gray-400" />
               <span className="text-xs text-gray-400 font-semibold uppercase">Background Scale</span>
             </div>
             <div className="flex items-center gap-2">
                <Minimize size={14} className="text-gray-500" />
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={imagePos.scale}
                  onChange={(e) => setImagePos(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  className="flex-1 accent-purple-500 h-1 bg-gray-700 rounded-lg appearance-none"
                />
                <Maximize size={14} className="text-gray-500" />
            </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black/95 relative">
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900 shadow-md z-10">
           <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-lg hover:bg-gray-800 text-gray-300 ${
                  historyIndex <= 0 ? 'opacity-30' : ''
                }`}
              >
                <Undo size={18} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`p-2 rounded-lg hover:bg-gray-800 text-gray-300 ${
                  historyIndex >= history.length - 1 ? 'opacity-30' : ''
                }`}
              >
                <Redo size={18} />
              </button>
           </div>
           <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700 hover:border-gray-600 text-sm font-medium">
                  <Upload size={16} /><span className="hidden sm:inline">Upload Own</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
              </label>
              <button
                type="button"
                onClick={() => handleExport('png')}
                disabled={!image}
                className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 text-sm ${
                  !image ? 'opacity-50 grayscale' : ''
                }`}
              >
                  <Download size={16} /> Export Meme
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-checkered">
           {!image ? (
               <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                   <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-700">
                     <Smile size={48} className="text-purple-500" />
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-2">Create Your Meme</h2>
                   <p className="text-gray-400 max-w-xs mb-8">
                     Select a template from the sidebar or upload your own image to get started.
                   </p>
               </div>
           ) : (
               <div
                 ref={containerRef}
                 className="relative shadow-2xl overflow-hidden select-none bg-[#0a0a0a] ring-1 ring-gray-800"
                 style={{ width: 'auto', height: 'auto', maxHeight: '80vh', maxWidth: '100%', aspectRatio: 'auto' }}
                 onMouseDown={handleBgMouseDown}
               >
                 <img
                   src={image}
                   alt="Meme Base"
                   className="pointer-events-none block max-w-full max-h-[80vh] object-contain"
                   style={{ transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${imagePos.scale})`, transformOrigin: 'center center' }}
                   draggable={false}
                 />
                 {items.map(item => (
                     <div
                       key={item.id}
                       onMouseDown={(e) => handleMouseDown(e, item.id)}
                       onTouchStart={(e) => handleMouseDown(
                         { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, stopPropagation: () => {} },
                         item.id
                       )}
                       className={`absolute cursor-move hover:ring-1 hover:ring-white/30 ${
                         selectedId === item.id ? 'z-50' : 'z-10'
                       }`}
                       style={{
                         left: `${item.x}%`,
                         top: `${item.y}%`,
                         transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                         touchAction: 'none'
                       }}
                     >
                        {item.type === 'text' ? (
                            <div
                              className={selectedId === item.id ? 'ring-2 ring-purple-500' : ''}
                              style={{ 
                                fontFamily: item.fontFamily, 
                                fontSize: `${item.fontSize}px`, 
                                color: item.color, 
                                WebkitTextStroke: item.strokeWidth > 0
                                  ? `${item.strokeWidth}px ${item.strokeColor}`
                                  : 'none', 
                                backgroundColor: item.backgroundColor, 
                                padding: `${item.paddingY || 5}px ${item.paddingX || 10}px`,
                                fontWeight: item.fontWeight, 
                                whiteSpace: 'pre-wrap', 
                                wordWrap: 'break-word',
                                width: `${item.width || 40}%`,
                                minWidth: '50px',
                                textAlign: 'center', 
                                lineHeight: 1.2 
                              }}
                            >
                                {item.caps ? item.content.toUpperCase() : item.content}
                            </div>
                        ) : (
                          <div
                            className={selectedId === item.id ? 'ring-2 ring-purple-500 rounded-full p-1' : ''}
                            style={{ fontSize: `${item.fontSize}px`, lineHeight: 1 }}
                          >
                            {item.content}
                          </div>
                        )}
                        
                        {/* Interactive Resize Handles */}
                        {selectedId === item.id && (
                            <>
                                {/* Corner Handles - Scale */}
                                <div
                                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full cursor-nw-resize z-50 shadow-md hover:scale-110 transition-transform" 
                                  onMouseDown={(e) => handleResizeStart(e, item.id, 'nw')}
                                />
                                <div
                                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full cursor-ne-resize z-50 shadow-md hover:scale-110 transition-transform" 
                                  onMouseDown={(e) => handleResizeStart(e, item.id, 'ne')}
                                />
                                <div
                                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full cursor-sw-resize z-50 shadow-md hover:scale-110 transition-transform" 
                                  onMouseDown={(e) => handleResizeStart(e, item.id, 'sw')}
                                />
                                <div
                                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full cursor-se-resize z-50 shadow-md hover:scale-110 transition-transform" 
                                  onMouseDown={(e) => handleResizeStart(e, item.id, 'se')}
                                />
                                
                                {/* Side Handles - Width */}
                                <div
                                  className="absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-8 bg-white border-2 border-purple-600 rounded-md cursor-e-resize z-50 shadow-md hover:scale-110 transition-transform flex items-center justify-center" 
                                  onMouseDown={(e) => handleResizeStart(e, item.id, 'e')}
                                >
                                    <div className="w-0.5 h-3 bg-gray-300" />
                                </div>
                                <div
                                  className="absolute top-1/2 -left-3 -translate-y-1/2 w-4 h-8 bg-white border-2 border-purple-600 rounded-md cursor-w-resize z-50 shadow-md hover:scale-110 transition-transform flex items-center justify-center" 
                                  onMouseDown={(e) => handleResizeStart(e, item.id, 'w')}
                                >
                                     <div className="w-0.5 h-3 bg-gray-300" />
                                </div>
                            </>
                        )}
                     </div>
                 ))}
               </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default MemeGenerator;
