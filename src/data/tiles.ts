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
  | "ocean-overfished"
  | "river-canals"
  | "river-hydro";

export type TileType = BaseTileType | ManagedTileType;

export type ResourceKind = "forest" | "oil" | "ocean" | "river";

export type TileAction = {
  id: string;
  label: string;
  description: string;
  resultingType?: ManagedTileType;
  researchNote: string;
  effects: {
    money?: number;
    environment?: number;
    climateRisk?: number;
  };
};

export type RegionCharacter = {
  image: string;
  quote: string;
};

export type Region = {
  id: string;
  kind: ResourceKind;
  type: TileType;
  name: string;
  description: string;
  characters: RegionCharacter[];
  actions: TileAction[];
};

export type MapTile = {
  type: TileType;
  regionId?: string;
};

const forestActions: TileAction[] = [
  {
    id: "protect",
    label: "Protect Forest",
    description: "Protect this forest as a conservation area.",
    resultingType: "forest-protected",
    researchNote:
      "You decided to protect the forest, losing money but increasing your climate score! According to the World Wildlife Fund, over 1.6 billion people depend on natural forests for food or fuel, and around 70 million people worldwide, including many Indigenous communities, call forests home (WWF). Forests can provide us with oxygen, shelter, jobs, water, nourishment and fuel, and your decision to protect this forest will continue to benefit these important characteristics of your community.",
    effects: { money: -5, environment: 12, climateRisk: -6 },
  },
  {
    id: "cut",
    label: "Cut Down Forest",
    description: "Clear the forest for lumber and revenue.",
    resultingType: "forest-cut",
    researchNote:
      "You decided to cut down this forest, gaining money but lowering your climate score. According to NASA, forests play a critical role in regulating Earth’s climate by absorbing and storing carbon dioxide from the atmosphere. When forests are cleared, much of that stored carbon is released back into the atmosphere, while the landscape also loses its ability to remove future carbon emissions. In addition to contributing to climate change, deforestation destroys wildlife habitat and increases soil erosion; your decision has provided an immediate economic benefit, but it also comes with environmental consequences that may affect Green Island for years to come.",
    effects: { money: 25, environment: -18, climateRisk: 8 },
  },
];

const oilActions: TileAction[] = [
  {
    id: "leave",
    label: "Leave It Alone",
    description: "Leave the oil underground.",
    researchNote:
      "You decided to leave this oil field untouched, sacrificing immediate profits but increasing your climate score. According to the International Energy Agency, achieving global net-zero emissions requires that no new oil and gas fields be approved for development beyond those already committed. Limiting the expansion of fossil fuel extraction is an important step toward reducing future greenhouse gas emissions and slowing climate change. By choosing not to drill, Green Island has forfeited a valuable source of revenue, but it has also taken a step toward protecting its climate for generations.",
    effects: { environment: 5, climateRisk: -4 },
  },
  {
    id: "drill",
    label: "Drill Oil Field",
    description: "Extract oil for energy and profit.",
    resultingType: "oil-drilled",
    researchNote:
      "You decided to drill this oil field, increasing your money but lowering your climate score. According to the Intergovernmental Panel on Climate Change, the continued extraction and combustion of fossil fuels is the largest contributor to the rise in atmospheric greenhouse gases responsible for anthropogenic climate change. Fossil fuels account for the majority of global carbon dioxide emissions from human activities, making reductions in their use essential for limiting future warming. Your decision has provided Green Island with valuable revenue and economic growth, but it has also increased the island’s contribution to climate change.",
    effects: { money: 35, environment: -20, climateRisk: 15 },
  },
];

const oceanActions: TileAction[] = [
  {
    id: "sustainable",
    label: "Fish Sustainably",
    description: "Limit catch sizes to preserve the fishery.",
    researchNote:
      "You decided to fish sustainably, earning a modest profit while increasing your climate score. According to the Food and Agriculture Organization, sustainable fisheries management helps maintain healthy fish populations and protects marine biodiversity, supporting the livelihoods of millions of people who depend on fishing for food and income. By limiting harvests to levels that fish populations can naturally replenish, communities can continue benefiting from the ocean for generations. Your decision may not have generated the highest immediate profit, but it has helped ensure that Green Island’s marine ecosystems remain healthy and productive well into the future.",
    effects: { money: 8, environment: 4, climateRisk: -2 },
  },
  {
    id: "overfish",
    label: "Overfish",
    description: "Maximize short-term catch at the cost of ocean health.",
    resultingType: "ocean-overfished",
    researchNote:
      "You decided to overfish the surrounding waters, increasing your money substantially but lowering your climate score. According to the Food and Agriculture Organization of the United Nations, overfishing occurs when fish are harvested faster than populations can naturally reproduce, leading to declining fish stocks and damaged marine ecosystems. Unsustainable fishing practices can disrupt entire food webs and eventually reduce the amount of seafood available in the future. Your decision has brought Green Island greater economic gains, but it has also placed increasing pressure on the ocean resources that many communities depend on for their livelihoods and food security.",
    effects: { money: 20, environment: -12, climateRisk: 4 },
  },
];

const riverActions: TileAction[] = [
  {
    id: "hydro",
    label: "Invest in Hydroelectric Power",
    description: "Use the river to generate renewable energy for the settlement.",
    resultingType: "river-hydro",
    researchNote:
      "You decided to invest in hydroelectric power, sacrificing some immediate profits but increasing your climate score. According to the United States Department of Energy, hydropower is one of the nation’s largest sources of renewable electricity and can provide reliable energy and support electric grid stability. Although dams and other hydroelectric infrastructure can alter river ecosystems and fish migration if not carefully managed, hydropower produces electricity without the burning of fossil fuels. Your investment has helped Green Island transition toward cleaner energy while taking an important step toward a more sustainable future.",
    effects: { money: 6, environment: 6, climateRisk: -5 },
  },
  {
    id: "canals",
    label: "Dig Canals",
    description: "Expand the river into canals to improve transportation and trade.",
    resultingType: "river-canals",
    researchNote:
      "You decided to expand the river into a network of canals, improving transportation and increasing your money while lowering your climate score. The displacement of the Biloxi-Chitimacha-Choctaw native populations in southern Louisiana are evidence that decades of canal construction for navigation and industry can contribute to the destruction of wetlands by allowing saltwater to penetrate freshwater marshes, accelerating erosion and land loss. As these wetlands disappeared, many Indigenous communities were forced to leave the lands they had called home for generations, threatening their livelihoods and cultural traditions and identities. Your investment has made travel and commerce easier for Green Island today, but it also demonstrates how infrastructure projects can unintentionally reshape ecosystems and displace the people who depend on them.",
    effects: { money: 18, environment: -8, climateRisk: 3 },
  },
];

export const regions: Region[] = [
  {
    id: "forest-south",
    kind: "forest",
    type: "forest",
    name: "Southern Forest",
    description:
      "A dense forest that stores carbon and protects the island from erosion.",
      characters: [
    {
      image: "/characters/character_01.png",
      quote:
        "Hiya {username}, my friend is studying a new species of salamander they found in the Southern Forest. Apparently it has the ability to grow back its limbs in under a week, isn’t that just so cool? They said studying it could lead to medical breakthroughs in the future! Since you’re the mayor, what’s your plan with the forest?",
    },
    {
      image: "/characters/character_02.png",
      quote:
        "Hi {username}, I’m a lumberjack who just moved in down the street. I recently got a job offer from Evil Corp stating they want to contract me in their leveling of the Southern Forest, but I didn’t know they owned the land. Are you planning on helping them clear the Southern Forest?",
    },
  ],
    actions: forestActions,
  },

  {
    id: "forest-northwest",
    kind: "forest",
    type: "forest",
    name: "Northwest Forest",
    description:
      "A dense forest that stores carbon and protects the island from erosion.",
      characters: [
    {
      image: "/characters/character_03.png",
      quote:
        "Hey there {username}, glad to see you around! I just love the environment around Green Island, and I can’t wait to take my family to the Northwest Forest for some hiking. But we don’t have any park rangers yet that could help us find a trailhead… Is the forest protected yet?",
    },
    {
      image: "/characters/character_04.png",
      quote:
        "Hello {username}. I overheard something my neighbor who works at Evil Corp said… She was talking about how they want to cut down the entire Northwest Forest to build a new data center to train a new Artificial Intelligence model. I don’t really know what that means… What’s your decision?",
    },
  ],
    actions: forestActions,
  },

  {
    id: "oil-north",
    kind: "oil",
    type: "oil",
    name: "Northern Oil Field",
    description:
      "A fossil fuel reserve that can produce wealth while increasing climate risk.",
      characters: [
    {
      image: "/characters/character_05.png",
      quote:
        "Hi {username}! My family has lived on Green Island for generations, and I’m worried about what drilling could do to our air, water, and wildlife. My dad says he knows we’d make money from the oil, but once it’s gone, we can’t put it back. Could we leave these oil fields untouched?",
    },
    {
      image: "/characters/character_06.png",
      quote:
        "Good afternoon, {username}. I’m a representative from Evil Corp. Beneath these fields lies an enormous oil reserve worth millions. We can create jobs, build roads, and make the entirety of Green Island extremely wealthy. All we need is your approval to begin drilling.",
    },
  ],
    actions: oilActions,
  },
  {
    id: "oil-south",
    kind: "oil",
    type: "oil",
    name: "Southern Oil Field",
    description:
      "A fossil fuel reserve that can produce wealth while increasing climate risk.",
      characters: [
    {
      image: "/characters/character_07.png",
      quote:
        "Hello, {username}. I teach science at the village school, and my students always ask what kind of island they’ll inherit in the future. If we have other ways to develop, maybe these oil fields should remain part of the landscape instead of becoming another industrial site.",
    },
    {
      image: "/characters/character_08.png",
      quote:
        "Hello Mayor. I’m with Evil Corp, and we’ve done the math. This oil field could become the economic engine of Green Island. Think about the new businesses and tax revenue that drilling could provide. We understand the concerns, but the world still depends on oil. If you don’t develop this field, someone else will. Why shouldn’t Green Island benefit from its own natural resources?",
    },
  ],
    actions: oilActions,
  },
  {
    id: "ocean-east",
    kind: "ocean",
    type: "ocean",
    name: "Eastern Ocean",
    description:
      "An ocean region along the eastern coast that supports fisheries and trade.",
      characters: [
    {
      image: "/characters/character_10.png",
      quote:
        "Hi, {username}. I’ve spent years studying the reefs and fisheries around Green Island, and I’m a bit concerned about the future of these waters. Healthy oceans are beautiful but they also protect our coastlines and support a stable underwater ecosystem. Once marine ecosystems collapse, they can take decades to recover. I don’t want something like that to happen to our Eastern Ocean.",
    },
    {
      image: "/characters/character_15.png",
      quote:
        "Good to see you, {username}. Demand for seafood has never been higher with all these new Green Islanders moving in, and at Evil Corp we believe that we are sitting on an incredible economic opportunity. We have the technology and investors ready to maximize production. The ocean is one of your greatest assets Mayor, do you really want to let all this money swim away?",
    },
  ],
    actions: oceanActions,
  },
  {
    id: "ocean-west",
    kind: "ocean",
    type: "ocean",
    name: "Western Ocean",
    description:
      "An ocean region along the western coast where communities fish for food and income.",
      characters: [
    {
      image: "/characters/character_11.png",
      quote:
        "Morning, {username}. My family relies on the local fish market for a lot of our income, and we have done so for generations. My grandfather taught me these waters, and now I’m here teaching my daughter bright and early. If we take only what the ocean can replace, there’ll always be fish for the next generation. I hope we don’t let any profit driven decisions empty these waters…",
    },
    {
      image: "/characters/character_12.png",
      quote:
        "Hello, {username}. I run a local fishing business that was recently acquired by Evil Corp, and we’ve been given access to a fleet large enough to catch more fish than ever before. We could bring jobs, lower food prices, grow our economy and more! But only if we stop limiting how much we harvest. What do you think about that?",
    },
  ],
    actions: oceanActions,
  },
  {
    id: "main-river",
    kind: "river",
    type: "river",
    name: "Main River",
    description:
      "A major river that connects the northern interior to the southern settlement and supports transportation, freshwater access, and possible energy development.",
      characters: [
    {
      image: "/characters/character_13.png",
      quote:
        "Oh, hello {username}, didn’t see you there! Since I just moved here, I was wondering where we get our energy from? My brother works in the clean energy industry, and he said that this bubbling river could provide thousands of megawatts of power to Green Island without disrupting the local ecosystem, as long as it’s done right. Could I give you his number?",
    },
    {
      image: "/characters/character_14.png",
      quote:
        "Hi {username}. I was listening to a podcast on the CEO of Evil Corp, and he said that the Main River is his company’s next project. He wants to rapidly build canals across the island to improve shipment of his product, but I don’t think he knows what he’s doing. What do you think about that?",
    },
  ],
    actions: riverActions,
  },
];