import { useState, useCallback } from "react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    archetypes: string[];
    weight: number;
  }[];
}

export interface ArchetypeScore {
  archetype: string;
  score: number;
  description: string;
  traits: string[];
  examples: string[];
}

const ARCHETYPES: Record<string, { description: string; traits: string[]; examples: string[] }> = {
  'The Innocent': {
    description: 'Optimistic, pure, and trustworthy. You believe in simplicity and doing the right thing.',
    traits: ['Optimistic', 'Honest', 'Pure', 'Wholesome', 'Trustworthy'],
    examples: ['Coca-Cola', 'Dove', 'Whole Foods']
  },
  'The Sage': {
    description: 'Wise, knowledgeable, and thoughtful. You value truth and helping others understand.',
    traits: ['Intelligent', 'Analytical', 'Thoughtful', 'Expert', 'Trusted advisor'],
    examples: ['Google', 'BBC', 'The Economist']
  },
  'The Explorer': {
    description: 'Adventurous, independent, and pioneering. You push boundaries and seek new experiences.',
    traits: ['Adventurous', 'Independent', 'Pioneering', 'Authentic', 'Free-spirited'],
    examples: ['Patagonia', 'Jeep', 'REI']
  },
  'The Outlaw': {
    description: 'Rebellious, disruptive, and liberating. You challenge the status quo and break rules.',
    traits: ['Revolutionary', 'Disruptive', 'Bold', 'Unconventional', 'Liberating'],
    examples: ['Harley-Davidson', 'Virgin', 'Diesel']
  },
  'The Magician': {
    description: 'Transformative, visionary, and innovative. You make dreams come true.',
    traits: ['Visionary', 'Transformative', 'Innovative', 'Charismatic', 'Imaginative'],
    examples: ['Apple', 'Tesla', 'Disney']
  },
  'The Hero': {
    description: 'Courageous, determined, and inspiring. You overcome challenges and inspire others.',
    traits: ['Courageous', 'Determined', 'Strong', 'Inspiring', 'Honorable'],
    examples: ['Nike', 'FedEx', 'BMW']
  },
  'The Lover': {
    description: 'Passionate, intimate, and sensual. You create connection and make people feel special.',
    traits: ['Passionate', 'Intimate', 'Indulgent', 'Romantic', 'Sensual'],
    examples: ['Chanel', "Victoria's Secret", 'Godiva']
  },
  'The Jester': {
    description: 'Fun, playful, and entertaining. You bring joy and live in the moment.',
    traits: ['Fun', 'Playful', 'Witty', 'Irreverent', 'Entertaining'],
    examples: ["M&M's", 'Old Spice', 'Dollar Shave Club']
  },
  'The Everyperson': {
    description: 'Relatable, authentic, and down-to-earth. You connect through shared values.',
    traits: ['Relatable', 'Authentic', 'Humble', 'Friendly', 'Genuine'],
    examples: ['IKEA', 'Target', "Levi's"]
  },
  'The Caregiver': {
    description: 'Nurturing, protective, and supportive. You put others first and provide comfort.',
    traits: ['Nurturing', 'Caring', 'Protective', 'Supportive', 'Generous'],
    examples: ['Johnson & Johnson', 'TOMS', 'Volvo']
  },
  'The Ruler': {
    description: 'Commanding, premium, and authoritative. You lead with excellence and control.',
    traits: ['Authoritative', 'Premium', 'Refined', 'Powerful', 'Exclusive'],
    examples: ['Mercedes-Benz', 'Rolex', 'American Express']
  },
  'The Creator': {
    description: 'Innovative, artistic, and imaginative. You bring new things into existence.',
    traits: ['Creative', 'Innovative', 'Artistic', 'Expressive', 'Non-conformist'],
    examples: ['LEGO', 'Adobe', 'Pinterest']
  }
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'challenge',
    question: 'When facing a challenge, your brand...',
    options: [
      { text: 'Finds the simplest, most elegant solution', archetypes: ['The Sage', 'The Creator'], weight: 2 },
      { text: 'Takes bold action and leads by example', archetypes: ['The Hero', 'The Ruler'], weight: 2 },
      { text: 'Sees it as an adventure to embrace', archetypes: ['The Explorer', 'The Outlaw'], weight: 2 },
      { text: 'Turns it into something fun and engaging', archetypes: ['The Jester', 'The Magician'], weight: 2 }
    ]
  },
  {
    id: 'relationship',
    question: 'Your ideal customer relationship feels like...',
    options: [
      { text: 'A trusted advisor they can rely on', archetypes: ['The Sage', 'The Caregiver'], weight: 2 },
      { text: 'A best friend who gets them', archetypes: ['The Everyperson', 'The Lover'], weight: 2 },
      { text: 'An inspiring mentor pushing them further', archetypes: ['The Hero', 'The Magician'], weight: 2 },
      { text: 'A rebellious ally against the status quo', archetypes: ['The Outlaw', 'The Explorer'], weight: 2 }
    ]
  },
  {
    id: 'success',
    question: 'Success for your brand means...',
    options: [
      { text: 'Making a positive difference in people\'s lives', archetypes: ['The Caregiver', 'The Innocent'], weight: 2 },
      { text: 'Achieving excellence and industry leadership', archetypes: ['The Ruler', 'The Hero'], weight: 2 },
      { text: 'Creating something never seen before', archetypes: ['The Creator', 'The Magician'], weight: 2 },
      { text: 'Helping people discover their potential', archetypes: ['The Explorer', 'The Sage'], weight: 2 }
    ]
  },
  {
    id: 'communication',
    question: 'Your brand communicates by...',
    options: [
      { text: 'Sharing knowledge and insights', archetypes: ['The Sage', 'The Creator'], weight: 2 },
      { text: 'Inspiring action and courage', archetypes: ['The Hero', 'The Explorer'], weight: 2 },
      { text: 'Creating emotional connections', archetypes: ['The Lover', 'The Caregiver'], weight: 2 },
      { text: 'Making people smile and laugh', archetypes: ['The Jester', 'The Everyperson'], weight: 2 }
    ]
  },
  {
    id: 'fear',
    question: 'What does your brand fear most?',
    options: [
      { text: 'Being seen as ordinary or boring', archetypes: ['The Magician', 'The Creator'], weight: 2 },
      { text: 'Letting people down or being dishonest', archetypes: ['The Innocent', 'The Caregiver'], weight: 2 },
      { text: 'Being powerless or ineffective', archetypes: ['The Hero', 'The Ruler'], weight: 2 },
      { text: 'Being constrained or losing freedom', archetypes: ['The Explorer', 'The Outlaw'], weight: 2 }
    ]
  },
  {
    id: 'environment',
    question: 'Your ideal brand environment is...',
    options: [
      { text: 'A premium, exclusive space', archetypes: ['The Ruler', 'The Lover'], weight: 2 },
      { text: 'A creative, inspiring studio', archetypes: ['The Creator', 'The Magician'], weight: 2 },
      { text: 'A cozy, welcoming place', archetypes: ['The Caregiver', 'The Everyperson'], weight: 2 },
      { text: 'An exciting, adventurous setting', archetypes: ['The Explorer', 'The Outlaw'], weight: 2 }
    ]
  },
  {
    id: 'promise',
    question: 'Your brand promises customers...',
    options: [
      { text: 'Transformation and new possibilities', archetypes: ['The Magician', 'The Hero'], weight: 2 },
      { text: 'Quality and reliability you can trust', archetypes: ['The Ruler', 'The Sage'], weight: 2 },
      { text: 'Authenticity and genuine connection', archetypes: ['The Everyperson', 'The Lover'], weight: 2 },
      { text: 'Freedom and self-discovery', archetypes: ['The Explorer', 'The Innocent'], weight: 2 }
    ]
  },
  {
    id: 'competition',
    question: 'Against competitors, your brand...',
    options: [
      { text: 'Outsmarts them with superior knowledge', archetypes: ['The Sage', 'The Creator'], weight: 2 },
      { text: 'Outperforms them through excellence', archetypes: ['The Hero', 'The Ruler'], weight: 2 },
      { text: 'Stands apart by being different', archetypes: ['The Outlaw', 'The Explorer'], weight: 2 },
      { text: 'Wins hearts with genuine care', archetypes: ['The Caregiver', 'The Lover'], weight: 2 }
    ]
  },
  {
    id: 'values',
    question: 'Which value matters most to your brand?',
    options: [
      { text: 'Innovation and creativity', archetypes: ['The Creator', 'The Magician'], weight: 3 },
      { text: 'Excellence and achievement', archetypes: ['The Hero', 'The Ruler'], weight: 3 },
      { text: 'Authenticity and integrity', archetypes: ['The Innocent', 'The Everyperson'], weight: 3 },
      { text: 'Care and connection', archetypes: ['The Caregiver', 'The Lover'], weight: 3 }
    ]
  },
  {
    id: 'emotion',
    question: 'What emotion do you want customers to feel?',
    options: [
      { text: 'Inspired and empowered', archetypes: ['The Hero', 'The Magician'], weight: 3 },
      { text: 'Safe and cared for', archetypes: ['The Caregiver', 'The Innocent'], weight: 3 },
      { text: 'Excited and adventurous', archetypes: ['The Explorer', 'The Jester'], weight: 3 },
      { text: 'Special and appreciated', archetypes: ['The Lover', 'The Ruler'], weight: 3 }
    ]
  },
  {
    id: 'story',
    question: 'Your brand\'s story is about...',
    options: [
      { text: 'Overcoming obstacles and winning', archetypes: ['The Hero', 'The Outlaw'], weight: 2 },
      { text: 'Discovery and transformation', archetypes: ['The Explorer', 'The Magician'], weight: 2 },
      { text: 'Creating something meaningful', archetypes: ['The Creator', 'The Sage'], weight: 2 },
      { text: 'Bringing joy and belonging', archetypes: ['The Jester', 'The Everyperson'], weight: 2 }
    ]
  },
  {
    id: 'voice',
    question: 'If your brand was a person, they would speak...',
    options: [
      { text: 'With authority and confidence', archetypes: ['The Ruler', 'The Hero'], weight: 2 },
      { text: 'With warmth and empathy', archetypes: ['The Caregiver', 'The Lover'], weight: 2 },
      { text: 'With wit and humor', archetypes: ['The Jester', 'The Outlaw'], weight: 2 },
      { text: 'With wisdom and insight', archetypes: ['The Sage', 'The Creator'], weight: 2 }
    ]
  }
];

export function useBrandQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const questions = QUIZ_QUESTIONS;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const answerQuestion = useCallback((optionIndex: number) => {
    const question = questions[currentQuestion];
    const option = question.options[optionIndex];

    // Update answers
    setAnswers(prev => ({ ...prev, [question.id]: optionIndex }));

    // Update scores
    setScores(prev => {
      const newScores = { ...prev };
      option.archetypes.forEach(archetype => {
        newScores[archetype] = (newScores[archetype] || 0) + option.weight;
      });
      return newScores;
    });

    // Move to next question or complete
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestion, questions, totalQuestions]);

  const goBack = useCallback(() => {
    if (currentQuestion > 0) {
      const question = questions[currentQuestion - 1];
      const previousAnswer = answers[question.id];
      
      if (previousAnswer !== undefined) {
        const option = question.options[previousAnswer];
        setScores(prev => {
          const newScores = { ...prev };
          option.archetypes.forEach(archetype => {
            newScores[archetype] = Math.max(0, (newScores[archetype] || 0) - option.weight);
          });
          return newScores;
        });
        setAnswers(prev => {
          const newAnswers = { ...prev };
          delete newAnswers[question.id];
          return newAnswers;
        });
      }
      
      setCurrentQuestion(prev => prev - 1);
      setIsComplete(false);
    }
  }, [currentQuestion, questions, answers]);

  const reset = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setScores({});
    setIsComplete(false);
  }, []);

  const getResults = useCallback((): { primary: ArchetypeScore; secondary: ArchetypeScore | null; allScores: ArchetypeScore[] } => {
    const archetypeScores: ArchetypeScore[] = Object.entries(ARCHETYPES).map(([name, data]) => ({
      archetype: name,
      score: scores[name] || 0,
      description: data.description,
      traits: data.traits,
      examples: data.examples
    })).sort((a, b) => b.score - a.score);

    const primary = archetypeScores[0];
    const secondary = archetypeScores[1]?.score > 0 ? archetypeScores[1] : null;

    return { primary, secondary, allScores: archetypeScores };
  }, [scores]);

  return {
    currentQuestion,
    questions,
    totalQuestions,
    progress,
    answers,
    scores,
    isComplete,
    answerQuestion,
    goBack,
    reset,
    getResults
  };
}
