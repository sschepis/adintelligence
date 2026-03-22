/**
 * @deprecated Use NoticeState instead. This component is a compatibility wrapper.
 * Example migration: <WarningState variant="warning" /> → <NoticeState type="warning" />
 */
import { NoticeState } from "./NoticeState";

type WarningVariant = "warning" | "info" | "tip" | "error";

interface WarningStateProps {
  title?: string;
  message?: string;
  description?: string;
  className?: string;
  variant?: WarningVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * @deprecated Use NoticeState instead
 */
export function WarningState({
  variant = "warning",
  ...props
}: WarningStateProps) {
  return <NoticeState type={variant} {...props} />;
}
