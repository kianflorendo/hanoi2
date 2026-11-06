/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PegId, PegState } from '@/types/hanoi';

interface GameBoardProps {
  pegs: PegState;
  diskCount: number;
  movedDisk?: { disk: number; from: PegId; to: PegId } | null;
  selectedPeg?: PegId | null;
  onPegClick?: (pegId: PegId) => void;
  isInteractive?: boolean;
}

const PEGS_INFO: { id: PegId; label: string; role: string; desc: string }[] = [
  { id: 'A', label: 'Peg A', role: 'Source', desc: 'Initial disk stack' },
  { id: 'B', label: 'Peg B', role: 'Auxiliary', desc: 'Buffer / helper peg' },
  { id: 'C', label: 'Peg C', role: 'Destination', desc: 'Target destination' },
];

const DISK_STYLES: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: {
    bg: 'from-amber-400 to-amber-500',
    border: 'border-amber-300/80',
    text: 'text-amber-950',
    glow: 'shadow-amber-500/20',
  },
  2: {
    bg: 'from-emerald-400 to-emerald-600',
    border: 'border-emerald-300/80',
    text: 'text-emerald-950',
    glow: 'shadow-emerald-500/20',
  },
  3: {
    bg: 'from-cyan-400 to-cyan-600',
    border: 'border-cyan-300/80',
    text: 'text-cyan-950',
    glow: 'shadow-cyan-500/20',
  },
  4: {
    bg: 'from-indigo-400 to-indigo-600',
    border: 'border-indigo-300/80',
    text: 'text-white',
    glow: 'shadow-indigo-500/25',
  },
  5: {
    bg: 'from-violet-500 to-purple-600',
    border: 'border-purple-300/80',
    text: 'text-white',
    glow: 'shadow-violet-500/25',
  },
  6: {
    bg: 'from-rose-500 to-rose-700',
    border: 'border-rose-300/80',
    text: 'text-white',
    glow: 'shadow-rose-500/30',
  },
};

export const GameBoard: React.FC<GameBoardProps> = ({
  pegs,
  diskCount,
  movedDisk,
  selectedPeg,
  onPegClick,
  isInteractive = false,
}) => {
  const getDiskWidth = (diskSize: number) => {
    const minWidthPercent = 32;
    const maxWidthPercent = 94;
    if (diskCount <= 1) return `${maxWidthPercent}%`;
    const step = (maxWidthPercent - minWidthPercent) / (diskCount - 1);
    const width = minWidthPercent + (diskSize - 1) * step;
    return `${width}%`;
  };

  return (
    <div className="w-full flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Visual board header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Physical Game Board</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono">{diskCount} Disks</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
          <span>Framer Motion Smooth Interpolation</span>
        </div>
      </div>

      {/* Main Pegs Area */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 pb-2 min-h-[300px] sm:min-h-[360px] items-end relative">
        {PEGS_INFO.map((peg) => {
          const disksOnPeg = pegs[peg.id] || [];
          const isSelected = selectedPeg === peg.id;
          const isMoveSource = movedDisk?.from === peg.id;
          const isMoveDest = movedDisk?.to === peg.id;

          return (
            <div
              key={peg.id}
              onClick={() => onPegClick && onPegClick(peg.id)}
              className={`group flex flex-col items-center justify-end relative h-[280px] sm:h-[320px] rounded-lg transition-all duration-200 ${
                isInteractive
                  ? 'cursor-pointer hover:bg-slate-800/50'
                  : ''
              } ${
                isSelected
                  ? 'bg-indigo-950/40 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900'
                  : ''
              }`}
            >
              {/* Peg Role Badge at top */}
              <div className="absolute top-0 flex flex-col items-center text-center">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                    isMoveDest
                      ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40'
                      : isMoveSource
                      ? 'text-amber-300 bg-amber-950/80 border border-amber-500/40'
                      : isSelected
                      ? 'text-indigo-300 bg-indigo-950/80 border border-indigo-500/40'
                      : 'text-slate-300 bg-slate-800/90 border border-slate-700/60'
                  }`}
                >
                  {peg.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {peg.role}
                </span>
              </div>

              {/* Vertical Peg Rod (Pillar) */}
              <div className="absolute bottom-6 w-3 sm:w-3.5 h-[200px] sm:h-[230px] rounded-t-full bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-inner border-x border-t border-slate-600/50 z-0">
                <div className="w-full h-2 rounded-t-full bg-slate-500"></div>
              </div>

              {/* Disks stacked vertically on this peg */}
              <div className="w-full flex flex-col-reverse items-center z-10 pb-6 mb-0 min-h-[160px]">
                {disksOnPeg.map((diskSize, index) => {
                  const style = DISK_STYLES[diskSize] || DISK_STYLES[1];
                  const isRecentlyMoved = movedDisk?.disk === diskSize;
                  const isTopDisk = index === disksOnPeg.length - 1;

                  return (
                    <motion.div
                      key={`disk-${diskSize}`}
                      layoutId={`hanoi-disk-${diskSize}`}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 26,
                        mass: 0.8,
                      }}
                      style={{
                        width: getDiskWidth(diskSize),
                      }}
                      className={`h-7 sm:h-8 rounded-md bg-gradient-to-r ${style.bg} border ${
                        style.border
                      } shadow-lg ${
                        style.glow
                      } flex items-center justify-between px-2.5 my-0.5 select-none relative group/disk ${
                        isRecentlyMoved
                          ? 'ring-2 ring-white/90 shadow-indigo-500/50'
                          : ''
                      } ${
                        isInteractive && isTopDisk
                          ? 'hover:brightness-110 hover:-translate-y-0.5'
                          : ''
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-black/30"></span>

                      <span
                        className={`text-xs font-bold font-mono tracking-tight ${style.text}`}
                      >
                        Disk {diskSize}
                      </span>

                      <span className="w-1.5 h-1.5 rounded-full bg-black/30"></span>

                      <div className="absolute inset-x-1 top-0.5 h-[1.5px] bg-white/40 rounded-full"></div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Peg Base / Stand */}
              <div
                className={`w-[85%] sm:w-[90%] h-5 rounded-md bg-gradient-to-t from-slate-900 to-slate-750 border border-slate-700 shadow-md flex items-center justify-center z-10 transition-colors ${
                  isMoveDest
                    ? 'border-emerald-500/60 shadow-emerald-950/40'
                    : isMoveSource
                    ? 'border-amber-500/60 shadow-amber-950/40'
                    : ''
                }`}
              >
                <div className="w-[60%] h-1 rounded-full bg-slate-600/40"></div>
              </div>

              {/* Peg Capacity Footer */}
              <div className="mt-2 text-center">
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {disksOnPeg.length} {disksOnPeg.length === 1 ? 'disk' : 'disks'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ground Stand Baseplate spanning all pegs */}
      <div className="w-full h-3 rounded-b-lg bg-gradient-to-b from-slate-800 to-slate-950 border-t border-slate-700/80 shadow-2xl mt-1"></div>

      {/* Real-time move action banner */}
      {movedDisk && (
        <div className="mt-3 py-2 px-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-300">Active Move:</span>
            <span className="text-slate-200">
              Disk <span className="font-mono font-bold">{movedDisk.disk}</span>
            </span>
            <span className="text-slate-400">
              from <span className="font-mono text-amber-300 font-semibold">{movedDisk.from}</span>
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-400">
              to <span className="font-mono text-emerald-300 font-semibold">{movedDisk.to}</span>
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            layoutId active
          </span>
        </div>
      )}
    </div>
  );
};
