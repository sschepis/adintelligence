import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/40 group-[.toaster]:shadow-xl group-[.toaster]:shadow-primary/5 group-[.toaster]:rounded-2xl",
          title: "group-[.toast]:font-semibold group-[.toast]:text-foreground",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: 
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:font-medium group-[.toast]:shadow-sm group-[.toast]:shadow-primary/20 group-[.toast]:hover:bg-primary/90",
          cancelButton: 
            "group-[.toast]:bg-muted/60 group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:hover:bg-muted",
          success:
            "group-[.toaster]:bg-emerald-50/95 group-[.toaster]:border-emerald-200/60 group-[.toaster]:text-emerald-900 dark:group-[.toaster]:bg-emerald-950/95 dark:group-[.toaster]:border-emerald-800/60 dark:group-[.toaster]:text-emerald-100",
          error:
            "group-[.toaster]:bg-rose-50/95 group-[.toaster]:border-rose-200/60 group-[.toaster]:text-rose-900 dark:group-[.toaster]:bg-rose-950/95 dark:group-[.toaster]:border-rose-800/60 dark:group-[.toaster]:text-rose-100",
          warning:
            "group-[.toaster]:bg-amber-50/95 group-[.toaster]:border-amber-200/60 group-[.toaster]:text-amber-900 dark:group-[.toaster]:bg-amber-950/95 dark:group-[.toaster]:border-amber-800/60 dark:group-[.toaster]:text-amber-100",
          info:
            "group-[.toaster]:bg-sky-50/95 group-[.toaster]:border-sky-200/60 group-[.toaster]:text-sky-900 dark:group-[.toaster]:bg-sky-950/95 dark:group-[.toaster]:border-sky-800/60 dark:group-[.toaster]:text-sky-100",
          closeButton:
            "group-[.toast]:bg-background/80 group-[.toast]:border-border/40 group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted group-[.toast]:hover:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
