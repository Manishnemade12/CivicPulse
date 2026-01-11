import { redirect } from "next/navigation";

export default function ComplaintDetailRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/complaints/my/${params.id}`);
}
