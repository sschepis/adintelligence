import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Trophy,
  Star,
  Sparkles,
  Check
} from "lucide-react";
import { useBrandQuiz } from "@/hooks/useBrandQuiz";
import { useBrandDNA } from "@/hooks/useBrandDNA";

export function BrandPersonalityQuiz() {
  const { brandDNA, updatePersonality } = useBrandDNA();
  const {
    currentQuestion,
    questions,
    totalQuestions,
    progress,
    answers,
    isComplete,
    answerQuestion,
    goBack,
    reset,
    getResults
  } = useBrandQuiz();

  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question?.id];

  const handleSaveResults = async () => {
    const { primary, secondary } = getResults();
    setSaving(true);
    
    try {
      await updatePersonality({
        archetype: primary.archetype,
        secondaryArchetype: secondary?.archetype || null,
        traits: primary.traits,
        values: primary.traits.slice(0, 3),
        emotionalTone: primary.traits[0],
        completedAt: new Date().toISOString()
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error saving results:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    reset();
    setShowResults(false);
  };

  // Show saved results if quiz was previously completed
  if (brandDNA.personality.archetype && !isComplete && !showResults) {
    const savedArchetype = brandDNA.personality.archetype;
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Brand Archetype
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary">
              <Star className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{savedArchetype}</h3>
              {brandDNA.personality.secondaryArchetype && (
                <p className="text-sm text-muted-foreground mt-1">
                  with influences from {brandDNA.personality.secondaryArchetype}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {brandDNA.personality.traits.map((trait) => (
              <Badge key={trait} variant="secondary">
                {trait}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Completed on {new Date(brandDNA.personality.completedAt!).toLocaleDateString()}
          </p>

          <Button onClick={handleRetake} variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show final results
  if (isComplete && showResults) {
    const { primary, secondary, allScores } = getResults();
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground"
              >
                <Trophy className="h-12 w-12" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl">Your Brand Archetype</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Archetype */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3"
            >
              <h2 className="text-3xl font-bold text-primary">{primary.archetype}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {primary.description}
              </p>
            </motion.div>

            {/* Secondary Archetype */}
            {secondary && secondary.score > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 rounded-lg bg-secondary/50"
              >
                <p className="text-sm text-muted-foreground">With secondary influence from</p>
                <p className="text-lg font-semibold">{secondary.archetype}</p>
              </motion.div>
            )}

            {/* Traits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium text-center">Core Traits</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {primary.traits.map((trait, i) => (
                  <motion.div
                    key={trait}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {trait}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Example Brands */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium text-center">Brands Like You</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {primary.examples.map((brand) => (
                  <Badge key={brand} variant="outline">
                    {brand}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 pt-4"
            >
              <Button onClick={handleRetake} variant="outline" className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* All Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Full Archetype Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allScores.slice(0, 6).map((score, i) => (
                <div key={score.archetype} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate">{score.archetype}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(score.score / Math.max(...allScores.map(s => s.score))) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{score.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show completion state before saving
  if (isComplete) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600"
          >
            <Check className="h-10 w-10" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold">Quiz Complete!</h3>
            <p className="text-muted-foreground mt-2">
              Ready to discover your brand archetype?
            </p>
          </div>
          <Button onClick={handleSaveResults} disabled={saving} className="gap-2">
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Reveal My Archetype
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz in progress
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Question {currentQuestion + 1} of {totalQuestions}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => answerQuestion(i)}
                  className={`w-full p-4 rounded-xl border text-left transition-all hover:border-primary hover:bg-primary/5 ${
                    selectedAnswer === i 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-sm">{option.text}</span>
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Button variant="ghost" onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
