import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAutoReports, PerformanceReport } from "@/hooks/useAutoReports";
import { FileText, Download, Trash2, Loader2, Calendar, Settings } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export function AutoReportPanel() {
  const {
    isGenerating,
    reports,
    currentReport,
    settings,
    setCurrentReport,
    updateSettings,
    generateReport,
    deleteReport,
    exportReport
  } = useAutoReports();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Auto Reports
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reports">Auto-generate reports</Label>
              <Switch
                id="auto-reports"
                checked={settings.enabled}
                onCheckedChange={(enabled) => updateSettings({ enabled })}
              />
            </div>
            <div className="space-y-1">
              <Label>Frequency</Label>
              <Select
                value={settings.frequency}
                onValueChange={(frequency: 'daily' | 'weekly' | 'monthly') => 
                  updateSettings({ frequency })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-metrics">Include metrics</Label>
              <Switch
                id="include-metrics"
                checked={settings.includeMetrics}
                onCheckedChange={(includeMetrics) => updateSettings({ includeMetrics })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-recs">Include recommendations</Label>
              <Switch
                id="include-recs"
                checked={settings.includeRecommendations}
                onCheckedChange={(includeRecommendations) => updateSettings({ includeRecommendations })}
              />
            </div>
          </div>
        )}

        {/* Generate Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => generateReport('daily')}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            Daily
          </Button>
          <Button
            onClick={() => generateReport('weekly')}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Weekly
          </Button>
          <Button
            onClick={() => generateReport('monthly')}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            Monthly
          </Button>
        </div>

        {/* Current Report */}
        {currentReport && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{currentReport.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(currentReport.generatedAt, 'PPp')}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => exportReport(currentReport, 'text')}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteReport(currentReport.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm">{currentReport.summary}</p>

            {currentReport.highlights.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Highlights</p>
                <ul className="text-sm space-y-1">
                  {currentReport.highlights.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentReport.recommendations.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recommendations</p>
                <ul className="text-sm space-y-1">
                  {currentReport.recommendations.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Report History */}
        {reports.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Recent Reports</p>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setCurrentReport(report)}
                    className={`w-full text-left p-2 rounded border transition-colors hover:bg-muted/50 ${
                      currentReport?.id === report.id ? 'bg-muted border-primary' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{report.title}</span>
                      <Badge variant="outline" className="text-xs">{report.period}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(report.generatedAt, 'PP')}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {reports.length === 0 && !currentReport && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No reports generated yet</p>
            <p className="text-xs">Click a button above to generate your first report</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
