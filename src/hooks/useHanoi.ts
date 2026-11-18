/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { snapshotAt, totalStepCount, MAX_SAFE_DISKS } from '../lib/hanoiTrace';
import { HanoiSnapshot } from '../types/hanoi';

export function useHanoi(initialDisks: number = 3) {
  const [diskCount, setDiskCount] = useState<number>(initialDisks);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 1.5x, 2x, 3x

  // Total number of steps from the closed form: no trace is ever materialized.
  // Any single snapshot is reconstructed on demand in O(n) via snapshotAt().
  // Counts stay float-exact only up to MAX_SAFE_DISKS (2^53 integer range).
  const n = Math.min(diskCount, MAX_SAFE_DISKS);
  const totalSteps = useMemo(() => totalStepCount(n), [n]);

  // When disk count changes, reset step to 0 and pause
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [diskCount]);

  const currentSnapshot = useMemo(
    () => snapshotAt(n, Math.min(currentStepIndex, totalSteps)),
    [n, currentStepIndex, totalSteps]
  );

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

  // Auto-play timer
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

    // Interval derived from playback speed
    const baseInterval = 900; // ms
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
