// pages/index.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [players, setPlayers] = useState(Array(12).fill(''));
  const [matches, setMatches] = useState([]);
  const inputRefs = useRef([]);
  const topRef = useRef(null);

  useEffect(() => {
    const cachedMatches = localStorage.getItem('padelMatches');
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
    if (event.key === 'Enter') {
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

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const newMatches = [];
    const partnerships = new Set();

    for (let rotation = 0; rotation < 3; rotation++) {
      let availablePlayers = [...shuffled];
      const rotationMatches = [];

      for (let court = 0; court < 3; court++) {
        let teamA = [], teamB = [];
        
        while (teamA.length < 2) {
          const player = availablePlayers.pop();
          if (teamA.length === 0 || !hasPartnership(partnerships, player, teamA[0])) {
            teamA.push(player);
          } else {
            availablePlayers.unshift(player);
          }
        }
        
        while (teamB.length < 2) {
          const player = availablePlayers.pop();
          if (teamB.length === 0 || !hasPartnership(partnerships, player, teamB[0])) {
            teamB.push(player);
          } else {
            availablePlayers.unshift(player);
          }
        }

        addPartnerships(partnerships, teamA);
        addPartnerships(partnerships, teamB);

        rotationMatches.push({ teamA, teamB });
      }

      newMatches.push(rotationMatches);
      shuffled.sort(() => Math.random() - 0.5);
    }

    setMatches(newMatches);
    localStorage.setItem('padelMatches', JSON.stringify(newMatches));
    scrollToTop();
  };

  const hasPartnership = (partnerships, player1, player2) => {
    return partnerships.has(`${player1}-${player2}`) || partnerships.has(`${player2}-${player1}`);
  };

  const addPartnerships = (partnerships, team) => {
    partnerships.add(`${team[0]}-${team[1]}`);
  };

  const resetMatches = () => {
    setMatches([]);
    setPlayers(Array(12).fill(''));
    localStorage.removeItem('padelMatches');
    scrollToTop();
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6" ref={topRef}>
      <Head>
        <title>Padel Speler Matcher</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-blue-800">Padel Speler Matcher</h1>
        
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-blue-700">Voer Spelers In</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {players.map((player, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  placeholder={`Speler ${index + 1}`}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-black placeholder-gray-400"
                />
              ))}
            </div>
            <button
              onClick={generateMatches}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-xl font-semibold hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Genereer Wedstrijden
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-blue-700">Wedstrijdschema</h2>
            {matches.map((rotation, rotationIndex) => (
              <div key={rotationIndex} className="mb-10 last:mb-0">
                <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-600">
                  Ronde {rotationIndex + 1}
                </h3>
                <div className="space-y-6">
                  {rotation.map((court, courtIndex) => (
                    <div key={courtIndex} className="bg-blue-50 rounded-lg p-4 shadow-sm border-2 border-blue-200">
                      <h4 className="text-lg sm:text-xl font-semibold mb-4 text-blue-800">Baan {courtIndex + 1}</h4>
                      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-blue-700 mb-2">Team A</p>
                          <ul className="list-disc list-inside text-lg text-gray-800">
                            {court.teamA.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-blue-700 mb-2">Team B</p>
                          <ul className="list-disc list-inside text-lg text-gray-800">
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
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg text-xl font-semibold hover:bg-red-700 transition duration-300 ease-in-out mt-8"
            >
              Verwijder Resultaten en Begin Opnieuw
            </button>
          </div>
        )}
      </main>
    </div>
  );
}