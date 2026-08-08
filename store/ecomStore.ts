import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/ecomData';

export interface CartItem {
  product: Product;
  quantity: number;
  giftWrap: boolean;
  giftMessage?: string;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  addressType?: 'HOME' | 'WORK';
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  giftWrapFee: number;
  platformFee: number;
  shippingFee: number;
  total: number;
  status: 'Order Placed' | 'Order Accepted' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: Address;
  paymentMode: string;
  transactionId: string;
  awbNumber: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface EcomState {
  cart: CartItem[];
  wishlist: string[]; // Product IDs
  addresses: Address[];
  orders: Order[];
  searchQuery: string;
  toasts: ToastMessage[];

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleGiftWrap: (productId: string, giftWrap: boolean) => void;
  updateGiftMessage: (productId: string, message: string) => void;
  clearCart: () => void;

  toggleWishlist: (productId: string) => void;
  moveToWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
  removeAddress: (id: string) => void;

  createOrder: (
    shippingAddress: Address,
    paymentMode: string,
    transactionId: string
  ) => Order;

  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderAWB: (orderId: string, awbNumber: string) => void;
  syncDelhiveryAutoStatuses: () => void;

  setSearchQuery: (query: string) => void;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Calculators
  getCartSubtotal: () => number;
  getGiftWrapTotal: () => number;
  getPlatformFee: () => number;
  getGrandTotal: () => number;
  getCartItemCount: () => number;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    fullName: 'Ananya Sharma',
    street: '42 Lotus Park, CG Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '380009',
    phone: '+91 98765 43210',
    isDefault: true,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-98214',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        product: {
          id: 'b-earth-cats-eye',
          name: "Earth & Cat's Eye Harmony Bracelet",
          price: 499,
          rating: 4.9,
          reviewsCount: 42,
          category: 'Bracelets',
          material: 'Gemstones & Cat Eye',
          image: '/beads/pomelli_photoshoot_image_1_1_0726.png',
          images: ['/beads/pomelli_photoshoot_image_1_1_0726.png'],
          description: "Carved Indian wood barrels interspersed with luminescent green cat's eye spheres.",
          details: [],
          inStock: true,
        },
        quantity: 1,
        giftWrap: true,
        giftMessage: 'Happy Birthday Ananya! With love from mom.',
      },
    ],
    subtotal: 499,
    giftWrapFee: 20,
    platformFee: 25,
    shippingFee: 0,
    total: 544,
    status: 'Shipped',
    shippingAddress: DEFAULT_ADDRESSES[0],
    paymentMode: 'SME Pay UPI',
    transactionId: 'SMEPAY-882194',
    awbNumber: 'DLHV902817342',
  },
];

export const useEcomStore = create<EcomState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: ['b-earth-cats-eye', 'b-rosewood-ebony'],
      addresses: DEFAULT_ADDRESSES,
      orders: INITIAL_ORDERS,
      searchQuery: '',
      toasts: [],

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.cart.findIndex((item) => item.product.id === product.id);
          let updatedCart: CartItem[];

          if (existingIndex > -1) {
            updatedCart = [...state.cart];
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              quantity: updatedCart[existingIndex].quantity + quantity,
            };
          } else {
            updatedCart = [
              ...state.cart,
              { product, quantity, giftWrap: false, giftMessage: '' },
            ];
          }

          const updatedWishlist = state.wishlist.filter((id) => id !== product.id);

          return { cart: updatedCart, wishlist: updatedWishlist };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      toggleGiftWrap: (productId, giftWrap) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, giftWrap } : item
          ),
        }));
      },

      updateGiftMessage: (productId, giftMessage) => {
        const trimmedMessage = giftMessage.slice(0, 120);
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, giftMessage: trimmedMessage } : item
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlist.includes(productId);
          const updated = exists
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId];

          return { wishlist: updated };
        });
      },

      moveToWishlist: (productId) => {
        set((state) => {
          const updatedWishlist = state.wishlist.includes(productId)
            ? state.wishlist
            : [...state.wishlist, productId];
          const updatedCart = state.cart.filter((item) => item.product.id !== productId);
          return { wishlist: updatedWishlist, cart: updatedCart };
        });
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      addAddress: (addressData) => {
        const id = `addr-${Date.now()}`;
        const newAddress: Address = { ...addressData, id };

        set((state) => {
          let addresses = [...state.addresses];
          if (newAddress.isDefault) {
            addresses = addresses.map((a) => ({ ...a, isDefault: false }));
          }
          return { addresses: [...addresses, newAddress] };
        });

        get().addToast('Address Saved', 'New shipping address added to your account.', 'success');
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      createOrder: (shippingAddress, paymentMode, transactionId) => {
        const state = get();
        const subtotal = state.getCartSubtotal();
        const giftWrapFee = state.getGiftWrapTotal();
        const platformFee = state.getPlatformFee();
        const grandTotal = state.getGrandTotal();

        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const awbNumber = `DLHV${Math.floor(100000000 + Math.random() * 900000000)}`;

        const newOrder: Order = {
          id: orderId,
          createdAt: new Date().toISOString(),
          items: [...state.cart],
          subtotal,
          giftWrapFee,
          platformFee,
          shippingFee: 0,
          total: grandTotal,
          status: 'Order Placed',
          shippingAddress,
          paymentMode,
          transactionId,
          awbNumber,
        };

        set((s) => ({
          orders: [newOrder, ...s.orders],
          cart: [],
        }));

        get().addToast('Order Placed!', `Your order ${orderId} has been successfully placed.`, 'success');

        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
        get().addToast('Status Updated', `Order ${orderId} status set to ${status}.`, 'success');
      },

      updateOrderAWB: (orderId, awbNumber) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, awbNumber } : o)),
        }));
        get().addToast('AWB Generated', `Delhivery AWB ${awbNumber} assigned to ${orderId}.`, 'success');
      },

      syncDelhiveryAutoStatuses: () => {
        import('@/lib/delhivery').then(({ getLiveDelhiveryStatus }) => {
          set((state) => ({
            orders: state.orders.map((o) => {
              if (o.status === 'Cancelled') return o;
              const autoStatus = getLiveDelhiveryStatus(o.createdAt, o.status);
              return { ...o, status: autoStatus };
            }),
          }));
        });
      },

      setSearchQuery: (searchQuery) => {
        set({ searchQuery });
      },

      addToast: (title, message, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        set(() => ({
          toasts: [{ id, title, message, type }],
        }));

        setTimeout(() => {
          get().removeToast(id);
        }, 3200);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      getCartSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getGiftWrapTotal: () => {
        return get().cart.reduce((sum, item) => sum + (item.giftWrap ? 20 * item.quantity : 0), 0);
      },

      getPlatformFee: () => {
        return get().cart.length > 0 ? 25 : 0;
      },

      getGrandTotal: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getGiftWrapTotal() + get().getPlatformFee();
      },

      getCartItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'beadu-ecom-store-v1',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          return localStorage.getItem(name);
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          try {
            localStorage.setItem(name, value);
          } catch (e) {
            try {
              localStorage.clear();
              localStorage.setItem(name, value);
            } catch (err) {
              // Ignore storage quota limits gracefully
            }
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        cart: state.cart.map((item) => {
          const img = item.product.image;
          const cleanImg = img && img.length > 500 ? "/beads/pomelli_photoshoot_image_1_1_0726.png" : img;
          return {
            ...item,
            product: {
              ...item.product,
              image: cleanImg,
            },
          };
        }),
        wishlist: state.wishlist,
        addresses: state.addresses,
        orders: state.orders.map((order) => ({
          ...order,
          items: order.items.map((item) => {
            const img = item.product.image;
            const cleanImg = img && img.length > 500 ? "/beads/pomelli_photoshoot_image_1_1_0726.png" : img;
            return {
              ...item,
              product: {
                ...item.product,
                image: cleanImg,
              },
            };
          }),
        })),
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as unknown as { __ecomStore: typeof useEcomStore.getState }).__ecomStore = useEcomStore.getState;
}
