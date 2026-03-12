'use client'
import { useState } from 'react'
import { X, ShoppingBag, Trash2, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

interface CheckoutModalProps {
  onClose: () => void
}

type Step = 'cart' | 'form' | 'success'

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPrice = useCartStore((s) => s.totalPrice)

  const [step, setStep] = useState<Step>('cart')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_firstname: form.firstname,
          customer_lastname: form.lastname,
          customer_phone: form.phone,
          customer_address: form.address,
          items,
          total: totalPrice(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la commande')
      }

      setStep('success')
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-lg text-gray-900">
            {step === 'cart' && '🛒 Mon panier'}
            {step === 'form' && '📋 Mes coordonnées'}
            {step === 'success' && '✅ Commande envoyée'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP: CART ── */}
          {step === 'cart' && (
            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Votre panier est vide</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-primary-900 font-medium text-sm underline underline-offset-2"
                  >
                    Voir nos produits
                  </button>
                </div>
              ) : (
                <>
                  <ul className="space-y-3 mb-6">
                    {items.map((item) => (
                      <li
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                      >
                        <span className="text-3xl">{item.product.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} {item.product.unit} ×{' '}
                            {item.product.price.toFixed(2).replace('.', ',')}€
                          </p>
                        </div>
                        <span className="font-heading font-bold text-sm text-primary-900 whitespace-nowrap">
                          {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}€
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Total */}
                  <div className="bg-primary-50 rounded-2xl p-4 flex items-center justify-between mb-6">
                    <span className="font-medium text-primary-900">Total commande</span>
                    <span className="font-heading font-bold text-xl text-primary-900">
                      {totalPrice().toFixed(2).replace('.', ',')} €
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 text-center mb-4">
                    💬 Après votre commande, notre équipe vous contactera par téléphone ou WhatsApp pour confirmer et organiser le paiement.
                  </p>

                  <button
                    onClick={() => setStep('form')}
                    className="w-full bg-primary-900 hover:bg-primary-800 text-white font-heading font-semibold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continuer → Mes coordonnées
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── STEP: FORM ── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                Nous vous contacterons pour confirmer votre commande de{' '}
                <strong className="text-primary-900">
                  {totalPrice().toFixed(2).replace('.', ',')}€
                </strong>
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    placeholder="Jean"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    placeholder="Dupont"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  type="tel"
                  placeholder="+33 6 XX XX XX XX"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Adresse de livraison *
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="12 rue de la Paix, 75001 Paris"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-3.5 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-900 hover:bg-primary-800 text-white font-heading font-semibold py-3.5 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Envoi...' : '✓ Commander'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
                Commande envoyée !
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Merci <strong>{form.firstname}</strong>, votre commande a été transmise à notre équipe.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Nous vous contacterons au{' '}
                <strong className="text-primary-900">{form.phone}</strong>{' '}
                dans les prochaines heures pour confirmer et organiser la livraison. 🙏
              </p>
              <div className="bg-gold-50 rounded-2xl p-4 text-sm text-gold-700 mb-6">
                📞 Vous pouvez aussi nous appeler directement :<br />
                <strong>+33 7 59 26 49 55</strong> · <strong>+33 6 18 37 89 19</strong>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-primary-900 text-white font-heading font-semibold py-4 rounded-2xl hover:bg-primary-800 transition-colors"
              >
                Continuer les achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}