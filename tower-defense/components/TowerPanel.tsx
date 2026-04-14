'use client';
import { PlayerId } from '../lib/gameEngine';

interface TowerPanelProps {
  gold: number;
  playerId?: PlayerId;
  onSelectTower: (type: string) => void;
  selectedTowerType: string | null;
}

export default function TowerPanel({ gold, onSelectTower, selectedTowerType }: TowerPanelProps) {
  const towers = [
    { type: 'basic', cost: 50, name: 'Basic Tower', damage: 10 },
    { type: 'sniper', cost: 120, name: 'Sniper Tower', damage: 30 },
  ];

  return (
    <div className="bg-[#1e1e2f] border border-white/10 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">Towers</h2>
      <p className="text-sm text-gray-400">Select a tower to deploy onto the map.</p>
      <div className="flex gap-2">
        {towers.map(t => (
          <button
            key={t.type}
            onClick={() => onSelectTower(t.type)}
            disabled={gold < t.cost}
            className={`flex-1 p-3 rounded border transition-all ${
              selectedTowerType === t.type 
                ? 'border-cyan-400 bg-cyan-900/30' 
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            } ${gold < t.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-semibold text-white">{t.name}</div>
            <div className="text-yellow-400 text-sm">{t.cost} G</div>
          </button>
        ))}
      </div>
    </div>
  );
}
