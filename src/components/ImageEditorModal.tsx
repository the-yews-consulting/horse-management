import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  Sun,
  Droplet,
  Palette,
  Type,
  Pencil,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { Modal } from './Modal';

interface ImageEditorModalProps {
  media: {
    id: string;
    file_url: string;
    title?: string;
  };
  horseId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function ImageEditorModal({ media, horseId, onClose, onComplete }: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<fabric.Image | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f3f4f6'
    });

    fabricCanvasRef.current = canvas;

    fabric.Image.fromURL(media.file_url, (img) => {
      if (!img) return;

      const scale = Math.min(
        canvas.width! / img.width!,
        canvas.height! / img.height!,
        1
      );

      img.scale(scale);
      img.set({
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
        selectable: false
      });

      imageRef.current = img;
      canvas.add(img);
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, [media.file_url]);

  const applyFilters = () => {
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    img.filters = [];

    if (brightness !== 0) {
      img.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }));
    }

    if (contrast !== 0) {
      img.filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
    }

    if (saturation !== 0) {
      img.filters.push(new fabric.Image.filters.Saturation({ saturation: saturation / 100 }));
    }

    img.applyFilters();
    canvas.renderAll();
  };

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation]);

  const handleRotate = () => {
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const currentAngle = img.angle || 0;
    img.rotate(currentAngle + 90);
    canvas.renderAll();
  };

  const handleFlip = () => {
    const canvas = fabricCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    img.set('flipX', !img.flipX);
    canvas.renderAll();
  };

  const enableDrawing = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = '#ff0000';
    canvas.freeDrawingBrush.width = 3;
    setActiveTool('draw');
  };

  const disableDrawing = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    setActiveTool('select');
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Add text', {
      left: 100,
      top: 100,
      fontSize: 32,
      fill: '#000000',
      fontFamily: 'Arial'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleSave = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1
      });

      const response = await fetch(`/api/horses/${horseId}/media/${media.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ file_url: dataUrl })
      });

      if (response.ok) {
        onComplete();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Edit: ${media.title || 'Image'}`} size="xl">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          <button
            onClick={handleRotate}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
            Rotate
          </button>

          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Flip horizontal"
          >
            <FlipHorizontal className="w-4 h-4" />
            Flip
          </button>

          <button
            onClick={activeTool === 'draw' ? disableDrawing : enableDrawing}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
              activeTool === 'draw'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            title="Draw"
          >
            <Pencil className="w-4 h-4" />
            Draw
          </button>

          <button
            onClick={addText}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Add text"
          >
            <Type className="w-4 h-4" />
            Text
          </button>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Sun className="w-4 h-4" />
              Brightness: {brightness}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4" />
              Contrast: {contrast}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Droplet className="w-4 h-4" />
              Saturation: {saturation}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
          <canvas ref={canvasRef} className="border border-gray-300 rounded" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
