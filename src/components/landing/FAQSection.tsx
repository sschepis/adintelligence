import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Instincts AI detect trends?",
    answer: "Our AI analyzes millions of social signals across TikTok, Instagram, Pinterest, and more in real-time. We use visual pattern recognition and natural language processing to identify emerging trends before they peak, giving you a competitive edge."
  },
  {
    question: "Can I integrate with my existing e-commerce platform?",
    answer: "Yes! We offer seamless integration with Shopify and other major e-commerce platforms. Your product catalog syncs automatically, enabling instant trend-to-inventory matching and one-click campaign deployment."
  },
  {
    question: "How accurate are the AI-generated creative assets?",
    answer: "Our synthetic focus groups validate creative assets before deployment, achieving 85%+ accuracy in predicting real-world performance. You can also A/B test any asset against live audiences for additional confidence."
  },
  {
    question: "What's the typical time from trend detection to campaign launch?",
    answer: "With our automated workflow, you can go from trend detection to live campaign in under 2 hours. Our one-click deployment wizard handles creative generation, audience targeting, and budget allocation automatically."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! We offer a free trial so you can experience the full power of Instincts AI. No credit card required to get started. Simply enter your brand URL and we'll set everything up automatically."
  },
  {
    question: "How does the inventory matching work?",
    answer: "Our AI analyzes visual patterns, colors, and keywords from trending content, then matches them against your product catalog using computer vision. Products are scored based on trend alignment, enabling intelligent bundling and gap analysis."
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background to-secondary/20 scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Instincts AI and how it can transform your commerce workflow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl px-6 data-[state=open]:shadow-lg transition-shadow duration-300"
              >
                <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
