import { makeAutoObservable } from "mobx";

export class UiStore {
  // ===== GLOBAL LOADING =====
  isLoading = false;

  // ===== CART DROPDOWN =====
  isCartOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  // ===== LOADING HELPERS (GIỮ NGUYÊN LOGIC CŨ) =====
  isBusy() {
    this.isLoading = true;
  }

  isIdle() {
    this.isLoading = false;
  }

  // ===== CART DROPDOWN HELPERS =====
  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  openCart() {
    this.isCartOpen = true;
  }

  closeCart() {
    this.isCartOpen = false;
  }
}
