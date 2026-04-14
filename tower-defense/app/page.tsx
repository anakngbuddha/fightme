'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LobbyPage() {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-room', { method: 'POST' });
      const data = await res.json();
      if (data.roomId) {
        // Player 1 creates the room
        router.push(`/game/${data.roomId}?player=player1`);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!roomIdInput) return;
    setLoading(true);
    // Player 2 joins the room
    router.push(`/game/${roomIdInput}?player=player2`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f16] flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f0f16] to-[#0f0f16]"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#1e1e2f]/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Nexus Duel</h1>
          <p className="text-gray-400">Serverless Tower Defense</p>
        </div>

        <button 
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-bold transition-all shadow-lg hover:shadow-cyan-500/25"
        >
          {loading ? 'Creating...' : 'Create New Game'}
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-center tracking-widest placeholder:tracking-normal"
          />
          <button 
            onClick={handleJoinRoom}
            disabled={!roomIdInput || loading}
            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}
