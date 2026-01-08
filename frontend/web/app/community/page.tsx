import Link from "next/link";

export default function CommunityPage() {
  return (
    <main>
      <h1>Community</h1>
      <p>Scaffolded feed page.</p>
      <p>
        <Link href="/community/create">Create post</Link>
      </p>
    </main>
  );
}
