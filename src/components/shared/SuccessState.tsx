/**
 * @deprecated Use NoticeState instead. This component is a compatibility wrapper.
 * Example migration: <SuccessState variant="inline" /> → <NoticeState type="success" />
 */
import { NoticeState } from "./NoticeState";

interface SuccessStateProps {
  title?: string;
  message?: string;
  description?: string;
  className?: string;
  variant?: "default" | "inline" | "card" | "centered";
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * @deprecated Use NoticeState instead
 */
export function SuccessState({
  variant = "inline",
  ...props
}: SuccessStateProps) {
  // All variants map to the same NoticeState success type
  return <NoticeState type="success" {...props} />;
}
