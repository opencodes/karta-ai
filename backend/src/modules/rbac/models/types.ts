export type RoleSlug = 'root' | 'admin' | 'member';

export type PermissionRecord = {
  id: string;
  slug: string;
  resource: string;
  action: string;
};

export type UserAuthzContext = {
  userId: string;
  organizationId: string | null;
  role: string;
  isRoot: boolean;
  status: 'active' | 'invited' | 'disabled';
};

export type CanResult = {
  allowed: boolean;
  reason?: string;
};
