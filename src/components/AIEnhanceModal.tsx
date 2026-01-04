import React, { useState, useEffect } from 'react';
import { Wand2, Save } from 'lucide-react';
import { Modal } from './Modal';
import Upscaler from 'upscaler';
import model from '@upscalerjs/default-model';

interface AIEnhanceModalProps {
  media: {
    id: string;
    file_url: string;
    title?: string;
  };
  horseId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function AIEnhanceModal({ media, horseId, onClose, onComplete }: AIEnhanceModalProps) {
  const [originalImage, setOriginalImage] = useState<string>(media.file_url);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scale, setScale] = useState(2);
  const [progress, setProgress] = useState(0);
  const [showComparison, setShowComparison] = useState(true);

  const handleEnhance = async () => {
    setEnhancing(true);
    setProgress(0);

    try {
      const upscaler = new Upscaler({
        model,
      });

      setProgress(25);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = originalImage;
      });

      setProgress(50);

      const canvas = document.createElement('canvas');
      const maxDimension = 1024;
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      setProgress(75);

      const upscaledCanvas = await upscaler.upscale(canvas, {
        output: 'tensor',
        patchSize: 64,
        padding: 2,
      });

      setProgress(90);

      const upscaledImageData = await upscaler.execute(upscaledCanvas, {
        output: 'base64',
      });

      setEnhancedImage(upscaledImageData as string);
      setProgress(100);
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('AI enhancement failed. The image might be too large. Try a smaller image.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!enhancedImage) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/horses/${horseId}/media/${media.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: enhancedImage })
      });

      if (response.ok) {
        onComplete();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save enhanced image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`AI Enhance: ${media.title || 'Image'}`} size="xl">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            AI enhancement uses deep learning to upscale and enhance image quality. This process may take a minute for large images.
          </p>
        </div>

        {!enhancedImage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upscale Factor: {scale}x
              </label>
              <input
                type="range"
                min="2"
                max="4"
                step="1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                disabled={enhancing}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2x (Faster)</span>
                <span>3x</span>
                <span>4x (Best Quality)</span>
              </div>
            </div>

            <button
              onClick={handleEnhance}
              disabled={enhancing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enhancing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enhancing... {progress}%
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Start AI Enhancement
                </>
              )}
            </button>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg p-4">
          {enhancedImage ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowComparison(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showComparison
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Compare
                </button>
                <button
                  onClick={() => setShowComparison(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !showComparison
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Enhanced Only
                </button>
              </div>

              {showComparison ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Enhanced</p>
                    <img
                      src={enhancedImage}
                      alt="Enhanced"
                      className="w-full rounded border border-gray-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <img
                    src={enhancedImage}
                    alt="Enhanced"
                    className="max-w-full rounded border border-gray-300"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-12">
              <img
                src={originalImage}
                alt="Original"
                className="max-w-full max-h-96 rounded border border-gray-300"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={enhancing || saving}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {enhancedImage ? 'Discard' : 'Cancel'}
          </button>
          {enhancedImage && (
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
                  Save Enhanced Image
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
