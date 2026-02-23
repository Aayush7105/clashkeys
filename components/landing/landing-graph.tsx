import WpmGraph from "../soloplay/wpmgraph";

const staticWpmData = [
  52, 61, 48, 73, 66, 58, 81, 69, 74, 55, 88, 62, 79, 71, 93, 64, 84, 59, 97,
  68, 76, 53, 90, 72, 85, 60, 99, 70,
];

const staticRawWpmData = [
  58, 68, 54, 80, 72, 65, 89, 75, 82, 61, 96, 69, 87, 77, 101, 71, 92, 66, 105,
  75, 84, 60, 98, 79, 94, 67, 108, 78,
];

const staticBurstWpmData = [
  85, 110, 95, 130, 118, 102, 145, 120, 138, 100, 160, 108, 150, 125, 175, 112,
  155, 98, 190, 120, 142, 92, 170, 128, 158, 105, 200, 118,
];

const staticErrorPoints = [
  { second: 2, wpm: 48 },
  { second: 5, wpm: 58 },
  { second: 9, wpm: 55 },
  { second: 11, wpm: 62 },
  { second: 15, wpm: 64 },
  { second: 17, wpm: 59 },
  { second: 21, wpm: 53 },
  { second: 24, wpm: 60 },
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
