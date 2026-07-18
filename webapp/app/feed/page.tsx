import FeedView from "@/components/FeedView";
import { fetchDecisions } from "@/lib/api";

export default async function FeedPage() {
  const decisions = await fetchDecisions();
  return <FeedView decisions={decisions} />;
}
