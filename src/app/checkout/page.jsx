'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getCart } from '@/utils/cart';
import { getProductById } from '@/utils/products-supabase';
import { createOrder } from '@/utils/orders-supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    citta: '',
    cap: '',
    paese: 'Italia',
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

  const formatPrice = (price) => {
    return `€${parseFloat(price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome richiesto';
    if (!formData.cognome.trim()) newErrors.cognome = 'Cognome richiesto';
    if (!formData.email.trim()) newErrors.email = 'Email richiesta';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'Telefono richiesto';
    if (!formData.indirizzo.trim()) newErrors.indirizzo = 'Indirizzo richiesto';
    if (!formData.citta.trim()) newErrors.citta = 'Città richiesta';
    if (!formData.cap.trim()) newErrors.cap = 'CAP richiesto';

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
          name: product?.name || 'Prodotto',
          price: product ? parseFloat(product.price || 0) : 0,
          quantity: item.quantity || 1,
          image: product?.images?.[0] || product?.image || '',
        };
      });

      // Créer la commande
      const orderData = {
        email: formData.email,
        nome: formData.nome,
        cognome: formData.cognome,
        telefono: formData.telefono,
        total: calculateTotal(),
        subtotal: calculateTotal(),
        status: 'pending',
        shipping_address: {
          indirizzo: formData.indirizzo,
          citta: formData.citta,
          cap: formData.cap,
          paese: formData.paese,
        },
        items: orderItems,
      };

      await createOrder(orderData);

      // Préparer l'email avec les détails de la commande
      const orderDetails = `
Ordine per: ${formData.nome} ${formData.cognome}
Email: ${formData.email}
Telefono: ${formData.telefono}

Indirizzo di spedizione:
${formData.indirizzo}
${formData.citta}, ${formData.cap}
${formData.paese}

Prodotti:
${orderItems.map((item) => `- ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n')}

Totale: ${formatPrice(calculateTotal())}
      `.trim();

      // Rediriger vers l'email avec les détails
      const emailSubject = encodeURIComponent(`Nuovo ordine - ${formData.nome} ${formData.cognome}`);
      const emailBody = encodeURIComponent(orderDetails);
      const mailtoLink = `mailto:robertotavernar7@gmail.com?subject=${emailSubject}&body=${emailBody}`;
      
      window.location.href = mailtoLink;

      // Vider le panier après redirection
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Errore durante l\'elaborazione dell\'ordine. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary">Caricamento...</p>
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
            Il tuo carrello è vuoto
          </h1>
          <p className="text-text-secondary mb-6">
            Aggiungi alcuni prodotti al tuo carrello per procedere.
          </p>
          <Link
            href="/product-catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span>Continua lo shopping</span>
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
                Informazioni di contatto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Nome <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.nome ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.nome && <p className="mt-1 text-sm text-error">{errors.nome}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Cognome <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cognome}
                    onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.cognome ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.cognome && <p className="mt-1 text-sm text-error">{errors.cognome}</p>}
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
                    Telefono <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.telefono ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.telefono && <p className="mt-1 text-sm text-error">{errors.telefono}</p>}
                </div>
              </div>
            </div>

            {/* Indirizzo di spedizione */}
            <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Indirizzo di spedizione
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Indirizzo <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.indirizzo}
                    onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.indirizzo ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.indirizzo && <p className="mt-1 text-sm text-error">{errors.indirizzo}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Città <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.citta}
                      onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.citta ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.citta && <p className="mt-1 text-sm text-error">{errors.citta}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      CAP <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cap}
                      onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.cap ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.cap && <p className="mt-1 text-sm text-error">{errors.cap}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Paese
                    </label>
                    <input
                      type="text"
                      value={formData.paese}
                      onChange={(e) => setFormData({ ...formData, paese: e.target.value })}
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
                Riepilogo ordine
              </h2>
              <div className="space-y-3 mb-6">
                {cart.map((item) => {
                  const product = products[item.id];
                  const price = product ? parseFloat(product.price || 0) : 0;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {product?.name || 'Prodotto'} x{item.quantity || 1}
                      </span>
                      <span className="text-text-primary font-semibold">
                        {formatPrice(price * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-border pt-3 flex justify-between text-lg font-heading font-bold text-text-primary">
                  <span>Totale</span>
                  <span>{formatPrice(calculateTotal())}</span>
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
                    <span>Elaborazione...</span>
                  </>
                ) : (
                  <>
                    <span>Completa ordine</span>
                    <Icon name="ArrowRightIcon" size={20} variant="outline" />
                  </>
                )}
              </button>
              <Link
                href="/shopping-cart"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-fast"
              >
                <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                <span>Torna al carrello</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
