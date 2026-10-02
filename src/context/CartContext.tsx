"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/lib/data/types";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { useToast } from "@/components/ui/Toast";
import { calculateDeliveryFee, CHENNAI_BRANCHES } from "@/lib/config/branches";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  fulfilmentType: "delivery" | "pickup";
  setFulfilmentType: (type: "delivery" | "pickup") => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  deliveryDistanceKm: number;
  setDeliveryDistanceKm: (km: number) => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfilmentType, setFulfilmentType] = useState<"delivery" | "pickup">("delivery");
  // Single kitchen, so there is only ever one branch to select.
    const [selectedBranchId, setSelectedBranchId] = useState<string>(
      CHENNAI_BRANCHES[0]?.id ?? "nungambakkam"
    );
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(3);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kichees_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedBranch = localStorage.getItem("kichees_branch");
      if (savedBranch) {
        setSelectedBranchId(savedBranch);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Hydrate cart from pre-filled AI voice session URL parameter (?cart=cs_xxx)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("cart") || params.get("cartSession") || params.get("session");

      if (sessionId && sessionId.startsWith("cs_")) {
        fetch(`/api/cart/session?id=${encodeURIComponent(sessionId)}`)
          .then((res) => {
            if (!res.ok) throw new Error("Session fetch failed");
            return res.json();
          })
          .then((data) => {
            if (data.success && data.session && Array.isArray(data.session.items) && data.session.items.length > 0) {
              setItems(data.session.items);
              try {
                localStorage.setItem("kichees_cart", JSON.stringify(data.session.items));
                if (data.session.customerPhone) {
                  localStorage.setItem("kichees_customer_phone", data.session.customerPhone);
                }
                if (data.session.customerName) {
                  localStorage.setItem("kichees_customer_name", data.session.customerName);
                }
                if (data.session.customerNotes) {
                  localStorage.setItem("kichees_customer_notes", data.session.customerNotes);
                }
              } catch {}

              setIsCartOpen(true);
              toast("Basket Loaded!", {
                description: `Loaded ${data.session.items.length} ${data.session.items.length === 1 ? "item" : "items"} from your voice order request.`,
                type: "success",
              });

              // Clean up query param from URL bar
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete("cart");
              cleanUrl.searchParams.delete("cartSession");
              cleanUrl.searchParams.delete("session");
              window.history.replaceState({}, "", cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : "") + cleanUrl.hash);
            }
          })
          .catch((err) => {
            console.warn("Could not hydrate cart session:", err);
          });
      }
    } catch (e) {
      console.warn("Cart URL hydration check error:", e);
    }
  }, [toast]);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kichees_cart", JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  const handleSetBranch = (id: string) => {
    setSelectedBranchId(id);
    try {
      localStorage.setItem("kichees_branch", id);
    } catch {}
  };

  const addItem = (newItem: Omit<CartItem, "cartItemId">) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.variantId === newItem.variantId &&
          i.customMessage === newItem.customMessage
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      } else {
        const cartItemId = `${newItem.productId}-${newItem.variantId}-${Date.now()}`;
        return [...prev, { ...newItem, cartItemId }];
      }
    });

    trackEvent({
      name: "add_to_cart",
      productId: newItem.productId,
      variantId: newItem.variantId,
      productName: newItem.name,
      price: newItem.price,
      quantity: newItem.quantity,
    });

    toast("Added to your basket", {
      description: `${newItem.name} (${newItem.variantLabel})`,
      type: "success",
    });

    setIsCartOpen(true);
  };

  const removeItem = (cartItemId: string) => {
    const item = items.find((i) => i.cartItemId === cartItemId);
    if (item) {
      trackEvent({
        name: "remove_from_cart",
        cartItemId,
        itemName: item.name,
      });
      toast("Removed from basket", {
        description: item.name,
        type: "info",
      });
    }
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const handleSetFulfilment = (type: "delivery" | "pickup") => {
    setFulfilmentType(type);
    trackEvent({ name: "select_delivery_method", method: type });
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Dynamic delivery fee calculation:
  // Pickup: ₹0
  // Delivery: Base ₹60 (up to 3km) + ₹15/km beyond 3km. Free over ₹1,500
  const deliveryCalculation = calculateDeliveryFee(deliveryDistanceKm, subtotal);
  const deliveryFee = fulfilmentType === "pickup" ? 0 : deliveryCalculation.fee;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        fulfilmentType,
        setFulfilmentType: handleSetFulfilment,
        selectedBranchId,
        setSelectedBranchId: handleSetBranch,
        deliveryDistanceKm,
        setDeliveryDistanceKm,
        deliveryAddress,
        setDeliveryAddress,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
