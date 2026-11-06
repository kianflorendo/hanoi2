/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackFrame } from '../types/hanoi';
import { Layers, ArrowDown, Activity, Sparkles } from 'lucide-react';

interface CallStackProps {
  callStack: StackFrame[];
  activeFrameId: string | null;
  maxPossibleDepth: number;
  highlightedLine?: number;
}

const STAGE_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  call: {
    label: 'Entering Activation Record',
    color: 'text-sky-300',
    badge: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
  },
  'base-check': {
    label: 'Evaluating Base Condition (n == 1)',
    color: 'text-amber-300',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  'recurse-left': {
    label: 'Step 1: Recursing to Clear to Aux',
    color: 'text-indigo-300',
    badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
  },
  'move-disk': {
    label: 'Step 2: Physically Moving Disk',
    color: 'text-emerald-300',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  'recurse-right': {
    label: 'Step 3: Recursing to Transfer from Aux',
    color: 'text-purple-300',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
  },
  return: {
    label: 'Returning to Caller (Pop)',
    color: 'text-rose-300',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  },
};

export const CallStack: React.FC<CallStackProps> = ({
  callStack,
  activeFrameId,
  maxPossibleDepth,
}) => {
  // We display the stack from Top of Stack down to Root
  // in memory, the newest frame is at index (callStack.length - 1)
  const reversedStack = [...callStack].reverse();
  const currentDepth = callStack.length;

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl relative backdrop-blur-sm">
      {/* Header with Stack Memory Metrics */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-slate-200 text-sm">
            Call Stack in Memory
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Depth:</span>
          <span className="text-indigo-300 font-bold tabular-nums">
            {currentDepth}
          </span>
          <span>/</span>
          <span className="text-slate-500 tabular-nums">{maxPossibleDepth}</span>
        </div>
      </div>

      {/* Stack Status & Visual Stack Pointer Indicator */}
      <div className="flex items-center justify-between py-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Execution Memory:</span>
          <span className="font-mono text-slate-200">
            {currentDepth === 0 ? 'Idle' : `${currentDepth} active frames`}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Last-In, First-Out (LIFO)
        </div>
      </div>

      {/* Stack Frames Container */}
      <div className="flex-1 min-h-[300px] max-h-[460px] overflow-y-auto pr-1 space-y-3 relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {reversedStack.length === 0 ? (
            <motion.div
              key="empty-stack"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="h-full min-h-[240px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/40"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Call Stack is Empty
              </p>
              <p className="text-xs text-slate-400 max-w-[260px] mt-1.5 leading-relaxed">
                No active function activation records. Press <span className="text-indigo-300 font-medium">Play</span> or <span className="text-indigo-300 font-medium">Step Forward</span> to push the initial <code className="text-amber-300 font-mono">solve()</code> frame.
              </p>
            </motion.div>
          ) : (
            reversedStack.map((frame, index) => {
              const isTopOfStack = index === 0;
              const isActive = frame.id === activeFrameId || isTopOfStack;
              const stageInfo =
                STAGE_LABELS[frame.stage] || STAGE_LABELS['call'];

              return (
                <motion.div
                  key={frame.id}
                  layout
                  initial={{ opacity: 0, y: -24, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.88,
                    y: -16,
                    transition: { duration: 0.22 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 340,
                    damping: 28,
                  }}
                  className={`rounded-lg p-3 sm:p-3.5 border transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'bg-slate-800/90 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {/* Top of Stack Pointer Label */}
                  {isTopOfStack && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-500/30 text-[11px]">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold font-mono">
                        <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                        <span>TOP OF STACK (Active Frame)</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[10px]">
                        SP → 0x{((frame.depth + 1) * 1024).toString(16).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Function Signature Title */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs sm:text-[13px] font-bold text-slate-100 flex items-center gap-1.5 break-all">
                      <span className="text-indigo-400">solve</span>
                      <span className="text-slate-400">(</span>
                      <span className="text-amber-300 font-semibold">
                        n={frame.n}
                      </span>
                      <span className="text-slate-400">,</span>
                      <span className="text-slate-300">
                        src=&apos;{frame.source}&apos;
                      </span>
                      <span className="text-slate-400">,</span>
                      <span className="text-slate-300">
                        aux=&apos;{frame.auxiliary}&apos;
                      </span>
                      <span className="text-slate-400">,</span>
                      <span className="text-slate-300">
                        dest=&apos;{frame.destination}&apos;
                      </span>
                      <span className="text-slate-400">)</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                      }`}
                    >
                      Depth {frame.depth}
                    </span>
                  </div>

                  {/* Active Phase / Stage Badge */}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border inline-flex items-center gap-1 ${stageInfo.badge}`}
                    >
                      {isActive && <Sparkles className="w-2.5 h-2.5" />}
                      <span>{stageInfo.label}</span>
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      Line {frame.activeLine}
                    </span>
                  </div>

                  {/* Stack Frame Parameter Mini-Grid */}
                  <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-[11px] font-mono bg-slate-900/80 p-2 rounded border border-slate-800/70">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">
                        Disk N
                      </span>
                      <span className="text-amber-300 font-semibold">
                        {frame.n}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">
                        Source
                      </span>
                      <span className="text-slate-200">Peg {frame.source}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">
                        Auxiliary
                      </span>
                      <span className="text-slate-200">
                        Peg {frame.auxiliary}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">
                        Target
                      </span>
                      <span className="text-emerald-300 font-semibold">
                        Peg {frame.destination}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Stack Base Info */}
      <div className="pt-3 mt-auto border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-mono">Stack Base: main()</span>
        <span className="text-slate-400">
          Max recursion depth for N={maxPossibleDepth}: <span className="font-mono font-semibold text-slate-300">{maxPossibleDepth}</span>
        </span>
      </div>
    </div>
  );
};
