import { makeAutoObservable } from "mobx";

export interface CartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

class CartStore {
    items: CartItem[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    addItem(item: Omit<CartItem, "quantity">) {
        const items = Array.isArray(this.items) ? this.items : [];
        const found = items.find((i) => i.productId === item.productId);
        if (found) {
            found.quantity += 1;
        } else {
            this.items = [...items, { ...item, quantity: 1 }];
        }
    }

    removeItem(productId: string) {
        const items = Array.isArray(this.items) ? this.items : [];
        this.items = items.filter((i) => i.productId !== productId);
    }

    clear() {
        this.items = [];
    }

    get totalQuantity() {
        const items = Array.isArray(this.items) ? this.items : [];
        return items.reduce((s, i) => s + i.quantity, 0);
    }

    get totalPrice() {
        const items = Array.isArray(this.items) ? this.items : [];
        return items.reduce((s, i) => s + i.price * i.quantity, 0);
    }
}

export const cartStore = new CartStore();
