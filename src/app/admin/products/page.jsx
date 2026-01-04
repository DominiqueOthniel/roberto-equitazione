'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les produits depuis localStorage
    if (typeof window !== 'undefined') {
      const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      setProducts(storedProducts);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des Produits</h1>
          <Link
            href="/admin/products/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Ajouter un Produit
          </Link>
        </div>

        {/* Statistiques */}
        <div className="bg-card p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-2">Total Produits</h3>
          <p className="text-3xl font-bold text-primary">{products.length}</p>
        </div>

        {/* Liste des produits */}
        <div className="bg-card rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Tous les Produits</h2>
          </div>
          <div className="divide-y">
            {products.length === 0 ? (
              <div className="p-6 text-center text-text-secondary">
                Aucun produit trouvé
              </div>
            ) : (
              products.slice(0, 10).map((product, index) => (
                <div key={product.id || index} className="p-6 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{product.name || 'Produit sans nom'}</div>
                      <div className="text-sm text-text-secondary mt-1">
                        {product.category || 'Catégorie inconnue'}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Stock: {product.stock || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">€{product.price ? product.price.toLocaleString('it-IT') : '0'}</div>
                      <Link
                        href={`/admin/products/${product.id || index}/edit`}
                        className="text-primary hover:underline text-sm"
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}