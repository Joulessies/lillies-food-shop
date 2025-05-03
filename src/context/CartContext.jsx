import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  
  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const loadCart = () => {
      // Get cart key based on whether user is logged in
      const cartKey = user ? `cart_${user.id}` : 'cart_anonymous';
      
      try {
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    };
    
    loadCart();
  }, [user]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length >= 0) { // Changed from > 0 to >= 0 to also save empty cart
      // Get cart key based on whether user is logged in
      const cartKey = user ? `cart_${user.id}` : 'cart_anonymous';
      
      try {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cartItems, user]);
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already in cart
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity }];
      }
    });
    openCart();
  };
  
  const updateQuantity = (productId, quantity) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const clearCart = () => {
    setCartItems([]);
    // Also clear from localStorage
    const cartKey = user ? `cart_${user.id}` : 'cart_anonymous';
    localStorage.removeItem(cartKey);
  };
  
  // Add functions to match what your Navbar expects
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    ).toFixed(2);
  };
  
  const getItemCount = () => {
    return cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );
  };
  
  // Transfer anonymous cart to user cart upon login
  const mergeAnonymousCart = (userId) => {
    try {
      const anonymousCart = JSON.parse(localStorage.getItem('cart_anonymous') || '[]');
      
      if (anonymousCart.length > 0) {
        // Merge anonymous cart with user cart
        const userCartKey = `cart_${userId}`;
        const userCart = JSON.parse(localStorage.getItem(userCartKey) || '[]');
        
        // Combine carts, handle duplicates
        const mergedCart = [...userCart];
        
        anonymousCart.forEach(anonItem => {
          const existingItem = mergedCart.find(item => item.id === anonItem.id);
          
          if (existingItem) {
            existingItem.quantity += anonItem.quantity;
          } else {
            mergedCart.push(anonItem);
          }
        });
        
        // Save merged cart
        localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
        
        // Clear anonymous cart
        localStorage.removeItem('cart_anonymous');
        
        // Update state
        setCartItems(mergedCart);
      }
    } catch (error) {
      console.error('Failed to merge anonymous cart:', error);
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getItemCount,
        mergeAnonymousCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;