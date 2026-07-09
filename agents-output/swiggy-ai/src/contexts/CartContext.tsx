'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  dish: string
  restaurant: string
  price: number
  qty: number
  veg: boolean
  emoji: string
}

interface CartContextType {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty' | 'id'>) => void
  remove: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clear: () => void
  totalItems: number
  totalPrice: number
  restaurantName: string | null
}

const CartContext = createContext<CartContextType>(null!)
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (item: Omit<CartItem, 'qty' | 'id'>) => {
    const id = `${item.dish}||${item.restaurant}`
    setItems(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, id, qty: 1 }]
    })
  }

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    )
  }

  const clear = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  // One restaurant → its name; several → "X & 2 more"
  const distinctRestaurants = [...new Set(items.map(i => i.restaurant))]
  const restaurantName =
    distinctRestaurants.length === 0 ? null :
    distinctRestaurants.length === 1 ? distinctRestaurants[0] :
    `${distinctRestaurants[0]} & ${distinctRestaurants.length - 1} more`

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, totalItems, totalPrice, restaurantName }}>
      {children}
    </CartContext.Provider>
  )
}
