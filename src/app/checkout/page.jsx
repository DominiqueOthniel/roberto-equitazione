'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getCart } from '@/utils/cart';
import { getProductById } from '@/utils/products-supabase';
import { createOrder } from '@/utils/orders-supabase';
import { BRAND, formatPrice } from '@/lib/brand';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    state: '',
    country: 'United States',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartItems = getCart();
      setCart(cartItems);

      // Charger les détails des produits
      const productsData = {};
      for (const item of cartItems) {
        try {
          const product = await getProductById(item.id);
          if (product) {
            productsData[item.id] = product;
          }
        } catch (error) {
          console.error(`Erreur lors du chargement du produit ${item.id}:`, error);
        }
      }
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = products[item.id];
      const price = product ? parseFloat(product.price || 0) : 0;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const formatMoney = (price) => formatPrice(price);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Préparer les items de commande
      const orderItems = cart.map((item) => {
        const product = products[item.id];
        return {
          id: item.id,
          name: product?.name || 'Product',
          price: product ? parseFloat(product.price || 0) : 0,
          quantity: item.quantity || 1,
          image: product?.images?.[0] || product?.image || '',
        };
      });

      // Créer la commande
      const orderData = {
        email: formData.email,
        nome: formData.firstName,
        cognome: formData.lastName,
        telefono: formData.phone,
        total: calculateTotal(),
        subtotal: calculateTotal(),
        status: 'pending',
        shipping_address: {
          indirizzo: formData.address,
          citta: formData.city,
          stato: formData.state,
          cap: formData.zip,
          paese: formData.country,
        },
        items: orderItems,
      };

      await createOrder(orderData);

      const orderDetails = `
Order for: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

Shipping address:
${formData.address}
${formData.city}, ${formData.state} ${formData.zip}
${formData.country}

Products:
${orderItems.map((item) => `- ${item.name} x${item.quantity} - ${formatMoney(item.price * item.quantity)}`).join('\n')}

Total: ${formatMoney(calculateTotal())}
      `.trim();

      const emailSubject = encodeURIComponent(`New order - ${formData.firstName} ${formData.lastName}`);
      const emailBody = encodeURIComponent(orderDetails);
      const mailtoLink = `mailto:${BRAND.email}?subject=${emailSubject}&body=${emailBody}`;
      
      window.location.href = mailtoLink;

      // Vider le panier après redirection
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Icon name="ShoppingCartIcon" size={64} className="mx-auto text-text-secondary mb-4" variant="outline" />
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Your cart is empty
          </h1>
          <p className="text-text-secondary mb-6">
            Add products to your cart to continue.
          </p>
          <Link
            href="/product-catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span>Continue shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-text-primary mb-6">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informazioni di contatto */}
            <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Contact information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    First name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.firstName ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-error">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Last name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.lastName ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-error">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.email ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.phone ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Shipping address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Address <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.address ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-error">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      City <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.city ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.city && <p className="mt-1 text-sm text-error">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      State <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="CA"
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.state ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.state && <p className="mt-1 text-sm text-error">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      ZIP <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.zip ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.zip && <p className="mt-1 text-sm text-error">{errors.zip}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 lg:p-6 sticky top-4">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Order summary
              </h2>
              <div className="space-y-3 mb-6">
                {cart.map((item) => {
                  const product = products[item.id];
                  const price = product ? parseFloat(product.price || 0) : 0;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {product?.name || 'Product'} x{item.quantity || 1}
                      </span>
                      <span className="text-text-primary font-semibold">
                        {formatMoney(price * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-border pt-3 flex justify-between text-lg font-heading font-bold text-text-primary">
                  <span>Total</span>
                  <span>{formatMoney(calculateTotal())}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Complete order</span>
                    <Icon name="ArrowRightIcon" size={20} variant="outline" />
                  </>
                )}
              </button>
              <Link
                href="/shopping-cart"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-fast"
              >
                <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                <span>Back to cart</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
