import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, Calendar, Lock } from 'lucide-react';
import { Modal } from './Modal';

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'video';
  duration?: number;
}

interface MediaUploadModalProps {
  horseId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function MediaUploadModal({ horseId, onClose, onComplete }: MediaUploadModalProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'metadata'>('files');
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    date_taken: new Date().toISOString().split('T')[0],
    is_private: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = async (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    const previews = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        let duration: number | undefined;

        if (type === 'video') {
          duration = await getVideoDuration(preview);
        }

        return { file, preview, type, duration };
      })
    );

    setFiles((prev) => [...prev, ...previews]);
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(Math.floor(video.duration));
        video.remove();
      };
      video.src = url;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const filePreview of files) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(filePreview.file);
        });

        const img = new window.Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = fileData;
        });

        const mediaData = {
          media_type: filePreview.type,
          file_url: fileData,
          title: metadata.title || filePreview.file.name,
          description: metadata.description,
          date_taken: metadata.date_taken,
          is_private: metadata.is_private,
          duration: filePreview.duration,
          width: filePreview.type === 'image' ? img.width : undefined,
          height: filePreview.type === 'image' ? img.height : undefined,
          file_size: filePreview.file.size
        };

        const response = await fetch(`/api/horses/${horseId}/media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(mediaData)
        });

        if (!response.ok) {
          throw new Error('Failed to upload media');
        }
      }

      onComplete();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen onClose={onClose} title="Upload Media">
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'files'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'metadata'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Metadata
          </button>
        </div>

        {activeTab === 'files' ? (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Supports images (JPEG, PNG, WEBP) and videos (MP4, MOV)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select Files
              </button>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((filePreview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {filePreview.type === 'image' ? (
                        <img
                          src={filePreview.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            src={filePreview.preview}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                          {filePreview.duration && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                              {formatDuration(filePreview.duration)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {filePreview.file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Taken
              </label>
              <input
                type="date"
                value={metadata.date_taken}
                onChange={(e) =>
                  setMetadata({ ...metadata, date_taken: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) =>
                  setMetadata({ ...metadata, title: e.target.value })
                }
                placeholder="Enter a title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) =>
                  setMetadata({ ...metadata, description: e.target.value })
                }
                placeholder="Add a description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setMetadata({ ...metadata, is_private: !metadata.is_private })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  metadata.is_private ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    metadata.is_private ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                Private
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {files.length} {files.length === 1 ? 'file' : 'files'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
