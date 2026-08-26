'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { getProducts, deleteProduct } from '@/utils/products-supabase';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Sei sicuro di voler eliminare "${productName}"? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Errore durante l\'eliminazione del prodotto');
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((p) => p.type === filterType);
    }

    return filtered;
  }, [products, searchQuery, filterType]);

  const types = useMemo(() => {
    const allTypes = products.map((p) => p.type).filter(Boolean);
    return ['all', ...new Set(allTypes)];
  }, [products]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      inStock: products.filter((p) => (p.stock || 0) > 0).length,
      outOfStock: products.filter((p) => (p.stock || 0) === 0).length,
      featured: products.filter((p) => p.is_featured).length,
    };
  }, [products]);

  const formatPrice = (price) => {
    return `€${parseFloat(price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
            Prodotti
          </h2>
          <p className="text-text-secondary">
            Gestisci i prodotti del catalogo
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast"
        >
          <Icon name="PlusIcon" size={20} variant="outline" />
          <span>Nuovo prodotto</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Totale</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">In magazzino</p>
          <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Esauriti</p>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">In evidenza</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="MagnifyingGlassIcon"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                variant="outline"
              />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tutti i tipi</option>
              {types
                .filter((t) => t !== 'all')
                .map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary">Caricamento...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Icon name="CubeIcon" size={48} className="mx-auto text-text-secondary mb-4" variant="outline" />
          <p className="text-text-secondary mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Nessun prodotto trovato con i filtri selezionati'
              : 'Nessun prodotto nel catalogo'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast"
            >
              <Icon name="PlusIcon" size={20} variant="outline" />
              <span>Crea il primo prodotto</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase">
                    Prodotto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase">
                    Prezzo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-text-primary uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const mainImage =
                    product.images && Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : product.image || '/placeholder-product.jpg';
                  return (
                    <tr key={product.id} className="hover:bg-muted/50 transition-fast">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={mainImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">{product.name}</p>
                            {product.brand && (
                              <p className="text-sm text-text-secondary">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-text-secondary">{product.type || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-text-primary">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="ml-2 text-sm text-text-secondary line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            (product.stock || 0) > 0
                              ? 'text-green-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }
                        >
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {product.is_featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              In evidenza
                            </span>
                          )}
                          {product.is_new && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Nuovo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-fast"
                            title="Modifica"
                          >
                            <Icon name="PencilIcon" size={18} variant="outline" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-fast"
                            title="Elimina"
                          >
                            <Icon name="TrashIcon" size={18} variant="outline" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-border">
            {filteredProducts.map((product) => {
              const mainImage =
                product.images && Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : product.image || '/placeholder-product.jpg';
              return (
                <div key={product.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary mb-1 truncate">{product.name}</h3>
                      {product.brand && (
                        <p className="text-sm text-text-secondary mb-2">{product.brand}</p>
                      )}
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold text-text-primary">{formatPrice(product.price)}</span>
                        <span
                          className={
                            (product.stock || 0) > 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'
                          }
                        >
                          Stock: {product.stock || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast text-sm"
                        >
                          <Icon name="PencilIcon" size={16} variant="outline" />
                          <span>Modifica</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="px-3 py-2 bg-error text-error-foreground rounded-lg hover:opacity-90 transition-fast"
                        >
                          <Icon name="TrashIcon" size={16} variant="outline" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

