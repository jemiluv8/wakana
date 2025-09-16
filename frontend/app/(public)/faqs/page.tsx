import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TOP_FAQS } from "@/lib/constants/faqs";

export const metadata = {
  title: "FAQ | Wakana",
  description: "Frequently asked questions about Wakana - your open source, self-hosted developer time tracking solution.",
};

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Find answers to common questions about Wakana, setup, and troubleshooting.
        </p>
        
        <Accordion type="single" collapsible className="space-y-2">
          {TOP_FAQS.map((faq) => (
            <AccordionItem 
              value={faq.question} 
              key={faq.question}
              className="border border-gray-200 dark:border-gray-800 rounded-lg px-4"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}