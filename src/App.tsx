import { useState } from "react";
import "./App.css";
import type { MapTile, Region, TileAction, TileType } from "./data/tiles";
import { regions } from "./data/tiles";
import IslandCanvas from "./components/IslandCanvas";
import { useEffect} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import AuthBox from "./components/AuthBox";

type IslandStats = {
  year: number;
  money: number;
  population: number;
  happiness: number;
  environment: number;
  energy: number;
  climateRisk: number;
};

const startingStats: IslandStats = {
  year: 1,
  money: 50,
  population: 20,
  happiness: 60,
  environment: 80,
  energy: 20,
  climateRisk: 10,
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
  city: "#7e62ad",
};

const labels: Record<TileType, string> = {
  ocean: "Ocean",
  grass: "Grassland",
  forest: "Forest",
  "forest-cut": "Cut Forest",
  "forest-protected": "Protected Forest",
  oil: "Oil Field",
  "oil-drilled": "Drilled Oil Field",
  "ocean-overfished": "Overfished Ocean",
  ice: "Polar Ice Caps",
  river: "River",
  city: "City",
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

  function ellipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    type: TileType,
    regionId?: string
  ) {
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) {
          setTile(x, y, type, regionId);
        }
      }
    }
  }

  function rect(
    x0: number,
    y0: number,
    width: number,
    height: number,
    type: TileType,
    regionId?: string
  ) {
    for (let y = y0; y < y0 + height; y++) {
      for (let x = x0; x < x0 + width; x++) {
        setTile(x, y, type, regionId);
      }
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

  // Interactable ocean regions
  rect(0, 0, 64, 128, getRegionType("ocean-west", "ocean"), "ocean-west");
  rect(64, 0, 64, 128, getRegionType("ocean-east", "ocean"), "ocean-east");

  // Ice caps
  ellipse(64, -10, 58, 24, "ice");
  ellipse(64, 138, 58, 26, "ice");

 // Main island body: asymmetric organic shape
ellipse(58, 61, 35, 42, "grass");
ellipse(36, 49, 21, 30, "grass");
ellipse(88, 46, 28, 24, "grass");
ellipse(45, 84, 27, 24, "grass");
ellipse(82, 80, 31, 28, "grass");
ellipse(95, 63, 15, 25, "grass");

// irregular bumps / peninsulas
ellipse(22, 91, 10, 16, "grass");
ellipse(95, 103, 18, 9, "grass");
ellipse(114, 84, 9, 14, "grass");

  // River from north to city/south
  line(
    [
      { x: 68, y: 22 },
      { x: 66, y: 36 },
      { x: 61, y: 48 },
      { x: 58, y: 60 },
      { x: 67, y: 70 },
      { x: 82, y: 78 },
      { x: 84, y: 90 },
      { x: 75, y: 100 },
    ],
    2,
    "river"
  );

  // City near southern river mouth
  ellipse(61, 94, 9, 8, "city");

  // Forests
  ellipse(36, 36, 15, 13, getRegionType("forest-northwest", "forest"), "forest-northwest");
  ellipse(45, 46, 10, 15, getRegionType("forest-northwest", "forest"), "forest-northwest");
  ellipse(35, 56, 10, 15, getRegionType("forest-northwest", "forest"), "forest-northwest");

  ellipse(65, 78, 23, 13, getRegionType("forest-south", "forest"), "forest-south");

  // Oil fields
  ellipse(62, 24, 10, 7, getRegionType("oil-north", "oil"), "oil-north");

  ellipse(105, 49, 8, 8, getRegionType("oil-south", "oil"), "oil-south");

  return map;
}

export default function App() {
  const [stats, setStats] = useState<IslandStats>(startingStats);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saveId, setSaveId] = useState<string | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [regionStates, setRegionStates] = useState<Record<string, TileType>>({});
  const [lastAction, setLastAction] = useState(
    "Click a forest, oil field, or ocean region to manage it."
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadGame(currentUser: User) {
  const { data, error } = await supabase
    .from("game_saves")
    .select("*")
    .eq("user_id", currentUser.id)
    .single();

  if (error || !data) return;

  setStats(data.stats);
  setRegionStates(data.region_states ?? {});
  setLastAction(data.last_action ?? "Loaded saved game.");
  setSaveId(data.id);
}

useEffect(() => {
  if (user) {
    loadGame(user);
  }
}, [user]);

async function saveGame() {
  if (!user) return;

  const saveData = {
    user_id: user.id,
    profile_name: user.email,
    stats,
    region_states: regionStates,
    last_action: lastAction,
    updated_at: new Date().toISOString(),
  };

  if (saveId) {
    await supabase.from("game_saves").update(saveData).eq("id", saveId);
  } else {
    const { data } = await supabase
      .from("game_saves")
      .insert(saveData)
      .select()
      .single();

    if (data) setSaveId(data.id);
  }

  setLastAction("Game saved.");
}

  const islandMap = makeMap(regionStates);

  function getRegion(regionId?: string) {
    return regions.find((region) => region.id === regionId) ?? null;
  }

  function applyAction(action: TileAction) {
    if (!selectedRegion) return;

    setStats((s) => ({
      year: s.year + 1,
      money: s.money + (action.effects.money ?? 0),
      population: s.population,
      happiness: clamp(s.happiness + (action.effects.happiness ?? 0)),
      environment: clamp(s.environment + (action.effects.environment ?? 0)),
      energy: clamp(s.energy + (action.effects.energy ?? 0)),
      climateRisk: clamp(s.climateRisk + (action.effects.climateRisk ?? 0)),
    }));

    if (action.resultingType) {
      setRegionStates((current) => ({
        ...current,
        [selectedRegion.id]: action.resultingType!,
      }));
    }

    setLastAction(`${selectedRegion.name}: ${action.description}`);
    setSelectedRegion(null);
  }
  
  if (!user) {
    return (
      <main className="login-screen">
        <AuthBox />
      </main>
    );
  } 

  return (
    <main className="game-shell">
      <aside className="sidebar">
        <h1>Green Island</h1>
        <p>Manage resources wisely for a thriving and sustainable future.</p>

        <div className="save-controls">
          <button onClick={saveGame}>Save Game</button>
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>


        <div className="stats-card">
          <p>
            <span>Year:</span> <strong>{stats.year}</strong>
          </p>
          <p>
            <span>Money:</span> <strong>${stats.money}</strong>
          </p>
          <p>
            <span>Population:</span> <strong>{stats.population}</strong>
          </p>
          <p>
            <span>Happiness:</span> <strong>{stats.happiness}</strong>
          </p>
          <p>
            <span>Environment:</span> <strong>{stats.environment}</strong>
          </p>
          <p>
            <span>Energy:</span> <strong>{stats.energy}</strong>
          </p>
          <p>
            <span>Climate Risk:</span> <strong>{stats.climateRisk}</strong>
          </p>
        </div>

        <div className="legend">
          <h2>Map Legend</h2>
          {Object.entries(labels).map(([type, label]) => (
            <div className="legend-row" key={type}>
              <span
                className="legend-swatch"
                style={{ background: colors[type as TileType] }}
              />
              {label}
            </div>
          ))}
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
          onSelectRegion={setSelectedRegion}
        />
      </section>

      {selectedRegion && (
        <aside className="region-panel">
          <button
            className="close-button"
            onClick={() => setSelectedRegion(null)}
          >
            ×
          </button>

          <div className="region-title-row">
            <span
              className="large-swatch"
              style={{
                background:
                  colors[regionStates[selectedRegion.id] ?? selectedRegion.type],
              }}
            />
            <h2>{selectedRegion.name}</h2>
          </div>

          <p>{selectedRegion.description}</p>

          <h3>Management Options</h3>

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
        </aside>
      )}
    </main>
  );
}