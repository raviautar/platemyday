export interface TourStep {
  id: string;
  page: string;
  targetSelector: string | null;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    page: '/meal-plan',
    targetSelector: null,
    title: 'Welcome to PlateMyDay!',
    description: "Let's take a quick tour of the key features. You can skip at any time.",
    placement: 'center',
  },
  {
    id: 'meal-plan-generate',
    page: '/meal-plan',
    targetSelector: '[data-tour="meal-plan-generate"]',
    title: 'Generate Your Meal Plan',
    description: 'Hit Generate to create a personalized AI-powered meal plan for the entire week.',
    placement: 'bottom',
  },
  {
    id: 'meal-plan-customize',
    page: '/meal-plan',
    targetSelector: '[data-tour="meal-plan-customize"]',
    title: 'Customize Your Plan',
    description: "Add notes about what's in your fridge, preferred cuisines, or meal styles before generating.",
    placement: 'bottom',
  },
  {
    id: 'meal-plan-shopping',
    page: '/meal-plan',
    targetSelector: '[data-tour="meal-plan-shopping"]',
    title: 'Shopping List',
    description: 'AI automatically consolidates and groups all ingredients from your meal plan into a handy shopping list.',
    placement: 'bottom',
  },
  {
    id: 'meal-plan-history',
    page: '/meal-plan',
    targetSelector: '[data-tour="meal-plan-history"]',
    title: 'Plan History',
    description: 'Every plan you generate is saved. Come back here to view or restore past plans.',
    placement: 'bottom',
  },
  {
    id: 'recipes-list',
    page: '/recipes',
    targetSelector: '[data-tour="recipes-list"]',
    title: 'Recipe Library',
    description: 'All your saved recipes live here. Search by name or filter by tags and prep time.',
    placement: 'top',
  },
  {
    id: 'recipes-ai-fab',
    page: '/recipes',
    targetSelector: '[data-tour="recipes-ai-fab"]',
    title: 'AI Recipe Generator',
    description: 'Tap here to generate a new recipe with AI — just describe what you\'re craving.',
    placement: 'top',
  },
  {
    id: 'customize-preferences',
    page: '/customize',
    targetSelector: '[data-tour="customize-preferences"]',
    title: 'Set Your Preferences',
    description: 'Configure your dietary type, allergies, cuisines, and macro goals. These shape every meal plan.',
    placement: 'top',
  },
  {
    id: 'upgrade-premium',
    page: '/upgrade',
    targetSelector: '[data-tour="upgrade-premium"]',
    title: 'Go Unlimited',
    description: 'Free users get 10 meal plan generations. Upgrade to Premium or Lifetime for unlimited planning.',
    placement: 'top',
  },
  {
    id: 'finish',
    page: '/upgrade',
    targetSelector: null,
    title: "You're all set!",
    description: "That's the tour! Head to Meal Plan to generate your first plan, or explore Recipes to get started.",
    placement: 'center',
  },
];
