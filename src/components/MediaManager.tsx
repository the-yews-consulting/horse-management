import React, { useState, useEffect } from 'react';
import { Plus, Image, Video, Edit, Wand2, Share2, Trash2, Lock, Unlock } from 'lucide-react';
import MediaUploadModal from './MediaUploadModal';
import ImageEditorModal from './ImageEditorModal';
import AIEnhanceModal from './AIEnhanceModal';
import SocialShareModal from './SocialShareModal';

interface MediaItem {
  id: string;
  horse_id: string;
  media_type: 'image' | 'video';
  file_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  date_taken: string;
  is_private: boolean;
  duration?: number;
  width?: number;
  height?: number;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

interface MediaManagerProps {
  horseId: string;
}

export default function MediaManager({ horseId }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [enhancingMedia, setEnhancingMedia] = useState<MediaItem | null>(null);
  const [sharingMedia, setSharingMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    loadMedia();
  }, [horseId]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/horses/${horseId}/media`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    loadMedia();
  };

  const handleTogglePrivacy = async (item: MediaItem) => {
    try {
      const response = await fetch(`/api/horses/${horseId}/media/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ ...item, is_private: !item.is_private })
      });

      if (response.ok) {
        loadMedia();
      }
    } catch (error) {
      console.error('Failed to update privacy:', error);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/horses/${horseId}/media/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        loadMedia();
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Gallery</h2>
          <p className="text-sm text-gray-600 mt-1">
            {media.length} {media.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Media
        </button>
      </div>

      {media.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-200 rounded-full">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media yet</h3>
          <p className="text-gray-600 mb-6">Upload photos and videos of your horse</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="relative aspect-square bg-gray-100">
                {item.media_type === 'image' ? (
                  <img
                    src={item.file_url}
                    alt={item.title || 'Horse media'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="p-4 bg-white rounded-full shadow-lg">
                        <Video className="w-8 h-8 text-gray-700" />
                      </div>
                    </div>
                    {item.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded flex items-center gap-1">
                    {item.media_type === 'image' ? (
                      <Image className="w-3 h-3" />
                    ) : (
                      <Video className="w-3 h-3" />
                    )}
                    {item.media_type}
                  </span>
                </div>

                <button
                  onClick={() => handleTogglePrivacy(item)}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-75 text-white rounded hover:bg-opacity-90 transition-opacity"
                  title={item.is_private ? 'Private' : 'Public'}
                >
                  {item.is_private ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(item.date_taken)}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.media_type === 'image' && (
                    <>
                      <button
                        onClick={() => setEditingMedia(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        title="Edit image"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setEnhancingMedia(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        title="AI Enhance"
                      >
                        <Wand2 className="w-4 h-4" />
                        Enhance
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSharingMedia(item)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <MediaUploadModal
          horseId={horseId}
          onClose={() => setShowUploadModal(false)}
          onComplete={handleUploadComplete}
        />
      )}

      {editingMedia && (
        <ImageEditorModal
          media={editingMedia}
          horseId={horseId}
          onClose={() => setEditingMedia(null)}
          onComplete={() => {
            setEditingMedia(null);
            loadMedia();
          }}
        />
      )}

      {enhancingMedia && (
        <AIEnhanceModal
          media={enhancingMedia}
          horseId={horseId}
          onClose={() => setEnhancingMedia(null)}
          onComplete={() => {
            setEnhancingMedia(null);
            loadMedia();
          }}
        />
      )}

      {sharingMedia && (
        <SocialShareModal
          media={sharingMedia}
          onClose={() => setSharingMedia(null)}
        />
      )}
    </div>
  );
}
