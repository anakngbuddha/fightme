'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { pusherClient } from '../../../lib/pusher';
import { GameState, INITIAL_STATE, PlayerId, updateGameState } from '../../../lib/gameEngine';
import GameCanvas from '../../../components/GameCanvas';
import TowerPanel from '../../../components/TowerPanel';
import WavePanel from '../../../components/WavePanel';
import { v4 as uuidv4 } from 'uuid';

export default function GamePage({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  const searchParams = useSearchParams();
  const playerId = (searchParams.get('player') as PlayerId) || 'player2';
  
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  
  // Use a ref for the game loop to avoid dependency cycles with state
  const stateRef = useRef<GameState>(INITIAL_STATE);
  stateRef.current = gameState;

  const lastTimeRef = useRef<number>(Date.now());
  const requestRef = useRef<number>();

  useEffect(() => {
    // 1. Subscribe to presence channel
    const channelName = `presence-room-${roomId}`;
    const channel = pusherClient.subscribe(channelName);
    
    channel.bind('pusher:subscription_succeeded', () => {
      // If player2 joined, they signify to player1
      if (playerId === 'player2') {
        fetch('/api/join-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, playerId })
        });
      }
    });

    channel.bind('player-joined', (data: unknown) => {
      console.log('Player joined', data);
    });

    channel.bind('tower-placed', (data: { playerId: string; towerId: string; x: number; y: number; }) => {
      // Add the other player's tower
      const { playerId: sourcePlayerId, towerId, x, y } = data;
      if (sourcePlayerId !== playerId) {
         setGameState(prev => ({
           ...prev,
           towers: [
             ...prev.towers,
             { id: towerId, ownerId: sourcePlayerId as PlayerId, x, y, range: 100, damage: 10, cooldown: 1000, lastFired: 0 }
           ]
         }));
      }
    });

    channel.bind('wave-sent', (data: { playerId: string; enemies: { type: string; id: string; ownerId: string }[] }) => {
      const { playerId: sourcePlayerId, enemies } = data;
      if (sourcePlayerId !== playerId) {
        // Enforce incoming enemies spawning rules
        // If player1 sends an enemy, it spawns at x=0. 
        // If player2 sends an enemy, it spawns at x=800.
        const spawnX = sourcePlayerId === 'player1' ? 0 : 800;
        const mappedEnemies = enemies.map((e: { type: string; id: string; ownerId: string }) => ({
          ...e,
          ownerId: e.ownerId as PlayerId,
          x: spawnX,
          y: 300, // middle lane roughly
          health: e.type === 'brute' ? 100 : 30,
          maxHealth: e.type === 'brute' ? 100 : 30,
          speed: e.type === 'brute' ? 0.05 : 0.1,
          reward: e.type === 'brute' ? 20 : 5
        }));

        setGameState(prev => ({
          ...prev,
          enemies: [...prev.enemies, ...mappedEnemies]
        }));
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [roomId, playerId]);

  // Game Loop
  useEffect(() => {
    const loop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setGameState(prev => updateGameState(prev, deltaTime));
      
      requestRef.current = requestAnimationFrame(loop);
    };
    
    // Start loop
    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const handleMapClick = (x: number, y: number) => {
    if (!selectedTower) return;
    
    const cost = selectedTower === 'sniper' ? 120 : 50;
    if (gameState[playerId].gold < cost) return;

    // Local deduction & optimistic UI update
    const towerId = uuidv4();
    setGameState(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], gold: prev[playerId].gold - cost },
      towers: [
        ...prev.towers,
        { id: towerId, ownerId: playerId, x, y, range: selectedTower === 'sniper' ? 200 : 100, damage: selectedTower === 'sniper' ? 30 : 10, cooldown: selectedTower === 'sniper' ? 2000 : 1000, lastFired: 0 }
      ]
    }));

    setSelectedTower(null);

    // Broadcast
    fetch('/api/place-tower', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId, towerId, x, y })
    });
  };

  const handleSendWave = (type: string, count: number) => {
    const cost = type === 'brute' ? 100 : 20;
    if (gameState[playerId].gold < cost) return;

    setGameState(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], gold: prev[playerId].gold - cost }
    }));

    fetch('/api/send-wave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId, enemyType: type, count })
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f16] flex flex-col p-4 text-white">
      <header className="flex justify-between items-center bg-[#1e1e2f] p-4 rounded-xl border border-white/10 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Room: {roomId}</h1>
          <p className="text-gray-400 text-sm">You are playing as <span className="font-mono text-white">{playerId}</span></p>
        </div>
        
        <div className="flex gap-8 items-center text-center">
          <div>
            <div className={`text-3xl font-extrabold ${playerId === 'player1' ? 'text-cyan-400' : 'text-pink-400'}`}>
              {Math.floor(gameState[playerId].health)} HP
            </div>
            <div className="text-sm text-gray-500">Your Base</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-yellow-400">
              {Math.floor(gameState[playerId].gold)} G
            </div>
            <div className="text-sm text-gray-500">Resources</div>
          </div>
          <div>
            <div className={`text-3xl font-extrabold ${playerId === 'player1' ? 'text-pink-400' : 'text-cyan-400'}`}>
              {Math.floor(gameState[playerId === 'player1' ? 'player2' : 'player1'].health)} HP
            </div>
            <div className="text-sm text-gray-500">Enemy Base</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-6 items-start justify-center max-w-7xl mx-auto w-full">
        <div className="flex-1 flex justify-center w-full">
          <GameCanvas 
            gameState={gameState} 
            playerId={playerId} 
            onMapClick={handleMapClick} 
          />
        </div>
        
        <aside className="w-80 flex flex-col gap-6">
          <TowerPanel 
            gold={gameState[playerId].gold} 
            playerId={playerId} 
            onSelectTower={setSelectedTower} 
            selectedTowerType={selectedTower} 
          />
          <WavePanel 
            gold={gameState[playerId].gold} 
            onSendWave={handleSendWave} 
          />
        </aside>
      </main>
    </div>
  );
}
