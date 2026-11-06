/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  Sliders,
} from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  onScrub: (step: number) => void;
  diskCount: number;
  onDiskCountChange: (count: number) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  moveNumber: number;
  totalMoves: number;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3];

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  currentStep,
  totalSteps,
  onScrub,
  diskCount,
  onDiskCountChange,
  playbackSpeed,
  onSpeedChange,
  moveNumber,
  totalMoves,
}) => {
  const isStart = currentStep === 0;
  const isEnd = currentStep >= totalSteps;
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Top Bar: Progress Scrubber and Step/Move Indicators */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Execution Progress</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-indigo-400">
              Step {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span>Disk Moves:</span>
            <span className="text-amber-300 font-semibold tabular-nums">
              {moveNumber}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 tabular-nums">{totalMoves} (2^{diskCount}-1)</span>
          </div>
        </div>

        {/* Step Progress Scrubber Bar */}
        <div className="relative flex items-center group py-1">
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none transition-all"
            aria-label="Execution step scrubber"
          />
          <div
            className="absolute left-0 top-[9px] h-2 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-l-lg pointer-events-none transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        {/* Playback Button Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={onReset}
            title="Reset to beginning"
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={isStart}
            title="Step Backward"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              isStart
                ? 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer active:scale-95'
            }`}
            aria-label="Step backward"
          >
            <SkipBack className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-lg transition-all cursor-pointer active:scale-95 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>{isEnd ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={isEnd}
            title="Step Forward"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              isEnd
                ? 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer active:scale-95'
            }`}
            aria-label="Step forward"
          >
            <span className="hidden xs:inline">Next</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed and Disk Quantity Controls */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <span className="text-[11px] text-slate-400 font-medium">Speed:</span>
            <div className="flex items-center gap-0.5">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Disk Quantity Selector (3 to 6) */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <span className="text-[11px] text-slate-400 font-medium">Disks:</span>
            <div className="flex items-center gap-1">
              {[3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => onDiskCountChange(count)}
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded transition-all cursor-pointer ${
                    diskCount === count
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  aria-label={`Set disk count to ${count}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
