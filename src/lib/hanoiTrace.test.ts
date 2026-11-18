/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HanoiSnapshot, PegState, StackFrame, PegId } from '../types/hanoi';
import { snapshotAt, totalStepCount, traceEventCount } from './hanoiTrace';

/**
 * TEST ORACLE — the previous O(n * 2^n) implementation, copied verbatim from
 * hooks/useHanoi.ts before the lazy rewrite. Every snapshot produced by the new
 * O(n) closed-form implementation must be deep-equal to this for all n = 1..10.
 */
export function generateHanoiStepsLegacy(
  n: number,
  source: PegId = 'A',
  aux: PegId = 'B',
  dest: PegId = 'C'
): HanoiSnapshot[] {
  const snapshots: HanoiSnapshot[] = [];
  const currentPegs: PegState = {
    A: Array.from({ length: n }, (_, i) => n - i),
    B: [],
    C: [],
  };

  const currentStack: StackFrame[] = [];
  let moveCounter = 0;
  const totalMoves = Math.pow(2, n) - 1;
  let frameIdCounter = 0;

  const clonePegs = (pegs: PegState): PegState => ({
    A: [...pegs.A],
    B: [...pegs.B],
    C: [...pegs.C],
  });

  const cloneStack = (stack: StackFrame[]): StackFrame[] =>
    stack.map((frame) => ({ ...frame }));

  snapshots.push({
    stepIndex: 0,
    totalSteps: 0,
    moveNumber: 0,
    totalMoves,
    pegs: clonePegs(currentPegs),
    callStack: [],
    activeFrameId: null,
    actionType: 'start',
    movedDisk: null,
    description: `Ready to solve Tower of Hanoi with ${n} disks. Call stack is currently empty.`,
    detailExplanation: `Minimum required disk moves: 2^${n} - 1 = ${totalMoves}. Click 'Play' or 'Step Forward' to initiate the first recursive call.`,
    highlightedLine: 1,
  });

  function solve(
    diskN: number,
    src: PegId,
    auxiliary: PegId,
    destination: PegId,
    depth: number
  ) {
    frameIdCounter += 1;
    const frameId = `frame-${frameIdCounter}-${diskN}-${src}-${destination}`;
    const frame: StackFrame = {
      id: frameId,
      n: diskN,
      source: src,
      auxiliary,
      destination,
      stage: 'call',
      activeLine: 1,
      depth,
      label: `solve(n=${diskN}, src='${src}', aux='${auxiliary}', dest='${destination}')`,
    };

    currentStack.push(frame);
    snapshots.push({
      stepIndex: snapshots.length,
      totalSteps: 0,
      moveNumber: moveCounter,
      totalMoves,
      pegs: clonePegs(currentPegs),
      callStack: cloneStack(currentStack),
      activeFrameId: frameId,
      actionType: 'push',
      movedDisk: null,
      description:
        diskN === 1
          ? `Pushing base call: solve(n=1, ${src} → ${destination}) to the call stack.`
          : `Pushing recursive call: solve(n=${diskN}, ${src} → ${destination}) onto call stack.`,
      detailExplanation: `Stack grows deeper to depth ${depth + 1}. Function allocates activation record in stack memory.`,
      highlightedLine: 1,
    });

    frame.stage = 'base-check';
    frame.activeLine = 2;
    snapshots.push({
      stepIndex: snapshots.length,
      totalSteps: 0,
      moveNumber: moveCounter,
      totalMoves,
      pegs: clonePegs(currentPegs),
      callStack: cloneStack(currentStack),
      activeFrameId: frameId,
      actionType: 'line',
      movedDisk: null,
      description:
        diskN === 1
          ? `Evaluating base case: n === 1 evaluates to TRUE.`
          : `Evaluating base case: n === ${diskN} (false), proceeding to recursive decomposition.`,
      detailExplanation:
        diskN === 1
          ? `With only 1 disk left to move, no intermediate peg is needed. The disk can move directly.`
          : `With ${diskN} disks, the problem must be broken into two sub-problems of size ${diskN - 1}.`,
      highlightedLine: 2,
    });

    if (diskN === 1) {
      frame.stage = 'move-disk';
      frame.activeLine = 3;

      const moved = currentPegs[src].pop();
      if (moved !== undefined) {
        currentPegs[destination].push(moved);
      }
      moveCounter += 1;

      snapshots.push({
        stepIndex: snapshots.length,
        totalSteps: 0,
        moveNumber: moveCounter,
        totalMoves,
        pegs: clonePegs(currentPegs),
        callStack: cloneStack(currentStack),
        activeFrameId: frameId,
        actionType: 'move',
        movedDisk: { disk: 1, from: src, to: destination },
        description: `Base case reached: Moving disk 1 from ${src} to ${destination}.`,
        detailExplanation: `Disk 1 relocated from Peg ${src} directly onto Peg ${destination}. Move ${moveCounter} of ${totalMoves}.`,
        highlightedLine: 3,
      });

      frame.stage = 'return';
      frame.activeLine = 4;
      snapshots.push({
        stepIndex: snapshots.length,
        totalSteps: 0,
        moveNumber: moveCounter,
        totalMoves,
        pegs: clonePegs(currentPegs),
        callStack: cloneStack(currentStack),
        activeFrameId: frameId,
        actionType: 'line',
        movedDisk: null,
        description: `Base case execution complete. Returning from solve(n=1).`,
        detailExplanation: `Disk 1 was moved successfully. Function prepares to return control to its caller.`,
        highlightedLine: 4,
      });

      currentStack.pop();
      const parentFrame = currentStack[currentStack.length - 1];
      snapshots.push({
        stepIndex: snapshots.length,
        totalSteps: 0,
        moveNumber: moveCounter,
        totalMoves,
        pegs: clonePegs(currentPegs),
        callStack: cloneStack(currentStack),
        activeFrameId: parentFrame ? parentFrame.id : null,
        actionType: 'pop',
        movedDisk: null,
        description: `Popped solve(n=1, ${src} → ${destination}) from the call stack.`,
        detailExplanation: `Stack contracts. Memory frame deallocated. Resuming caller at depth ${depth}.`,
        highlightedLine: parentFrame ? parentFrame.activeLine : 0,
      });

      return;
    }

    frame.stage = 'recurse-left';
    frame.activeLine = 5;
    snapshots.push({
      stepIndex: snapshots.length,
      totalSteps: 0,
      moveNumber: moveCounter,
      totalMoves,
      pegs: clonePegs(currentPegs),
      callStack: cloneStack(currentStack),
      activeFrameId: frameId,
      actionType: 'line',
      movedDisk: null,
      description: `Step 1: Recursing to move top ${diskN - 1} disks from ${src} to ${auxiliary} (using ${destination} as aux).`,
      detailExplanation: `Before moving the largest disk (${diskN}), all ${diskN - 1} disks on top of it must be cleared to Peg ${auxiliary}.`,
      highlightedLine: 5,
    });

    solve(diskN - 1, src, destination, auxiliary, depth + 1);

    frame.stage = 'move-disk';
    frame.activeLine = 6;

    const moved = currentPegs[src].pop();
    if (moved !== undefined) {
      currentPegs[destination].push(moved);
    }
    moveCounter += 1;

    snapshots.push({
      stepIndex: snapshots.length,
      totalSteps: 0,
      moveNumber: moveCounter,
      totalMoves,
      pegs: clonePegs(currentPegs),
      callStack: cloneStack(currentStack),
      activeFrameId: frameId,
      actionType: 'move',
      movedDisk: { disk: diskN, from: src, to: destination },
      description: `Step 2: Moving disk ${diskN} from ${src} to ${destination}.`,
      detailExplanation: `Peg ${destination} is now clear to receive disk ${diskN}. Move ${moveCounter} of ${totalMoves}.`,
      highlightedLine: 6,
    });

    frame.stage = 'recurse-right';
    frame.activeLine = 7;
    snapshots.push({
      stepIndex: snapshots.length,
      totalSteps: 0,
      moveNumber: moveCounter,
      totalMoves,
      pegs: clonePegs(currentPegs),
      callStack: cloneStack(currentStack),
      activeFrameId: frameId,
      actionType: 'line',
      movedDisk: null,
      description: `Step 3: Recursing to transfer the ${diskN - 1} disks from ${auxiliary} onto ${destination} (using ${src} as aux).`,
      detailExplanation: `Disk ${diskN} is in place. Now bringing the remaining ${diskN - 1} disks over to rest on top of it.`,
      highlightedLine: 7,
    });

    solve(diskN - 1, auxiliary, src, destination, depth + 1);

    currentStack.pop();
    const parentFrame = currentStack[currentStack.length - 1];
    snapshots.push({
      stepIndex: snapshots.length,
      totalSteps: 0,
      moveNumber: moveCounter,
      totalMoves,
      pegs: clonePegs(currentPegs),
      callStack: cloneStack(currentStack),
      activeFrameId: parentFrame ? parentFrame.id : null,
      actionType: 'pop',
      movedDisk: null,
      description: `Popped solve(n=${diskN}, ${src} → ${destination}) from the call stack.`,
      detailExplanation: `All sub-problems for n=${diskN} completed. Memory deallocated.`,
      highlightedLine: parentFrame ? parentFrame.activeLine : 0,
    });
  }

  solve(n, source, aux, dest, 0);

  snapshots.push({
    stepIndex: snapshots.length,
    totalSteps: 0,
    moveNumber: moveCounter,
    totalMoves,
    pegs: clonePegs(currentPegs),
    callStack: [],
    activeFrameId: null,
    actionType: 'complete',
    movedDisk: null,
    description: `Tower of Hanoi solved successfully in ${moveCounter} moves!`,
    detailExplanation: `All ${n} disks successfully transferred from Peg A to Peg C in exactly 2^${n} - 1 = ${totalMoves} moves. Call stack returned to 0 frames.`,
    highlightedLine: 0,
  });

  const total = snapshots.length - 1;
  snapshots.forEach((s) => {
    s.totalSteps = total;
  });

  return snapshots;
}

for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  test(`snapshotAt(n=${n}) matches legacy generator at every step`, () => {
    const oracle = generateHanoiStepsLegacy(n);
    assert.equal(totalStepCount(n), oracle.length - 1, 'totalSteps mismatch');
    for (let i = 0; i < oracle.length; i++) {
      assert.deepEqual(snapshotAt(n, i), oracle[i], `divergence at step ${i}`);
    }
  });
}

test('traceEventCount closed form E(n) = 11*2^(n-1) - 6', () => {
  for (let n = 1; n <= 12; n++) {
    const oracleLen = generateHanoiStepsLegacy(n).length;
    assert.equal(traceEventCount(n) + 2, oracleLen, `E(${n}) vs oracle length`);
  }
});

test('large-n random access stays fast and legal (n=40)', () => {
  const n = 40;
  const total = totalStepCount(n); // 11*2^39 - 5, well within float precision
  const t0 = process.hrtime.bigint();
  for (const frac of [0, 0.001, 0.25, 0.5, 0.75, 0.999, 1]) {
    const snap = snapshotAt(n, Math.round(total * frac));
    assert.equal(snap.pegs.A.length + snap.pegs.B.length + snap.pegs.C.length, n);
  }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  assert.ok(ms < 100, `random access too slow: ${ms}ms`);
});
