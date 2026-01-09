import Link from "next/link";

export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <p>This page is scaffolded (auth will be wired later).</p>
      <p>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
