'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('paymentMethods');
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      } else {
        // Données d'exemple
        const exampleMethods = [
          {
            id: 1,
            type: 'card',
            cardNumber: '**** **** **** 4242',
            cardHolder: 'Marco Rossi',
            expiryDate: '12/25',
            isDefault: true,
            brand: 'visa'
          }
        ];
        setPaymentMethods(exampleMethods);
        localStorage.setItem('paymentMethods', JSON.stringify(exampleMethods));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des méthodes de paiement:', error);
    }
  };

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    brand: 'visa'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Détecter la marque de la carte à partir du numéro
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      let brand = 'visa';
      if (cleaned.startsWith('4')) {
        brand = 'visa';
      } else if (cleaned.startsWith('5') || cleaned.startsWith('2')) {
        brand = 'mastercard';
      } else if (cleaned.startsWith('3')) {
        brand = 'amex';
      }
      setFormData(prev => ({ ...prev, [name]: value, brand }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate || !formData.cvv) {
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      alert('Numero di carta non valido.');
      return;
    }

    const newMethod = {
      id: editingId || Date.now(),
      type: 'card',
      cardNumber: `**** **** **** ${cleanedCardNumber.slice(-4)}`,
      cardHolder: formData.cardHolder,
      expiryDate: formData.expiryDate,
      isDefault: paymentMethods.length === 0 || editingId === null,
      brand: formData.brand
    };

    let updated;
    if (editingId) {
      updated = paymentMethods.map(m => m.id === editingId ? newMethod : m);
    } else {
      // Désactiver le défaut des autres si on ajoute une nouvelle carte par défaut
      if (newMethod.isDefault) {
        updated = paymentMethods.map(m => ({ ...m, isDefault: false }));
        updated.push(newMethod);
      } else {
        updated = [...paymentMethods, newMethod];
      }
    }

    setPaymentMethods(updated);
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
    
    // Réinitialiser le formulaire
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      brand: 'visa'
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleEdit = (method) => {
    setEditingId(method.id);
    // Note: on ne peut pas récupérer le numéro complet, donc on garde juste les 4 derniers chiffres
    setFormData({
      cardNumber: method.cardNumber.replace(/\s/g, '').slice(-4),
      cardHolder: method.cardHolder,
      expiryDate: method.expiryDate,
      cvv: '',
      brand: method.brand || 'visa'
    });
    setIsAddingNew(true);
  };

  const handleDelete = (id) => {
    if (confirm('Sei sicuro di voler eliminare questo metodo di pagamento?')) {
      const updated = paymentMethods.filter(m => m.id !== id);
      // Si on supprime la carte par défaut, la première devient par défaut
      if (updated.length > 0 && !updated.some(m => m.isDefault)) {
        updated[0].isDefault = true;
      }
      setPaymentMethods(updated);
      localStorage.setItem('paymentMethods', JSON.stringify(updated));
    }
  };

  const setAsDefault = (id) => {
    const updated = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id
    }));
    setPaymentMethods(updated);
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
  };

  const getCardBrandIcon = (brand) => {
    switch (brand) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const cancelEdit = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      brand: 'visa'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/user-dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-fast mb-4"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span className="font-body">Retour au tableau de bord</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
            Metodi di Pagamento
          </h1>
          <p className="text-text-secondary">
            Gestisci i tuoi metodi di pagamento salvati
          </p>
        </div>

        <div className="max-w-4xl">
          {/* Liste des méthodes de paiement */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-text-primary">
                Metodi Salvati
              </h2>
              {!isAddingNew && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent transition-fast"
                >
                  <Icon name="PlusIcon" size={20} variant="outline" />
                  <span>Aggiungi metodo</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {paymentMethods.length === 0 && !isAddingNew ? (
                <div className="text-center py-12 text-text-secondary">
                  <div className="text-5xl mb-4 opacity-50">💳</div>
                  <p className="mb-2">Nessun metodo di pagamento salvato</p>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="text-primary hover:underline"
                  >
                    Aggiungi il primo metodo
                  </button>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg transition-fast ${
                      method.isDefault
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl">{getCardBrandIcon(method.brand)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-body font-semibold text-text-primary">
                              {method.cardNumber}
                            </p>
                            {method.isDefault && (
                              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                                Predefinito
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mb-1">
                            {method.cardHolder}
                          </p>
                          <p className="text-sm text-text-secondary">
                            Scade: {method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => setAsDefault(method.id)}
                            className="px-3 py-1 text-sm border border-input rounded-md hover:bg-muted transition-fast"
                          >
                            Imposta come predefinito
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(method)}
                          className="p-2 rounded-md hover:bg-muted transition-fast"
                        >
                          <Icon name="PencilIcon" size={18} variant="outline" />
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-fast"
                        >
                          <Icon name="TrashIcon" size={18} variant="outline" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Formulaire d'ajout/modification */}
          {isAddingNew && (
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                {editingId ? 'Modifica metodo di pagamento' : 'Aggiungi metodo di pagamento'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Numero carta *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      handleInputChange({ ...e, target: { ...e.target, value: formatted } });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Intestatario *
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="MARCO ROSSI"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Scadenza (MM/AA) *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        handleInputChange({ ...e, target: { ...e.target, value } });
                      }}
                      placeholder="12/25"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        handleInputChange({ ...e, target: { ...e.target, value } });
                      }}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent transition-fast"
                  >
                    {editingId ? 'Salva modifiche' : 'Aggiungi metodo'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 border border-input rounded-md text-text-primary hover:bg-muted transition-fast"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

