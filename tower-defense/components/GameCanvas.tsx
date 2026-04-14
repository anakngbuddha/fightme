'use client';
import { useEffect, useRef } from 'react';
import { GameState, GAME_WIDTH, GAME_HEIGHT, PlayerId } from '../lib/gameEngine';

interface GameCanvasProps {
  gameState: GameState;
  playerId?: PlayerId;
  onMapClick?: (x: number, y: number) => void;
}

export default function GameCanvas({ gameState, onMapClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.fillStyle = '#1e1e2f'; // dark vibrant background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#2d2d44';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for(let j=0; j<canvas.height; j+=40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Draw paths depending on player view, for simplicity, horizontal across the middle
    ctx.fillStyle = '#3e3e50';
    ctx.fillRect(0, canvas.height / 2 - 20, canvas.width, 40);

    // Bases
    // Player1 Base (Left)
    ctx.fillStyle = '#00ffcc'; // neon cyan
    ctx.fillRect(0, canvas.height / 2 - 40, 40, 80);
    // Player2 Base (Right)
    ctx.fillStyle = '#ff3366'; // neon pink
    ctx.fillRect(canvas.width - 40, canvas.height / 2 - 40, 40, 80);

    // Draw Towers
    gameState.towers.forEach(t => {
      ctx.fillStyle = t.ownerId === 'player1' ? '#00ffcc' : '#ff3366';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw range (subtle)
      ctx.strokeStyle = t.ownerId === 'player1' ? 'rgba(0, 255, 204, 0.2)' : 'rgba(255, 51, 102, 0.2)';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Enemies
    gameState.enemies.forEach(e => {
      ctx.fillStyle = e.ownerId === 'player1' ? '#ff3366' : '#00ffcc';
      ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
      
      // Health bar
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x - 10, e.y - 15, 20, 3);
      ctx.fillStyle = 'green';
      ctx.fillRect(e.x - 10, e.y - 15, 20 * (e.health / e.maxHealth), 3);
    });

  }, [gameState]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onMapClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onMapClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      onClick={handleClick}
      className="border border-white/20 rounded shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full max-w-[800px] aspect-[4/3]"
    />
  );
}
