'use client';

interface WavePanelProps {
  gold: number;
  onSendWave: (type: string, count: number) => void;
}

export default function WavePanel({ gold, onSendWave }: WavePanelProps) {
  const enemies = [
    { type: 'grunt', cost: 20, name: 'Grunt', count: 3 },
    { type: 'brute', cost: 100, name: 'Brute', count: 1 },
  ];

  return (
    <div className="bg-[#1e1e2f] border border-white/10 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Waves</h2>
      <p className="text-sm text-gray-400">Send enemies to attack your opponent.</p>
      <div className="flex gap-2">
        {enemies.map(e => (
          <button
            key={e.type}
            onClick={() => onSendWave(e.type, e.count)}
            disabled={gold < e.cost}
            className={`flex-1 p-3 rounded border transition-all border-white/10 bg-white/5 hover:bg-white/10 ${
              gold < e.cost ? 'opacity-50 cursor-not-allowed' : 'hover:border-pink-400 hover:bg-pink-900/30'
            }`}
          >
            <div className="font-semibold text-white">{e.name}x{e.count}</div>
            <div className="text-yellow-400 text-sm">{e.cost} G</div>
          </button>
        ))}
      </div>
    </div>
  );
}
