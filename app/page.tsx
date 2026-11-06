/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useHanoi } from '@/hooks/useHanoi';
import { GameBoard } from '@/components/GameBoard';
import { CallStack } from '@/components/CallStack';
import { Controls } from '@/components/Controls';
import { CodeTracer } from '@/components/CodeTracer';
import {
  Layers,
  Sparkles,
  Gamepad2,
  BookOpen,
  HelpCircle,
  Cpu,
  X,
  Clock,
  Check,
} from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'manual'>('visualizer');
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

  const {
    diskCount,
    setDiskCount,
    currentStepIndex,
    currentSnapshot,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    togglePlay,
  } = useHanoi(3);

  // Keyboard shortcut navigation (Space: Play/Pause, ArrowRight: Next, ArrowLeft: Prev, R: Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward, reset]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Tower of Hanoi
          </span>
          <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
            DSA Recursion Engine
          </span>
        </div>

        <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'visualizer'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Algorithm Visualizer</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Interactive Game</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTheoryOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer active:scale-95 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Recursion Theory &amp; Proof</span>
            <span className="sm:hidden">Theory</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {activeTab === 'visualizer'
                ? 'Call Stack & Disk Motion Synchronization'
                : 'Interactive Hanoi Challenge'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {activeTab === 'visualizer'
                ? 'Watch how pure recursive calls push activation records into memory and pop upon base cases.'
                : 'Test your intuition by moving disks between Peg A, B, and C following the mathematical rules.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Time Complexity:</span>
            <span className="text-amber-400 font-bold">O(2ⁿ)</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Aux Space:</span>
            <span className="text-sky-400 font-bold">O(n)</span>
          </div>
        </div>

        {activeTab === 'visualizer' ? (
          <div className="space-y-6">
            {/* Dual-Pane Visualizer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Pane (Physical Game Board & Stepper Controls): 7 Columns on Desktop */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <GameBoard
                  pegs={currentSnapshot.pegs}
                  diskCount={diskCount}
                  movedDisk={currentSnapshot.movedDisk}
                />

                <Controls
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlay}
                  onStepForward={stepForward}
                  onStepBackward={stepBackward}
                  onReset={reset}
                  currentStep={currentStepIndex}
                  totalSteps={totalSteps}
                  onScrub={jumpToStep}
                  diskCount={diskCount}
                  onDiskCountChange={setDiskCount}
                  playbackSpeed={playbackSpeed}
                  onSpeedChange={setPlaybackSpeed}
                  moveNumber={currentSnapshot.moveNumber}
                  totalMoves={currentSnapshot.totalMoves}
                />
              </div>

              {/* Right Pane (Memory / Call Stack Visualizer): 5 Columns on Desktop */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <CallStack
                  callStack={currentSnapshot.callStack}
                  activeFrameId={currentSnapshot.activeFrameId}
                  maxPossibleDepth={diskCount}
                  highlightedLine={currentSnapshot.highlightedLine}
                />

                <CodeTracer
                  highlightedLine={currentSnapshot.highlightedLine}
                  description={currentSnapshot.description}
                  detailExplanation={currentSnapshot.detailExplanation}
                  actionType={currentSnapshot.actionType}
                />
              </div>
            </div>

            {/* Helper Banner */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Keyboard Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono">Space</kbd> Play/Pause, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono">→</kbd> Step Next, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono">←</kbd> Step Prev, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono">R</kbd> Reset.
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                onClick={() => setIsTheoryOpen(true)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Mathematical Recurrence Proof</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto rounded-xl bg-slate-900/90 border border-slate-800 p-6 text-center text-slate-300">
            <h2 className="text-base font-bold text-white mb-2">Challenge Mode</h2>
            <p className="text-xs text-slate-400 mb-4">
              Switch back to Algorithm Visualizer to step through recursion frames and inspect call stack memory.
            </p>
            <button
              onClick={() => setActiveTab('visualizer')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
            >
              Back to Algorithm Visualizer
            </button>
          </div>
        )}
      </main>

      {/* Theory Dialog */}
      {isTheoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Understanding Recursion &amp; Call Stacks
                </h3>
              </div>
              <button
                onClick={() => setIsTheoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>1. What is the Call Stack in Memory?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a program calls a function, the computer pushes an activation record onto the Call Stack. Each frame stores parameters (n, src, aux, dest), return addresses, and local state. When base case n=1 is reached, frames unwind and pop off memory.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>2. Recurrence Relation &amp; Complexity Analysis</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Time Complexity</span>
                  <p className="text-sm font-bold text-amber-300 font-mono">O(2ⁿ) Exponential</p>
                  <p className="text-slate-400 text-[11px]">Recurrence: T(n) = 2T(n-1) + 1. Total moves: 2ⁿ - 1 ({Math.pow(2, diskCount) - 1} moves for n={diskCount}).</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Auxiliary Stack Space</span>
                  <p className="text-sm font-bold text-sky-300 font-mono">O(n) Linear Depth</p>
                  <p className="text-slate-400 text-[11px]">Maximum call stack depth at any instant equals n (height of the recursion tree).</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>3. The 3 Divide-and-Conquer Phases</span>
              </h4>
              <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                <li><strong className="text-slate-200">Phase 1:</strong> Recursively move top n - 1 disks from Source to Auxiliary.</li>
                <li><strong className="text-slate-200">Phase 2:</strong> Move the largest disk n directly from Source to Destination.</li>
                <li><strong className="text-slate-200">Phase 3:</strong> Recursively move n - 1 disks from Auxiliary to Destination.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTheoryOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Got it, back to simulation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attribution Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-400">
        Developed by KIAN FLORENDO
      </footer>
    </div>
  );
}
