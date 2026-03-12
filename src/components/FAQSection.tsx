import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on all unworn items with original tags attached. Simply contact our support team to initiate a return.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 5–7 business days. Express shipping (2–3 business days) is available at checkout for an additional fee.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship to over 50 countries worldwide. International shipping typically takes 7–14 business days depending on your location.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Check our Size Guide linked in the footer for detailed measurements. If you're between sizes, we recommend sizing up for a relaxed fit.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "Orders can be modified or cancelled within 2 hours of placement. After that, the order enters processing and cannot be changed.",
  },
];

export const FAQSection = () => {
  return (
    <section className="w-full px-6 md:px-10 py-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-10 text-center">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="font-display text-sm md:text-base uppercase tracking-wide text-foreground hover:no-underline hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
