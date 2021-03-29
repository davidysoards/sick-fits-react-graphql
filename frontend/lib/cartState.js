import { createContext, useContext, useState } from 'react';

const LocalStateContext = createContext();
const LocalStateProvider = LocalStateContext.Provider;

function CartStateProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  function toggleCart() {
    setCartOpen(!cartOpen);
  }
  function openCart() {
    setCartOpen(true);
  }
  function closeCart() {
    setCartOpen(false);
  }
  return (
    <LocalStateProvider
      value={{ cartOpen, setCartOpen, toggleCart, openCart, closeCart }}
    >
      {children}
    </LocalStateProvider>
  );
}

function useCart() {
  return useContext(LocalStateContext);
}

export { CartStateProvider, useCart };
