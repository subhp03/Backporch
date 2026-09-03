import type { Metadata } from "next";
import { AuthBox } from "../AuthBox";

export const metadata: Metadata = {
  title: "Sign in · Backporch",
};

export default function SignInPage() {
  return <AuthBox view="sign_in" />;
}
