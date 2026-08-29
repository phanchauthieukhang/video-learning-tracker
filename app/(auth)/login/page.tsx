import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnimatedLoginView } from "@/components/auth/animated-login-view";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <AnimatedLoginView />;
}
