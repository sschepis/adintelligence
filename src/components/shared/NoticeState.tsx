import { AlertTriangle, Info, AlertCircle, Lightbulb, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type NoticeType = "success" | "warning" | "caution" | "info" | "error" | "tip";

interface NoticeStateProps {
  type?: NoticeType;
  title?: string;
  message?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** Control visibility for AnimatePresence */
  visible?: boolean;
  /** Disable animations */
  noAnimation?: boolean;
}

const noticeConfig = {
  success: {
    container: "bg-green-500/10 border-green-500/20",
    icon: "text-green-500",
    title: "text-green-700 dark:text-green-400",
    message: "text-green-600 dark:text-green-300",
    IconComponent: CheckCircle,
  },
  warning: {
    container: "bg-amber-500/10 border-amber-500/20",
    icon: "text-amber-500",
    title: "text-amber-700 dark:text-amber-400",
    message: "text-amber-600 dark:text-amber-300",
    IconComponent: AlertTriangle,
  },
  caution: {
    container: "bg-orange-500/10 border-orange-500/20",
    icon: "text-orange-500",
    title: "text-orange-700 dark:text-orange-400",
    message: "text-orange-600 dark:text-orange-300",
    IconComponent: AlertTriangle,
  },
  info: {
    container: "bg-blue-500/10 border-blue-500/20",
    icon: "text-blue-500",
    title: "text-blue-700 dark:text-blue-400",
    message: "text-blue-600 dark:text-blue-300",
    IconComponent: Info,
  },
  error: {
    container: "bg-destructive/10 border-destructive/20",
    icon: "text-destructive",
    title: "text-destructive",
    message: "text-destructive/80",
    IconComponent: AlertCircle,
  },
  tip: {
    container: "bg-blue-500/10 border-blue-500/20",
    icon: "text-blue-500",
    title: "text-blue-700 dark:text-blue-400",
    message: "text-blue-600 dark:text-blue-300",
    IconComponent: Lightbulb,
  },
};

const noticeVariants = {
  initial: { 
    opacity: 0, 
    y: -8,
    scale: 0.98
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const
    }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: "easeIn" as const
    }
  }
};

export function NoticeState({
  type = "info",
  title,
  message,
  description,
  className,
  icon,
  action,
  visible = true,
  noAnimation = false,
}: NoticeStateProps) {
  const config = noticeConfig[type];
  const IconComponent = config.IconComponent;
  const displayMessage = message || description;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        config.container,
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icon || <IconComponent className={cn("h-5 w-5", config.icon)} />}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-medium", config.title)}>{title}</p>
        )}
        {displayMessage && (
          <p className={cn("text-sm", !title && "font-medium", title && "mt-0.5", config.message)}>
            {displayMessage}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );

  if (noAnimation) {
    return visible ? content : null;
  }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          variants={noticeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
