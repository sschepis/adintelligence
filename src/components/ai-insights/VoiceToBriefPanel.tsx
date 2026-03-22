import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceToBrief, BriefTemplate, SharedBrief, BriefFeedback } from "@/hooks/useVoiceToBrief";
import { Mic, MicOff, Wand2, Copy, Loader2, Volume2, Save, FolderOpen, Trash2, FileText, Share2, Link, MessageSquare, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";

function TemplateLibrary({ 
  templates, 
  onLoad, 
  onDelete 
}: { 
  templates: BriefTemplate[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const categoryLabels: Record<BriefTemplate['category'], string> = {
    'product-launch': 'Product Launch',
    'seasonal': 'Seasonal',
    'awareness': 'Brand Awareness',
    'conversion': 'Conversion',
    'engagement': 'Engagement',
    'custom': 'Custom'
  };

  const groupedTemplates = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, BriefTemplate[]>);

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {Object.entries(groupedTemplates).map(([category, temps]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {categoryLabels[category as BriefTemplate['category']] || category}
            </h4>
            {temps.map((template) => (
              <div
                key={template.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm truncate">{template.name}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onLoad(template.id)}>
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    {template.category === 'custom' && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {template.brief.channels.slice(0, 3).map((ch, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{ch}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function SharedBriefsPanel({
  sharedBriefs,
  onDelete,
  getShareUrl
}: {
  sharedBriefs: SharedBrief[];
  onDelete: (id: string) => void;
  getShareUrl: (code: string) => string;
}) {
  const copyLink = (code: string) => {
    navigator.clipboard.writeText(getShareUrl(code));
    toast.success('Link copied!');
  };

  if (sharedBriefs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No shared briefs yet</p>
        <p className="text-xs">Share a brief to collaborate with your team</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {sharedBriefs.map((sb) => (
          <div key={sb.id} className="p-3 rounded-lg border bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm truncate">{sb.title}</h5>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {sb.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {sb.feedback.length} comments
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => copyLink(sb.shareCode)}>
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(sb.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs font-mono">{sb.shareCode}</Badge>
              <span className="text-xs text-muted-foreground">
                Expires {sb.expiresAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function FeedbackSection({ 
  feedback,
  shareCode,
  onAddFeedback
}: { 
  feedback: BriefFeedback[];
  shareCode: string;
  onAddFeedback: (author: string, comment: string) => void;
}) {
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (author.trim() && comment.trim()) {
      onAddFeedback(author.trim(), comment.trim());
      setComment("");
    }
  };

  return (
    <div className="space-y-3 border-t pt-3 mt-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Team Feedback ({feedback.length})
      </h4>
      
      {feedback.length > 0 && (
        <ScrollArea className="h-[120px]">
          <div className="space-y-2">
            {feedback.map((fb) => (
              <div key={fb.id} className="p-2 rounded bg-muted/50 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{fb.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">{fb.comment}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="space-y-2">
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className="text-sm"
        />
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your feedback..."
          className="text-sm min-h-[60px]"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!author.trim() || !comment.trim()}>
          Add Feedback
        </Button>
      </div>
    </div>
  );
}

export function VoiceToBriefPanel() {
  const {
    isListening,
    isProcessing,
    transcript,
    brief,
    templates,
    sharedBriefs,
    currentSharedBrief,
    startListening,
    stopListening,
    generateBrief,
    saveAsTemplate,
    loadTemplate,
    deleteTemplate,
    shareBrief,
    addFeedback,
    deleteSharedBrief,
    getShareUrl,
    clearBrief,
    setTranscript
  } = useVoiceToBrief();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState<BriefTemplate['category']>('custom');
  const [libraryTab, setLibraryTab] = useState("templates");

  const handleCopyBrief = () => {
    if (!brief) return;
    const briefText = `
Campaign Brief: ${brief.title}

Objective: ${brief.objective}

Target Audience: ${brief.targetAudience}

Key Messages:
${brief.keyMessages.map(m => `• ${m}`).join('\n')}

Channels: ${brief.channels.join(', ')}

${brief.budget ? `Budget: ${brief.budget}` : ''}
${brief.timeline ? `Timeline: ${brief.timeline}` : ''}

Creative Direction: ${brief.creativeDirection}

Call to Action: ${brief.callToAction}
    `.trim();
    navigator.clipboard.writeText(briefText);
    toast.success('Brief copied to clipboard');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    saveAsTemplate(templateName, templateDescription, templateCategory);
    setSaveDialogOpen(false);
    setTemplateName("");
    setTemplateDescription("");
    setTemplateCategory('custom');
  };

  const handleShare = async () => {
    await shareBrief();
  };

  const handleAddFeedback = async (author: string, comment: string) => {
    if (currentSharedBrief) {
      await addFeedback(currentSharedBrief.shareCode, author, comment);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice-to-Brief
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Library
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Brief Library</DialogTitle>
              </DialogHeader>
              <Tabs value={libraryTab} onValueChange={setLibraryTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
                  <TabsTrigger value="shared">Shared ({sharedBriefs.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="templates">
                  <TemplateLibrary 
                    templates={templates} 
                    onLoad={loadTemplate}
                    onDelete={deleteTemplate}
                  />
                </TabsContent>
                <TabsContent value="shared">
                  <SharedBriefsPanel 
                    sharedBriefs={sharedBriefs}
                    onDelete={deleteSharedBrief}
                    getShareUrl={getShareUrl}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Input */}
        <div className="flex items-center gap-3">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isListening ? "Listening... Click to stop" : "Click to start speaking"}
            </p>
            <p className="text-xs text-muted-foreground">
              Describe your campaign idea and I'll create a structured brief
            </p>
          </div>
        </div>

        {/* Transcript */}
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your spoken words will appear here, or type directly..."
          className="min-h-[100px]"
        />

        {/* Generate Button */}
        <Button
          onClick={() => generateBrief()}
          disabled={!transcript.trim() || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Brief...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Campaign Brief
            </>
          )}
        </Button>

        {/* Generated Brief */}
        {brief && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{brief.title}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopyBrief} title="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="Save as Template">
                      <Save className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save as Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Template Name</label>
                        <Input
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="e.g., Holiday Sale Campaign"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          placeholder="Brief description of when to use this template"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select value={templateCategory} onValueChange={(v) => setTemplateCategory(v as BriefTemplate['category'])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product-launch">Product Launch</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                            <SelectItem value="awareness">Brand Awareness</SelectItem>
                            <SelectItem value="conversion">Conversion</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSaveTemplate} className="w-full">
                        Save Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {currentSharedBrief && (
              <Badge variant="secondary" className="gap-1">
                <Link className="h-3 w-3" />
                Shared: {currentSharedBrief.shareCode}
              </Badge>
            )}

            <div>
              <p className="text-xs text-muted-foreground">Objective</p>
              <p className="text-sm">{brief.objective}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Target Audience</p>
              <p className="text-sm">{brief.targetAudience}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Key Messages</p>
              <ul className="text-sm space-y-1">
                {brief.keyMessages.map((msg, i) => (
                  <li key={i}>• {msg}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Channels</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {brief.channels.map((channel, i) => (
                  <Badge key={i} variant="secondary">{channel}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Creative Direction</p>
              <p className="text-sm">{brief.creativeDirection}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Call to Action</p>
              <Badge>{brief.callToAction}</Badge>
            </div>

            {/* Feedback Section for shared briefs */}
            {currentSharedBrief && (
              <FeedbackSection 
                feedback={currentSharedBrief.feedback}
                shareCode={currentSharedBrief.shareCode}
                onAddFeedback={handleAddFeedback}
              />
            )}

            <Button variant="outline" size="sm" onClick={clearBrief} className="w-full">
              Start New Brief
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
