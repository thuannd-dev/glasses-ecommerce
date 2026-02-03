import axios from "axios";
import { store } from "../stores/store";
import { toast } from "react-toastify";
import { router } from "../../app/router/Routes";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

const agent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

agent.interceptors.request.use((config) => {
  store.uiStore.isBusy();
  return config;
});

agent.interceptors.response.use(
  async (response) => {
    if (import.meta.env.DEV) await sleep(1000);
    store.uiStore.isIdle();
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) await sleep(1000);
    store.uiStore.isIdle();
    console.log(error.response);

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
        } else {
          toast.error(data);
        }
        break;
      case 401:
        toast.error("Unauthorised");
        break;
      case 404:
        router.navigate("/not-found");
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
