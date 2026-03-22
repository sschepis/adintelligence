// Shared components barrel export

// Layout
export { PageContainer } from "./PageContainer";
export { PageHeader } from "./PageHeader";
export { WCAGAlertBanner } from "./WCAGAlertBanner";

// Navigation & Search
export { SearchFilterBar } from "./SearchFilterBar";
export { BackButton } from "./BackButton";
export { TabNavigation, type Tab } from "./TabNavigation";

// Data Display
export { MetricCard } from "./MetricCard";
export { CampaignList } from "./CampaignList";
export { ApiStatusIndicator } from "./ApiStatusIndicator";

// Charts & Visualization
export { VolumeChart } from "./VolumeChart";
export { PerformanceChart } from "./PerformanceChart";

// Theme & Brand Preview
export { ThemePreview } from "./ThemePreview";
export { BrandColorPreview, ColorSwatchRow, type BrandColors } from "./BrandColorPreview";

// Skeletons (re-exported from ui)
export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonMetric, 
  SkeletonTable, 
  SkeletonChart 
} from "@/components/ui/skeleton";

// Forms
export { FormSection, FormRow } from "./FormSection";
export { ColorPickerField, isValidHexColor } from "./ColorPickerField";
export { FileUploadField } from "./FileUploadField";

// Settings
export { SettingsSection } from "./SettingsSection";
export { SettingsPageHeader } from "./SettingsPageHeader";
export { SettingsToggle } from "./SettingsToggle";

// Dialogs
export { DialogConfirm } from "./DialogConfirm";

// Widgets & Assistants
export { GlassBoxAssistant } from "./GlassBoxAssistant";
export { NotificationCenter } from "@/components/layout/NotificationCenter";

// Empty, Loading & Error States
export { EmptyState } from "@/components/ui/empty-state";
export { LoadingState, LoadingSpinner, LoadingCards, LoadingSkeleton } from "./LoadingState";
export { ErrorState } from "./ErrorState";
/** @deprecated Use NoticeState instead */
export { WarningState } from "./WarningState";
/** @deprecated Use NoticeState instead */
export { SuccessState } from "./SuccessState";
export { NoticeState } from "./NoticeState";

// Data Tables
export { DataTable, type DataTableColumn } from "./DataTable";
