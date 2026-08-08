import { createFileRoute } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { TOP_FAQS } from "~/lib/constants/faqs";

export const Route = createFileRoute("/_dashboard/dashboard/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div>
      <h1 className="mb-8 text-center text-6xl">FAQs</h1>
      <Accordion type="single" collapsible>
        {TOP_FAQS.map((faq) => (
          <AccordionItem value={faq.question} key={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
