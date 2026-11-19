import Customer from "../../live-queue/Customer";
export const metadata = { title: "Your queue ticket · QueueLess SA" };
export default async function Page({
  params,
}: {
  params: Promise<{ business: string }>;
}) {
  const { business } = await params;
  return <Customer key={business} slug={business} />;
}
