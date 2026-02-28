import { makeAutoObservable } from "mobx";

export class UiStore {
  // ===== GLOBAL LOADING =====
  isLoading = false;

  // ===== CART DROPDOWN =====
  isCartOpen = false;

  // ===== USER MENU (avatar) — đóng khi mở cart, cart đóng khi mở avatar =====
  userMenuAnchor: HTMLElement | null = null;

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

  setUserMenuAnchor(el: HTMLElement | null) {
    this.userMenuAnchor = el;
  }

  closeUserMenu() {
    this.userMenuAnchor = null;
  }
}
