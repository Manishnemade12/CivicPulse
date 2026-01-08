export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h1>Complaint Detail</h1>
      <p>Complaint ID: {id}</p>
    </main>
  );
}
