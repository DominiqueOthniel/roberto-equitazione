'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function ProductForm({ product, onSubmit }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    image: product?.image || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    type: product?.type || '',
    size: product?.size || '',
    material: product?.material || '',
    stock: product?.stock || 0,
    rating: product?.rating || 0,
    reviews: product?.reviews || 0,
    isNew: product?.isNew || false,
    description: product?.description || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
    // Cancellare l'errore per questo campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
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
    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
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
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Image URL
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.type ? 'border-red-500' : 'border-input'
              }`}
            >
              <option value="">Select a type</option>
              <option value="Dressage">Dressage</option>
              <option value="Show Jumping">Show Jumping</option>
              <option value="All Purpose">All Purpose</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>
        </div>
      </div>

      {/* Price and stock */}
      <div>
        <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
          Price and stock
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
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Original price ($)
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
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
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
              Size
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
          rows={4}
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
          className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent transition-fast"
        >
          {product ? 'Update' : 'Create product'}
        </button>
      </div>
    </form>
  );
}

