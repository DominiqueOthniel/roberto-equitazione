'use client';

import { useState } from 'react';
import { testSupabaseConnection } from '@/utils/test-supabase-connection';
import { addToCart, getCart } from '@/utils/cart-supabase';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await testSupabaseConnection();
      setTestResult(result ? '✅ Test succeeded' : '❌ Test failed. Check the console');
    } catch (error) {
      setTestResult('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    setLoading(true);
    try {
      console.log('🧪 Test: Ajout d\'un produit au panier...');
      await addToCart({
        id: 'test-' + Date.now(),
        name: 'Produit Test',
        price: 100,
        quantity: 1
      });
      
      const updatedCart = await getCart();
      setCart(updatedCart);
      console.log('✅ Produit ajouté, panier:', updatedCart);
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_carts')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur: ' + error.message);
      } else {
        console.log('✅ Données dans user_carts:', data);
        alert(`Found ${data.length} cart(s) in Supabase. Check the console for details.`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run connection test'}
          </button>
          
          {testResult && (
            <div className={`p-4 rounded-md ${testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {testResult}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold">Specific tests</h2>
          
          <button
            onClick={testAddToCart}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50 block"
          >
            Test: Add a product to the cart
          </button>
          
          <button
            onClick={checkSupabaseData}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50 block"
          >
            Check data in Supabase
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open the browser console (F12)</li>
            <li>Click "Run connection test"</li>
            <li>Check the messages in the console</li>
            <li>If you see errors, follow the on-screen instructions</li>
          </ol>
        </div>

        {cart.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Current cart:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(cart, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
