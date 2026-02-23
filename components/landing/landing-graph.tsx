import WpmGraph from "../soloplay/wpmgraph";

const staticWpmData = [
  37, 42, 48, 54, 57, 61, 59, 63, 67, 65, 69, 72, 74, 73, 76, 78,
];
const staticRawWpmData = [
  40, 45, 51, 57, 61, 65, 63, 68, 71, 69, 73, 76, 77, 76, 79, 82,
];
const staticBurstWpmData = [
  44, 50, 56, 62, 66, 72, 64, 75, 79, 74, 81, 84, 83, 82, 86, 89,
];
const staticErrorPoints = [
  { second: 2, wpm: 48 },
  { second: 6, wpm: 59 },
  { second: 9, wpm: 65 },
  { second: 13, wpm: 73 },
];

export default function LandingGraph() {
  return (
    <div className="space-y-4 lg:w-[calc(100%+4rem)] lg:-ml-16">
      <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.25em] text-neutral-500">
        <span>WPM Preview</span>
        <span className="text-[#e2b714]">Static Data</span>
      </div>
      <WpmGraph
        wpmData={staticWpmData}
        rawWpmData={staticRawWpmData}
        burstWpmData={staticBurstWpmData}
        errorPoints={staticErrorPoints}
        durationSeconds={15}
        forceOneSecondXTicks
      />
    </div>
  );
}
