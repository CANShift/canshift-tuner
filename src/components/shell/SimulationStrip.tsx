import { useDeviceStore } from '../../stores/device.store'

export const SimulationStrip = () => {
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const exitSimulation = useDeviceStore((s) => s.exitSimulation)
  if (!simulationMode) return null
  return (
    <div
      role="status"
      className="flex shrink-0 items-center gap-3.5 bg-ui-accent px-5 py-2.5 font-mono text-[11.5px] tracking-[0.14em] text-white"
    >
      <span aria-hidden="true" className="block size-[7px] bg-white" />
      <span>MODE SIMULATION ACTIVATED</span>
      <span className="tracking-[0.06em] opacity-75">
        editing a config without a board · burning is disabled
      </span>
      <button
        type="button"
        onClick={exitSimulation}
        className="ml-auto cursor-pointer border border-white/50 bg-transparent px-2.5 py-1 font-[inherit] text-[10.5px] tracking-[0.14em] text-white hover:bg-white/10"
      >
        TURN OFF
      </button>
    </div>
  )
}
