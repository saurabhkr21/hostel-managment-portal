import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  } else if (session.user.role === "STAFF") {
    redirect("/staff");
  } else if (session.user.role === "STUDENT") {
    redirect("/student");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Redirecting...</h1>
    </div>
  );
}
