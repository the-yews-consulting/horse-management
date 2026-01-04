import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, Copy, Check, Square, Maximize2 } from 'lucide-react';
import { Modal } from './Modal';

interface SocialShareModalProps {
  media: {
    id: string;
    media_type: 'image' | 'video';
    file_url: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
  };
  onClose: () => void;
}

type CropMode = 'square' | 'fit';

export default function SocialShareModal({ media, onClose }: SocialShareModalProps) {
  const [cropMode, setCropMode] = useState<CropMode>('square');
  const [caption, setCaption] = useState('');
  const [processedUrl, setProcessedUrl] = useState<string>(media.file_url);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hashtags = ['#HorseLife', '#Equestrian', '#HorsesOfInstagram', '#EquestrianLife'];

  useEffect(() => {
    const defaultCaption = [media.title, media.description]
      .filter(Boolean)
      .join(' - ');
    setCaption(defaultCaption || 'Check out my horse!');
  }, [media.title, media.description]);

  useEffect(() => {
    if (media.media_type === 'image') {
      processImage();
    }
  }, [cropMode, media.file_url]);

  const processImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = media.file_url;
    });

    if (cropMode === 'square') {
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      ctx.drawImage(
        img,
        offsetX, offsetY, size, size,
        0, 0, size, size
      );
    } else {
      const maxHeight = 1350;
      const maxWidth = 1080;

      let width = img.width;
      let height = img.height;

      if (height > maxHeight) {
        width = (width / height) * maxHeight;
        height = maxHeight;
      }

      if (width > maxWidth) {
        height = (height / width) * maxWidth;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);
    }

    setProcessedUrl(canvas.toDataURL('image/jpeg', 0.95));
  };

  const copyCaption = async () => {
    const fullCaption = `${caption}\n\n${hashtags.join(' ')}`;
    try {
      await navigator.clipboard.writeText(fullCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `${media.title || 'horse-media'}-${cropMode}.${media.media_type === 'video' ? 'mp4' : 'jpg'}`;
    link.click();
  };

  const shareNative = async () => {
    if (!navigator.share) {
      alert('Web Share API is not supported on this device. Use the download button instead.');
      return;
    }

    try {
      const blob = await (await fetch(processedUrl)).blob();
      const file = new File(
        [blob],
        `${media.title || 'horse-media'}.${media.media_type === 'video' ? 'mp4' : 'jpg'}`,
        { type: blob.type }
      );

      const fullCaption = `${caption}\n\n${hashtags.join(' ')}`;

      await navigator.share({
        files: [file],
        title: media.title || 'My Horse',
        text: fullCaption
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        alert('Sharing failed. Try downloading and sharing manually.');
      }
    }
  };

  const openSocialPlatform = (platform: string) => {
    const fullCaption = encodeURIComponent(`${caption}\n\n${hashtags.join(' ')}`);

    const urls: Record<string, string> = {
      instagram: 'https://www.instagram.com/',
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      twitter: `https://twitter.com/intent/tweet?text=${fullCaption}`,
      whatsapp: `https://wa.me/?text=${fullCaption}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
      if (platform === 'instagram') {
        alert('Download the image, then open Instagram and upload it from your device.');
      }
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Export for Social Media" size="lg">
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Format your media for social media platforms and share directly or download to post manually.
          </p>
        </div>

        {media.media_type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setCropMode('square')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                  cropMode === 'square'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <Square className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Square (1:1)</div>
                  <div className="text-xs opacity-75">Instagram, Facebook</div>
                </div>
              </button>

              <button
                onClick={() => setCropMode('fit')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                  cropMode === 'fit'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <Maximize2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Fit to Height</div>
                  <div className="text-xs opacity-75">Instagram Portrait</div>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
          {media.media_type === 'image' ? (
            <img
              src={processedUrl}
              alt="Preview"
              className="max-w-full max-h-96 rounded shadow-lg"
            />
          ) : (
            <video
              src={media.file_url}
              controls
              className="max-w-full max-h-96 rounded shadow-lg"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Write your caption..."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Share to Platform
          </label>

          {navigator.share && (
            <button
              onClick={shareNative}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share via Mobile
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openSocialPlatform('instagram')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              Instagram
            </button>

            <button
              onClick={() => openSocialPlatform('facebook')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              Facebook
            </button>

            <button
              onClick={() => openSocialPlatform('twitter')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              X (Twitter)
            </button>

            <button
              onClick={() => openSocialPlatform('whatsapp')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              WhatsApp
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyCaption}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Caption
                </>
              )}
            </button>

            <button
              onClick={downloadMedia}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
