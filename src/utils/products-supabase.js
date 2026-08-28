/**
 * Product utility functions with Supabase synchronization
 */

import { supabase, assertSupabaseConfigured } from '@/lib/supabase';

const PRODUCT_COLUMNS = new Set([
  'name',
  'brand',
  'description',
  'price',
  'original_price',
  'images',
  'type',
  'size',
  'material',
  'rating',
  'reviews_count',
  'stock',
  'is_new',
  'is_featured',
  'disciplina',
  'paese_origine',
  'technical_specs',
  'features',
  'sizes',
]);

function sanitizeProductData(productData = {}) {
  const sanitized = {};

  for (const [key, value] of Object.entries(productData)) {
    if (!PRODUCT_COLUMNS.has(key)) {
      continue;
    }

    if (key === 'images') {
      if (Array.isArray(value)) {
        sanitized.images = value.filter(Boolean);
      } else if (value) {
        sanitized.images = [value];
      } else {
        sanitized.images = [];
      }
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

export function formatSupabaseError(error) {
  if (!error) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  return [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(' | ');
}

/**
 * Get all products
 */
export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cache local
    if (typeof window !== 'undefined') {
      localStorage.setItem('products', JSON.stringify(data || []));
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return getProductsLocalStorage();
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return getProductByIdLocalStorage(id);
  }
}

/**
 * Create a new product
 */
export async function createProduct(productData) {
  assertSupabaseConfigured('create products');

  try {
    console.log('Création produit dans Supabase:', productData);
    
    const { data, error } = await supabase
      .from('products')
      .insert(sanitizeProductData(productData))
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase lors de la création du produit:', error);
      console.error('Détails:', error.message, error.details, error.hint);
      throw error;
    }

    console.log('Produit créé avec succès:', data);

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const products = await getProducts();
      localStorage.setItem('products', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Update a product
 */
export async function updateProduct(id, productData) {
  assertSupabaseConfigured('update products');

  try {
    console.log('Mise à jour produit dans Supabase:', id, productData);
    
    const payload = {
      ...sanitizeProductData(productData),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erreur Supabase lors de la mise à jour du produit:', error);
      console.error('Détails:', error.message, error.details, error.hint);
      throw new Error(formatSupabaseError(error));
    }

    if (!data || data.length === 0) {
      throw new Error(
        'No product was updated. Run supabase-fix-products-save.sql in Supabase SQL Editor, then try again.'
      );
    }

    const updatedProduct = data[0];

    console.log('Produit mis à jour avec succès:', updatedProduct);

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const products = await getProducts();
      localStorage.setItem('products', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }

    return updatedProduct;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id) {
  assertSupabaseConfigured('delete products');

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const products = await getProducts();
      localStorage.setItem('products', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    throw error;
  }
}

// Fallback functions (localStorage)
function getProductsLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des produits:', error);
    return [];
  }
}

function getProductByIdLocalStorage(id) {
  const products = getProductsLocalStorage();
  return products.find(p => p.id === parseInt(id) || p.id === id) || null;
}

function createProductLocalStorage(productData) {
  if (typeof window === 'undefined') return null;
  
  try {
    const products = getProductsLocalStorage();
    const newProduct = {
      ...productData,
      id: products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }
    
    return newProduct;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return null;
  }
}

function updateProductLocalStorage(id, productData) {
  if (typeof window === 'undefined') return null;
  
  try {
    const products = getProductsLocalStorage();
    const index = products.findIndex(p => p.id === parseInt(id) || p.id === id);
    
    if (index >= 0) {
      products[index] = {
        ...products[index],
        ...productData,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('products', JSON.stringify(products));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productsUpdated'));
      }
      
      return products[index];
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return null;
  }
}

function deleteProductLocalStorage(id) {
  if (typeof window === 'undefined') return false;
  
  try {
    const products = getProductsLocalStorage();
    const filtered = products.filter(p => p.id !== parseInt(id) && p.id !== id);
    localStorage.setItem('products', JSON.stringify(filtered));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return false;
  }
}

