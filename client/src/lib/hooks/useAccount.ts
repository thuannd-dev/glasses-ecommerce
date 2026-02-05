import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginSchema } from "../schemas/loginSchema";
import agent from "../api/agent";
import { useLocation, useNavigate } from "react-router";
import type { RegisterSchema } from "../schemas/registerSchema";
import { toast } from "react-toastify";

export const useAccount = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Xóa cache user khi vào trang login/register → tránh hiển thị avatar cũ khi chưa login
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      queryClient.removeQueries({ queryKey: ["user"] });
    }
  }, [location.pathname, queryClient]);

  const fetchUser = async () => {
    const response = await agent.get<User>("/account/user-info");
    return response.data;
  };

  const loginUser = useMutation({
    mutationFn: async (creds: LoginSchema) => {
      await agent.post("/login?useCookies=true", {
        email: creds.email,
        password: creds.password,
      });
    },
    onSuccess: () => {
      // Chỉ invalidate user để các component khác (NavBar, RequireRole, ...) tự fetch user-info.
      // Tránh gọi user-info ngay lập tức sau login vì cookie có thể chưa kịp được gửi kèm → 401/204.
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const registerUser = useMutation({
    mutationFn: async (creds: RegisterSchema) => {
      await agent.post("/account/register", creds);
    },
    onSuccess: async (_data, variables) => {
      toast.success("Đăng ký thành công! Đang đăng nhập…");
      try {
        await agent.post("/login?useCookies=true", {
          email: variables.email,
          password: variables.password,
        });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        navigate("/auth/redirect");
      } catch {
        toast.info("Đăng ký thành công. Vui lòng đăng nhập.");
        navigate("/login");
      }
    },
  });

  const logoutUser = useMutation({
    mutationFn: async () => {
      try {
        await agent.post("/account/logout");
      } catch {
        // Backend xóa cookie; client vẫn clear cache
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["activities"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      navigate("/");
    },
  });

  //if we don't set the query to enabled -> default value is true
  //  it will re run hook (re run useQuery) every time component re renders, every time useAccount is called
  //And this may be go to api and fetch user info again and again if state of query is stale
  // we don't want that because we just want to fetch user info once when app loads
  const { data: currentUser, isLoading: loadingUserInfo } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    //it mean that if we already have user data in cache we don't need to run this query again and the path is not /register
    // enabled:
    //   !queryClient.getQueryData(["user"]) && location.pathname !== "/register",
    //   && location.pathname !== "/login"
    //When user login, we need to fetch user info and store it in state,
    //  if disable location.pathname !== "/login" then the loginUser
    // will not work properly if we are using invalidateQueries (not fetch immediately),
    //  <RequireAuth> will redirect user to login page forever
    //  instead of letting user access /activities page

    // Luôn fetch khi đang ở /auth/redirect (sau login) để lấy user + roles mới nhất.
    // Nếu không, cache cũ có thể khiến enabled=false và không fetch → PostLoginRedirect không có roles.
    enabled:
      (location.pathname === "/auth/redirect" || !queryClient.getQueryData(["user"])) &&
      location.pathname !== "/register" &&
      location.pathname !== "/login",
  });

  return { loginUser, registerUser, currentUser, logoutUser, loadingUserInfo };
};
