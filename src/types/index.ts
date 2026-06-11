export interface IChannel {
  id: string;
  name: string;
  SCGId: string;
  friendshipId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  visible: boolean;
  users: IUser[];
  roles: IRoles[];
}

export interface IServer {
  id: string;
  name: string;
  users: IUser[];
  channelGroups: IServerGroup[];
}

export interface IRoles {
  id: string;
  role: string;
  admin: boolean;
  createdAt: Date;
  users: IUser[];
  rank: number;
}

export interface IUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: string;
  userRoles: IRoles[];
  channels: IChannel[];
}

export interface IServerGroup {
  id: string;
  serverId: string;
  name: string;
  createdAt: Date;
  channels: IChannel[];
  server: IServer;
}

export interface Invite {
  code: string;
  serverId: string;
  server?: IServer;
  expiresAt: string;
  createdAt: string;
}
