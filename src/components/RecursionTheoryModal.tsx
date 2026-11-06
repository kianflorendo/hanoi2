/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, X, Cpu, Clock, Layers, Check } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisks: number;
}

export const RecursionTheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  currentDisks,
}) => {
  if (!isOpen) return null;

  const totalMoves = Math.pow(2, currentDisks) - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5 text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Understanding Recursion & Call Stacks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close theory dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. What is the Call Stack? */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>1. What is the Call Stack in Memory?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            When a program calls a function, the computer pushes an <strong className="text-white">Activation Record (Stack Frame)</strong> onto the Call Stack. This record stores:
          </p>
          <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 pl-1">
            <li>Parameters: <code className="text-amber-300 font-mono">n</code>, <code className="text-amber-300 font-mono">src</code>, <code className="text-amber-300 font-mono">aux</code>, <code className="text-amber-300 font-mono">dest</code></li>
            <li>Return Address: The exact line of code to resume when this function finishes</li>
            <li>Local Variables & Execution State</li>
          </ul>
          <p className="text-xs text-slate-300 leading-relaxed">
            Because recursion calls the same function with smaller parameters, each call pauses its parent and waits until the child returns. When base case <code className="text-emerald-300 font-mono">n === 1</code> is reached, the stack begins unwinding (popping).
          </p>
        </div>

        {/* 2. Recurrence Relation & Complexity */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            <span>2. Recurrence Relation & Complexity Analysis</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                Time Complexity
              </span>
              <p className="text-sm font-bold text-amber-300 font-mono">
                O(2ⁿ) Exponential
              </p>
              <p className="text-slate-400 text-[11px]">
                Recurrence formula: <br />
                <code className="text-slate-300">T(n) = 2T(n-1) + 1</code>
                <br />
                Yields exact minimum moves: <strong className="text-white">2ⁿ - 1</strong> ({totalMoves} moves for n={currentDisks}).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                Auxiliary Space (Call Stack)
              </span>
              <p className="text-sm font-bold text-sky-300 font-mono">
                O(n) Linear Depth
              </p>
              <p className="text-slate-400 text-[11px]">
                Maximum stack depth at any given instant is equal to <strong className="text-white">n</strong> (the height of the recursion tree).
              </p>
            </div>
          </div>
        </div>

        {/* 3. The 3 Steps of Divide & Conquer */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>3. The 3 Divide-and-Conquer Phases</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-200">
                  Sub-Problem 1: Clear top n - 1 disks to Auxiliary
                </p>
                <p className="text-slate-400 text-[11px]">
                  Using the destination peg as a temporary buffer: <code className="text-indigo-300 font-mono">solve(n - 1, source, dest, aux)</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-200">
                  Direct Move: Relocate the largest disk n
                </p>
                <p className="text-slate-400 text-[11px]">
                  With the destination peg completely free, move disk n directly from Source to Destination.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 border border-purple-500/40 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-200">
                  Sub-Problem 2: Transfer n - 1 disks from Auxiliary to Destination
                </p>
                <p className="text-slate-400 text-[11px]">
                  Using the now-empty source peg as a buffer: <code className="text-purple-300 font-mono">solve(n - 1, aux, source, dest)</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95 transition-all shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Got it, back to simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
