'use client'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Props {
  onBack: () => void
  onPlaceOrder: () => void
}

export default function CartPage({ onBack, onPlaceOrder }: Props) {
  const { items, updateQty, restaurantName, totalItems, totalPrice } = useCart()

  const deliveryFee = totalPrice > 300 ? 0 : 30
  const platformFee = 5
  const gst = Math.round(totalPrice * 0.05)
  const grandTotal = totalPrice + deliveryFee + platformFee + gst

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24"
      style={{ background: '#f4f4f4' }}
    >
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onBack}
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              border: '1.5px solid #e0e0e0',
              borderRadius: 6,
            }}
          >
            <ArrowLeft size={16} color="#3d4152" />
          </button>
          <div>
            <p className="font-bold text-sm" style={{ color: '#3d4152' }}>Your Cart</p>
            {restaurantName && (
              <p className="text-xs" style={{ color: '#686b78' }}>{restaurantName}</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 8, background: '#f4f4f4' }} />

      {/* Items list */}
      <div className="bg-white px-4 py-3">
        {items.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: '#686b78' }}>Your cart is empty</p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                {/* Veg/Non-veg dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: item.veg ? '#3d9b6e' : '#e74c3c',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                {/* Emoji + Dish name + restaurant */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ fontSize: 12, color: '#3d4152' }}>
                    {item.emoji} {item.dish}
                  </p>
                  <p className="truncate" style={{ fontSize: 10, color: '#93959f', marginTop: 1 }}>
                    {item.restaurant}
                  </p>
                </div>

                {/* Qty stepper */}
                <div
                  className="flex items-center rounded-[7px] overflow-hidden"
                  style={{ border: '1.5px solid #bdbdbd', flexShrink: 0 }}
                >
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="flex items-center justify-center font-bold text-sm"
                    style={{ width: 28, height: 28, color: '#3d4152', background: '#fff' }}
                  >
                    −
                  </button>
                  <span
                    className="font-bold text-xs text-center"
                    style={{ width: 24, color: '#3d4152' }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="flex items-center justify-center font-bold text-sm"
                    style={{ width: 28, height: 28, background: '#FC8019', color: '#fff' }}
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <p className="font-bold" style={{ fontSize: 12, color: '#3d4152', minWidth: 40, textAlign: 'right' }}>
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 8, background: '#f4f4f4' }} />

      {/* Coupon row */}
      <div className="bg-white px-4 py-3">
        <div
          className="flex items-center justify-between rounded-[8px] px-3 py-3"
          style={{ border: '1.5px dashed #bdbdbd' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🏷️</span>
            <span className="text-xs font-medium" style={{ color: '#3d4152' }}>Apply coupon</span>
          </div>
          <span className="text-xs font-bold" style={{ color: '#FC8019' }}>SAVE MORE →</span>
        </div>
      </div>

      <div style={{ height: 8, background: '#f4f4f4' }} />

      {/* Bill Details */}
      <div className="bg-white px-4 pt-4 pb-5">
        <p
          className="font-semibold tracking-widest mb-4"
          style={{ fontSize: 10, color: '#93959f', textTransform: 'uppercase' }}
        >
          Bill Details
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: '#3d4152' }}>Item total</span>
            <span className="text-xs font-medium" style={{ color: '#3d4152' }}>₹{totalPrice}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: '#3d4152' }}>Delivery fee</span>
            {deliveryFee === 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-xs line-through" style={{ color: '#93959f' }}>₹30</span>
                <span className="text-xs font-bold" style={{ color: '#3d9b6e' }}>FREE</span>
              </span>
            ) : (
              <span className="text-xs font-medium" style={{ color: '#3d4152' }}>₹{deliveryFee}</span>
            )}
          </div>

          <div className="flex justify-between">
            <span className="text-xs" style={{ color: '#3d4152' }}>Platform fee</span>
            <span className="text-xs font-medium" style={{ color: '#3d4152' }}>₹{platformFee}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs" style={{ color: '#3d4152' }}>GST & charges</span>
            <span className="text-xs font-medium" style={{ color: '#3d4152' }}>₹{gst}</span>
          </div>

          <div
            className="flex justify-between pt-3"
            style={{ borderTop: '1px dashed #e0e0e0' }}
          >
            <span className="font-bold" style={{ fontSize: 14, color: '#3d4152' }}>Grand Total</span>
            <span className="font-bold" style={{ fontSize: 14, color: '#3d4152' }}>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Sticky Place Order button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white"
        style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.08)' }}
      >
        <button
          onClick={onPlaceOrder}
          disabled={items.length === 0}
          className="w-full rounded-[12px] py-4 font-bold text-white text-sm flex items-center justify-center"
          style={{
            background: items.length === 0 ? '#bdbdbd' : '#FC8019',
            transition: 'background 0.2s',
          }}
        >
          Place Order · ₹{grandTotal}
        </button>
      </div>
    </motion.div>
  )
}
