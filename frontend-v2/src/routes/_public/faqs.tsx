import { createFileRoute } from '@tanstack/react-router'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { TOP_FAQS } from "~/lib/constants/faqs";

export const Route = createFileRoute('/_public/faqs')({
  component: RouteComponent,
})

// export const metadata = {
//   title: "FAQ | Wakana",
//   description:
//     "Frequently asked questions about Wakana - your open source, self-hosted developer time tracking solution.",
// };

export default function RouteComponent() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-primary">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

      <div className="space-y-4">
        <p className="mb-8 leading-relaxed">
          Find answers to common questions about Wakana, setup, and
          troubleshooting.
        </p>

        <Accordion type="single" collapsible className="space-y-2">
          {TOP_FAQS.map((faq) => (
            <AccordionItem
              value={faq.question}
              key={faq.question}
              className="border border-gray-800 rounded-lg px-4"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
