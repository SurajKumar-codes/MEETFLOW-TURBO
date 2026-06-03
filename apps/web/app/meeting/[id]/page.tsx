import MeetingClient from "./MeetingClient";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ passcode?: string }>;
}) {
  const { id } = await params;
  const { passcode } = await searchParams;

  return <MeetingClient meetingId={id} passcode={passcode} />;
}
