import { prisma } from "@/lib/prisma";

// User queries
export const getUserFromDb = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const getUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: {
      username,
    },
  });
};

export const createUser = async (
  email: string,
  displayName: string,
  username: string,
  password: string,
  status: string,
) => {
  return await prisma.user.create({
    data: {
      email,
      displayName,
      username,
      password,
      status,
    },
  });
};

export const setStatus = async (email: string, status: string) => {
  return await prisma.user.update({
    where: {
      email,
    },
    data: {
      status,
    },
  });
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const getUserIdByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  return user?.id || null;
};

export const getFriendsList = async (userId: string) => {
  return await prisma.user.findMany({
    where: {
      OR: [
        { sentRequests: { some: { addresseeId: userId, status: "ACCEPTED" } } },
        {
          receivedRequests: {
            some: { requesterId: userId, status: "ACCEPTED" },
          },
        },
      ],
    },
    include: {
      channels: {
        where: {
          GroupChat: false,
          serverType: false,
          name: null,
          SCGId: null,
          users: { some: { id: userId } },
        },
      },
    },
    orderBy: {
      displayName: "asc",
    },
  });
};

export const getPendingFriendRequests = async (userId: string) => {
  return await prisma.user.findMany({
    where: {
      sentRequests: {
        some: {
          addresseeId: userId,
          status: "PENDING",
        },
      },
    },
    include: {
      sentRequests: {
        where: {
          addresseeId: userId,
          status: "PENDING",
        },
      },
    },
  });
};

export const checkRequestExists = async (
  senderId: string,
  receiverId: string,
) => {
  return await prisma.friendship.findFirst({
    where: {
      OR: [
        {
          requesterId: senderId,
          addresseeId: receiverId,
        },
        {
          requesterId: receiverId,
          addresseeId: senderId,
        },
      ],
    },
  });
};

export const getSentFriendRequests = async (userId: string) => {
  return await prisma.user.findMany({
    where: {
      receivedRequests: {
        some: {
          requesterId: userId,
          status: "PENDING",
        },
      },
    },
    include: {
      receivedRequests: {
        where: {
          requesterId: userId,
          status: "PENDING",
        },
      },
    },
  });
};

export const getUserChannels = async (userId: string) => {
  return await prisma.channel.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      users: {
        where: {
          id: {
            not: userId,
          },
        },
      },
    },
  });
};

export const getChannelByUserid = async (userId: string, userId2: string) => {
  return await prisma.channel.findFirst({
    where: {
      AND: [
        { users: { some: { id: userId } } },
        { users: { some: { id: userId2 } } },
        { users: { every: { id: { in: [userId, userId2] } } } },
      ],
    },
  });
};

// Friendship queries
export const createFriendRequest = async (
  requesterId: string,
  addresseeId: string,
) => {
  return await prisma.friendship.create({
    data: {
      requesterId,
      addresseeId,
      status: "PENDING",
    },
  });
};

export const findExistingFriendRequest = async (
  requesterId: string,
  addresseeId: string,
) => {
  return await prisma.friendship.findFirst({
    where: {
      requesterId,
      addresseeId,
    },
  });
};

export const acceptFriendRequest = async (requestId: string) => {
  return await prisma.friendship.update({
    where: {
      id: requestId,
    },
    data: {
      status: "ACCEPTED",
    },
  });
};

export const rejectFriendRequest = async (requestId: string) => {
  return await prisma.friendship.update({
    where: {
      id: requestId,
    },
    data: {
      status: "STRANGER",
    },
  });
};

// Channel queries
export const createChannel = async (
  SCGId?: string,
  name?: string,
  friendId?: string,
  sessionUserId?: string,
) => {
  if (sessionUserId && friendId) {
    return await prisma.channel.create({
      data: {
        users: {
          connect: [{ id: sessionUserId || "" }, { id: friendId || "" }],
        },
      },
    });
  }

  if (SCGId && name) {
    return await prisma.channel.create({
      data: {
        SCGId,
        name,
        serverType: true,
      },
    });
  }
};

export const createServerChannel = async (
  SCGId: string,
  name: string,
  exclusiveUserIds: string[] = [],
  exclusiveRolesIds: string[] = [],
) => {
  return await prisma.channel.create({
    data: {
      SCGId,
      name,
      serverType: true,
      users: {
        connect: exclusiveUserIds.map((id) => ({ id })),
      },
      roles: {
        connect: exclusiveRolesIds.map((id) => ({ id })),
      },
    },
  });
};

export const getChannelById = async (channelId: string) => {
  return await prisma.channel.findUnique({
    where: {
      id: channelId,
    },
    include: {
      users: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: true,
        },
      },
    },
  });
};

export const getChannelByUserId = async (userId: string) => {
  return await prisma.channel.findMany({
    where: {
      visible: true,
      GroupChat: false,
      serverType: false,
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      users: {
        where: {
          id: {
            not: userId,
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const setChannelVisibility = async (
  channelId: string,
  visible: boolean,
) => {
  return await prisma.channel.update({
    where: {
      id: channelId,
    },
    data: {
      visible: visible,
    },
  });
};

export const getServerChannels = async (serverId: string) => {
  return await prisma.channel.findMany({
    where: {
      channelGroup: {
        serverId: serverId,
      },
    },
    include: {
      users: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: true,
        },
      },
    },
  });
};

export const getFriendChannel = async (userId: string, friendId: string) => {
  return await prisma.channel.findFirst({
    where: {
      GroupChat: false,
      serverType: false,
      AND: [
        { users: { some: { id: userId } } },
        { users: { some: { id: friendId } } },
      ],
    },
  });
};

// message queries
export const createMessage = async (
  channelId: string,
  senderId: string,
  content: string,
) => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { channelId, senderId, content },
      include: { sender: true },
    }),
    prisma.channel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
};

// server queries
export const createServer = async (
  name: string,
  serverType: boolean,
  sessionUserId: string,
) => {
  return await prisma.server.create({
    data: {
      name,
      public: serverType,
      users: {
        connect: { id: sessionUserId },
      },
    },
  });
};

export const getServerbyId = async (serverId: string) => {
  return await prisma.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      users: true,
      roles: true,
      channelGroups: {
        include: {
          channels: true,
        },
      },
    },
  });
};

export const getServerById = async (serverId: string) => {
  return await prisma.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channelGroups: {
        include: {
          channels: true,
        },
      },
      users: {
        orderBy: {
          displayName: "asc",
        },
        include: {
          userRoles: {
            where: {
              serverId,
            },
            orderBy: {
              rank: "asc",
            },
          },
        },
      },
    },
  });
};

export const getServerByUserId = async (userId: string) => {
  return await prisma.server.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      channelGroups: {
        include: {
          channels: true,
        },
      },
    },
  });
};

export const checkUserMembership = async (serverId: string, userId: string) => {
  return await prisma.server.findFirst({
    where: {
      id: serverId,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });
};

export const deleteServer = async (serverId: string) => {
  return await prisma.server.delete({
    where: {
      id: serverId,
    },
  });
};

export const userJoinServer = async (serverId: string, userId: string) => {
  return await prisma.server.update({
    where: {
      id: serverId,
    },
    data: {
      users: {
        connect: { id: userId },
      },
    },
  });
};

export const getServerMembers = async (serverId: string) => {
  return await prisma.user.findMany({
    where: {
      servers: {
        some: {
          id: serverId,
        },
      },
    },
  });
};

// role queries
export const createRole = async (
  serverId: string,
  role: string,
  userId?: string,
  admin?: boolean,
  rank?: number,
) => {
  if (!userId) {
    // standard role creation within a server
    return await prisma.serverRoles.create({
      data: {
        serverId,
        role,
        admin,
        rank,
      },
    });
  } else {
    // create role on server creation
    return await prisma.serverRoles.create({
      data: {
        serverId,
        role,
        admin,
        users: {
          connect: { id: userId },
        },
      },
    });
  }
};

export const getRolesByServerId = async (serverId: string) => {
  return await prisma.serverRoles.findMany({
    where: {
      serverId,
      role: { not: "Owner" },
    },
    include: {
      users: true,
    },
    orderBy: {
      rank: "asc",
    },
  });
};

export const getRolesByUserId = async (serverId: string, userId: string) => {
  return await prisma.serverRoles.findMany({
    where: {
      serverId,
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      users: true,
    },
    orderBy: {
      rank: "asc",
    },
  });
};

export const checkAdmin = async (serverId: string, userId: string) => {
  return await prisma.serverRoles.findFirst({
    where: {
      serverId,
      admin: true,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });
};

export const updateRank = async (roleId: string, rank: number) => {
  return await prisma.serverRoles.update({
    where: {
      id: roleId,
    },
    data: {
      rank: rank,
    },
  });
};

export const addUserToRole = async (roleId: string, userId: string) => {
  return await prisma.serverRoles.update({
    where: {
      id: roleId,
    },
    data: {
      users: {
        connect: { id: userId },
      },
    },
  });
};

export const removeUserFromRole = async (roleId: string, userId: string) => {
  return await prisma.serverRoles.update({
    where: {
      id: roleId,
    },
    data: {
      users: {
        disconnect: { id: userId },
      },
    },
  });
};

// Server Channel Group queries
export const createSCG = async (
  serverId: string,
  name: string,
  exclusiveUserIds: string[] = [],
  exclusiveRolesIds: string[] = [],
) => {
  return await prisma.serverChannelGroup.create({
    data: {
      serverId,
      name,
      exclusiveUsers: {
        connect: exclusiveUserIds.map((id) => ({ id })),
      },
      roles: {
        connect: exclusiveRolesIds.map((id) => ({ id })),
      },
    },
  });
};

// fetch categories and channels that either have no roles or contain the users roles
export const getSCGByServerId = async (serverId: string) => {
  return await prisma.serverChannelGroup.findMany({
    where: {
      serverId,
    },
    include: {
      server: true,
      channels: {
        include: {
          users: true,
          roles: true,
        },
      },
      exclusiveUsers: true,
      roles: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

// server invite queries
export const checkServerInviteExists = async (serverId: string) => {
  return await prisma.serverInvite.findFirst({
    where: {
      serverId,
    },
  });
};

const generateInviteCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const createServerInvite = async (serverId: string) => {
  const code = generateInviteCode();
  return await prisma.serverInvite.create({
    data: {
      serverId,
      code,
    },
  });
};

export const getServerInviteByCode = async (code: string) => {
  return await prisma.serverInvite.findFirst({
    where: {
      code,
    },
    include: {
      server: {
        select: {
          name: true,
        },
      },
    },
  });
};
