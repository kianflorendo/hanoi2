/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Code2, Info, CheckCircle2 } from 'lucide-react';
import { ActionType } from '../types/hanoi';

interface CodeTracerProps {
  highlightedLine: number;
  description: string;
  detailExplanation: string;
  actionType: ActionType;
}

const ALGORITHM_LINES = [
  { lineNum: 1, code: 'function solve(n, source, aux, dest):', indent: 0 },
  { lineNum: 2, code: '  if (n === 1):', indent: 1 },
  { lineNum: 3, code: '    moveDisk(1, source, dest)  // Base move', indent: 2 },
  { lineNum: 4, code: '    return', indent: 2 },
  { lineNum: 5, code: '  solve(n - 1, source, dest, aux)  // Step 1: clear to aux', indent: 1 },
  { lineNum: 6, code: '  moveDisk(n, source, dest)        // Step 2: move disk n', indent: 1 },
  { lineNum: 7, code: '  solve(n - 1, aux, source, dest)  // Step 3: place on dest', indent: 1 },
];

export const CodeTracer: React.FC<CodeTracerProps> = ({
  highlightedLine,
  description,
  detailExplanation,
  actionType,
}) => {
  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-3">
      {/* Code Tracer Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Recursive Algorithm Tracer
          </h4>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Line{' '}
          <span className="text-amber-300 font-bold tabular-nums">
            {highlightedLine > 0 ? highlightedLine : '—'}
          </span>{' '}
          / 7
        </div>
      </div>

      {/* Code Viewer */}
      <div className="rounded-lg bg-slate-950/90 border border-slate-800/90 p-2.5 font-mono text-xs overflow-x-auto">
        {ALGORITHM_LINES.map((line) => {
          const isCurrent = line.lineNum === highlightedLine;
          return (
            <div
              key={line.lineNum}
              className={`flex items-center py-1 px-2 rounded transition-all duration-150 ${
                isCurrent
                  ? 'bg-indigo-950/80 text-white font-medium border-l-2 border-indigo-400 pl-2 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {/* Line Number */}
              <span
                className={`w-6 text-[11px] text-right pr-3 select-none tabular-nums ${
                  isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-600'
                }`}
              >
                {line.lineNum}
              </span>

              {/* Code Line */}
              <span className="whitespace-pre">{line.code}</span>

              {/* Active pointer badge */}
              {isCurrent && (
                <span className="ml-auto text-[10px] text-indigo-300 bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-500/30 font-sans font-normal whitespace-nowrap">
                  Executing
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Plain-Text Description Callout (as required by prompt) */}
      <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-3 space-y-1">
        <div className="flex items-start gap-2">
          {actionType === 'complete' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          )}
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-200">
              {description}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {detailExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
