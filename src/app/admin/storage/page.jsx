'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { 
  listFiles, 
  getStorageUsage, 
  findOrphanImages, 
  deleteFile, 
  deleteMultipleFiles 
} from '@/lib/supabase-storage';

export default function StorageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState(null);
  const [orphanImages, setOrphanImages] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orphans' | 'all'

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      
      // Charger l'utilisation du storage
      const usage = await getStorageUsage('products');
      setStorageUsage(usage);

      // Charger les images orphelines
      const orphans = await findOrphanImages('products');
      setOrphanImages(orphans);

      // Charger tous les fichiers
      const files = await listFiles('products');
      setAllFiles(files);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (path) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    const imagesToSelect = activeTab === 'orphans' ? orphanImages : allFiles;
    if (selectedImages.size === imagesToSelect.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(imagesToSelect.map(img => img.path || img.name)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) {
      alert('Sélectionnez au moins une image à supprimer');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedImages.size} image(s) ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setDeleting(true);
      const paths = Array.from(selectedImages);
      const result = await deleteMultipleFiles('products', paths);
      
      alert(`${result.success} image(s) supprimée(s) avec succès. ${result.failed > 0 ? `${result.failed} échec(s).` : ''}`);
      
      // Recharger les données
      setSelectedImages(new Set());
      await loadStorageData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (path) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.')) {
      return;
    }

    try {
      await deleteFile('products', path);
      alert('Image supprimée avec succès');
      await loadStorageData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 rounded-md hover:bg-muted transition-fast"
          aria-label="Retour à l'administration"
        >
          <Icon name="ArrowLeftIcon" size={20} variant="outline" />
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Gestion du Stockage
          </h2>
          <p className="text-text-secondary">Gérez les images et l'espace de stockage</p>
        </div>
      </div>

      {/* Storage Usage Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
          Utilisation du Stockage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-text-secondary mb-1">Total de fichiers</p>
            <p className="text-2xl font-bold text-text-primary">{storageUsage?.totalFiles || 0}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-text-secondary mb-1">Taille totale</p>
            <p className="text-2xl font-bold text-text-primary">{storageUsage?.sizeFormatted || '0 B'}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-text-secondary mb-1">Images orphelines</p>
            <p className="text-2xl font-bold text-text-primary">{orphanImages.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-fast ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('orphans')}
              className={`px-6 py-3 font-medium transition-fast ${
                activeTab === 'orphans'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Images Orphelines ({orphanImages.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium transition-fast ${
                activeTab === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tous les Fichiers ({allFiles.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-2">💡 Conseils pour gérer l'espace</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                  <li>Supprimez les images orphelines (non utilisées) pour libérer de l'espace</li>
                  <li>Optimisez vos images avant l'upload (compression, redimensionnement)</li>
                  <li>Vérifiez régulièrement les images inutilisées</li>
                  <li>Si vous atteignez la limite, vous pouvez upgrader votre plan Supabase</li>
                </ul>
              </div>
              
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-2">📊 Limites Supabase</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                  <li><strong>Plan Free:</strong> 1 GB de storage</li>
                  <li><strong>Plan Pro:</strong> 100 GB de storage</li>
                  <li><strong>Plan Team:</strong> 200 GB de storage</li>
                  <li>Vous pouvez upgrader depuis le dashboard Supabase</li>
                </ul>
              </div>
            </div>
          )}

          {/* Orphan Images Tab */}
          {activeTab === 'orphans' && (
            <div className="space-y-4">
              {orphanImages.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 border border-input rounded-md bg-background text-text-primary hover:bg-muted transition-fast text-sm"
                    >
                      {selectedImages.size === orphanImages.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    {selectedImages.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        disabled={deleting}
                        className="px-4 py-2 bg-error text-error-foreground rounded-md hover:opacity-90 transition-fast text-sm disabled:opacity-50"
                      >
                        {deleting ? 'Suppression...' : `Supprimer ${selectedImages.size} image(s)`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {orphanImages.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="CheckCircleIcon" size={48} variant="outline" className="mx-auto mb-4 text-success" />
                  <p className="text-text-secondary">Aucune image orpheline trouvée ! 🎉</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {orphanImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className={`relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer transition-fast ${
                        selectedImages.has(image.path) ? 'border-primary' : 'border-border'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.path)}
                          onChange={() => handleSelectImage(image.path)}
                          className="absolute top-2 left-2 z-10 w-5 h-5"
                        />
                        <Image
                          src={image.url}
                          alt="Orphan image"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-fast flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteSingle(image.path)}
                            className="opacity-0 group-hover:opacity-100 bg-error text-error-foreground px-3 py-1 rounded text-sm transition-fast"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 truncate">{formatSize(image.size)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Files Tab */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Nom</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Taille</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Créé le</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFiles.map((file, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-fast">
                        <td className="py-3 px-4 text-sm text-text-primary">{file.name}</td>
                        <td className="py-3 px-4 text-sm text-text-secondary">{formatSize(file.metadata?.size)}</td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          {file.created_at ? new Date(file.created_at).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteSingle(file.name)}
                            className="text-error hover:text-error/80 transition-fast text-sm"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

