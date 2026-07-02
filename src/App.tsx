import { useEffect, useState } from "react";
import "./App.css";
import type { MapTile, Region, TileAction, TileType } from "./data/tiles";
import { regions } from "./data/tiles";
import IslandCanvas from "./components/IslandCanvas";
import { supabase } from "./lib/supabase";

type IslandStats = {
  year: number;
  money: number;
  climateScore: number;
};

const startingStats: IslandStats = {
  year: 1,
  money: 50,
  climateScore: 80,
};

const WIDTH = 128;
const HEIGHT = 128;

const colors: Record<TileType, string> = {
  ocean: "#0b5f9e",
  grass: "#8fbd4f",
  forest: "#1f6b2d",
  "forest-cut": "#8b5a2b",
  "forest-protected": "#0f4d22",
  oil: "#4d4038",
  "oil-drilled": "#a06f42",
  "ocean-overfished": "#2f8f8c",
  ice: "#dff3fb",
  river: "#2f9ed8",
  "river-canals": "#1f78a8",
  "river-hydro": "#46b6e8",
  city: "#7e62ad",
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function makeMap(regionStates: Record<string, TileType>): MapTile[] {
  const map: MapTile[] = Array.from({ length: WIDTH * HEIGHT }, () => ({
    type: "ocean",
  }));

  function getRegionType(regionId: string, fallback: TileType): TileType {
    return regionStates[regionId] ?? fallback;
  }

  function setTile(x: number, y: number, type: TileType, regionId?: string) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
    map[y * WIDTH + x] = { type, regionId };
  }

  function ellipse(cx: number, cy: number, rx: number, ry: number, type: TileType, regionId?: string) {
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) setTile(x, y, type, regionId);
      }
    }
  }

  function rect(x0: number, y0: number, width: number, height: number, type: TileType, regionId?: string) {
    for (let y = y0; y < y0 + height; y++) {
      for (let x = x0; x < x0 + width; x++) setTile(x, y, type, regionId);
    }
  }

  function line(
    points: { x: number; y: number }[],
    thickness: number,
    type: TileType,
    regionId?: string
  ) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = Math.round(a.x + (b.x - a.x) * t);
        const y = Math.round(a.y + (b.y - a.y) * t);
        ellipse(x, y, thickness, thickness, type, regionId);
      }
    }
  }

  rect(0, 0, 64, 128, getRegionType("ocean-west", "ocean"), "ocean-west");
  rect(64, 0, 64, 128, getRegionType("ocean-east", "ocean"), "ocean-east");

  ellipse(64, -10, 58, 24, "ice");
  ellipse(64, 138, 58, 26, "ice");

  ellipse(58, 61, 35, 42, "grass");
  ellipse(36, 49, 21, 30, "grass");
  ellipse(88, 46, 28, 24, "grass");
  ellipse(45, 84, 27, 24, "grass");
  ellipse(82, 80, 31, 28, "grass");
  ellipse(95, 63, 15, 25, "grass");
  ellipse(22, 91, 10, 16, "grass");
  ellipse(95, 103, 18, 9, "grass");
  ellipse(114, 84, 9, 14, "grass");

  line(
    [
      { x: 68, y: 24 },
      { x: 66, y: 36 },
      { x: 61, y: 48 },
      { x: 58, y: 60 },
      { x: 67, y: 70 },
      { x: 80, y: 78 },
      { x: 84, y: 90 },
      { x: 60, y: 102 },
    ],
    4,
    getRegionType("main-river", "river"),
    "main-river"
  );

  ellipse(36, 36, 15, 13, getRegionType("forest-northwest", "forest"), "forest-northwest");
  ellipse(45, 46, 10, 15, getRegionType("forest-northwest", "forest"), "forest-northwest");
  ellipse(35, 56, 10, 15, getRegionType("forest-northwest", "forest"), "forest-northwest");

  ellipse(100, 82, 12, 13, getRegionType("forest-south", "forest"), "forest-south");
  ellipse(97, 75, 10, 13, getRegionType("forest-south", "forest"), "forest-south");

  ellipse(95, 40, 14, 9, getRegionType("oil-north", "oil"), "oil-north");
  ellipse(90, 47, 10, 8, getRegionType("oil-north", "oil"), "oil-north");

  ellipse(45, 90, 10, 8, getRegionType("oil-south", "oil"), "oil-south");
  ellipse(42, 86, 10, 10, getRegionType("oil-south", "oil"), "oil-south");

  return map;
}

export default function App() {
  const [stats, setStats] = useState<IslandStats>(startingStats);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [regionStates, setRegionStates] = useState<Record<string, TileType>>({});
  const [lastAction, setLastAction] = useState("Click a region to manage it.");
  const [showIntro, setShowIntro] = useState(true);
  const [showCorporateEvent, setShowCorporateEvent] = useState(false);
  const [corporateEventDone, setCorporateEventDone] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const legendItems = [
  ["ocean", "Ocean"],
  ["grass", "Grassland"],
  ["forest", "Forest"],
  ["forest-cut", "Harvested Forest"],
  ["oil", "Oil Field"],
  ["oil-drilled", "Drilled Oil Field"],
  ["river", "River"],
  ["river-hydro", "Managed River"],
  ["ice", "Polar Ice Caps"],
] as const;
  const [lockedRegions, setLockedRegions] = useState<Record<string, boolean>>({});
  const [researchPopup, setResearchPopup] = useState<{
    title: string;
    note: string;
  } | null>(null);
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("green-island-username")
  );

  async function loadGame(currentUsername: string) {
    const { data } = await supabase
      .from("game_saves")
      .select("*")
      .eq("username", currentUsername)
      .maybeSingle();

    if (!data) return;

    setStats(data.stats);
    setRegionStates(data.region_states ?? {});
    setLastAction(data.last_action ?? "Loaded saved game.");
    setLockedRegions(data.locked_regions ?? {});
    setCorporateEventDone(data.corporate_event_done ?? false);
  }

  function personalize(text: string) {
    return text.replaceAll("{username}", username ?? "Player");
  }

  useEffect(() => {
    if (stats.year >= 8 && !corporateEventDone) {
      setShowCorporateEvent(true);
    }
  }, [stats.year, corporateEventDone]);

  useEffect(() => {
    if (username) {
      loadGame(username);
    }
  }, [username]);

  async function saveGame() {
    if (!username) return;

    const saveData = {
      username,
      stats,
      region_states: regionStates,
      last_action: lastAction,
      updated_at: new Date().toISOString(),
      corporate_event_done: corporateEventDone,
      locked_regions: lockedRegions,
    };

    await supabase
      .from("game_saves")
      .upsert(saveData, { onConflict: "username" });

    setLastAction("Game saved.");
  }

  const islandMap = makeMap(regionStates);

  function getRegion(regionId?: string) {
    return regions.find((region) => region.id === regionId) ?? null;
  }

  function handleCorporateDecision(choice: "evil-corp" | "regulation") {
    setStats((s) => {
      if (choice === "evil-corp") {
        return {
          year: s.year + 1,
          money: s.money + 60,
          climateScore: clamp(s.climateScore - 25),
        };
      }

      return {
        year: s.year + 1,
        money: s.money - 15,
        climateScore: clamp(s.climateScore + 15),
      };
    });

    setLastAction(
      choice === "evil-corp"
        ? "You gave Evil Corp permission to build data centers across Green Island. This had drastic effects on the environment and climate of Green Island. According to a team of researchers at Cornell, the current rate of AI growth would annually put 24 to 44 million metric tons of carbon dioxide into the atmosphere by 2030, with the emissions equivalent of adding 5 to 10 million cars to U.S. roadways. It would also drain 731 to 1,125 million cubic meters of water per year, which is equal to the annual household water usage of 6 to 10 million Americans. Your decision will allow Evil Corp to expand their business across Green Island and continue to wreak havoc on the environment."
        : "You created regulations limiting corporate control over Green Island, limiting the reach of companies like Evil Corp and reducing their ability to exploit the island’s natural resources. According to the United States Environmental Protection Agency, environmental regulations are designed to protect human health and the environment by limiting pollution and conserving natural resources, ensuring that the social costs of environmental damage are considered alongside economic benefits. Decades of evidence have shown that environmental protections can improve public health while supporting economic prosperity through cleaner technologies and sustainable development. Your decision may have reduced Green Island’s immediate profits, but it has helped ensure that economic growth occurs without sacrificing the island’s ecosystems or the future of your population."
    );

    setCorporateEventDone(true);
    setShowCorporateEvent(false);
  }

  function applyAction(action: TileAction) {
    if (!selectedRegion) return;

    setStats((s) => ({
      year: s.year + 1,
      money: s.money + (action.effects.money ?? 0),
      climateScore: clamp(
        s.climateScore +
          (action.effects.environment ?? 0) -
          (action.effects.climateRisk ?? 0)
      ),
    }));

    if (action.resultingType) {
      setRegionStates((current) => ({
        ...current,
        [selectedRegion.id]: action.resultingType!,
      }));
    }

    setLockedRegions((current) => ({
      ...current,
      [selectedRegion.id]: true,
    }));

    setLastAction(`${selectedRegion.name}: ${action.description}`);

    setSelectedRegion(null);

    setResearchPopup({
      title: `${selectedRegion.name}: ${action.label}`,
      note: action.researchNote,
    });
  }

  const gameComplete = corporateEventDone;

    function getClimateReport() {
      if (stats.climateScore < 40) {
        return `With a climate score of ${stats.climateScore}, Green Island is headed in a direction that will eventually lead to environmental collapse. Sea levels continue to rise as the polar ice caps melt, biodiversity has declined as habitats disappear, and the island is becoming increasingly vulnerable to the impacts of climate change.`;
      }

      return `With a climate score of ${stats.climateScore}, Green Island has taken meaningful steps toward protecting its environment. Forests continue storing carbon, fisheries remain productive, energy is sustainable, and more tough decisions have helped reduce future climate risks. More work is still needed, but your administration has built a strong foundation.`;
    }

    function getMoneyReport() {
      if (stats.money < 40) {
        return `With a treasury of $${stats.money}, protecting the environment required difficult economic sacrifices. Fighting climate change is costly work, but your administration invested in Green Island's health rather than profit.`;
      }

      return `With a treasury of $${stats.money}, your administration helped create an economic boom for Green Island. Resource development and industry brought wealth to the island, but that prosperity came with environmental tradeoffs.`;
    }

if (!username) {
  return (
    <main className="login-screen">
      <div className="auth-box">
        <h1>Green Island</h1>
        <p>Enter a username to start or continue your island.</p>

        <input
          placeholder="Username"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const value = event.currentTarget.value.trim();

              if (value.length > 0) {
                localStorage.setItem("green-island-username", value);
                setUsername(value);
              }
            }
          }}
        />

        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>(
              ".auth-box input"
            );

            const value = input?.value.trim();

            if (value) {
              localStorage.setItem("green-island-username", value);
              setUsername(value);
            }
          }}
        >
          Play
        </button>
      </div>
    </main>
  );
  }

  return (
    <main className="game-shell">
      <aside className="sidebar">
        <h1>Green Island</h1>
        <p>Manage resources while balancing profit and climate health.</p>

        <div className="save-controls">
          <button onClick={saveGame}>Save Game</button>
          <button
              onClick={() => {
                localStorage.removeItem("green-island-username");
                setUsername(null);
              }}
            >
              Switch User
            </button>
        </div>

        <div className="stats-card">
          <p><span>Year:</span> <strong>{stats.year}</strong></p>
          <p><span>Money:</span> <strong>${stats.money}</strong></p>
          <p><span>Climate Score:</span> <strong>{stats.climateScore}</strong></p>
        </div>

        <div className="legend">
          <h2>Map Legend</h2>

          {legendItems.map(([type, label]) => (
            <div className="legend-row" key={type}>
              <span
                className="legend-swatch"
                style={{ background: colors[type] }}
              />
              {label}
            </div>
          ))}

          <p className="legend-note">
            Resource regions may change color after you make a decision.
          </p>
        </div>

        <div className="hint">{lastAction}</div>
      </aside>

      <section className="map-wrapper">
        <IslandCanvas
          width={WIDTH}
          height={HEIGHT}
          map={islandMap}
          colors={colors}
          hoveredRegionId={hoveredRegionId}
          setHoveredRegionId={setHoveredRegionId}
          getRegion={getRegion}
          onSelectRegion={(region) => {
            if (lockedRegions[region.id]) {
              setLastAction(`${region.name} has already been managed.`);
              return;
            }

            setSelectedRegion(region);
          }}
        />
      </section>

      {selectedRegion && (
      <div className="decision-backdrop">
        <div className="decision-modal">
          <button className="close-button" onClick={() => setSelectedRegion(null)}>
            ×
          </button>

          <h2>{selectedRegion.name}</h2>
          <p className="region-description">{selectedRegion.description}</p>

          <div className="character-row">
            {selectedRegion.characters.map((character) => (
              <div className="character-card" key={character.image}>
                <div className="dialogue-box">
                  {personalize(character.quote)}
                </div>
                <img src={character.image} alt="" className="character-image" />
              </div>
            ))}
          </div>

          <h3>What is your decision?</h3>

          <div className="decision-buttons">
            {selectedRegion.actions.map((action) => (
              <button
                className="management-option"
                key={action.label}
                onClick={() => applyAction(action)}
              >
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

      {researchPopup && (
        <div className="research-backdrop">
          <div className="research-modal">
            <h2>{researchPopup.title}</h2>

            <p>{researchPopup.note}</p>

            <button onClick={() => setResearchPopup(null)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {showIntro && (
        <div className="intro-backdrop">
          <div className="intro-modal">
            <img src="/logo.png" alt="Green Island logo" className="intro-logo" />
            <h1>Green Island</h1>
            <p>
              Congratulations, {username}! You are now the mayor of Green Island! The future of this vast land is now in your hands. You have the power to manage the island’s environment and economy, making sure that you keep these things in balance. If your climate score is too low, bad things might happen, so make sure you keep that in check. Over the next 8 years, you will be presented with many decisions that have benefits and consequences; I hope that you will converse with your citizens and listen to their needs throughout your term. Good luck!
            </p>
            <button onClick={() => setShowIntro(false)}>Begin</button>
          </div>
        </div>
      )}
      {showCorporateEvent && (
      <div className="decision-backdrop">
        <div className="decision-modal">
          <h2>Corporate Expansion Proposal</h2>

          <p className="region-description">
            It is now your 8th year as Mayor, and Green Island has reached a turning point. Evil Corp wants permission to
            build data centers across the island, while citizens worry about the
            company's growing influence.
          </p>

          <div className="character-row">
            <div className="character-card">
              <div className="dialogue-box">
                Hello {username}, it is finally time I make my acquaintance with you. As the CEO of Evil Corp, I am prepared to invest heavily in Green Island. With your approval, we can build enormous data centers all across the island in an effort to make this island a technological powerhouse. All I need is your signature. Trust me, you will benefit greatly from this as well.
              </div>
              <img src="/characters/ceo.png" alt="" className="character-image" />
            </div>

            <div className="character-card">
              <div className="dialogue-box">
                {username}, I am coming to you as a concerned citizen. Evil Corp has too much power over our resources and the environment, and if they keep up their terrible practices we may have no Green Island in the future! If we do not set limits on corporations like this, who will actually control Green Island?
              </div>
              <img src="/characters/citizen.png" alt="" className="character-image" />
            </div>
          </div>

          <h3>What is your decision?</h3>

          <div className="decision-buttons">
            <button
              className="management-option"
              onClick={() => handleCorporateDecision("evil-corp")}
            >
              <strong>Give Permission to Evil Corp</strong>
              <span>Gain major revenue, but lower your climate score significantly.</span>
            </button>

            <button
              className="management-option"
              onClick={() => handleCorporateDecision("regulation")}
            >
              <strong>Regulate Corporations</strong>
              <span>Lose money now, but protect the island's future.</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {showSources && (
      <div className="sources-backdrop">
        <div className="sources-modal">
          <button className="close-button" onClick={() => setShowSources(false)}>
            ×
          </button>

          <h2>Sources</h2>

          <ul>
            <li>Fishinfo - Fisheries and Aquaculture, www.fao.org/fishery/en/fishinfo. Accessed 25 June 2026.</li>
            <li>Hydropower Program | Department of Energy, www.energy.gov/cmei/water/hydropower-program. Accessed 25 June 2026.</li>
            <li>New Fossil Fuels 'incompatible’ with 1.5C Goal, Comprehensive Analysis Finds - Carbon Brief, www.carbonbrief.org/new-fossil-fuels-incompatible-with-1-5c-goal-comprehensive-analysis-finds/. Accessed 25 June 2026.</li>
            <li>Oil Security and Emergency Response - about - IEA, www.iea.org/about/oil-security-and-emergency-response. Accessed 25 June 2026.</li>
            <li>Our Mission and What We Do | US EPA, www.epa.gov/aboutepa/our-mission-and-what-we-do. Accessed 25 June 2026.</li>
            <li>Rising Sea Levels Creating First Native American Climate Refugees | Sciencedaily, www.sciencedaily.com/releases/2017/10/171023132006.htm. Accessed 25 June 2026.</li>
            <li>‘Roadmap’ Shows the Environmental Impact of AI Data Center Boom | Cornell Chronicle, news.cornell.edu/stories/2025/11/roadmap-shows-environmental-impact-ai-data-center-boom. Accessed 25 June 2026.</li>

          </ul>
        </div>
      </div>
    )}

    {gameComplete && (
      <div className="final-backdrop">
        <div className="final-modal">
          <h1>Congratulations {username} on completing your tenure as mayor!</h1>

          <p>
            For eight years, you balanced economic development with environmental
            stewardship. Every decision shaped the future of Green Island.
          </p>

          <div className="report-card">
            <section>
              <h2>Climate Report</h2>
              <h3>Climate Score: {stats.climateScore}/100</h3>
              <p>{getClimateReport()}</p>
            </section>

            <section>
              <h2>Economic Report</h2>
              <h3>Treasury: ${stats.money}</h3>
              <p>{getMoneyReport()}</p>
            </section>

            <section>
              <h2>Final Reflection</h2>
              <p>
                There is no single correct way to manage Green Island. Every choice
                involved competing interests and tradeoffs
                between economic growth and environmental protection. Play again and see what new decisions you can make!
              </p>
            </section>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("green-island-username");
              setUsername(null);
            }}
          >
            Return to Login
          </button>
          <button onClick={() => setShowSources(true)}>
            See Sources
          </button>
        </div>
      </div>
    )}

    </main>
  );
}