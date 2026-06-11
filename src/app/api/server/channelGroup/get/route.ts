import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getSCGByServerId, checkAdmin } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const userId = req.auth.user.id;
  const userRoles = [searchParams.getAll("userRoles[]")]
    .flat()
    .filter((role): role is string => role !== null);

  if (!serverId) {
    return NextResponse.json(
      { success: false, message: "Missing serverId" },
      { status: 400 },
    );
  }

  const isAdmin = await checkAdmin(serverId, req.auth.user.id);

  try {
    const serverGroups = await getSCGByServerId(serverId);

    const filterChannels = (channels: (typeof serverGroups)[0]["channels"]) =>
      channels
        .map((channel: (typeof serverGroups)[0]["channels"][0]) => {
          if (channel.users.length === 0 && channel.roles.length === 0) {
            return channel;
          }
          return channel.users.some((user) => user.id === userId) ||
            channel.roles.some((role) => userRoles.includes(role.id))
            ? channel
            : null;
        })
        .filter((channel) => channel !== null);

    const filteredGroups = serverGroups
      .map((group) => {
        // Public group — no group-level restrictions, but still filter channels
        if (group.exclusiveUsers.length === 0 && group.roles.length === 0) {
          return { ...group, channels: filterChannels(group.channels) };
        }

        // User has no access to this group — exclude it entirely
        if (
          !group.exclusiveUsers.some((user) => user.id === userId) &&
          !group.roles.some((role) => userRoles.includes(role.id))
        ) {
          return null;
        }

        // User has access to the group — filter channels based on user access
        return { ...group, channels: filterChannels(group.channels) };
      })
      .filter((group) => group !== null);

    // return all groups and channels if user is an admin, otherwise return filtered groups and channels
    if (isAdmin) {
      return NextResponse.json({ success: true, filteredGroups: serverGroups });
    }
    return NextResponse.json({ success: true, filteredGroups });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
