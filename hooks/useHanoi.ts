/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PegId, PegState, StackFrame, HanoiSnapshot } from '@/types/hanoi';

/**
 * Pure recursive generator for Tower of Hanoi execution frames.
 * Returns an immutable array of snapshots synchronizing physical peg positions,
 * call stack memory state, and algorithm execution line markers.
 */
export function generateHanoiSteps(
  n: number,
  source: PegId = 'A',
  aux: PegId = 'B',
  dest: PegId = 'C'
): HanoiSnapshot[] {
  const snapshots: HanoiSnapshot[] = [];
  const currentPegs: PegState = {
    A: Array.from({ length: n }, (_, i) => n - i), // [n, n-1, ..., 1] (bottom to top)
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

  // Initial Snapshot: Ready to start
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

    // 1. PUSH frame onto call stack
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

    // 2. CHECK base condition
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
      // Base Case: Move disk 1 directly
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

      // Base Case Return
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

      // POP base frame
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

    // Sub-Problem 1: Move n-1 disks from src to aux using destination
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

    // After sub-problem 1 returns: Move the largest disk n from src to destination
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

    // Sub-Problem 2: Move n-1 disks from auxiliary to destination using src
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

    // Frame complete: POP from call stack
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

  // Run pure recursive generation
  solve(n, source, aux, dest, 0);

  // Final completion snapshot
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

export function useHanoi(initialDisks: number = 3) {
  const [diskCount, setDiskCount] = useState<number>(initialDisks);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const snapshots = useMemo(() => {
    return generateHanoiSteps(diskCount);
  }, [diskCount]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [diskCount]);

  const currentSnapshot = snapshots[currentStepIndex] || snapshots[0];
  const totalSteps = snapshots.length - 1;

  const stepForward = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const jumpToStep = useCallback(
    (index: number) => {
      setIsPlaying(false);
      setCurrentStepIndex(Math.max(0, Math.min(index, totalSteps)));
    },
    [totalSteps]
  );

  const togglePlay = useCallback(() => {
    if (currentStepIndex >= totalSteps) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, totalSteps]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (currentStepIndex >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const baseInterval = 900;
    const interval = Math.max(120, Math.round(baseInterval / playbackSpeed));

    timerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev + 1 >= totalSteps) {
          setIsPlaying(false);
          return totalSteps;
        }
        return prev + 1;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed]);

  return {
    diskCount,
    setDiskCount,
    currentStepIndex,
    setCurrentStepIndex,
    currentSnapshot,
    snapshots,
    totalSteps,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    togglePlay,
  };
}
