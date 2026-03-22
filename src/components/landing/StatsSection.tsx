import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatItemProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: LucideIcon;
  duration?: number;
  delay?: number;
}

function AnimatedStat({ value, suffix = "", prefix = "", label, icon: Icon, duration = 2, delay = 0 }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const timer = setTimeout(() => {
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * value));

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setCount(value);
        }
      };
      animate();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, value, duration, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      {Icon && (
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <div className="text-4xl md:text-5xl font-display font-bold text-foreground">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

interface StatsGridProps {
  stats: StatItemProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className = "" }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-8 md:gap-12 ${className}`}>
      {stats.map((stat, i) => (
        <AnimatedStat key={stat.label} {...stat} delay={i * 0.1} />
      ))}
    </div>
  );
}

export function StatsBar({ stats, className = "" }: { stats: StatItemProps[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-16 ${className}`}>
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex items-center gap-8">
          <AnimatedStat {...stat} delay={i * 0.15} />
          {i < stats.length - 1 && (
            <div className="hidden md:block w-px h-12 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}
