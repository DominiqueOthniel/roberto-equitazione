'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { listFiles, deleteFile, getStorageUsage, findOrphanImages, deleteMultipleFiles } from '@/lib/supabase-storage';
import { getProducts } from '@/utils/products-supabase';
import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'products';

export default function AdminStoragePage() {
  const [files, setFiles] = useState([]);
  const [usage, setUsage] = useState({ totalFiles: 0, totalSize: 0, sizeFormatted: '0 B' });
  const [orphanImages, setOrphanImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showOrphans, setShowOrphans] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      const [filesData, usageData] = await Promise.all([
        listFiles(BUCKET_NAME).catch(() => []),
        getStorageUsage(BUCKET_NAME).catch(() => ({ totalFiles: 0, totalSize: 0, sizeFormatted: '0 B' })),
      ]);
      setFiles(filesData);
      setUsage(usageData);
    } catch (error) {
      console.error('Erreur lors du chargement du stockage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrphanImages = async () => {
    try {
      setLoading(true);
      const products = await getProducts();
      const orphan = await findOrphanImages(BUCKET_NAME, []);
      setOrphanImages(orphan);
      setShowOrphans(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'images orphelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (path) => {
    if (!confirm(`Are you sure you want to delete this file?\n${path}`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteFile(BUCKET_NAME, path);
      await loadStorageData();
      if (showOrphans) {
        await loadOrphanImages();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Error deleting the file');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteOrphans = async () => {
    if (orphanImages.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${orphanImages.length} unused images? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const paths = orphanImages.map(img => img.path);
      await deleteMultipleFiles(BUCKET_NAME, paths);
      await loadStorageData();
      await loadOrphanImages();
      alert(`${orphanImages.length} images deleted successfully`);
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
      alert('Error deleting the images');
    } finally {
      setDeleting(false);
    }
  };

  const getFileUrl = (path) => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
          Storage
        </h2>
        <p className="text-text-secondary">
          Manage files in the "products" bucket
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Total files</p>
          <p className="text-2xl font-bold text-text-primary">{usage.totalFiles}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Total size</p>
          <p className="text-2xl font-bold text-text-primary">{usage.sizeFormatted}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Unused images</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-text-primary">
              {showOrphans ? orphanImages.length : '?'}
            </p>
            <button
              onClick={loadOrphanImages}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-fast"
              disabled={loading}
            >
              {showOrphans ? 'Refresh' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Orphan Images Section */}
      {showOrphans && orphanImages.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Unused images ({orphanImages.length})
              </h3>
              <p className="text-sm text-text-secondary">
                Images not used by any product
              </p>
            </div>
            <button
              onClick={handleDeleteOrphans}
              disabled={deleting}
              className="px-4 py-2 bg-error text-error-foreground rounded-lg hover:opacity-90 transition-fast disabled:opacity-50 flex items-center gap-2"
            >
              <Icon name="TrashIcon" size={18} variant="outline" />
              <span>Delete all</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {orphanImages.map((image) => (
              <div key={image.path} className="relative group">
                <div className="relative aspect-square bg-surface rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.path}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <button
                    onClick={() => handleDeleteFile(image.path)}
                    disabled={deleting}
                    className="absolute top-2 right-2 p-2 bg-error/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Icon name="TrashIcon" size={16} variant="outline" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-secondary truncate" title={image.path}>
                  {image.path.split('/').pop()}
                </p>
                <p className="text-xs text-text-secondary">{formatFileSize(image.size)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold text-text-primary">
            All files ({files.length})
          </h3>
          <button
            onClick={loadStorageData}
            disabled={loading}
            className="px-4 py-2 bg-muted text-text-primary rounded-lg hover:bg-muted/80 transition-fast disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="ArrowPathIcon" size={18} variant="outline" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-secondary">Loading...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="PhotoIcon" size={48} className="mx-auto text-text-secondary mb-4" variant="outline" />
            <p className="text-text-secondary">No files found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => {
              const fileUrl = getFileUrl(file.name);
              const fileSize = file.metadata?.size || 0;
              return (
                <div key={file.name} className="relative group">
                  {isImage(file.name) ? (
                    <div className="relative aspect-square bg-surface rounded-lg overflow-hidden">
                      <Image
                        src={fileUrl}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        disabled={deleting}
                        className="absolute top-2 right-2 p-2 bg-error/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Icon name="TrashIcon" size={16} variant="outline" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Icon name="DocumentIcon" size={32} className="text-text-secondary" variant="outline" />
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        disabled={deleting}
                        className="absolute top-2 right-2 p-2 bg-error/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Icon name="TrashIcon" size={16} variant="outline" />
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-text-secondary truncate" title={file.name}>
                    {file.name.split('/').pop()}
                  </p>
                  <p className="text-xs text-text-secondary">{formatFileSize(fileSize)}</p>
                  {file.created_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(file.created_at).toLocaleDateString('en-US')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

