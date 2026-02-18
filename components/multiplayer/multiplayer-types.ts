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
  startedAt?: number;
  users?: RoomUser[];
};
