import type { Metadata } from "next";
import { AuthUi } from "../AuthUi";

export const metadata: Metadata = {
  title: "Sign in · Backporch",
};

export default function SignInPage() {
  return <AuthUi view="sign_in" />;
}
