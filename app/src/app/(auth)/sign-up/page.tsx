import type { Metadata } from "next";
import { AuthUi } from "../AuthUi";

export const metadata: Metadata = {
  title: "Sign up · Backporch",
};

export default function SignUpPage() {
  return <AuthUi view="sign_up" />;
}
