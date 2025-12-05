/**
 * Product utility functions with Supabase synchronization
 */

import { supabase } from '@/lib/supabase';

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
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const products = await getProducts();
      localStorage.setItem('products', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return createProductLocalStorage(productData);
  }
}

/**
 * Update a product
 */
export async function updateProduct(id, productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const products = await getProducts();
      localStorage.setItem('products', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return updateProductLocalStorage(id, productData);
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id) {
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
    return deleteProductLocalStorage(id);
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

