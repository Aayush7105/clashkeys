import { RotateCcw, Play, Trophy, Settings } from "lucide-react";

const Shortcuts = () => {
    const shortcuts = [
  {
    keys: ["Tab", "Enter"],
    action: "restart test",
  },
  
];
  return (
      <div className="flex items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500 mt-12">
        {shortcuts.map((shortcut, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, index) => (
                <div key={key} className="flex items-center gap-1">
                  <kbd className="rounded bg-neutral-700 px-2 py-0.5 text-[11px] font-medium text-neutral-300 shadow-sm">
                    {key}
                  </kbd>

                  {index !== shortcut.keys.length - 1 && (
                    <span className="text-neutral-600">+</span>
                  )}
                </div>
              ))}
            </div>

            <span className="text-neutral-500">—</span>

            <span className="text-neutral-500 text-[11px]">{shortcut.action}</span>
          </div>
        ))}
      </div>
  );
}

export default Shortcuts
