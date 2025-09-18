import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../shared/Header';
import { 
  Clock, 
  GamepadIcon, 
  Trophy, 
  Star, 
  RotateCcw, 
  Play,
  Pause,
  Square,
  Zap,
  Target,
  Brain,
  Timer,
  Award,
  Sparkles,
  Settings,
  User
} from 'lucide-react';

const WaitingDashboard = () => {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameScores, setGameScores] = useState({
    memory: { best: 0, played: 0 },
    reaction: { best: 0, played: 0 },
    wordchain: { best: 0, played: 0 }
  });

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryGameActive, setMemoryGameActive] = useState(false);

  // Reaction Game State
  const [reactionState, setReactionState] = useState('waiting'); // 'waiting', 'ready', 'go', 'clicked'
  const [reactionTime, setReactionTime] = useState(null);
  const [reactionStartTime, setReactionStartTime] = useState(null);
  const [reactionTimeout, setReactionTimeout] = useState(null);

  // Word Chain Game State
  const [currentWord, setCurrentWord] = useState('');
  const [wordChain, setWordChain] = useState([]);
  const [wordInput, setWordInput] = useState('');
  const [wordScore, setWordScore] = useState(0);
  const [wordGameActive, setWordGameActive] = useState(false);
  const [wordTimer, setWordTimer] = useState(30);

  // Initialize memory game
  const initMemoryGame = () => {
    const symbols = ['🎯', '🚀', '💎', '🌟', '🎨', '🎪', '🎭', '🎸'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false }));
    
    setMemoryCards(cards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMemoryMoves(0);
    setMemoryGameActive(true);
  };

  // Handle memory card click
  const handleMemoryCardClick = (cardId) => {
    if (!memoryGameActive || flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
      return;
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      const firstCard = memoryCards.find(card => card.id === first);
      const secondCard = memoryCards.find(card => card.id === second);

      if (firstCard.symbol === secondCard.symbol) {
        setMatchedCards(prev => [...prev, first, second]);
        setFlippedCards([]);
        
        // Check if game is complete
        if (matchedCards.length + 2 === memoryCards.length) {
          setMemoryGameActive(false);
          const score = Math.max(0, 100 - memoryMoves * 5);
          setGameScores(prev => ({
            ...prev,
            memory: {
              best: Math.max(prev.memory.best, score),
              played: prev.memory.played + 1
            }
          }));
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  // Initialize reaction game
  const startReactionGame = () => {
    setReactionState('ready');
    setReactionTime(null);
    
    const delay = Math.random() * 4000 + 1000; // 1-5 seconds
    const timeout = setTimeout(() => {
      setReactionState('go');
      setReactionStartTime(Date.now());
    }, delay);
    
    setReactionTimeout(timeout);
  };

  // Handle reaction click
  const handleReactionClick = () => {
    if (reactionState === 'ready') {
      setReactionState('waiting');
      clearTimeout(reactionTimeout);
      alert('Too early! Wait for the green signal.');
    } else if (reactionState === 'go') {
      const time = Date.now() - reactionStartTime;
      setReactionTime(time);
      setReactionState('clicked');
      
      setGameScores(prev => ({
        ...prev,
        reaction: {
          best: prev.reaction.best === 0 ? time : Math.min(prev.reaction.best, time),
          played: prev.reaction.played + 1
        }
      }));
    }
  };

  // Initialize word chain game
  const startWordGame = () => {
    const startWords = ['SIMPLE', 'BRAIN', 'SMART', 'QUICK', 'POWER'];
    const randomWord = startWords[Math.floor(Math.random() * startWords.length)];
    setCurrentWord(randomWord);
    setWordChain([randomWord]);
    setWordInput('');
    setWordScore(0);
    setWordGameActive(true);
    setWordTimer(30);
  };

  // Handle word submission
  const handleWordSubmit = () => {
    const input = wordInput.toUpperCase().trim();
    if (!input || input.length < 3) return;

    const lastLetter = currentWord[currentWord.length - 1];
    if (input[0] === lastLetter && !wordChain.includes(input)) {
      setWordChain(prev => [...prev, input]);
      setCurrentWord(input);
      setWordScore(prev => prev + input.length);
      setWordInput('');
    } else {
      alert(input[0] !== lastLetter ? 
        `Word must start with "${lastLetter}"` : 
        'Word already used!'
      );
    }
  };

  // Word game timer
  useEffect(() => {
    let interval;
    if (wordGameActive && wordTimer > 0) {
      interval = setInterval(() => {
        setWordTimer(prev => {
          if (prev <= 1) {
            setWordGameActive(false);
            setGameScores(prevScores => ({
              ...prevScores,
              wordchain: {
                best: Math.max(prevScores.wordchain.best, wordScore),
                played: prevScores.wordchain.played + 1
              }
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [wordGameActive, wordTimer, wordScore]);

  const games = [
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Match pairs of cards to test your memory',
      icon: Sparkles,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'reaction',
      name: 'Reaction Time',
      description: 'Test how fast your reflexes are',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 'wordchain',
      name: 'Word Chain',
      description: 'Create a chain of words in 30 seconds',
      icon: Target,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-500/10'
    }
  ];

  const GameCard = ({ game }) => {
    const IconComponent = game.icon;
    const score = gameScores[game.id];
    
    return (
      <div 
        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
        onClick={() => setSelectedGame(game.id)}
      >
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 mx-auto`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-white text-center mb-2">{game.name}</h3>
        <p className="text-gray-300 text-center text-sm mb-4">{game.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Best Score:</span>
            <span className="text-white font-semibold">{score.best || 'Not played'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Games Played:</span>
            <span className="text-white font-semibold">{score.played}</span>
          </div>
        </div>
        
        <button className={`w-full mt-4 py-2 rounded-xl bg-gradient-to-r ${game.color} text-white font-semibold hover:shadow-lg transition-all`}>
          Play Game
        </button>
      </div>
    );
  };

  const MemoryGame = () => (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Memory Match</h3>
        <div className="flex items-center gap-4">
          <span className="text-white">Moves: {memoryMoves}</span>
          <button 
            onClick={initMemoryGame}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-6">
        {memoryCards.map((card) => (
          <div
            key={card.id}
            className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-lg ${
              flippedCards.includes(card.id) || matchedCards.includes(card.id)
                ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white transform scale-105 shadow-lg'
                : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-400 hover:bg-white/15 hover:border-white/30'
            }`}
            onClick={() => handleMemoryCardClick(card.id)}
          >
            {(flippedCards.includes(card.id) || matchedCards.includes(card.id)) ? card.symbol : '?'}
          </div>
        ))}
      </div>
      
      {!memoryGameActive && matchedCards.length === memoryCards.length && memoryCards.length > 0 && (
        <div className="text-center">
          <p className="text-green-400 text-lg font-semibold">
            Congratulations! You completed it in {memoryMoves} moves!
          </p>
          <p className="text-white">Score: {Math.max(0, 100 - memoryMoves * 5)}</p>
        </div>
      )}
    </div>
  );

  const ReactionGame = () => (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Reaction Time</h3>
        <button 
          onClick={startReactionGame}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Start Test
        </button>
      </div>
      
      <div className="text-center">
        <div 
          className={`w-64 h-64 mx-auto rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center text-white font-bold text-xl ${
            reactionState === 'waiting' ? 'bg-gray-600' :
            reactionState === 'ready' ? 'bg-red-600' :
            reactionState === 'go' ? 'bg-green-600' :
            'bg-blue-600'
          }`}
          onClick={handleReactionClick}
        >
          {reactionState === 'waiting' && 'Click "Start Test" to begin'}
          {reactionState === 'ready' && 'Wait for GREEN...'}
          {reactionState === 'go' && 'CLICK NOW!'}
          {reactionState === 'clicked' && `${reactionTime}ms`}
        </div>
        
        {reactionTime && (
          <div className="mt-6">
            <p className="text-white text-lg">
              Your reaction time: <span className="font-bold text-yellow-400">{reactionTime}ms</span>
            </p>
            <p className="text-gray-300 text-sm mt-2">
              {reactionTime < 200 ? 'Lightning fast! ⚡' :
               reactionTime < 300 ? 'Very good! 👍' :
               reactionTime < 400 ? 'Good! 👌' :
               'Keep practicing! 💪'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const WordChainGame = () => (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Word Chain</h3>
        <div className="flex items-center gap-4">
          <span className="text-white">Time: {wordTimer}s</span>
          <span className="text-white">Score: {wordScore}</span>
          <button 
            onClick={startWordGame}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-300 mb-2">Current word:</p>
          <p className="text-3xl font-bold text-white">{currentWord}</p>
          <p className="text-gray-400 text-sm mt-2">
            Next word must start with "{currentWord[currentWord.length - 1]}"
          </p>
        </div>
        
        {wordGameActive && (
          <div className="flex gap-2">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleWordSubmit()}
              placeholder="Enter your word..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <button 
              onClick={handleWordSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              Submit
            </button>
          </div>
        )}
        
        <div className="max-h-32 overflow-y-auto">
          <p className="text-gray-300 text-sm mb-2">Word chain:</p>
          <div className="flex flex-wrap gap-2">
            {wordChain.map((word, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-600/20 text-green-300 rounded-lg text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
        
        {!wordGameActive && wordChain.length > 1 && (
          <div className="text-center mt-4">
            <p className="text-green-400 text-lg font-semibold">
              Game Over! Final Score: {wordScore}
            </p>
            <p className="text-white">Words created: {wordChain.length}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome, {user?.first_name}! 👋
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Please wait while an admin assigns you to a department
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-yellow-500/20 text-yellow-300 rounded-xl border border-yellow-500/30">
              <Sparkles className="w-5 h-5 mr-2" />
              Your account is being reviewed by our team
            </div>
          </div>
        </div>

        {/* Games Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Play Games While You Wait</h2>
            <p className="text-gray-300">Challenge yourself with these fun mini-games!</p>
          </div>

          {!selectedGame ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setSelectedGame(null)}
                className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Games
              </button>
              
              {selectedGame === 'memory' && <MemoryGame />}
              {selectedGame === 'reaction' && <ReactionGame />}
              {selectedGame === 'wordchain' && <WordChainGame />}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default WaitingDashboard;
