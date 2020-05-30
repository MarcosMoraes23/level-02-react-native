import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const KEY_PRODUCTS = '@GoMarketplace:products';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      AsyncStorage.clear();
      const itens = await AsyncStorage.getItem(KEY_PRODUCTS);
      if (itens) {
        setProducts(JSON.parse(itens));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    product => {
      const hasProductCart = products.find(item => item.id === product.id);
      let productsToAdd;
      if (hasProductCart) {
        productsToAdd = products.map(item => {
          if (product.id === item.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        productsToAdd = [...products, { ...product, quantity: 1 }];
      }
      AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(productsToAdd));
      setProducts(productsToAdd);
    },
    [products],
  );

  const increment = useCallback(
    id => {
      const productsUpdated = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(productsUpdated));

      setProducts(productsUpdated);
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      const productsUpdated = products.map(item => {
        if (item.id === id && item.quantity > 0) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(productsUpdated));

      setProducts(productsUpdated);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
