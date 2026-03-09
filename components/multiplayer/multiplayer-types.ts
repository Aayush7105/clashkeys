import type { SoloMode } from "../soloplay/soloplay-modes";

export type RoomUser = {
  id: string;
  name: string;
  progress: number;
  correctChars: number;
  totalKeystrokes: number;
};

export type TestStartedPayload = {
  text?: string;
  duration?: number;
  mode?: SoloMode;
  startedAt?: number;
  users?: RoomUser[];
};

export type RoomSettingsPayload = {
  duration?: number;
  mode?: SoloMode;
};
