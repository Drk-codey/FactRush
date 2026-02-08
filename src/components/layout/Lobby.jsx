import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CATEGORIES, DIFFICULTIES } from '../../utils/constants';
import { BOT_PROFILES } from '../../lib/enhancedBotLogic';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Users, Play, Settings, Copy, CheckCircle, Bot, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lobby = () => {
  const { room, players, setRoom, setPlayers, updateSettings, addPlayer, setPhase } = useGameStore();
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);

  // Local state for dropdowns
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]);
  const [selectedDuration, setSelectedDuration] = useState(5); // Default 5 mins

  useEffect(() => {
    if (room && isHost) {
      updateSettings({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        duration: selectedDuration
      });
    }
  }, [selectedCategory, selectedDifficulty, selectedDuration, isHost]);

  const handleCreateRoom = () => {
    if (!username) return;
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom = {
      room_code: roomCode,
      host_name: username,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      duration: selectedDuration,
      status: 'LOBBY'
    };
    const hostPlayer = { id: 'p1', username, is_host: true, is_ready: true, avatar: '😎', is_bot: false };

    setRoom(newRoom);
    setPlayers([hostPlayer]);
    setIsHost(true);
  };

  const handleJoinRoom = () => {
    if (!username || !joinCode) return;
    const newPlayer = { id: Math.random().toString(), username, is_host: false, is_ready: false, avatar: '👾', is_bot: false };
    setRoom({ room_code: joinCode, host_name: 'Host', status: 'LOBBY', duration: 5 }); // Default if joining unknown
    setPlayers([...players, newPlayer]);
    setIsHost(false);
  };

  const addBot = () => {
    const existingBots = players.filter(p => p.is_bot).length;
    if (existingBots >= 5) return;

    const botProfile = BOT_PROFILES[existingBots];

    const botPlayer = {
      id: botProfile.id, // Use consistent ID from profile
      username: botProfile.username,
      is_host: false,
      is_ready: true,
      avatar: botProfile.avatar,
      is_bot: true,
      personality: botProfile.personality
    };
    addPlayer(botPlayer);
  };

  const toggleReady = () => {
    // Toggle logic...
  }

  const handleStartGame = () => {
    setPhase('SUBMISSION');
  };

  if (room) {
    // Inside Lobby View
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6">
          <div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
              <h1 className="text-5xl font-display font-black text-white tracking-tight">
                LOBBY <span className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">#{room.room_code}</span>
              </h1>
            </motion.div>
            <div className="text-gray-400 mt-2 flex items-center gap-4 font-mono text-sm">
              <p className="flex items-center gap-2"><Users size={14} className="text-neon-purple" /> <span className="text-white font-bold">{players.length}</span> PLAYERS</p>
              <p className="flex items-center gap-2"><Clock size={14} className="text-neon-cyan" /> <span className="text-white font-bold">{room.duration || 5} MIN</span> MATCH</p>
            </div>
          </div>
          {isHost && (
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(room.room_code)}>
                <Copy size={14} /> CODE
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Setting Panel (Left) */}
          <div className={`space-y-6 ${!isHost && 'opacity-70 pointer-events-none grayscale'}`}>
            <Card className="h-full border-neon-cyan/20 bg-black/40">
              <div className="flex items-center gap-2 mb-6 text-neon-cyan">
                <Settings size={20} />
                <h3 className="font-bold uppercase tracking-wider">Configuration</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Facts Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat
                            ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Difficulty</label>
                  <div className="flex p-1 bg-black/50 rounded-lg border border-white/10">
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${selectedDifficulty === diff
                            ? diff === 'Hard' ? 'bg-red-500 text-white' : diff === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'
                            : 'text-gray-500 hover:bg-white/5'
                          }`}
                      >
                        {diff === 'Hard' && <Zap size={10} />}
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Match Duration</label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(min => (
                      <button
                        key={min}
                        onClick={() => setSelectedDuration(min)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${selectedDuration === min
                            ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                          }`}
                      >
                        {min} MIN
                      </button>
                    ))}
                  </div>
                </div>

                {isHost && (
                  <div className="pt-4 border-t border-white/10">
                    <Button className="w-full text-xs" variant="neon" size="sm" onClick={addBot} disabled={players.length >= 8}>
                      <Bot size={16} /> ADD AI OPPONENT
                    </Button>
                    <p className="text-[10px] text-gray-500 text-center mt-2">Max 5 Bots allowed</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Player Grid (Right) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {players.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 aspect-[4/3] backdrop-blur-md transition-all ${p.is_ready
                        ? 'border-neon-lime/50 bg-neon-lime/5 shadow-[0_0_15px_rgba(57,255,20,0.1)]'
                        : 'border-white/10 bg-white/5'
                      }`}
                  >
                    <div className="text-4xl filter drop-shadow-lg">{p.avatar}</div>
                    <div className="text-center">
                      <div className="font-bold text-lg leading-tight truncate max-w-[120px]">{p.username}</div>
                      {p.is_bot && <div className="text-[10px] text-neon-purple font-mono uppercase tracking-widest mt-1">AI Agent</div>}
                    </div>
                    {p.is_host && (
                      <span className="absolute top-3 left-3 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">HOST</span>
                    )}
                    {p.is_ready ? (
                      <CheckCircle className="text-neon-lime absolute top-3 right-3 drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]" size={18} />
                    ) : (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white/20 animate-pulse"></div>
                    )}
                  </motion.div>
                ))}
                {/* Empty Slots */}
                {[...Array(Math.max(0, (players.length > 5 ? 8 : 6) - players.length)).keys()].map(i => (
                  <div key={`empty-${i}`} className="border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center opacity-30 aspect-[4/3]">
                    <span className="text-gray-600 font-display text-sm">WAITING...</span>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <Button variant="ghost" onClick={() => { setRoom(null); setPlayers([]); }}>
            LEAVE LOBBY
          </Button>

          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full md:w-auto min-w-[200px] shadow-[0_0_30px_rgba(0,245,255,0.4)]"
              onClick={handleStartGame}
            >
              <Play size={20} fill="currentColor" /> START MATCH
            </Button>
          ) : (
            <Button
              variant={players.find(p => p.username === username)?.is_ready ? 'secondary' : 'primary'}
              size="lg"
              className="min-w-[200px]"
              onClick={toggleReady}
            >
              {players.find(p => p.username === username)?.is_ready ? 'NOT READY' : 'READY UP'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // CREATE / JOIN VIEW (Unchanged)
  return (
    <div className="max-w-md mx-auto mt-10 relative z-10">
      <Card className="space-y-6 border-neon-cyan/20 bg-black/60 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="text-center py-4">
          <h1 className="text-5xl font-display font-black text-white mb-1 tracking-tighter">FACT<span className="text-neon-cyan">RUSH</span></h1>
          <p className="text-neon-purple font-mono text-xs tracking-[0.3em] uppercase">The Verification Showdown</p>
        </div>

        <div className="space-y-5 px-2">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 pl-1">Identify Yourself</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all text-lg font-medium"
              placeholder="Enter Agent Name..."
            />
          </div>

          <Button
            variant="primary"
            className="w-full py-4 text-lg shadow-[0_0_20px_rgba(0,245,255,0.2)]"
            onClick={handleCreateRoom}
            disabled={!username}
          >
            CREATE NEW LOBBY
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-mono tracking-widest">OR JOIN EXISTING</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="flex-1 bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-neon-purple focus:outline-none uppercase font-mono tracking-widest text-center"
              placeholder="XYZ-123"
              maxLength={6}
            />
            <Button
              variant="neon"
              onClick={handleJoinRoom}
              disabled={!username || !joinCode}
              className="px-8"
            >
              JOIN
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center space-y-2">
        <div className="text-[10px] text-gray-500 font-mono">POWERED BY GENLAYER</div>
      </div>
    </div>
  );
};

export default Lobby;
