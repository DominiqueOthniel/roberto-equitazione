'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCart, saveCart } from '@/utils/cart-supabase';
import { registerCustomer, updateCustomerOrderStats } from '@/utils/customers-supabase';
import { createOrder } from '@/utils/orders-supabase';
import { createNotification } from '@/utils/notifications';

export default function CheckoutPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    via: '',
    numeroCivico: '',
    citta: '',
    provincia: 'Seleziona',
    cap: '',
    paese: 'Italia',
    telefono: '',
    email: ''
  });

  // Charger le panier et les données utilisateur au montage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Charger le panier
    const loadCart = async () => {
      try {
        const cart = await getCart();
        if (cart.length === 0) {
          // Rediriger si le panier est vide
          router.push('/shopping-cart');
          return;
        }
        setOrderItems(cart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    };

    loadCart();

    // Charger les données utilisateur si connecté
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Pré-remplir les champs avec les données utilisateur
        const nameParts = (user.name || '').split(' ');
        setFormData(prev => ({
          ...prev,
          nome: nameParts[0] || '',
          cognome: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
          telefono: user.phone || '',
          paese: user.address?.country || 'Italia',
          via: user.address?.street || user.address?.via || '',
          numeroCivico: user.address?.numeroCivico || '',
          citta: user.address?.city || user.address?.citta || '',
          provincia: user.address?.province || user.address?.provincia || 'Seleziona',
          cap: user.address?.cap || ''
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    }

    // Charger aussi depuis les clients si disponible
    const customers = localStorage.getItem('customers');
    if (customers && !userData) {
      try {
        const allCustomers = JSON.parse(customers);
        const userEmail = formData.email;
        if (userEmail) {
          const customer = allCustomers.find(c => c.email?.toLowerCase() === userEmail.toLowerCase());
          if (customer && customer.address) {
            setFormData(prev => ({
              ...prev,
              nome: (customer.name || '').split(' ')[0] || '',
              cognome: (customer.name || '').split(' ').slice(1).join(' ') || '',
              email: customer.email || '',
              telefono: customer.phone || '',
              paese: customer.address.country || 'Italia',
              via: customer.address.street || '',
              numeroCivico: customer.address.numeroCivico || '',
              citta: customer.address.city || '',
              provincia: customer.address.province || 'Seleziona',
              cap: customer.address.cap || ''
            }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données client:', error);
      }
    }
  }, [router]);

  const provinces = [
    'Seleziona',
    'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno', 'Asti', 'Avellino',
    'Bari', 'Barletta-Andria-Trani', 'Belluno', 'Benevento', 'Bergamo', 'Biella', 'Bologna', 'Bolzano',
    'Brescia', 'Brindisi', 'Cagliari', 'Caltanissetta', 'Campobasso', 'Caserta', 'Catania', 'Catanzaro',
    'Chieti', 'Como', 'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna', 'Ferrara', 'Firenze', 'Foggia',
    'Forlì-Cesena', 'Frosinone', 'Genova', 'Gorizia', 'Grosseto', 'Imperia', 'Isernia', 'La Spezia',
    'L Aquila', 'Latina', 'Lecce', 'Lecco', 'Livorno', 'Lodi', 'Lucca', 'Macerata', 'Mantova', 'Massa-Carrara',
    'Matera', 'Messina', 'Milano', 'Modena', 'Monza e della Brianza', 'Napoli', 'Novara', 'Nuoro',
    'Oristano', 'Padova', 'Palermo', 'Parma', 'Pavia', 'Perugia', 'Pesaro e Urbino', 'Pescara',
    'Piacenza', 'Pisa', 'Pistoia', 'Pordenone', 'Potenza', 'Prato', 'Ragusa', 'Ravenna', 'Reggio Calabria',
    'Reggio Emilia', 'Rieti', 'Rimini', 'Roma', 'Rovigo', 'Salerno', 'Sassari', 'Savona', 'Siena',
    'Siracusa', 'Sondrio', 'Sud Sardegna', 'Taranto', 'Teramo', 'Terni', 'Torino', 'Trapani', 'Trento',
    'Treviso', 'Trieste', 'Udine', 'Varese', 'Venezia', 'Verbano-Cusio-Ossola', 'Vercelli', 'Verona',
    'Vibo Valentia', 'Vicenza', 'Viterbo'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form data
    if (!formData.nome || !formData.cognome || !formData.via || !formData.numeroCivico || 
        !formData.citta || !formData.provincia || formData.provincia === 'Seleziona' || 
        !formData.cap || !formData.paese || !formData.telefono || !formData.email) {
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    // Calcolare gli importi
    const orderSubtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderTotal = orderSubtotal; // Il prezzo è tutto incluso

    // Save order data to localStorage (for demo purposes)
    const orderId = `ORD-${Date.now()}`;
    const orderData = {
      id: orderId,
      date: new Date(),
      customer: `${formData.nome} ${formData.cognome}`,
      email: formData.email,
      phone: formData.telefono,
      shippingAddress: formData,
      items: orderItems,
      subtotal: orderSubtotal,
      total: orderTotal,
      status: 'pending',
      orderDate: new Date().toISOString()
    };
    
    try {
      // Créer l'ordre dans Supabase
      const createdOrder = await createOrder({
        order_id: orderId,
        customer_name: `${formData.nome} ${formData.cognome}`,
        customer_email: formData.email,
        customer_phone: formData.telefono,
        shipping_address: formData,
        items: orderItems,
        subtotal: orderSubtotal,
        total: orderTotal,
        status: 'pending',
      });

      // Salvare in currentOrder (per compatibilità)
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
      }
      
      // Creare una notifica per l'admin
      createNotification(
        'order',
        'Nuovo ordine',
        `Ordine ${orderId} di ${formData.nome} ${formData.cognome} - ${orderTotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`,
        { orderId }
      );
      
      // Registrare o aggiornare il cliente nell'admin
      if (formData.email) {
        // Registrare il cliente se non esiste già
        await registerCustomer({
          name: `${formData.nome} ${formData.cognome}`,
          email: formData.email,
          phone: formData.telefono,
          address: {
            street: formData.via,
            numeroCivico: formData.numeroCivico,
            city: formData.citta,
            province: formData.provincia,
            cap: formData.cap,
            country: formData.paese
          }
        });
        
        // Aggiornare le statistiche dell'ordine
        await updateCustomerOrderStats(formData.email, orderTotal);
      }
      
      // Clear cart after successful order
      await saveCart([]);
      
      // Redirect to user dashboard after successful order
      alert('Ordine inviato con successo!');
      router.push('/user-dashboard');
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'ordine:', error);
      alert('Errore durante il salvataggio dell\'ordine. Riprova.');
    }
  };

  // Calculer les totaux à partir du panier
  const subtotal = orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const total = subtotal; // Il prezzo è tutto incluso

  // Si le panier est vide, afficher un message
  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Il tuo carrello è vuoto</p>
          <Link href="/shopping-cart" className="text-primary font-body hover:underline">
            Torna al carrello
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Shipping Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">
                Indirizzo di Spedizione
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Nome <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="cognome" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Cognome <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="cognome"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="via" className="block text-sm font-body font-semibold text-text-primary mb-2">
                    Via <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="via"
                    name="via"
                    value={formData.via}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="numeroCivico" className="block text-sm font-body font-semibold text-text-primary mb-2">
                    Numero Civico <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="numeroCivico"
                    name="numeroCivico"
                    value={formData.numeroCivico}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="citta" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Città <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="citta"
                      name="citta"
                      value={formData.citta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="provincia" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Provincia <span className="text-error">*</span>
                    </label>
                    <select
                      id="provincia"
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {provinces.map((province) => (
                        <option key={province} value={province === 'Seleziona' ? '' : province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cap" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      CAP <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="cap"
                      name="cap"
                      value={formData.cap}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="paese" className="block text-sm font-body font-semibold text-text-primary mb-2">
                    Paese <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="paese"
                    name="paese"
                    value={formData.paese}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Telefono <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <p className="text-xs text-text-secondary mt-4">
                  * Campi obbligatori
                </p>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center gap-2"
                  >
                    Continua
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">
                Riepilogo Ordine
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {item.quantity > 1 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary uppercase font-semibold mb-1">
                        {item.brand}
                      </p>
                      <h3 className="font-body font-semibold text-text-primary text-sm mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="font-heading font-bold text-text-primary">
                        {(item.price * item.quantity).toLocaleString('it-IT')} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-text-primary">Totale</span>
                  <span className="font-heading font-bold text-primary text-xl">
                    {total.toLocaleString('it-IT')} €
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2 text-center">
                  Prezzo tutto incluso (spedizione compresa)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

