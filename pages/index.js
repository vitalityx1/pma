import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";

export default function Home() {
  const [players, setPlayers] = useState(Array(12).fill(""));
  const [matches, setMatches] = useState([]);
  const inputRefs = useRef([]);
  const topRef = useRef(null);

  useEffect(() => {
    const cachedMatches = localStorage.getItem("padelMatches");
    if (cachedMatches) {
      setMatches(JSON.parse(cachedMatches));
    }
  }, []);

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleKeyPress = (event, index) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const nextIndex = (index + 1) % 12;
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const generateMatches = () => {
    if (players.some(player => player.trim() === '')) {
      alert('Vul alstublieft de namen van alle 12 spelers in.');
      return;
    }

    console.log("Starting match generation...");
    console.time("Match Generation");
    const result = generateValidMatches(players);
    console.timeEnd("Match Generation");

    if (result) {
      console.log("Valid matches generated:", result);
      setMatches(result);
      localStorage.setItem('padelMatches', JSON.stringify(result));
      scrollToTop();
    } else {
      console.log("Failed to generate valid matches.");
      alert('Kon geen geldige wedstrijden genereren. Probeer het opnieuw.');
    }
  };

  const generateValidMatches = (players) => {
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    const generateRound = (availablePlayers, existingMatches) => {
      console.log("Generating round. Available players:", availablePlayers);
      shuffleArray(availablePlayers);
      const round = [];
      const usedPlayers = new Set();

      for (let i = 0; i < 3; i++) {
        console.log(`Generating court ${i + 1}`);
        const teamA = [];
        const teamB = [];

        for (const player of availablePlayers) {
          if (usedPlayers.has(player)) continue;

          if (teamA.length < 2) {
            if (teamA.length === 0 || !hasPlayedTogether(player, teamA[0], existingMatches)) {
              teamA.push(player);
              usedPlayers.add(player);
              console.log(`Added ${player} to Team A`);
            }
          } else if (teamB.length < 2) {
            if ((teamB.length === 0 || !hasPlayedTogether(player, teamB[0], existingMatches)) &&
                !hasPlayedAgainst(player, teamA, existingMatches)) {
              teamB.push(player);
              usedPlayers.add(player);
              console.log(`Added ${player} to Team B`);
            }
          }

          if (teamA.length === 2 && teamB.length === 2) {
            round.push({ teamA, teamB });
            console.log(`Court ${i + 1} complete:`, { teamA, teamB });
            break;
          }
        }

        if (teamA.length !== 2 || teamB.length !== 2) {
          console.log(`Failed to create valid court ${i + 1}`);
          return null; // Failed to create a valid court
        }
      }

      console.log("Round generation complete:", round);
      return round;
    };

    const hasPlayedTogether = (player1, player2, matches) => {
      const result = matches.some(round => 
        round.some(match => 
          (match.teamA.includes(player1) && match.teamA.includes(player2)) ||
          (match.teamB.includes(player1) && match.teamB.includes(player2))
        )
      );
      console.log(`Checking if ${player1} and ${player2} have played together:`, result);
      return result;
    };

    const hasPlayedAgainst = (player, team, matches) => {
      const result = matches.some(round => 
        round.some(match => 
          (match.teamA.includes(player) && (match.teamB.includes(team[0]) || match.teamB.includes(team[1]))) ||
          (match.teamB.includes(player) && (match.teamA.includes(team[0]) || match.teamA.includes(team[1])))
        )
      );
      console.log(`Checking if ${player} has played against ${team}:`, result);
      return result;
    };

    const maxAttempts = 1000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Attempt ${attempt + 1}`);
      const matches = [];
      let success = true;

      for (let round = 0; round < 3; round++) {
        console.log(`Generating round ${round + 1}`);
        const roundMatch = generateRound(players, matches);
        if (roundMatch) {
          matches.push(roundMatch);
          console.log(`Round ${round + 1} generated successfully`);
        } else {
          console.log(`Failed to generate round ${round + 1}`);
          success = false;
          break;
        }
      }

      if (success) {
        console.log(`Valid matches generated on attempt ${attempt + 1}`);
        return matches;
      }
    }

    console.log(`Failed to generate valid matches after ${maxAttempts} attempts`);
    return null; // Failed to generate valid matches after max attempts
  };

  const resetMatches = () => {
    console.log("Resetting matches");
    setMatches([]);
    setPlayers(Array(12).fill(""));
    localStorage.removeItem("padelMatches");
    scrollToTop();
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ... (rest of the component remains the same)

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4"
      ref={topRef}
    >
      <Head>
        <title>Padel Toss Matcher</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <main className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-800 animate-fade-in">
          Padel Toss Matcher
        </h1>

        {matches.length === 0 ? (
          <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-6 animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700 text-center">
              Voer Spelers In
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {players.map((player, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)} 
                  type="text"
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  placeholder={`Speler ${index + 1}`}
                  className="w-full px-3 py-2 bg-white bg-opacity-70 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-indigo-800 placeholder-indigo-400 transition duration-300 ease-in-out"
                />
              ))}
            </div>
            <button
              onClick={generateMatches}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Genereer Wedstrijden
            </button>
          </div>
        ) : (
          <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-4 animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700 text-center">
              Wedstrijdschema
            </h2>
            {matches.map((rotation, rotationIndex) => (
              <div
                key={rotationIndex}
                className="mb-6 last:mb-0 animate-fade-in"
                style={{ animationDelay: `${rotationIndex * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold mb-3 text-indigo-600 text-center">
                  Ronde {rotationIndex + 1}
                </h3>
                <div className="space-y-3">
                  {rotation.map((court, courtIndex) => (
                    <div
                      key={courtIndex}
                      className="bg-indigo-50 bg-opacity-70 rounded-lg p-3 shadow-sm border border-indigo-200"
                    >
                      <h4 className="text-base font-semibold mb-2 text-indigo-800 text-center">
                        Baan {courtIndex + 1}
                      </h4>
                      <div className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-indigo-700 mb-1 text-center">
                            Team A
                          </p>
                          <ul className="list-none text-indigo-800 text-center">
                            {court.teamA.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="w-px bg-indigo-200 mx-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-indigo-700 mb-1 text-center">
                            Team B
                          </p>
                          <ul className="list-none text-indigo-800 text-center">
                            {court.teamB.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={resetMatches}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg text-base font-semibold hover:bg-pink-700 transition duration-300 ease-in-out mt-4 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
            >
              Verwijder Resultaten en Begin Opnieuw
            </button>
          </div>
        )}
      </main>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
