import { PageContainer, SettingsPageHeader } from "@/components/shared";
import { BrandThemeModule } from "@/components/brand/BrandThemeModule";

export default function BrandTheme() {
  return (
    <PageContainer className="max-w-5xl mx-auto space-y-8">
      <SettingsPageHeader
        title="Brand Theme"
        description="Customize your brand's visual identity and export your style guide"
      />
      <BrandThemeModule />
    </PageContainer>
  );
}
