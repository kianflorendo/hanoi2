/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PegId, PegState } from '../types/hanoi';
import { GameBoard } from './GameBoard';
import { RotateCcw, Trophy, AlertCircle, Sparkles } from 'lucide-react';

interface ManualPlayBoardProps {
  diskCount: number;
  onDiskCountChange: (count: number) => void;
}

export const ManualPlayBoard: React.FC<ManualPlayBoardProps> = ({
  diskCount,
  onDiskCountChange,
}) => {
  const [pegs, setPegs] = useState<PegState>(() => ({
    A: Array.from({ length: diskCount }, (_, i) => diskCount - i),
    B: [],
    C: [],
  }));

  const [selectedPeg, setSelectedPeg] = useState<PegId | null>(null);
  const [userMoves, setUserMoves] = useState<number>(0);
  const [lastMoved, setLastMoved] = useState<{
    disk: number;
    from: PegId;
    to: PegId;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  const optimalMoves = Math.pow(2, diskCount) - 1;

  // Reset when diskCount changes
  useEffect(() => {
    setPegs({
      A: Array.from({ length: diskCount }, (_, i) => diskCount - i),
      B: [],
      C: [],
    });
    setSelectedPeg(null);
    setUserMoves(0);
    setLastMoved(null);
    setErrorMessage(null);
    setIsSolved(false);
  }, [diskCount]);

  const handleReset = () => {
    setPegs({
      A: Array.from({ length: diskCount }, (_, i) => diskCount - i),
      B: [],
      C: [],
    });
    setSelectedPeg(null);
    setUserMoves(0);
    setLastMoved(null);
    setErrorMessage(null);
    setIsSolved(false);
  };

  const handlePegClick = (pegId: PegId) => {
    if (isSolved) return;
    setErrorMessage(null);

    // Case 1: No peg currently selected -> select this peg if it has disks
    if (!selectedPeg) {
      if (pegs[pegId].length === 0) {
        setErrorMessage(`Peg ${pegId} is empty! Select a peg with disks.`);
        return;
      }
      setSelectedPeg(pegId);
      return;
    }

    // Case 2: Clicking the same peg -> unselect
    if (selectedPeg === pegId) {
      setSelectedPeg(null);
      return;
    }

    // Case 3: Attempting to move top disk from selectedPeg to pegId
    const sourceDisks = pegs[selectedPeg];
    const targetDisks = pegs[pegId];
    const diskToMove = sourceDisks[sourceDisks.length - 1];
    const targetTopDisk = targetDisks[targetDisks.length - 1];

    // Rule validation: Cannot place larger disk on smaller disk
    if (targetTopDisk !== undefined && diskToMove > targetTopDisk) {
      setErrorMessage(
        `Illegal move! Disk ${diskToMove} cannot be placed on top of smaller Disk ${targetTopDisk}.`
      );
      setSelectedPeg(null);
      return;
    }

    // Valid move!
    const newPegs: PegState = {
      A: [...pegs.A],
      B: [...pegs.B],
      C: [...pegs.C],
    };

    const moved = newPegs[selectedPeg].pop();
    if (moved !== undefined) {
      newPegs[pegId].push(moved);
    }

    setPegs(newPegs);
    setUserMoves((prev) => prev + 1);
    setLastMoved({ disk: diskToMove, from: selectedPeg, to: pegId });
    setSelectedPeg(null);

    // Check win condition: All disks moved to Peg C
    if (newPegs.C.length === diskCount) {
      setIsSolved(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Game Board with interactive clicks enabled */}
      <GameBoard
        pegs={pegs}
        diskCount={diskCount}
        movedDisk={lastMoved}
        selectedPeg={selectedPeg}
        onPegClick={handlePegClick}
        isInteractive={!isSolved}
      />

      {/* Manual Mode Status and Controls Bar */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Your Moves:</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  userMoves <= optimalMoves
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {userMoves}
              </span>
            </div>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Optimal Moves:</span>
              <span className="text-sm font-bold text-indigo-400 tabular-nums">
                {optimalMoves}
              </span>
            </div>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">Disks:</span>
              <div className="flex items-center gap-1">
                {[3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    onClick={() => onDiskCountChange(count)}
                    className={`w-5 h-5 rounded text-[11px] font-mono flex items-center justify-center cursor-pointer ${
                      diskCount === count
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Board</span>
          </button>
        </div>

        {/* Dynamic Instructional Banner or Error Message */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSolved ? (
          <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Congratulations! Puzzle Solved!</p>
                <p className="text-emerald-300/90 text-[11px]">
                  You finished in <strong className="font-mono text-white">{userMoves}</strong> moves ({userMoves === optimalMoves ? 'Perfect optimal solution!' : `${userMoves - optimalMoves} moves over the mathematical minimum`}).
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs cursor-pointer active:scale-95 transition-all"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              {selectedPeg
                ? `Peg ${selectedPeg} selected. Click Peg A, B, or C to place Disk ${pegs[selectedPeg][pegs[selectedPeg].length - 1]}.`
                : 'Click any peg to pick up its top disk, then click a target peg to move it.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
