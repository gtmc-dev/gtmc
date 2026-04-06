"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import { CornerBrackets } from "@/components/ui/corner-brackets"

type StyleWritable = {
  style: {
    setProperty: (property: string, value: string, priority?: string) => void
  }
}

type FlyControls = {
  overlayElement?: StyleWritable | null
  setOverlayVisible?: () => void
  setKeybinds?: (keybinds: { down: string }) => void
  lock?: () => void
}

type CameraManager = {
  flyControls?: FlyControls | null
  disableFlyControls?: () => void
  enableFlyControls?: () => void
  isFlyControlsEnabled?: () => boolean
  focusOnSchematics?: () => void
}

type SchematicRecord = {
  id?: string
}

type SchematicDimensions = {
  x: number
  y: number
  z: number
}

type SchematicManager = {
  loadSchematic: (fileName: string, data: ArrayBuffer) => Promise<void>
  getFirstSchematic?: () => SchematicRecord | null
  getMaxSchematicDimensions?: () => SchematicDimensions | null
}

type RenderManager = {
  render?: () => void
}

type RendererInstance = {
  uiManager?: {
    showFPVOverlay?: () => void
    fpvOverlay?: StyleWritable | null
  } | null
  cameraManager?: CameraManager | null
  schematicManager: SchematicManager
  renderManager?: RenderManager | null
  resetRenderingBounds: (schematicId: string, includeAll: boolean) => void
  setRenderingBounds: (
    schematicId: string,
    min: [number, number, number],
    max: [number, number, number],
    refresh: boolean
  ) => void
  dispose?: () => void
}

type RendererModule = {
  SchematicRenderer?: RendererConstructor
  default?: RendererConstructor | { SchematicRenderer?: RendererConstructor }
}

type RendererConstructor = new (
  canvas: HTMLCanvasElement,
  rendererOptions: Record<string, never>,
  packs: {
    default: () => Promise<Blob>
  },
  options: {
    showGrid: boolean
    backgroundColor: number
    meshBuildingMode: string
    ffmpeg: { terminate: () => void }
    cameraOptions: { position: [number, number, number] }
    callbacks: {
      onRendererInitialized: (renderer: RendererInstance) => Promise<void>
      onSchematicFileLoadFailure: (error: unknown) => void
    }
  }
) => RendererInstance

function resolveRendererConstructor(moduleValue: unknown): RendererConstructor | null {
  if (typeof moduleValue !== "object" || moduleValue === null) {
    return null
  }

  const mod = moduleValue as RendererModule

  if (typeof mod.SchematicRenderer === "function") {
    return mod.SchematicRenderer
  }

  if (typeof mod.default === "function") {
    return mod.default
  }

  if (
    typeof mod.default === "object" &&
    mod.default !== null &&
    typeof mod.default.SchematicRenderer === "function"
  ) {
    return mod.default.SchematicRenderer
  }

  return null
}

function normalizeUrlInput(input: string) {
  let value = input.replace(/\r?\n/g, "").trim().replace(/^['"]|['"]$/g, "")

  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(value)
      if (decoded === value) break
      value = decoded
    } catch {
      break
    }
  }

  return value
}

function suppressNativeFpOverlays(instance: RendererInstance | null) {
  const ui = instance?.uiManager
  const cm = instance?.cameraManager

  try {
    if (ui) {
      ui.showFPVOverlay = () => {}
      if (ui.fpvOverlay) {
        ui.fpvOverlay.style.setProperty("display", "none", "important")
        ui.fpvOverlay.style.setProperty("pointer-events", "none", "important")
        ui.fpvOverlay.style.setProperty("opacity", "0", "important")
      }
    }

    if (cm?.flyControls) {
      cm.flyControls.setOverlayVisible = () => {}
      if (cm.flyControls.overlayElement) {
        cm.flyControls.overlayElement.style.setProperty(
          "display",
          "none",
          "important"
        )
        cm.flyControls.overlayElement.style.setProperty(
          "pointer-events",
          "none",
          "important"
        )
        cm.flyControls.overlayElement.style.setProperty("opacity", "0", "important")
      }
    }
  } catch {
    // Keep rendering resilient even if internals change.
  }
}

export interface LitematicaViewerProps {
  url: string
  height?: string | number
}

export default function LitematicaViewer({
  url,
  height = 400,
}: LitematicaViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<RendererInstance | null>(null)
  const schematicIdRef = useRef<string | null>(null)

  const [maxLayer, setMaxLayer] = useState(0)
  const [sliderLayer, setSliderLayer] = useState(0)
  const [targetLayer, setTargetLayer] = useState<number | "all">("all")
  const [layerMode, setLayerMode] = useState<"single" | "below">("below")
  const [schematicReady, setSchematicReady] = useState(false)
  const [isFlyMode, setIsFlyMode] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    setSchematicReady(false)
    schematicIdRef.current = null
    setIsFlyMode(false)

    const cleanUrl = normalizeUrlInput(url)
    let renderer: RendererInstance | null = null

    const proxyUrl = `/api/litematica-download?${new URLSearchParams({
      url: cleanUrl,
      ts: String(Date.now()),
    }).toString()}`

    const initRenderer = async () => {
      try {
        const mod = await import("schematic-renderer")
        const SR = resolveRendererConstructor(mod)

        if (typeof SR !== "function") {
          throw new Error("SchematicRenderer constructor not found in module exports")
        }

        renderer = new SR(
          canvasRef.current!,
          {},
          {
            default: async () => {
              const res = await fetch("/pack.zip")
              return await res.blob()
            },
          },
          {
            showGrid: true,
            backgroundColor: 0xf8f9fc,
            meshBuildingMode: "incremental",
             ffmpeg: { terminate: () => {} },
             cameraOptions: { position: [10, 10, 10] },
             callbacks: {
               onRendererInitialized: async (r: RendererInstance) => {
                 try {
                   suppressNativeFpOverlays(r)

                  const res = await fetch(proxyUrl, { cache: "no-store" })
                  if (!res.ok) {
                    throw new Error("Failed to fetch proxy: " + res.status)
                  }
                  const arrayBuffer = await res.arrayBuffer()

                  const fileName = cleanUrl.split("/").pop() || "schem.litematic"
                  await r.schematicManager.loadSchematic(fileName, arrayBuffer)

                  const schematicObj = r.schematicManager.getFirstSchematic?.()
                  schematicIdRef.current = schematicObj?.id || fileName

                  const dim = r.schematicManager.getMaxSchematicDimensions?.()
                  if (dim) {
                    const topLayer = Math.max(0, Math.ceil(dim.y) - 1)
                    setMaxLayer(topLayer)
                    setSliderLayer(topLayer)
                  }

                  r.cameraManager?.focusOnSchematics?.()
                  suppressNativeFpOverlays(r)
                  setSchematicReady(true)
                 } catch (err) {
                   console.error("Error loading schematic:", err)
                 }
               },
               onSchematicFileLoadFailure: (err: unknown) => {
                 console.error("Failed to load schematic file:", err)
               },
             },
          }
        )

        rendererRef.current = renderer
      } catch (e) {
        console.error("Error setting up schematic-renderer:", e)
      }
    }

    const handlePointerLockChange = () => {
      const current = rendererRef.current
      if (!current) return

      suppressNativeFpOverlays(current)

      const cm = current.cameraManager
      const locked = Boolean(document.pointerLockElement)
      if (!locked) {
        if (
          cm &&
          typeof cm.disableFlyControls === "function" &&
          cm.isFlyControlsEnabled?.()
        ) {
          cm.disableFlyControls()
        }
      }

      setIsFlyMode(locked)
    }

    document.addEventListener("pointerlockchange", handlePointerLockChange)
    initRenderer()

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange)
      setSchematicReady(false)
      schematicIdRef.current = null
      setIsFlyMode(false)

      if (
        rendererRef.current?.cameraManager?.isFlyControlsEnabled?.() &&
        typeof rendererRef.current.cameraManager.disableFlyControls === "function"
      ) {
        rendererRef.current.cameraManager.disableFlyControls()
      }

      if (rendererRef.current && typeof rendererRef.current.dispose === "function") {
        rendererRef.current.dispose()
      }
    }
  }, [url])

  useEffect(() => {
    if (!schematicReady || !rendererRef.current || !schematicIdRef.current) {
      return
    }

    const renderer = rendererRef.current
    const sm = renderer.schematicManager
    if (!sm) return

    const dim = sm.getMaxSchematicDimensions?.()
    if (!dim) return

    const schematicId = schematicIdRef.current
    const maxX = Math.max(1, Math.ceil(dim.x))
    const maxY = Math.max(1, Math.ceil(dim.y))
    const maxZ = Math.max(1, Math.ceil(dim.z))

    if (targetLayer === "all") {
      renderer.resetRenderingBounds(schematicId, true)
    } else {
      const y = Math.max(0, Math.min(targetLayer, maxY - 1))

      if (layerMode === "single") {
        renderer.setRenderingBounds(
          schematicId,
          [0, y, 0],
          [maxX, y + 1, maxZ],
          false
        )
      } else {
        renderer.setRenderingBounds(
          schematicId,
          [0, 0, 0],
          [maxX, y + 1, maxZ],
          false
        )
      }
    }

    renderer.renderManager?.render?.()
  }, [schematicReady, targetLayer, layerMode])

  const commitLayerSelection = () => {
    if (!schematicReady) return
    setTargetLayer(sliderLayer)
  }

  const toggleFlyMode = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    const current = rendererRef.current
    if (!current?.cameraManager) return

    const cm = current.cameraManager
    suppressNativeFpOverlays(current)

    if (cm.isFlyControlsEnabled?.()) {
      cm.disableFlyControls?.()
      setIsFlyMode(false)
      return
    }

    cm.enableFlyControls?.()
    if (cm.flyControls) {
      cm.flyControls.setKeybinds?.({ down: "ShiftLeft" })
      cm.flyControls.lock?.()
    }
  }

  return (
    <div
      className="
      group relative my-8 w-full rounded-sm border-2 guide-line bg-tech-bg
      font-mono
    "
    >
      <CornerBrackets size="size-4" color="border-tech-main/40" />

      <canvas
        ref={canvasRef}
        className="block w-full outline-none"
        style={{
          cursor: isFlyMode ? "crosshair" : "pointer",
          height: typeof height === "number" ? height + "px" : height,
        }}
      />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={toggleFlyMode}
        className={`absolute top-4 right-4 z-20 border px-3 py-1 text-[11px] font-bold tracking-widest uppercase transition-colors ${
          isFlyMode
            ? "border-tech-main bg-tech-main text-white"
            : "border-tech-main/60 bg-white/90 text-tech-main hover:bg-tech-main hover:text-white"
        }`}
      >
        {isFlyMode ? "SYS.EXIT_FLY" : "SYS.FIRST_PERSON"}
      </button>

      <div
        className="
        pointer-events-none absolute top-4 left-4 flex items-center gap-3
      "
      >
        <span
          className="
          shrink-0 border border-tech-main/40 bg-white/70 px-2 py-0.5 text-xs
          font-bold tracking-wider text-tech-main shadow-sm backdrop-blur-sm
        "
        >
          [LITEMATICA]
        </span>
        <span
          className="
          hidden text-[10px] tracking-widest text-tech-main/80 uppercase
          md:inline-block
        "
        >
          INTERACTIVE BLUEPRINT
        </span>
      </div>

      {maxLayer > 0 && (
        <div
          className={`absolute right-4 bottom-16 z-10 w-[250px] border border-tech-main/60 bg-white/90 p-3 text-tech-main shadow-sm backdrop-blur-md transition-all ${
            isFlyMode ? "pointer-events-none translate-x-2 opacity-0" : "opacity-100"
          }`}
        >
          <div className="mb-2 flex items-center justify-between border-b guide-line pb-1">
            <span className="text-[10px] font-bold tracking-widest uppercase">
              SYS.LAYER_FILTER
            </span>

            <button
              type="button"
              onClick={() => {
                setTargetLayer("all")
                setSliderLayer(maxLayer)
              }}
              className="border border-tech-main/30 px-1.5 py-0.5 text-[10px] font-bold uppercase transition-colors hover:bg-tech-main hover:text-white"
            >
              RESET
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span>LAYER {targetLayer === "all" ? "ALL" : targetLayer}</span>
            {targetLayer !== "all" && targetLayer !== sliderLayer && (
              <span className="text-[10px] opacity-70">PENDING {sliderLayer}</span>
            )}
          </div>

          <div className="mb-3 flex border border-tech-main/40 text-[10px] font-bold uppercase">
            <button
              type="button"
              onClick={() => setLayerMode("single")}
              className={`flex-1 py-1 transition-colors ${
                layerMode === "single"
                  ? "bg-tech-main text-white"
                  : "bg-white text-tech-main hover:bg-tech-main/10"
              }`}
            >
              SINGLE
            </button>

            <button
              type="button"
              onClick={() => setLayerMode("below")}
              className={`flex-1 border-l border-tech-main/40 py-1 transition-colors ${
                layerMode === "below"
                  ? "bg-tech-main text-white"
                  : "bg-white text-tech-main hover:bg-tech-main/10"
              }`}
            >
              BELOW
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={maxLayer}
            value={sliderLayer}
            onChange={(e) => setSliderLayer(Number(e.target.value))}
            onPointerUp={commitLayerSelection}
            onMouseUp={commitLayerSelection}
            onTouchEnd={commitLayerSelection}
            onKeyUp={commitLayerSelection}
            className="w-full cursor-ew-resize"
            data-litematica-layer-slider="true"
          />

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={commitLayerSelection}
              className="border border-tech-main px-2 py-0.5 text-[10px] font-bold uppercase transition-colors hover:bg-tech-main hover:text-white"
            >
              APPLY
            </button>
          </div>
        </div>
      )}

      <div
        className="
        pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2
        opacity-80 transition-opacity duration-300
        group-hover:opacity-100
      "
      >
        <div
          className="
          flex items-center gap-4 rounded-sm border guide-line bg-white/80 px-3
          py-1.5 text-xs whitespace-nowrap text-tech-main/80 shadow-sm
          backdrop-blur-md
        "
        >
          {isFlyMode ? (
            <>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  WASD
                </kbd>{" "}
                Move
              </span>
              <span className="flex items-center gap-1.5 opacity-60">|</span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  SPACE
                </kbd>{" "}
                Up
              </span>
              <span className="flex items-center gap-1.5 opacity-60">|</span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  SHIFT
                </kbd>{" "}
                Down
              </span>
              <span className="flex items-center gap-1.5 opacity-60">|</span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  ESC
                </kbd>{" "}
                Unlock
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  Left
                </kbd>{" "}
                Rotate
              </span>
              <span className="flex items-center gap-1.5 opacity-60">|</span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  Right
                </kbd>{" "}
                Pan
              </span>
              <span className="flex items-center gap-1.5 opacity-60">|</span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[2px] border border-tech-main/30 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-tech-main shadow-sm">
                  Wheel
                </kbd>{" "}
                Zoom
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
