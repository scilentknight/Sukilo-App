import {
  BookOpen,
  Headphones,
  House,
  Laptop,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Watch,
} from "lucide-react";

export const CATEGORY_ICONS = {
  Electronics: Laptop,
  "Fashion & Apparel": ShoppingBag,
  "Home & Kitchen": House,
  "Sports & Outdoors": Watch,
  "Beauty & Wellness": Sparkles,
  "Books & Media": BookOpen,
};

export const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Reliable delivery across Nepal",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Safe and secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free return  s",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "We're here to help",
  },
];
