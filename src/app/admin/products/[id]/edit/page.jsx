'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { getProductById, updateProduct } from '@/utils/products-supabase';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    image: '',
    images: [],
    price: '',
    originalPrice: '',
    type: '',
    size: '',
    material: '',
    stock: 0,
    rating: 0,
    reviews: 0,
    isNew: false,
    description: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadProduct = async () => {
      try {
        setLoading(true);
        console.log('📥 Chargement produit avec ID:', params.id);
        
        // Charger depuis Supabase
        const foundProduct = await getProductById(params.id);
        
        if (foundProduct) {
          console.log('✅ Produit trouvé:', foundProduct);
          setProduct(foundProduct);
          
          // Préparer les données du formulaire
          const images = foundProduct.images || [];
          const mainImage = foundProduct.image || (images.length > 0 ? images[0] : '');
          const otherImages = foundProduct.image && images.length > 0 
            ? images.filter(img => img !== foundProduct.image)
            : images;
          
          setFormData({
            name: foundProduct.name || '',
            brand: foundProduct.brand || '',
            image: mainImage,
            images: otherImages,
            price: foundProduct.price || '',
            originalPrice: foundProduct.original_price || '',
            type: foundProduct.type || '',
            size: foundProduct.size || '',
            material: foundProduct.material || '',
            stock: foundProduct.stock || 0,
            rating: foundProduct.rating || 0,
            reviews: foundProduct.reviews_count || 0,
            isNew: foundProduct.is_new || false,
            description: foundProduct.description || '',
            status: foundProduct.status || 'active',
          });
          
          if (mainImage) {
            setImagePreview(mainImage);
          }
        } else {
          console.warn('⚠️ Produit non trouvé pour ID:', params.id);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Aperçu de l'image principale
    if (name === 'image' && value) {
      setImagePreview(value);
    }
  };

  const addImageUrl = () => {
    const url = prompt('Inserisci URL immagine:');
    if (url && url.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }));
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del prodotto è obbligatorio';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Il brand è obbligatorio';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Il prezzo deve essere maggiore di 0';
    }
    if (!formData.type) {
      newErrors.type = 'Il tipo è obbligatorio';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'Lo stock non può essere negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    if (!product) return;

    setIsSubmitting(true);

    try {
      // Préparer les images (ajouter l'image principale si elle existe)
      const allImages = formData.image 
        ? [formData.image, ...formData.images].filter(Boolean)
        : formData.images;

      // Préparer les données pour Supabase
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        image: formData.image || (allImages.length > 0 ? allImages[0] : ''),
        images: allImages,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        type: formData.type,
        size: formData.size || null,
        material: formData.material || null,
        stock: parseInt(formData.stock) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviews_count: parseInt(formData.reviews) || 0,
        is_new: formData.isNew,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      console.log('💾 Mise à jour produit dans Supabase:', productData);
      
      // Mettre à jour dans Supabase
      await updateProduct(product.id, productData);

      // Rediriger vers la liste des produits
      router.push('/admin/products');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du produit:', error);
      alert('Errore durante l\'aggiornamento del prodotto. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-secondary">Caricamento...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-md hover:bg-muted transition-fast"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
          </Link>
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Prodotto non trovato
            </h2>
            <p className="text-text-secondary">Il prodotto che stai cercando non esiste.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-md hover:bg-muted transition-fast"
          aria-label="Torna alla lista prodotti"
        >
          <Icon name="ArrowLeftIcon" size={20} variant="outline" />
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Modifica Prodotto
          </h2>
          <p className="text-text-secondary">{product.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
            {/* Informazioni di base */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Informazioni di Base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Nome Prodotto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.name ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="Es: Sella Dressage Elite"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.brand ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="Es: PRESTIGE"
                    required
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tipo di Sella *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.type ? 'border-red-500' : 'border-input'
                    }`}
                    required
                  >
                    <option value="">Seleziona un tipo</option>
                    <option value="Dressage">Dressage</option>
                    <option value="Salto Ostacoli">Salto Ostacoli</option>
                    <option value="Uso Generale">Uso Generale</option>
                    <option value="Completo">Completo</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Immagini */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Immagini
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Immagine Principale (URL)
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {imagePreview && (
                  <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Anteprima"
                      fill
                      className="object-cover"
                      sizes="128px"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Immagini Aggiuntive
                  </label>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 border border-input rounded-md bg-background text-text-primary hover:bg-muted transition-fast mb-3"
                  >
                    + Aggiungi URL Immagine
                  </button>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full aspect-square border border-border rounded-lg overflow-hidden">
                            <Image
                              src={img}
                              alt={`Immagine ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 25vw, 128px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon name="XMarkIcon" size={14} variant="outline" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prezzo e Stock */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Prezzo e Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Prezzo (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.price ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="0.00"
                    required
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Prezzo Originale (€)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.stock ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="0"
                    required
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Caratteristiche */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Caratteristiche
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Misura
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Es: 17.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Materiale
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Es: Pelle"
                  />
                </div>
              </div>
            </div>

            {/* Valutazione */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Valutazione
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Valutazione (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Numero Recensioni
                  </label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Opzioni */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Opzioni</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-text-primary">Segna come nuovo prodotto</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Stato
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Attivo</option>
                    <option value="inactive">Inattivo</option>
                    <option value="draft">Bozza</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Descrizione
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Descrizione dettagliata del prodotto..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/admin/products"
                className="w-full sm:w-auto text-center px-6 py-2 border border-input rounded-md text-text-primary hover:bg-muted transition-fast"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
              Anteprima
            </h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative aspect-square bg-surface rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt={formData.name || 'Anteprima prodotto'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-surface rounded-lg flex items-center justify-center text-text-secondary">
                  <Icon name="PhotoIcon" size={48} variant="outline" />
                </div>
              )}
              <div>
                <p className="text-xs text-text-secondary uppercase font-semibold mb-1">
                  {formData.brand || 'BRAND'}
                </p>
                <h4 className="font-body font-semibold text-text-primary mb-2">
                  {formData.name || 'Nome Prodotto'}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-heading font-bold text-text-primary">
                    €{formData.price ? parseFloat(formData.price).toLocaleString('it-IT', { minimumFractionDigits: 2 }) : '0,00'}
                  </span>
                  {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price || 0) && (
                    <span className="text-sm text-text-secondary line-through">
                      €{parseFloat(formData.originalPrice).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {formData.type && (
                  <p className="text-xs text-text-secondary mb-2">
                    {formData.type} {formData.size && `${formData.size}"`}
                  </p>
                )}
                {formData.isNew && (
                  <span className="inline-block bg-warning text-warning-foreground px-2 py-1 rounded text-xs font-semibold mb-2">
                    Nuovo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
