import RoomPage from "@/components/multiplayer/multiplayerarea";
export const dynamic = "force-dynamic";

type RoomSearchParams = {
  roomId?: string;
  name?: string;
  duration?: string;
  mode?: string;
};

export default async function Room({
  searchParams,
}: {
  searchParams?: Promise<RoomSearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <RoomPage
      initialRoomId={params?.roomId}
      initialName={params?.name}
      initialDuration={params?.duration}
      initialMode={params?.mode}
    />
  );
}
