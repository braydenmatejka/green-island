export type BaseTileType =
  | "ocean"
  | "grass"
  | "forest"
  | "oil"
  | "ice"
  | "river"
  | "city";

export type ManagedTileType =
  | "forest-cut"
  | "forest-protected"
  | "oil-drilled"
  | "ocean-overfished";

export type TileType = BaseTileType | ManagedTileType;

export type ResourceKind = "forest" | "oil" | "ocean";

export type TileAction = {
  id: string;
  label: string;
  description: string;
  resultingType?: ManagedTileType;
  effects: {
    money?: number;
    happiness?: number;
    environment?: number;
    energy?: number;
    climateRisk?: number;
  };
};

export type Region = {
  id: string;
  kind: ResourceKind;
  type: TileType;
  name: string;
  description: string;
  actions: TileAction[];
};

export type MapTile = {
  type: TileType;
  regionId?: string;
};

export const regions: Region[] = [
  {
    id: "forest-northwest",
    kind: "forest",
    type: "forest",
    name: "Northwest Forest",
    description:
      "A dense forest that stores carbon and protects the island from erosion.",
    actions: [
      {
        id: "protect",
        label: "Protect Forest",
        description: "Protect this forest as a conservation area.",
        resultingType: "forest-protected",
        effects: { happiness: 10, environment: 12, money: -5, climateRisk: -6 },
      },
      {
        id: "cut",
        label: "Cut Down Forest",
        description: "Clear the forest for lumber and revenue.",
        resultingType: "forest-cut",
        effects: { money: 25, environment: -18, climateRisk: 8 },
      },
    ],
  },
  {
    id: "forest-northeast",
    kind: "forest",
    type: "forest",
    name: "Northeast Forest",
    description:
      "A major forest ecosystem near the northern coast of the island.",
    actions: [
      {
        id: "protect",
        label: "Protect Forest",
        description: "Protect this forest as a conservation area.",
        resultingType: "forest-protected",
        effects: { happiness: 10, environment: 12, money: -5, climateRisk: -6 },
      },
      {
        id: "cut",
        label: "Cut Down Forest",
        description: "Clear the forest for lumber and revenue.",
        resultingType: "forest-cut",
        effects: { money: 25, environment: -18, climateRisk: 8 },
      },
    ],
  },
  {
    id: "forest-south",
    kind: "forest",
    type: "forest",
    name: "Southern Forest",
    description:
      "A large southern forest that anchors the island's biodiversity and carbon storage.",
    actions: [
      {
        id: "protect",
        label: "Protect Forest",
        description: "Protect this forest as a conservation area.",
        resultingType: "forest-protected",
        effects: { happiness: 10, environment: 12, money: -5, climateRisk: -6 },
      },
      {
        id: "cut",
        label: "Cut Down Forest",
        description: "Clear the forest for lumber and short-term revenue.",
        resultingType: "forest-cut",
        effects: { money: 25, environment: -18, climateRisk: 8 },
      },
    ],
  },
  {
    id: "oil-north",
    kind: "oil",
    type: "oil",
    name: "Northern Oil Field",
    description:
      "A fossil fuel reserve that can produce wealth and energy while increasing climate risk.",
    actions: [
      {
        id: "drill",
        label: "Drill Oil Field",
        description: "Extract oil for energy and profit.",
        resultingType: "oil-drilled",
        effects: { money: 35, energy: 25, environment: -20, climateRisk: 15 },
      },
      {
        id: "leave",
        label: "Leave It Alone",
        description: "Leave the oil underground.",
        effects: { happiness: 5, environment: 5, climateRisk: -4 },
      },
    ],
  },
  {
    id: "oil-south",
    kind: "oil",
    type: "oil",
    name: "Southern Oil Field",
    description:
      "A fossil fuel reserve that can produce wealth and energy while increasing climate risk.",
    actions: [
      {
        id: "drill",
        label: "Drill Oil Field",
        description: "Extract oil for energy and profit.",
        resultingType: "oil-drilled",
        effects: { money: 35, energy: 25, environment: -20, climateRisk: 15 },
      },
      {
        id: "leave",
        label: "Leave It Alone",
        description: "Leave the oil underground.",
        effects: { happiness: 5, environment: 5, climateRisk: -4 },
      },
    ],
  },
  {
    id: "ocean-north",
    kind: "ocean",
    type: "ocean",
    name: "Northern Ocean",
    description:
      "A coastal fishing region that can support the island if managed carefully.",
    actions: [
      {
        id: "overfish",
        label: "Overfish",
        description: "Maximize short-term catch at the cost of ocean health.",
        resultingType: "ocean-overfished",
        effects: { money: 20, environment: -12, happiness: -4 },
      },
      {
        id: "sustainable",
        label: "Fish Sustainably",
        description: "Limit catch sizes to preserve the fishery.",
        effects: { money: 8, happiness: 5, environment: 4 },
      },
    ],
  },
  {
    id: "ocean-south",
    kind: "ocean",
    type: "ocean",
    name: "Southern Ocean",
    description:
      "A productive marine region vulnerable to overfishing and pollution.",
    actions: [
      {
        id: "overfish",
        label: "Overfish",
        description: "Maximize short-term catch at the cost of ocean health.",
        resultingType: "ocean-overfished",
        effects: { money: 20, environment: -12, happiness: -4 },
      },
      {
        id: "sustainable",
        label: "Fish Sustainably",
        description: "Limit catch sizes to preserve the fishery.",
        effects: { money: 8, happiness: 5, environment: 4 },
      },
    ],
  },
  {
    id: "ocean-east",
    kind: "ocean",
    type: "ocean",
    name: "Eastern Ocean",
    description:
      "An ocean region along the eastern coast that supports fisheries and trade.",
    actions: [
      {
        id: "overfish",
        label: "Overfish",
        description: "Maximize short-term catch at the cost of ocean health.",
        resultingType: "ocean-overfished",
        effects: { money: 20, environment: -12, happiness: -4 },
      },
      {
        id: "sustainable",
        label: "Fish Sustainably",
        description: "Limit catch sizes to preserve the fishery.",
        effects: { money: 8, happiness: 5, environment: 4 },
      },
    ],
  },
  {
    id: "ocean-west",
    kind: "ocean",
    type: "ocean",
    name: "Western Ocean",
    description:
      "An ocean region along the western coast where local communities fish for food and income.",
    actions: [
      {
        id: "overfish",
        label: "Overfish",
        description: "Maximize short-term catch at the cost of ocean health.",
        resultingType: "ocean-overfished",
        effects: { money: 20, environment: -12, happiness: -4 },
      },
      {
        id: "sustainable",
        label: "Fish Sustainably",
        description: "Limit catch sizes to preserve the fishery.",
        effects: { money: 8, happiness: 5, environment: 4 },
      },
    ],
  },
];