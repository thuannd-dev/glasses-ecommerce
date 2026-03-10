import axios from "axios";
import { store } from "../stores/store";
import { toast } from "react-toastify";
import { router } from "../../app/router/Routes";

const agent = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
});

agent.interceptors.request.use((config) => {
  store.uiStore.isBusy();
  return config;
});

agent.interceptors.response.use(
  async (response) => {
    store.uiStore.isIdle();
    return response;
  },
  async (error) => {
    store.uiStore.isIdle();

    if (!error.response) {
      toast.error("Cannot connect to server. Please check if the backend is running.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          const flattedErrors = modelStateErrors.flat();
          // Create an Error object with the validation messages
          const errorMessage = Array.isArray(flattedErrors)
            ? flattedErrors.join("; ")
            : String(flattedErrors);
          throw new Error(errorMessage);
        } else if (typeof data === "string") {
          throw new Error(data);
        } else if (data?.error) {
          throw new Error(data.error);
        } else if (data?.message) {
          throw new Error(data.message);
        } else {
          throw new Error("Validation failed. Please check your input.");
        }
        break;
      case 401: {
        const url: string | undefined = error.config?.url;
        const isLoginRequest = url?.includes("/login");
        const isCartRequest = url?.includes("/carts");

        if (isLoginRequest) {
          toast.error("Wrong password or invalid email");
        } else if (isCartRequest) {
          toast.error("Please log in before adding items to your cart.");
        } else {
          toast.error("You are not authorized. Please sign in again.");
        }
        break;
      }
      case 404:
        // Không redirect toàn cục — để từng trang/component xử lý (vd: OrderCard "Could not load", OrderDetailPage "Order not found")
        break;
      case 409:
        // Conflict errors (duplicate tickets, etc.)
        if (typeof data === "string") {
          throw new Error(data);
        } else if (data.error) {
          throw new Error(data.error);
        } else if (data.message) {
          throw new Error(data.message);
        }
        break;
      case 500:
        router.navigate("/server-error", { state: { error: data } });
        //state exist in memory of navigation so it just have value in the same session SPA
        //=> When user refresh the page or access directly, React Router not passing state and set location.state = null
        break;
      case 503:
        // Service unavailable (e.g., policy service down)
        if (typeof data === "string") {
          throw new Error(data);
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error("Service temporarily unavailable. Please try again later.");
        }
        break;
      default:
        // For any other error status, try to extract error message
        if (typeof data === "string") {
          throw new Error(data);
        } else if (data?.error) {
          throw new Error(data.error);
        } else if (data?.message) {
          throw new Error(data.message);
        }
        break;
    }

    return Promise.reject(error);
  },
);

export default agent;
