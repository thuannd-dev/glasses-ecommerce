import type { Product } from "../types";

export const MOCK_PRODUCTS: Product[] = [
    // ================= GLASSES =================
    {
        id: "g1",
        category: "glasses",
        brand: "OWNDAYS | SUN",
        code: "SNIP027N-5A C1",
        name: "Daily Frame – Black",
        price: 590000,
        tag: "Best seller",
        image:
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80",
        glassesType: "eyeglasses",
        shape: "round",
        material: "acetate",
        gender: "unisex",
        frameSize: "M",
        colors: ["#111827", "#8B5E34", "#D1D5DB"],
    },
    {
        id: "g2",
        category: "glasses",
        brand: "OWNDAYS | SUN",
        code: "SNIP0824B-5S C1",
        name: "Minimal Round – Silver",
        price: 690000,
        tag: "New",
        image:
            "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80",
        glassesType: "eyeglasses",
        shape: "round",
        material: "metal",
        gender: "unisex",
        frameSize: "M",
        colors: ["#111827", "#9CA3AF", "#D4AF37"],
    },
    {
        id: "g3",
        category: "glasses",
        brand: "OWNDAYS | SUN",
        code: "SNIP0823B-5S C2",
        name: "Street Bold – Tortoise",
        price: 820000,
        image:
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80",
        glassesType: "eyeglasses",
        shape: "rectangle",
        material: "acetate",
        gender: "unisex",
        frameSize: "L",
        colors: ["#111827", "#7C4A2D", "#C4B5A5"],
    },
    {
        id: "g4",
        category: "glasses",
        brand: "OWNDAYS | SUN",
        code: "SUN8023B-5S C1",
        name: "Classic Square – Matte Black",
        price: 750000,
        image:
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80",
        glassesType: "sunglasses",
        shape: "square",
        material: "tr90",
        gender: "men",
        frameSize: "L",
        colors: ["#111827", "#6B7280", "#F5F5F4"],
    },
    {
        id: "g5",
        category: "glasses",
        brand: "OWNDAYS | SUN",
        code: "SUN8024B-5S C1",
        name: "Slim Metal – Gold",
        price: 880000,
        tag: "Trending",
        image:
            "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1600&q=80",
        glassesType: "sunglasses",
        shape: "aviator",
        material: "metal",
        gender: "unisex",
        frameSize: "M",
        colors: ["#111827", "#D4AF37", "#E5E7EB"],
    },

    // ================= LENS =================
    {
        id: "l1",
        category: "lens",
        brand: "LENS LAB",
        code: "BLU-01",
        name: "BlueCut Lens Pro",
        price: 450000,
        tag: "Blue light",
        image:
            "https://images.unsplash.com/photo-1581591524425-c7e0978865d8?auto=format&fit=crop&w=1600&q=80",
        colors: ["#111827", "#60A5FA", "#E5E7EB"],
    },
    {
        id: "l2",
        category: "lens",
        brand: "LENS LAB",
        code: "UV-400",
        name: "UV400 Outdoor Lens",
        price: 520000,
        image:
            "https://images.unsplash.com/photo-1556306535-38febf6782e7?auto=format&fit=crop&w=1600&q=80",
        colors: ["#111827", "#22C55E", "#E5E7EB"],
    },

    // ================= FASHION =================
    {
        id: "f1",
        category: "fashion",
        brand: "LOOKBOOK",
        code: "URB-24",
        name: "Monochrome Street Style",
        price: 920000,
        tag: "Editor pick",
        image:
            "https://images.unsplash.com/photo-1520975958225-0f39b1c2f48b?auto=format&fit=crop&w=1600&q=80",
        colors: ["#111827", "#9CA3AF", "#F9FAFB"],
    },
    {
        id: "f2",
        category: "fashion",
        brand: "LOOKBOOK",
        code: "OFF-10",
        name: "Minimal Office Outfit",
        price: 850000,
        image:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
        colors: ["#111827", "#6B7280", "#F5F5F4"],
    },
];
