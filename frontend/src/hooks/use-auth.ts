import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLogin = () => {
  const { login } = useAuthStore();
  return useMutation(
    (data: { email: string; password: string }) =>
      Promise.resolve(login(data.email, data.password)),
    {
      onSuccess: () => {
        // Save user object in zustand
        toast("Logged in successfully!");
      },
      onError: (error) => {
        console.log(error);
        toast("Opps! Error", {
          description: "There was error loggin in!",
        });
      },
    }
  );
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  return useMutation(() => Promise.resolve(logout()), {
    onSuccess: () => {
      toast("Logged out successfully!");
    },
    onError: (error) => {
      console.log(error);
      toast("Opps! Error", {
        description: "There was error logging out!",
      });
    },
  });
};
