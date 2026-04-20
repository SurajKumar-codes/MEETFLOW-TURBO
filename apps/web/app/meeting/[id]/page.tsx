

import MeetingClient from "./MeetingClient";

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { passcode?: string };
}) {
  const {id} = await params;
  return <MeetingClient meetingId={id} passcode={searchParams?.passcode} />;
}
