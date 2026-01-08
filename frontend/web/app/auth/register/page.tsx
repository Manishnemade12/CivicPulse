import Link from "next/link";

export default function RegisterPage() {
  return (
    <main>
      <h1>Register</h1>
      <p>This page is scaffolded (auth will be wired later).</p>
      <p>
        Already have an account? <Link href="/auth/login">Login</Link>
      </p>
    </main>
  );
}
