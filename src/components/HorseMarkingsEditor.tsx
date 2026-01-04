import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  MoreHorizontal,
  Star,
  ZoomIn,
  ZoomOut,
  Trash2,
  Undo,
  Redo,
  PaintBucket
} from 'lucide-react';

interface HorseMarkingsEditorProps {
  initialImage?: string;
  onSave: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const PREDEFINED_MARKINGS = [
  'Star',
  'Snip',
  'Blaze',
  'Stripe',
  'Sock',
  'Stocking',
  'Coronet',
  'Pastern',
  'Fetlock',
  'Half-Cannon',
  'Cannon',
  'Half-Stocking'
];

const COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Brown', value: '#92400E' },
  { name: 'Yellow', value: '#FCD34D' },
  { name: 'Pink', value: '#EC4899' }
];

export default function HorseMarkingsEditor({
  initialImage,
  onSave,
  onCancel
}: HorseMarkingsEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string>('pencil');
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1000,
      height: 700,
      backgroundColor: '#E5E7EB'
    });

    fabricCanvasRef.current = canvas;

    addHorseOutlines(canvas);

    if (initialImage) {
      fabric.Image.fromURL(initialImage, (img) => {
        img.selectable = false;
        canvas.add(img);
        canvas.renderAll();
      });
    }

    return () => {
      canvas.dispose();
    };
  }, []);

  const addHorseOutlines = (canvas: fabric.Canvas) => {
    const outlineColor = '#000000';
    const outlineWidth = 2;

    const leftHorseProfile = createHorseProfile(100, 150, false);
    const rightHorseProfile = createHorseProfile(600, 150, true);
    const frontHead = createFrontHead(350, 150);
    const hindLegs = createHindLegs(300, 500);
    const frontLegs = createFrontLegs(600, 500);

    [leftHorseProfile, rightHorseProfile, frontHead, hindLegs, frontLegs].forEach(group => {
      group.selectable = false;
      group.evented = false;
      canvas.add(group);
    });

    canvas.renderAll();
  };

  const createHorseProfile = (x: number, y: number, mirrored: boolean) => {
    const scaleX = mirrored ? -1 : 1;

    const body = new fabric.Ellipse({
      left: 0,
      top: 50,
      rx: 80,
      ry: 50,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const neck = new fabric.Path('M 0 30 Q -20 10 -30 -20', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const head = new fabric.Path('M -30 -20 L -35 -40 L -30 -50 L -20 -48 L -18 -30 Z', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const legs = [
      new fabric.Line([10, 100, 10, 170], { stroke: '#000000', strokeWidth: 2 }),
      new fabric.Line([40, 100, 40, 170], { stroke: '#000000', strokeWidth: 2 }),
      new fabric.Line([60, 100, 60, 170], { stroke: '#000000', strokeWidth: 2 }),
      new fabric.Line([90, 100, 90, 170], { stroke: '#000000', strokeWidth: 2 })
    ];

    const tail = new fabric.Path('M 80 80 Q 100 90 110 120', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const group = new fabric.Group([body, neck, head, ...legs, tail], {
      left: x,
      top: y,
      scaleX: scaleX
    });

    return group;
  };

  const createFrontHead = (x: number, y: number) => {
    const head = new fabric.Ellipse({
      left: 0,
      top: 0,
      rx: 40,
      ry: 60,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const centerLine = new fabric.Line([0, -60, 0, 60], {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDashArray: [5, 5]
    });

    const nose = new fabric.Ellipse({
      left: -15,
      top: 40,
      rx: 15,
      ry: 20,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const group = new fabric.Group([head, centerLine, nose], {
      left: x,
      top: y
    });

    return group;
  };

  const createHindLegs = (x: number, y: number) => {
    const leftLeg = new fabric.Path('M 0 0 L -5 40 L -5 80 L -3 100 L 0 100', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const rightLeg = new fabric.Path('M 30 0 L 35 40 L 35 80 L 33 100 L 30 100', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const hindquarters = new fabric.Ellipse({
      left: 0,
      top: -30,
      rx: 30,
      ry: 40,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const group = new fabric.Group([hindquarters, leftLeg, rightLeg], {
      left: x,
      top: y
    });

    return group;
  };

  const createFrontLegs = (x: number, y: number) => {
    const leftLeg = new fabric.Path('M 0 0 L 0 80 L 2 100', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const rightLeg = new fabric.Path('M 30 0 L 30 80 L 28 100', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const chest = new fabric.Path('M 0 -20 Q 15 -30 30 -20', {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });

    const group = new fabric.Group([chest, leftLeg, rightLeg], {
      left: x,
      top: y
    });

    return group;
  };

  const selectTool = (tool: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setActiveTool(tool);
    canvas.isDrawingMode = false;
    canvas.selection = true;

    switch (tool) {
      case 'pencil':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = strokeWidth;
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = '#E5E7EB';
        canvas.freeDrawingBrush.width = strokeWidth * 2;
        break;
      case 'select':
        canvas.selection = true;
        break;
    }
  };

  const addShape = (shapeType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: fabric.Object | null = null;

    switch (shapeType) {
      case 'circle':
        shape = new fabric.Circle({
          left: 400,
          top: 300,
          radius: 20,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth
        });
        break;
      case 'square':
        shape = new fabric.Rect({
          left: 400,
          top: 300,
          width: 40,
          height: 40,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth
        });
        break;
      case 'dot':
        shape = new fabric.Circle({
          left: 400,
          top: 300,
          radius: 5,
          fill: strokeColor
        });
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    }
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Text', {
      left: 400,
      top: 300,
      fill: strokeColor,
      fontSize: 20,
      fontFamily: 'Arial'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addMarking = (marking: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.Text(marking, {
      left: 400,
      top: 300,
      fill: strokeColor,
      fontSize: 16,
      fontFamily: 'Arial',
      backgroundColor: 'rgba(255,255,255,0.7)'
    });

    canvas.add(text);
    canvas.renderAll();
  };

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects().filter(obj => obj.selectable !== false);
    objects.forEach(obj => canvas.remove(obj));
    canvas.renderAll();
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoom(newZoom);
    fabricCanvasRef.current?.setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    fabricCanvasRef.current?.setZoom(newZoom);
  };

  const handleStrokeWidthChange = (delta: number) => {
    const newWidth = Math.max(1, Math.min(20, strokeWidth + delta));
    setStrokeWidth(newWidth);

    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = newWidth;
    }
  };

  const handleSave = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    });

    onSave(dataURL);
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="flex h-[800px] bg-gray-200">
      <div className="w-20 bg-gray-300 border-r border-gray-400 flex flex-col items-center py-4 gap-2">
        <button
          onClick={() => selectTool('pencil')}
          className={`p-2 rounded ${activeTool === 'pencil' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
          title="Pencil"
        >
          <Pencil size={20} />
        </button>
        <button
          onClick={() => selectTool('eraser')}
          className={`p-2 rounded ${activeTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
          title="Eraser"
        >
          <Eraser size={20} />
        </button>
        <button
          onClick={() => addShape('square')}
          className="p-2 bg-white rounded hover:bg-gray-100"
          title="Fill/Square"
        >
          <Square size={20} />
        </button>
        <button
          onClick={() => addShape('dot')}
          className="p-2 bg-white rounded hover:bg-gray-100"
          title="Dot"
        >
          <div className="w-5 h-5 rounded-full bg-blue-500" />
        </button>
        <button
          onClick={() => addShape('circle')}
          className="p-2 bg-white rounded hover:bg-gray-100"
          title="Circle"
        >
          <Circle size={20} fill="black" />
        </button>
        <button
          onClick={addText}
          className="p-2 bg-white rounded hover:bg-gray-100"
          title="Text"
        >
          <Type size={20} />
        </button>
        <button
          onClick={() => selectTool('select')}
          className={`p-2 rounded ${activeTool === 'select' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
          title="Select"
        >
          <Star size={20} />
        </button>

        <div className="w-full h-px bg-gray-400 my-2" />

        <div className="text-xs font-semibold mb-2">Colors</div>
        <div className="grid grid-cols-2 gap-1 px-1">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                setStrokeColor(color.value);
                setFillColor(color.value);
                if (fabricCanvasRef.current?.isDrawingMode) {
                  fabricCanvasRef.current.freeDrawingBrush.color = color.value;
                }
              }}
              className={`w-7 h-7 rounded border-2 ${strokeColor === color.value ? 'border-blue-500' : 'border-gray-400'}`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        <div className="w-full h-px bg-gray-400 my-2" />

        <div className="text-xs font-semibold">Stroke</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStrokeWidthChange(-1)}
            className="p-1 bg-white rounded hover:bg-gray-100"
          >
            -
          </button>
          <span className="text-xs w-6 text-center">{strokeWidth}</span>
          <button
            onClick={() => handleStrokeWidthChange(1)}
            className="p-1 bg-white rounded hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded hover:bg-gray-100 mt-2"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded hover:bg-gray-100"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={clearCanvas}
          className="p-2 bg-white rounded hover:bg-gray-100 mt-2"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>

        <button
          onClick={deleteSelected}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          title="Delete Selected"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <canvas ref={canvasRef} className="border-2 border-gray-400 shadow-lg" />
        </div>

        <div className="bg-gray-100 border-t border-gray-400 p-4">
          <div className="mb-2 font-semibold">Markings</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {PREDEFINED_MARKINGS.map((marking) => (
              <button
                key={marking}
                onClick={() => addMarking(marking)}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                {marking}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Horse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
