import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sparkles, ArrowRight, ArrowLeft, Check, Mic, Brain, BookOpen, Shield, X, Plus, Loader2 } from "lucide-react";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { useBrandQuiz } from "@/hooks/useBrandQuiz";
import { toast } from "sonner";

interface Props { onComplete: () => void; onSkip?: () => void; }

const STEPS = [
  { id: "voice", title: "Brand Voice", icon: Mic, description: "Define your communication style" },
  { id: "personality", title: "Brand Personality", icon: Brain, description: "Discover your brand archetype" },
  { id: "story", title: "Brand Story", icon: BookOpen, description: "Tell your brand's narrative" },
  { id: "guardrails", title: "Brand Guardrails", icon: Shield, description: "Set content boundaries" },
];

export function BrandDNAOnboardingWizard({ onComplete, onSkip }: Props) {
  const { brandDNA, updateVoice, updatePersonality, updateStory, updateGuardrails, saving, analyzeVoice } = useBrandDNA();
  const quiz = useBrandQuiz();
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [url, setUrl] = useState("");
  const [toneSpectrum, setToneSpectrum] = useState(brandDNA.voice.toneSpectrum);
  const [words, setWords] = useState<string[]>(brandDNA.voice.vocabulary.preferred);
  const [newWord, setNewWord] = useState("");
  const [story, setStory] = useState(brandDNA.story);
  const [forbidden, setForbidden] = useState<string[]>(brandDNA.guardrails.forbiddenWords);
  const [topics, setTopics] = useState<string[]>(brandDNA.guardrails.avoidTopics);
  const [newForbidden, setNewForbidden] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const progress = ((step + 1) / STEPS.length) * 100;
  const currentQ = quiz.questions[quiz.currentQuestion];

  const handleAnalyze = async () => {
    if (!url) { toast.error("Enter website URL"); return; }
    setAnalyzing(true);
    try {
      const r = await analyzeVoice(url);
      if (r) { setToneSpectrum(r.toneSpectrum || toneSpectrum); setWords(r.vocabulary?.preferred || []); toast.success("Analysis complete!"); }
    } finally { setAnalyzing(false); }
  };

  const handleNext = async () => {
    if (step === 0) await updateVoice({ ...brandDNA.voice, toneSpectrum, vocabulary: { ...brandDNA.voice.vocabulary, preferred: words } });
    else if (step === 1 && quiz.isComplete) {
      const r = quiz.getResults();
      await updatePersonality({ archetype: r.primary.archetype, secondaryArchetype: r.secondary?.archetype, traits: r.primary.traits, values: [], emotionalTone: r.primary.description });
    }
    else if (step === 2) await updateStory(story);
    else if (step === 3) await updateGuardrails({ ...brandDNA.guardrails, forbiddenWords: forbidden, avoidTopics: topics });
    if (step < STEPS.length - 1) setStep(step + 1);
    else { toast.success("Brand DNA setup complete!"); onComplete(); }
  };

  const addItem = (list: string[], set: (l: string[]) => void, val: string, setVal: (v: string) => void) => {
    if (val.trim() && !list.includes(val.trim())) { set([...list, val.trim()]); setVal(""); }
  };
  const removeItem = (list: string[], set: (l: string[]) => void, val: string) => set(list.filter(w => w !== val));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Brand DNA Setup</h2></div>
          {onSkip && <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>}
        </div>
        <Progress value={progress} className="h-2 mb-6" />
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-1">{STEPS[step].title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{STEPS[step].description}</p>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {step === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2"><Input placeholder="https://yourbrand.com" value={url} onChange={e => setUrl(e.target.value)} />
                    <Button onClick={handleAnalyze} disabled={analyzing}>{analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}</Button>
                  </div>
                  {Object.entries(toneSpectrum).map(([k, v]) => (
                    <div key={k}><div className="flex justify-between text-xs text-muted-foreground"><span>{k === "formal" ? "Casual" : "Friendly"}</span><span className="capitalize">{k}</span></div>
                      <Slider value={[v]} onValueChange={([val]) => setToneSpectrum({ ...toneSpectrum, [k]: val })} max={100} />
                    </div>
                  ))}
                  <div className="flex gap-2"><Input placeholder="Add word..." value={newWord} onChange={e => setNewWord(e.target.value)} onKeyPress={e => e.key === "Enter" && addItem(words, setWords, newWord, setNewWord)} />
                    <Button size="icon" variant="outline" onClick={() => addItem(words, setWords, newWord, setNewWord)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">{words.map(w => <Badge key={w} variant="secondary" className="gap-1">{w}<X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(words, setWords, w)} /></Badge>)}</div>
                </div>
              )}
              {step === 1 && (!quiz.isComplete ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Question {quiz.currentQuestion + 1}/{quiz.totalQuestions}</span><Progress value={quiz.progress} className="w-24" /></div>
                  <h4 className="font-medium">{currentQ?.question}</h4>
                  <div className="grid gap-2">{currentQ?.options.map((o, i) => <Button key={i} variant="outline" className="justify-start text-left h-auto py-2" onClick={() => quiz.answerQuestion(i)}>{o.text}</Button>)}</div>
                </div>
              ) : (
                <div className="text-center space-y-3"><Check className="h-12 w-12 text-primary mx-auto" /><h4 className="font-semibold">Quiz Complete!</h4>
                  <Badge className="text-lg px-4 py-1">{quiz.getResults().primary.archetype}</Badge>
                  <p className="text-sm text-muted-foreground">{quiz.getResults().primary.description}</p>
                  <Button variant="ghost" size="sm" onClick={quiz.reset}>Retake</Button>
                </div>
              ))}
              {step === 2 && (
                <div className="space-y-3">
                  <Textarea placeholder="Brand mission..." value={story.mission || ""} onChange={e => setStory({ ...story, mission: e.target.value })} rows={2} />
                  <Textarea placeholder="Origin story..." value={story.origin || ""} onChange={e => setStory({ ...story, origin: e.target.value })} rows={2} />
                  <Input placeholder="Tagline" value={story.tagline || ""} onChange={e => setStory({ ...story, tagline: e.target.value })} />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex gap-2"><Input placeholder="Forbidden word..." value={newForbidden} onChange={e => setNewForbidden(e.target.value)} onKeyPress={e => e.key === "Enter" && addItem(forbidden, setForbidden, newForbidden, setNewForbidden)} />
                    <Button size="icon" variant="outline" onClick={() => addItem(forbidden, setForbidden, newForbidden, setNewForbidden)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">{forbidden.map(w => <Badge key={w} variant="destructive" className="gap-1">{w}<X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(forbidden, setForbidden, w)} /></Badge>)}</div>
                  <div className="flex gap-2"><Input placeholder="Topic to avoid..." value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyPress={e => e.key === "Enter" && addItem(topics, setTopics, newTopic, setNewTopic)} />
                    <Button size="icon" variant="outline" onClick={() => addItem(topics, setTopics, newTopic, setNewTopic)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">{topics.map(t => <Badge key={t} variant="outline" className="gap-1">{t}<X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(topics, setTopics, t)} /></Badge>)}</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Button onClick={handleNext} disabled={saving || (step === 1 && !quiz.isComplete)}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : step === STEPS.length - 1 ? <>Complete<Check className="h-4 w-4 ml-2" /></> : <>Next<ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}