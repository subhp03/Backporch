import type { Metadata } from "next";
import { AuthBox } from "../AuthBox";

export const metadata: Metadata = {
  title: "Sign up · Backporch",
};

export default function SignUpPage() {
  return <AuthBox view="sign_up" />;
}
