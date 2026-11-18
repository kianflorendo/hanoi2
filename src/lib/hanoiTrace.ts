/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HanoiSnapshot, PegState, StackFrame, PegId } from '../types/hanoi';

/**
 * Lazy, O(n)-per-step reconstruction of the Tower of Hanoi recursion trace.
 *
 * The previous implementation materialized the ENTIRE trace as an array:
 * ~6 snapshots per call frame x (2^n - 1) frames, each snapshot deep-cloning
 * the pegs O(n) and the whole call stack O(n) — O(n * 2^n) time and memory,
 * computed synchronously in a useMemo. n = 15 was already hundreds of
 * megabytes; n >= 20 froze the tab.
 *
 * This module computes any single step in O(n) time and O(n) memory using
 * closed forms instead of replaying:
 *
 * - Trace event count: E(1) = 5, E(k) = 6 + 2*E(k-1)  =>  E(n) = 11*2^(n-1) - 6.
 * - Peg of disk d (1 = smallest) after m completed moves:
 *     peg(d, m) = (dir_d * floor((m + 2^(d-1)) / 2^d)) mod 3,
 *   with dir_d = -1 when (n - d) is even, else +1; pegs 0='A', 1='B', 2='C'.
 * - The call stack at any step is rebuilt by an O(n) descent that locates the
 *   step inside the recursive event layout without materializing sibling
 *   traces; the frameId counter follows the pre-order position of each frame.
 *
 * Results are byte-identical to the eager generator for all steps (verified
 * exhaustively for n = 1..10 in hanoiTrace.test.ts).
 */

const PEG_IDS: PegId[] = ['A', 'B', 'C'];

/** Largest n for which every count used here stays exact as a JS number. */
export const MAX_SAFE_DISKS = 52;

/** Number of recursion-trace events emitted by solve(n): 11*2^(n-1) - 6. */
export function traceEventCount(n: number): number {
  return 11 * Math.pow(2, n - 1) - 6;
}

/** Total steps exposed by the stepper: start + trace + complete, minus one. */
export function totalStepCount(n: number): number {
  return traceEventCount(n) + 1;
}

function diskPeg(n: number, d: number, m: number): number {
  const movesOfDisk = Math.floor((m + Math.pow(2, d - 1)) / Math.pow(2, d));
  const direction = (n - d) % 2 === 0 ? -1 : 1;
  return (((direction * movesOfDisk) % 3) + 3) % 3;
}

/** Peg state after m completed moves (arrays are bottom -> top, disks 1..n). */
function pegsAfter(n: number, m: number): PegState {
  const pegs: PegState = { A: [], B: [], C: [] };
  for (let d = n; d >= 1; d--) {
    pegs[PEG_IDS[diskPeg(n, d, m)]].push(d);
  }
  return pegs;
}

interface FrameRef {
  counter: number;
  k: number;
  src: PegId;
  aux: PegId;
  dest: PegId;
  depth: number;
  stage: StackFrame['stage'];
  activeLine: number;
}

function toStackFrame(f: FrameRef): StackFrame {
  return {
    id: `frame-${f.counter}-${f.k}-${f.src}-${f.dest}`,
    n: f.k,
    source: f.src,
    auxiliary: f.aux,
    destination: f.dest,
    stage: f.stage,
    activeLine: f.activeLine,
    depth: f.depth,
    label: `solve(n=${f.k}, src='${f.src}', aux='${f.aux}', dest='${f.dest}')`,
  };
}

/**
 * Reconstruct the snapshot for one step of the trace. `i` is the 1-based index
 * of the event within the sub-trace of solve(k, src->dest via aux); `chain`
 * holds the frames of all active ancestors (this frame is pushed here).
 */
function descend(
  n: number,
  stepIndex: number,
  k: number,
  src: PegId,
  aux: PegId,
  dest: PegId,
  depth: number,
  counter: number,
  i: number,
  movesBefore: number,
  chain: FrameRef[]
): HanoiSnapshot {
  const totalSteps = totalStepCount(n);
  const totalMoves = Math.pow(2, n) - 1;

  const me: FrameRef = { counter, k, src, aux, dest, depth, stage: 'call', activeLine: 1 };
  chain.push(me);

  const snap = (o: {
    moveNumber: number;
    pegs: PegState;
    activeFrameId: string | null;
    actionType: HanoiSnapshot['actionType'];
    movedDisk: HanoiSnapshot['movedDisk'];
    description: string;
    detailExplanation: string;
    highlightedLine: number;
    popped?: boolean;
  }): HanoiSnapshot => ({
    stepIndex,
    totalSteps,
    moveNumber: o.moveNumber,
    totalMoves,
    pegs: o.pegs,
    callStack: (o.popped ? chain.slice(0, -1) : chain).map(toStackFrame),
    activeFrameId: o.activeFrameId,
    actionType: o.actionType,
    movedDisk: o.movedDisk,
    description: o.description,
    detailExplanation: o.detailExplanation,
    highlightedLine: o.highlightedLine,
  });

  const parent = () => chain[chain.length - 2];
  const frameId = `frame-${counter}-${k}-${src}-${dest}`;

  // Event 1: push
  if (i === 1) {
    return snap({
      moveNumber: movesBefore,
      pegs: pegsAfter(n, movesBefore),
      activeFrameId: frameId,
      actionType: 'push',
      movedDisk: null,
      description:
        k === 1
          ? `Pushing base call: solve(n=1, ${src} → ${dest}) to the call stack.`
          : `Pushing recursive call: solve(n=${k}, ${src} → ${dest}) onto call stack.`,
      detailExplanation: `Stack grows deeper to depth ${depth + 1}. Function allocates activation record in stack memory.`,
      highlightedLine: 1,
    });
  }

  // Event 2: base case check
  me.stage = 'base-check';
  me.activeLine = 2;
  if (i === 2) {
    return snap({
      moveNumber: movesBefore,
      pegs: pegsAfter(n, movesBefore),
      activeFrameId: frameId,
      actionType: 'line',
      movedDisk: null,
      description:
        k === 1
          ? `Evaluating base case: n === 1 evaluates to TRUE.`
          : `Evaluating base case: n === ${k} (false), proceeding to recursive decomposition.`,
      detailExplanation:
        k === 1
          ? `With only 1 disk left to move, no intermediate peg is needed. The disk can move directly.`
          : `With ${k} disks, the problem must be broken into two sub-problems of size ${k - 1}.`,
      highlightedLine: 2,
    });
  }

  if (k === 1) {
    // Event 3: move disk 1
    me.stage = 'move-disk';
    me.activeLine = 3;
    if (i === 3) {
      return snap({
        moveNumber: movesBefore + 1,
        pegs: pegsAfter(n, movesBefore + 1),
        activeFrameId: frameId,
        actionType: 'move',
        movedDisk: { disk: 1, from: src, to: dest },
        description: `Base case reached: Moving disk 1 from ${src} to ${dest}.`,
        detailExplanation: `Disk 1 relocated from Peg ${src} directly onto Peg ${dest}. Move ${movesBefore + 1} of ${totalMoves}.`,
        highlightedLine: 3,
      });
    }

    // Event 4: return line
    me.stage = 'return';
    me.activeLine = 4;
    if (i === 4) {
      return snap({
        moveNumber: movesBefore + 1,
        pegs: pegsAfter(n, movesBefore + 1),
        activeFrameId: frameId,
        actionType: 'line',
        movedDisk: null,
        description: `Base case execution complete. Returning from solve(n=1).`,
        detailExplanation: `Disk 1 was moved successfully. Function prepares to return control to its caller.`,
        highlightedLine: 4,
      });
    }

    // Event 5: pop
    const p = parent();
    return snap({
      moveNumber: movesBefore + 1,
      pegs: pegsAfter(n, movesBefore + 1),
      activeFrameId: p ? `frame-${p.counter}-${p.k}-${p.src}-${p.dest}` : null,
      actionType: 'pop',
      movedDisk: null,
      description: `Popped solve(n=1, ${src} → ${dest}) from the call stack.`,
      detailExplanation: `Stack contracts. Memory frame deallocated. Resuming caller at depth ${depth}.`,
      highlightedLine: p ? p.activeLine : 0,
      popped: true,
    });
  }

  const subEvents = traceEventCount(k - 1);
  const subMoves = Math.pow(2, k - 1) - 1;

  // Event 3: recurse-left line
  me.stage = 'recurse-left';
  me.activeLine = 5;
  if (i === 3) {
    return snap({
      moveNumber: movesBefore,
      pegs: pegsAfter(n, movesBefore),
      activeFrameId: frameId,
      actionType: 'line',
      movedDisk: null,
      description: `Step 1: Recursing to move top ${k - 1} disks from ${src} to ${aux} (using ${dest} as aux).`,
      detailExplanation: `Before moving the largest disk (${k}), all ${k - 1} disks on top of it must be cleared to Peg ${aux}.`,
      highlightedLine: 5,
    });
  }

  // Events 4 .. 3+subEvents: left sub-trace
  if (i <= 3 + subEvents) {
    return descend(n, stepIndex, k - 1, src, dest, aux, depth + 1, counter + 1, i - 3, movesBefore, chain);
  }

  // Event 4+subEvents: move disk k
  me.stage = 'move-disk';
  me.activeLine = 6;
  if (i === 4 + subEvents) {
    return snap({
      moveNumber: movesBefore + subMoves + 1,
      pegs: pegsAfter(n, movesBefore + subMoves + 1),
      activeFrameId: frameId,
      actionType: 'move',
      movedDisk: { disk: k, from: src, to: dest },
      description: `Step 2: Moving disk ${k} from ${src} to ${dest}.`,
      detailExplanation: `Peg ${dest} is now clear to receive disk ${k}. Move ${movesBefore + subMoves + 1} of ${totalMoves}.`,
      highlightedLine: 6,
    });
  }

  // Event 5+subEvents: recurse-right line
  me.stage = 'recurse-right';
  me.activeLine = 7;
  if (i === 5 + subEvents) {
    return snap({
      moveNumber: movesBefore + subMoves + 1,
      pegs: pegsAfter(n, movesBefore + subMoves + 1),
      activeFrameId: frameId,
      actionType: 'line',
      movedDisk: null,
      description: `Step 3: Recursing to transfer the ${k - 1} disks from ${aux} onto ${dest} (using ${src} as aux).`,
      detailExplanation: `Disk ${k} is in place. Now bringing the remaining ${k - 1} disks over to rest on top of it.`,
      highlightedLine: 7,
    });
  }

  // Events 6+subEvents .. 5+2*subEvents: right sub-trace
  if (i <= 5 + 2 * subEvents) {
    return descend(
      n, stepIndex, k - 1, aux, src, dest, depth + 1,
      counter + 1 + subMoves, // pre-order: skip entire left subtree
      i - (5 + subEvents),
      movesBefore + subMoves + 1,
      chain
    );
  }

  // Final event: pop
  const p = parent();
  return snap({
    moveNumber: movesBefore + Math.pow(2, k) - 1,
    pegs: pegsAfter(n, movesBefore + Math.pow(2, k) - 1),
    activeFrameId: p ? `frame-${p.counter}-${p.k}-${p.src}-${p.dest}` : null,
    actionType: 'pop',
    movedDisk: null,
    description: `Popped solve(n=${k}, ${src} → ${dest}) from the call stack.`,
    detailExplanation: `All sub-problems for n=${k} completed. Memory deallocated.`,
    highlightedLine: p ? p.activeLine : 0,
    popped: true,
  });
}

/**
 * The snapshot for any step index in O(n) — no precomputation, no arrays of
 * snapshots, safe for any n up to MAX_SAFE_DISKS.
 */
export function snapshotAt(n: number, stepIndex: number): HanoiSnapshot {
  const total = totalStepCount(n);
  const s = Math.max(0, Math.min(Math.round(stepIndex), total));
  const totalMoves = Math.pow(2, n) - 1;
  const base = { totalSteps: total, totalMoves };

  if (s === 0) {
    return {
      ...base,
      stepIndex: 0,
      moveNumber: 0,
      pegs: pegsAfter(n, 0),
      callStack: [],
      activeFrameId: null,
      actionType: 'start',
      movedDisk: null,
      description: `Ready to solve Tower of Hanoi with ${n} disks. Call stack is currently empty.`,
      detailExplanation: `Minimum required disk moves: 2^${n} - 1 = ${totalMoves}. Click 'Play' or 'Step Forward' to initiate the first recursive call.`,
      highlightedLine: 1,
    };
  }

  if (s === total) {
    return {
      ...base,
      stepIndex: total,
      moveNumber: totalMoves,
      pegs: pegsAfter(n, totalMoves),
      callStack: [],
      activeFrameId: null,
      actionType: 'complete',
      movedDisk: null,
      description: `Tower of Hanoi solved successfully in ${totalMoves} moves!`,
      detailExplanation: `All ${n} disks successfully transferred from Peg A to Peg C in exactly 2^${n} - 1 = ${totalMoves} moves. Call stack returned to 0 frames.`,
      highlightedLine: 0,
    };
  }

  return descend(n, s, n, 'A', 'B', 'C', 0, 1, s, 0, []);
}
