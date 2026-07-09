import z from "zod";

const registerUser = z.object({
  fullName: z.string({
    required_error: "Full name is required!",
  }),
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email({
      message: "Invalid email format!",
    }),
  fcmToken: z.string().optional(),
  password: z
    .string({
      required_error: "Password is required!",
    })
    .min(8, "Password should be minimum 8 characters "),
});

const loginUser = z.object({
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email({
      message: "Invalid email format!",
    }),
  password: z.string({
    required_error: "Password is required!",
  }),
});

const forgotPassword = z.object({
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email({
      message: "Invalid email format!",
    }),
});
const verifyOtp = z.object({
  userId: z.string({
    required_error: "userId is required!",
  }),
  otpCode: z.number({
    required_error: "otpCode is required!",
  }),
  type: z.nativeEnum({
    EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
    PASSWORD_RESET: "PASSWORD_RESET",
  }),
});

const resetPassword = z.object({
  newPassword: z
    .string({
      required_error: "Password is required!",
    })
    .min(8, "password should be minimum 8 characters "),
});


const resendOtp = z.object({
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email({
      message: "Invalid email format!",
    }),
});

const socialLogin = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
    fullName: z.string().optional(),
    fcmToken: z.string().optional(),
  }),
});

export const authValidation = {
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  registerUser,
  resendOtp,
  socialLogin,
};
