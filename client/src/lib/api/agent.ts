import axios from "axios";
import { showSessionExpiredToast } from "../auth/sessionExpiredToast";
import { queryClient } from "../queryClient";
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
          throw modelStateErrors.flat();
        } else if (data.message) {
          // Handle Result<T>.Failure with message (e.g., policy violations)
          throw new Error(data.message);
        } else if (typeof data === 'string') {
          // Handle direct string error responses
          throw new Error(data);
        } else {
          toast.error(data);
        }
        break;
      case 401: {
        const url: string | undefined = error.config?.url;
        const isLoginRequest = url?.includes("/login");
        const isCartRequest = url?.includes("/carts");
        const isUserInfoRequest = url?.includes("/account/user-info");

        if (isLoginRequest) {
          toast.error("Wrong password or invalid email");
          break;
        }

        const hadAuthenticatedUser = Boolean(
          queryClient.getQueryData<{ id?: string }>(["user"])?.id
        );

        if (hadAuthenticatedUser) {
          queryClient.removeQueries({ queryKey: ["user"] });
          queryClient.removeQueries({ queryKey: ["cart"] });
          showSessionExpiredToast();
        } else if (isCartRequest) {
          toast.error("Please log in before adding items to your cart.");
        } else if (!isUserInfoRequest) {
          toast.error("You are not authorized. Please sign in again.");
        }
        break;
      }
      case 404:
        // Không redirect toàn cục — để từng trang/component xử lý (vd: OrderCard "Could not load", OrderDetailPage "Order not found")
        break;
      case 409:
        // Conflict — duplicate request, validation error, etc.
        if (data.message) {
          throw new Error(data.message);
        } else if (typeof data === 'string') {
          // Handle direct string error responses (e.g., from Conflict(errorString))
          throw new Error(data);
        }
        break;
      case 500:
        router.navigate("/server-error", { state: { error: data } });
        //state exist in memory of navigation so it just have value in the same session SPA
        //=> When user refresh the page or access directly, React Router not passing state and set location.state = null
        break;
      default:
        break;
    }

    return Promise.reject(error);
  },
);

export default agent;
