import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/contexts/BrandContext";
import { toast } from "sonner";

export interface PerformanceReport {
  id: string;
  title: string;
  generatedAt: Date;
  period: 'daily' | 'weekly' | 'monthly';
  summary: string;
  highlights: string[];
  metrics: {
    campaigns: { total: number; active: number; performance: string };
    trends: { tracked: number; matched: number; topTrend: string };
    inventory: { totalProducts: number; lowStock: number; trending: number };
    revenue?: { estimated: string; change: string };
  };
  recommendations: string[];
  rawContent: string;
}

export interface ReportSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  includeMetrics: boolean;
  includeRecommendations: boolean;
  emailDelivery: boolean;
}

const DEFAULT_SETTINGS: ReportSettings = {
  enabled: true,
  frequency: 'weekly',
  dayOfWeek: 1, // Monday
  includeMetrics: true,
  includeRecommendations: true,
  emailDelivery: false
};

export function useAutoReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [settings, setSettings] = useState<ReportSettings>(DEFAULT_SETTINGS);
  const [currentReport, setCurrentReport] = useState<PerformanceReport | null>(null);
  const { user } = useAuth();
  const { activeBrand } = useBrand();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoReportSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Load cached reports
  useEffect(() => {
    const savedReports = localStorage.getItem('performanceReports');
    if (savedReports) {
      const parsed = JSON.parse(savedReports);
      setReports(parsed.map((r: any) => ({
        ...r,
        generatedAt: new Date(r.generatedAt)
      })));
    }
  }, []);

  const updateSettings = (newSettings: Partial<ReportSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('autoReportSettings', JSON.stringify(updated));
    toast.success('Report settings updated');
  };

  const generateReport = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    if (!user) {
      toast.error('Please sign in to generate reports');
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-performance-report', {
        body: {
          period,
          brandId: activeBrand?.id,
          brandName: activeBrand?.name,
          includeMetrics: settings.includeMetrics,
          includeRecommendations: settings.includeRecommendations
        }
      });

      if (error) throw error;

      const report: PerformanceReport = {
        id: crypto.randomUUID(),
        title: data.title,
        generatedAt: new Date(),
        period,
        summary: data.summary,
        highlights: data.highlights,
        metrics: data.metrics,
        recommendations: data.recommendations,
        rawContent: data.rawContent
      };

      const updatedReports = [report, ...reports].slice(0, 20); // Keep last 20 reports
      setReports(updatedReports);
      setCurrentReport(report);
      localStorage.setItem('performanceReports', JSON.stringify(updatedReports));

      toast.success('Performance report generated!');
      return report;
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteReport = (reportId: string) => {
    const updated = reports.filter(r => r.id !== reportId);
    setReports(updated);
    localStorage.setItem('performanceReports', JSON.stringify(updated));
    if (currentReport?.id === reportId) {
      setCurrentReport(null);
    }
    toast.success('Report deleted');
  };

  const exportReport = (report: PerformanceReport, format: 'text' | 'json' = 'text') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      filename = `report-${report.period}-${report.generatedAt.toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      content = `# ${report.title}\n\nGenerated: ${report.generatedAt.toLocaleString()}\n\n## Summary\n${report.summary}\n\n## Highlights\n${report.highlights.map(h => `- ${h}`).join('\n')}\n\n## Recommendations\n${report.recommendations.map(r => `- ${r}`).join('\n')}`;
      filename = `report-${report.period}-${report.generatedAt.toISOString().split('T')[0]}.md`;
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return {
    isGenerating,
    reports,
    currentReport,
    settings,
    setCurrentReport,
    updateSettings,
    generateReport,
    deleteReport,
    exportReport
  };
}
