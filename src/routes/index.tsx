import { createFileRoute } from "@tanstack/react-router";
import { SmsInsightApp } from "@/components/sms/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SMS Insight — Bank & telecom SMS at a glance" },
      { name: "description", content: "Turn CBE, Telebirr and Ethio Telecom SMS into clear summaries of money and packages." },
      { property: "og:title", content: "SMS Insight — Bank & telecom SMS at a glance" },
      { property: "og:description", content: "Turn CBE, Telebirr and Ethio Telecom SMS into clear summaries of money and packages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-0 sm:p-8">
      <div className="h-screen w-full overflow-hidden bg-background sm:h-[860px] sm:w-[400px] sm:rounded-[44px] sm:border-[10px] sm:border-ink sm:shadow-phone">
        <SmsInsightApp />
      </div>
    </main>
  );
}
