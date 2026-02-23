import WpmGraph from "../soloplay/wpmgraph";

const staticWpmData = [
  62, 85, 50, 96, 70, 58, 108, 66, 90, 55, 112, 72, 84, 118, 64, 100, 74, 126,
  68, 92, 80, 110, 60, 122,
];

const staticRawWpmData = [
  74, 96, 63, 88, 82, 69, 100, 78, 101, 67, 104, 84, 95, 109, 77, 92, 88, 115,
  81, 103, 94, 101, 73, 111,
];

const staticBurstWpmData = [
  125, 110, 78, 155, 92, 75, 170, 85, 140, 70, 185, 95, 120, 175, 88, 150, 96,
  205, 90, 135, 108, 165, 82, 210,
];

const staticErrorPoints = [
  { second: 2, wpm: 50 },
  { second: 5, wpm: 58 },
  { second: 9, wpm: 55 },
  { second: 14, wpm: 64 },
];
export default function LandingGraph() {
  return (
    <div className="space-y-4 lg:w-[calc(100%+2rem)] lg:-ml-8">
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
