import Link from "next/link";

export default function ComplaintsPage() {
  return (
    <main>
      <h1>Complaints</h1>
      <p>Scaffolded list page.</p>
      <p>
        <Link href="/complaints/new">Raise a complaint</Link>
      </p>
    </main>
  );
}
