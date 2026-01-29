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
        const found = this.items.find(i => i.productId === item.productId);
        if (found) {
            found.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
    }

    removeItem(productId: string) {
        this.items = this.items.filter(i => i.productId !== productId);
    }

    clear() {
        this.items = [];
    }

    get totalQuantity() {
        return this.items.reduce((s, i) => s + i.quantity, 0);
    }

    get totalPrice() {
        return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
    }
}

export const cartStore = new CartStore();
