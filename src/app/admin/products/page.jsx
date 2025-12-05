'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { getProducts, deleteProduct, updateProduct } from '@/utils/products-supabase';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadProducts();
    
    // Écouter les mises à jour
    const handleProductsUpdated = () => {
      loadProducts();
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await updateProduct(id, {
          status: product.status === 'active' ? 'inactive' : 'active'
        });
        await loadProducts();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">
            Gestione Prodotti
          </h2>
          <p className="text-text-secondary">
            Gestisci il tuo catalogo prodotti ({filteredProducts.length} prodotti)
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent transition-fast"
        >
          <Icon name="PlusIcon" size={20} variant="outline" />
          <span>Aggiungi un prodotto</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="MagnifyingGlassIcon"
                size={20}
                variant="outline"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Cerca un prodotto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden lg:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Prodotto
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Prezzo
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">
                    Nessun prodotto trovato
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted transition-fast">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-surface">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="PhotoIcon" size={20} variant="outline" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-body font-semibold text-text-primary">
                            {product.name}
                          </p>
                          <p className="text-sm text-text-secondary">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-body font-semibold text-text-primary">
                          €{product.price.toLocaleString('it-IT')}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-sm text-text-secondary line-through">
                            €{product.originalPrice.toLocaleString('it-IT')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock || 0} unità
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(product.id)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status === 'active' ? 'Attivo' : 'Inattivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-md hover:bg-muted transition-fast"
                        >
                          <Icon name="PencilIcon" size={18} variant="outline" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-fast"
                        >
                          <Icon name="TrashIcon" size={18} variant="outline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center text-text-secondary">
            Nessun prodotto trovato
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-surface">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="PhotoIcon" size={20} variant="outline" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-text-primary truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-text-secondary">{product.brand}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-body font-semibold text-text-primary">
                      €{product.price.toLocaleString('it-IT')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-text-secondary line-through">
                        €{product.originalPrice.toLocaleString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    product.stock > 10
                      ? 'bg-green-100 text-green-800'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stock || 0} unità
                </span>
                <button
                  onClick={() => toggleStatus(product.id)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.status === 'active' ? 'Attivo' : 'Inattivo'}
                </button>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-input rounded-md hover:bg-muted transition-fast"
                >
                  <Icon name="PencilIcon" size={16} variant="outline" />
                  <span className="text-sm">Modifica</span>
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-fast"
                >
                  <Icon name="TrashIcon" size={16} variant="outline" />
                  <span className="text-sm">Elimina</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

