import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TOP_FAQS } from "@/lib/constants/faqs";

export function FAQ() {
  return (
    <div className="m-auto md:mx-14 flex flex-col justify-center px-12 md:px-14 align-middle">
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
