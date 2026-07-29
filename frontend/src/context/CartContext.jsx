import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('solace_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('solace_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c._id === item._id);
      if (exists) {
        return prev.map(c => c._id === item._id ? { ...c, jumlah: c.jumlah + 1 } : c);
      }
      return [...prev, { ...item, jumlah: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c._id !== id));
  };

  const updateQty = (id, jumlah) => {
    if (jumlah < 1) return removeFromCart(id);
    setCart(prev => prev.map(c => c._id === id ? { ...c, jumlah } : c));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
