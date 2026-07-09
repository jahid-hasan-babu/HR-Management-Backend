import z from "zod";

const changePassword = z.object({
  currentPassword: z.string({
    required_error: "Current password is required!",
  }),
  newPassword: z
    .string({
      required_error: "New password is required!",
    })
    .min(8, "New password should be minimum 8 characters"),
});
export const UserValidations = {
  changePassword,
};
