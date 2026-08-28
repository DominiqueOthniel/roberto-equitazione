'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { createProduct } from '@/utils/products-supabase';
import { uploadProductImage } from '@/lib/supabase-storage';
import { formatPrice } from '@/lib/brand';

export default function NewProductPage() {
  const router = useRouter();
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const additionalImagesInputRef = useRef(null);

  const handleImageUpload = async (e, isMain = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'immagine è troppo grande. Dimensione massima: 5MB.');
      return;
    }

    setUploadingImage(true);

    try {
      const productName = formData.name || 'product';
      const imageUrl = await uploadProductImage(file, productName);
      
      console.log('✅ Image uploadée:', imageUrl);

      // Ajouter un petit délai pour laisser Supabase rendre l'image accessible
      // et éviter les erreurs 400 lors du premier chargement
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isMain) {
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
        setUploadedImages(prev => [...prev, imageUrl]);
      }

      // Réinitialiser l'input
      if (isMain && fileInputRef.current) {
        fileInputRef.current.value = '';
      } else if (!isMain && additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      const errorMessage = error.message || 'Unknown error during upload';
      console.error('❌ Détails erreur:', error);
      alert(`Error uploading the image:\n\n${errorMessage}\n\nCheck the console for more details.`);
    } finally {
      setUploadingImage(false);
    }
  };

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


  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🛒 [NewProduct] Début création produit...');
      console.log('🛒 [NewProduct] Données formulaire:', formData);

      // Préparer les images (ajouter l'image principale si elle existe)
      const allImages = formData.image 
        ? [formData.image, ...formData.images].filter(Boolean)
        : formData.images;

      // Préparer les données pour Supabase
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        type: formData.type,
        size: formData.size || null,
        material: formData.material || null,
        images: allImages.length > 0 ? allImages : (formData.image ? [formData.image] : []),
        rating: parseFloat(formData.rating) || 0,
        reviews_count: parseInt(formData.reviews) || 0,
        is_new: formData.isNew || false,
        description: formData.description.trim() || null,
      };

      console.log('🛒 [NewProduct] Données préparées pour Supabase:', productData);

      // Créer le produit dans Supabase
      const newProduct = await createProduct(productData);

      console.log('✅ [NewProduct] Produit créé avec succès:', newProduct);

      if (!newProduct) {
        throw new Error('Le produit n\'a pas été créé');
      }

      // Rediriger vers la liste des produits
      router.push('/admin/products');
    } catch (error) {
      console.error('❌ [NewProduct] Erreur lors de la création du produit:', error);
      console.error('❌ [NewProduct] Détails:', error.message, error.stack);
      alert(`Error creating the product: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-md hover:bg-muted transition-fast"
          aria-label="Back to product list"
        >
          <Icon name="ArrowLeftIcon" size={20} variant="outline" />
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            New Product
          </h2>
          <p className="text-text-secondary">Add a new product to the catalog</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Product name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.name ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="e.g. Elite Dressage Saddle"
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
                    placeholder="e.g. PRESTIGE"
                    required
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Saddle Type *
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
                    <option value="">Select a type</option>
                    <option value="Dressage">Dressage</option>
                    <option value="Show Jumping">Show Jumping</option>
                    <option value="All Purpose">All Purpose</option>
                    <option value="Eventing">Eventing</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Images
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Main Image
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-accent disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-text-secondary mt-2">Uploading...</p>
                  )}
                </div>

                {imagePreview && (
                  <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="128px"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Additional Images
                  </label>
                  <input
                    type="file"
                    ref={additionalImagesInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-accent disabled:opacity-50"
                  />
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full aspect-square border border-border rounded-lg overflow-hidden">
                            <Image
                              src={img}
                              alt={`Image ${index + 1}`}
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

            {/* Price and Stock */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Price and Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Price ($) *
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
                    Original Price ($)
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

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Seat size
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. 17.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Leather"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Rating
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Rating (0-5)
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
                    Number of Reviews
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

            {/* Options */}
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-text-primary">Mark as a new product</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Detailed product description..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/admin/products"
                className="w-full sm:w-auto text-center px-6 py-2 border border-input rounded-md text-text-primary hover:bg-muted transition-fast"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
              Preview
            </h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative aspect-square bg-surface rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt={formData.name || 'Product preview'}
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
                  {formData.name || 'Product name'}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-heading font-bold text-text-primary">
                    {formData.price ? formatPrice(formData.price) : formatPrice(0)}
                  </span>
                  {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price || 0) && (
                    <span className="text-sm text-text-secondary line-through">
                      {formatPrice(formData.originalPrice)}
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
                    New
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
