import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import * as authApi from "./auth.api";

/**
 * Mutation: Request password reset
 */
export const useRequestPasswordReset = () => {
  const navigate = useNavigate();

  return useMutation((email: string) => authApi.requestPasswordReset(email), {
    onSuccess: (data) => {
      toast.success("Password reset email sent!");
      navigate("/verify-otp", { state: { email: data.email } });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    },
  });
};

/**
 * Mutation: Verify OTP
 */
export const useVerifyOTP = () => {
  const navigate = useNavigate();

  return useMutation(
    (data: { email: string; otp: string }) => authApi.verifyOTP(data),
    {
      onSuccess: (_, variables) => {
        toast.success("OTP verified successfully!");
        navigate("/reset-password", {
          state: { email: variables.email, otp: variables.otp },
        });
      },
      onError: (error: any) => {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Invalid OTP. Please try again."
        );
      },
    }
  );
};

/**
 * Mutation: Reset password
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation(
    (data: {
      email: string;
      otp: string;
      password: string;
      confirmPassword: string;
    }) => authApi.resetPassword(data),
    {
      onSuccess: () => {
        toast.success("Password reset successfully!");
        navigate("/");
      },
      onError: (error: any) => {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      },
    }
  );
};
