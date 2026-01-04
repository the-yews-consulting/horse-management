import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, RotateCw, Trash2, Save, Grid3x3 } from 'lucide-react';

export interface FloorplanItem {
  id: string;
  type: 'single-stall' | 'double-horizontal' | 'double-vertical' | 'storage' | 'tack-room';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  label?: string;
}

interface FloorplanEditorProps {
  onSave: (items: FloorplanItem[]) => void;
  initialItems?: FloorplanItem[];
}

const GRID_SIZE = 20;
const ITEM_TEMPLATES = {
  'single-stall': { width: 3, height: 3, color: '#3B82F6', label: 'Single Stable' },
  'double-horizontal': { width: 6, height: 3, color: '#8B5CF6', label: 'Double Stable (H)' },
  'double-vertical': { width: 3, height: 6, color: '#8B5CF6', label: 'Double Stable (V)' },
  'storage': { width: 4, height: 4, color: '#F59E0B', label: 'Storage' },
  'tack-room': { width: 5, height: 4, color: '#10B981', label: 'Tack Room' },
};

export default function FloorplanEditor({ onSave, initialItems = [] }: FloorplanEditorProps) {
  const [items, setItems] = useState<FloorplanItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGrid((e.clientX - rect.left - pan.x) / zoom);
    const y = snapToGrid((e.clientY - rect.top - pan.y) / zoom);

    const template = ITEM_TEMPLATES[draggedType as keyof typeof ITEM_TEMPLATES];
    const newItem: FloorplanItem = {
      id: `item-${Date.now()}`,
      type: draggedType as FloorplanItem['type'],
      x,
      y,
      width: template.width * GRID_SIZE,
      height: template.height * GRID_SIZE,
      rotation: 0,
      label: template.label,
    };

    setItems([...items, newItem]);
    setDraggedType(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(selectedItemId === id ? null : id);
  };

  const handleRotate = () => {
    if (!selectedItemId) return;
    setItems(items.map(item => {
      if (item.id === selectedItemId) {
        const newRotation = ((item.rotation + 90) % 360) as FloorplanItem['rotation'];
        return {
          ...item,
          rotation: newRotation,
          width: item.height,
          height: item.width,
        };
      }
      return item;
    }));
  };

  const handleDelete = () => {
    if (!selectedItemId) return;
    setItems(items.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleSave = () => {
    onSave(items);
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="flex h-[600px] border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-300 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Stable Items</h3>
        <div className="space-y-2">
          {Object.entries(ITEM_TEMPLATES).map(([type, template]) => (
            <div
              key={type}
              draggable
              onDragStart={() => handleDragStart(type)}
              className="p-3 bg-white border-2 border-gray-300 rounded-lg cursor-move hover:border-blue-500 transition-colors"
            >
              <div
                className="w-full h-12 rounded mb-2"
                style={{ backgroundColor: template.color }}
              />
              <p className="text-sm font-medium text-gray-700">{template.label}</p>
              <p className="text-xs text-gray-500">
                {template.width}x{template.height} grid units
              </p>
            </div>
          ))}
        </div>

        {selectedItem && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Selected Item</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={selectedItem.label || ''}
                onChange={(e) => {
                  setItems(items.map(item =>
                    item.id === selectedItemId ? { ...item, label: e.target.value } : item
                  ));
                }}
                placeholder="Label"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRotate}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <RotateCw size={16} />
                  Rotate
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 border border-gray-300 rounded-lg ${showGrid ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-50'}`}
              title="Toggle Grid"
            >
              <Grid3x3 size={20} />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={20} />
            Save Layout
          </button>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-move"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isPanning ? 'grabbing' : 'default' }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Grid */}
            {showGrid && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '2000px', height: '2000px' }}>
                <defs>
                  <pattern
                    id="grid"
                    width={GRID_SIZE}
                    height={GRID_SIZE}
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="2000" height="2000" fill="url(#grid)" />
              </svg>
            )}

            {/* Items */}
            {items.map(item => {
              const template = ITEM_TEMPLATES[item.type];
              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item.id);
                  }}
                  className={`absolute cursor-pointer transition-all ${
                    selectedItemId === item.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.width,
                    height: item.height,
                    backgroundColor: template.color,
                    transform: `rotate(${item.rotation}deg)`,
                    transformOrigin: 'center',
                    borderRadius: '4px',
                    border: '2px solid rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <span className="text-white font-medium text-sm text-center break-words">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border-t border-gray-300 p-2 text-xs text-gray-600">
          <p>
            <strong>Tip:</strong> Drag items from the sidebar onto the canvas. Click to select, use tools to edit.
            Hold Shift + drag or middle mouse button to pan.
          </p>
        </div>
      </div>
    </div>
  );
}
