export type Policy = {
  id: string;
  category: string;
  title: string;
  description: string;
  effects: {
    money?: number;
    population?: number;
    environment?: number;
    energy?: number;
    climateRisk?: number;
  };
  researchNote: string;
};

export const policies: Policy[] = [
  {
    id: "coal",
    category: "Energy",
    title: "Build Coal Plant",
    description: "Cheap, powerful energy for rapid growth.",
    effects: {
      money: 20,
      energy: 30,
      environment: -15,
      climateRisk: 12,
    },
    researchNote:
      "This choice represents fossil-fuel development: high short-term productivity with long-term climate and environmental costs.",
  },
  {
    id: "solar",
    category: "Energy",
    title: "Build Solar Farm",
    description: "Expensive clean energy with lower long-term risk.",
    effects: {
      money: -10,
      energy: 18,
      environment: 5,
      climateRisk: -4,
    },
    researchNote:
      "This reflects mitigation strategies like renewable energy investment and emissions reduction.",
  },
  {
    id: "clearcut",
    category: "Forests",
    title: "Clear-Cut Forests",
    description: "Extract timber quickly for profit.",
    effects: {
      money: 25,
      environment: -20,
      climateRisk: 10,
    },
    researchNote:
      "This represents extractive resource management, where ecological costs are delayed but severe.",
  },
  {
    id: "preserve",
    category: "Forests",
    title: "Protect Forests",
    description: "Preserve ecosystems and reduce disaster vulnerability.",
    effects: {
      money: -5,
      environment: 15,
      climateRisk: -8,
    },
    researchNote:
      "This reflects conservation-based resource management and the idea that ecosystems provide long-term protection.",
  },
];