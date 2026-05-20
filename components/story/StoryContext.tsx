"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { calculate } from "@/lib/calculator";
import type { AcceptorId, CalculatorResult, DonorId } from "@/lib/types";

type StoryState = {
  donorId: DonorId;
  acceptorId: AcceptorId;
  fs: number;
  setDonorId: (id: DonorId) => void;
  setAcceptorId: (id: AcceptorId) => void;
  setFs: (v: number) => void;
  result: CalculatorResult;
  handoffHref: string;
};

const StoryCtx = createContext<StoryState | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [donorId, setDonorId] = useState<DonorId>("glucose");
  const [acceptorId, setAcceptorId] = useState<AcceptorId>("oxygen");
  const [fs, setFs] = useState(0.4);

  const result = useMemo(
    () => calculate({ donorId, acceptorId, fs }),
    [donorId, acceptorId, fs],
  );

  const handoffHref = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("donor", donorId);
    sp.set("acceptor", acceptorId);
    sp.set("fs", fs.toFixed(2));
    return `/calc?${sp.toString()}`;
  }, [donorId, acceptorId, fs]);

  const value = useMemo<StoryState>(
    () => ({
      donorId,
      acceptorId,
      fs,
      setDonorId,
      setAcceptorId,
      setFs,
      result,
      handoffHref,
    }),
    [donorId, acceptorId, fs, result, handoffHref],
  );

  return <StoryCtx.Provider value={value}>{children}</StoryCtx.Provider>;
}

export function useStory(): StoryState {
  const v = useContext(StoryCtx);
  if (!v) throw new Error("useStory must be used within StoryProvider");
  return v;
}
