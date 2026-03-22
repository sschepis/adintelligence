import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Instincts AI cut our trend-to-campaign time from 2 weeks to 2 hours. The ROI has been incredible.",
    author: "Sarah Chen",
    role: "Head of Marketing",
    company: "Luxe Beauty Co.",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "The synthetic focus groups saved us from launching a campaign that would have flopped. Worth every penny.",
    author: "Marcus Thompson",
    role: "E-commerce Director",
    company: "Urban Threads",
    avatar: "MT",
    rating: 5,
  },
  {
    quote: "Finally, a platform that actually understands visual trends. Our Instagram engagement is up 340%.",
    author: "Emily Rodriguez",
    role: "Brand Manager",
    company: "Glow Essentials",
    avatar: "ER",
    rating: 5,
  },
];

const brandLogos = [
  { name: "Luxe Beauty", initials: "LB" },
  { name: "Urban Threads", initials: "UT" },
  { name: "Glow Essentials", initials: "GE" },
  { name: "Modern Home", initials: "MH" },
  { name: "Fresh Foods", initials: "FF" },
  { name: "Style Studio", initials: "SS" },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-6">
        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-8">
            Trusted by leading brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brandLogos.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-sm font-semibold">
                  {brand.initials}
                </div>
                <span className="font-medium text-sm hidden sm:block">{brand.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Loved by Commerce Teams
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how leading brands are transforming their marketing with Instincts AI.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: "500+", label: "Brands Trust Us" },
            { value: "2M+", label: "Campaigns Launched" },
            { value: "340%", label: "Avg. ROI Increase" },
            { value: "4.9/5", label: "Customer Rating" },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-bold text-3xl md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
