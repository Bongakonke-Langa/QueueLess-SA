import Desk from "../../live-queue/Desk";
export const metadata = { title: "Merchant desk · QueueLess SA" };
export default async function Page({
  params,
}: {
  params: Promise<{ business: string }>;
}) {
  const { business } = await params;
  return <Desk key={business} slug={business} />;
}
