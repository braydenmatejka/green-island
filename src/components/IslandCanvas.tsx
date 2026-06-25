import type { MapTile, Region } from "../data/tiles";

type Props = {
  width: number;
  height: number;
  map: MapTile[];
  colors: Record<string, string>;
  hoveredRegionId: string | null;
  setHoveredRegionId: (id: string | null) => void;
  getRegion: (regionId?: string) => Region | null;
  onSelectRegion: (region: Region) => void;
};

export default function IslandCanvas({
  width,
  height,
  map,
  colors,
  hoveredRegionId,
  setHoveredRegionId,
  getRegion,
  onSelectRegion,
}: Props) {
  const canvasSize = 720;
  const tileSize = canvasSize / width;

  function draw(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    map.forEach((tile, index) => {
      const x = index % width;
      const y = Math.floor(index / width);

      ctx.fillStyle = colors[tile.type];
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

      if (hoveredRegionId && tile.regionId === hoveredRegionId) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    });
  }

  function getTileFromMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const x = Math.floor((mouseX / rect.width) * width);
    const y = Math.floor((mouseY / rect.height) * height);

    return map[y * width + x];
  }

  return (
    <canvas
      ref={draw}
      width={canvasSize}
      height={canvasSize}
      className="island-canvas"
      onMouseMove={(event) => {
        const tile = getTileFromMouse(event);
        setHoveredRegionId(tile?.regionId ?? null);
      }}
      onMouseLeave={() => setHoveredRegionId(null)}
      onClick={(event) => {
        const tile = getTileFromMouse(event);
        const region = getRegion(tile?.regionId);
        if (region) onSelectRegion(region);
      }}
    />
  );
}