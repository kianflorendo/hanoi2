/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PegId = 'A' | 'B' | 'C';

export interface PegInfo {
  id: PegId;
  name: string;
  role: 'Source' | 'Auxiliary' | 'Destination';
}

export type PegState = Record<PegId, number[]>;

export interface StackFrame {
  id: string;
  n: number;
  source: PegId;
  auxiliary: PegId;
  destination: PegId;
  stage: 'call' | 'base-check' | 'recurse-left' | 'move-disk' | 'recurse-right' | 'return';
  activeLine: number;
  depth: number;
  label: string;
}

export type ActionType = 'start' | 'push' | 'line' | 'move' | 'pop' | 'complete';

export interface HanoiSnapshot {
  stepIndex: number;
  totalSteps: number;
  moveNumber: number;
  totalMoves: number;
  pegs: PegState;
  callStack: StackFrame[];
  activeFrameId: string | null;
  actionType: ActionType;
  movedDisk: { disk: number; from: PegId; to: PegId } | null;
  description: string;
  detailExplanation: string;
  highlightedLine: number;
}
