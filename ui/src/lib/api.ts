const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export type User = {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: 'root' | 'superadmin' | 'admin' | 'member';
  isRoot: boolean;
  subscription: 'FREE' | 'PRO' | 'ENTERPRISE';
};

export type RbacSnapshot = {
  context: {
    userId: string;
    organizationId: string | null;
    role: string;
    isRoot: boolean;
    status: 'active' | 'invited' | 'disabled';
  };
  roles: string[];
  permissions: string[];
  modules: string[];
};

export type TaskItem = {
  id: string;
  rawInput: string;
  title: string;
  category: 'Finance' | 'Personal' | 'Work' | 'Contact' | 'General';
  tags: string[];
  time: string;
  date: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate: string;
  featured: boolean;
  status: 'pending' | 'done';
  createdAt: string;
  updatedAt: string;
};

export type EduKartaStudentProfile = {
  name: string;
  board: string;
  classLevel: string;
  subjects: string[];
  completedAt: string;
  updatedAt?: string;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function signup(email: string, password: string): Promise<{ token: string; user: User }> {
  return request('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
}

export async function me(token: string): Promise<{ user: User }> {
  return request('/api/auth/me', { token });
}

export async function updateMyProfile(
  token: string,
  payload: { fullName: string; phoneNumber: string },
): Promise<{ user: User; message: string }> {
  return request('/api/auth/me/profile', {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function getEduKartaStudentProfile(token: string): Promise<{ profile: EduKartaStudentProfile | null }> {
  return request('/api/edukarta/profile', { token });
}

export async function saveEduKartaStudentProfile(
  token: string,
  payload: { name: string; board: string; classLevel: string; subjects: string[] },
): Promise<{ message: string }> {
  return request('/api/edukarta/profile', {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function listEduKartaSubjectChapters(
  token: string,
): Promise<{ chaptersBySubject: Record<string, string[]> }> {
  return request('/api/edukarta/profile/chapters', { token });
}

export async function saveEduKartaSubjectChapters(
  token: string,
  payload: { subject: string; chapters: string[] },
): Promise<{ message: string; subject: string; count: number }> {
  return request('/api/edukarta/profile/chapters', {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function suggestEduKartaChapters(
  token: string,
  subject: string,
  isbn?: string,
): Promise<{ chapters: string[]; source: 'ai' | 'fallback' | 'book' }> {
  return request('/api/edukarta/profile/chapters/suggest', {
    method: 'POST',
    token,
    body: { subject, isbn },
  });
}

export async function extractEduKartaChaptersFromImage(
  token: string,
  payload: { subject: string; imageDataUrl: string },
): Promise<{ chapters: string[]; source: 'ocr-ai' }> {
  return request('/api/edukarta/profile/chapters/extract-from-image', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function summarizeEduKartaChapter(
  token: string,
  payload: { subject: string; chapter: string; ask?: string; history?: Array<{ question: string; answer: string }> },
): Promise<{ summary: string; context: { board: string; classLevel: string; subject: string; chapter: string } }> {
  return request('/api/edukarta/profile/chapters/summary', {
    method: 'POST',
    token,
    body: payload,
  });
}

export type EduKartaChapterTurn = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export async function listEduKartaChapterTurns(
  token: string,
  subject: string,
  chapter: string,
): Promise<{ turns: EduKartaChapterTurn[] }> {
  return request(
    `/api/edukarta/profile/chapters/qa?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`,
    { token },
  );
}

export async function saveEduKartaChapterTurn(
  token: string,
  payload: { subject: string; chapter: string; question: string; answer: string },
): Promise<{ turn: EduKartaChapterTurn }> {
  return request('/api/edukarta/profile/chapters/qa', {
    method: 'POST',
    token,
    body: payload,
  });
}

export type PrepKartaSubject = {
  id: string;
  name: string;
  progress: number;
  attempts: number;
};

export type PrepKartaConcept = {
  id: string;
  subjectId: string;
  name: string;
  totalQuestions: number;
  attemptedQuestions: number;
  masteryScore: number;
  masteryStatus: 'mastered' | 'in_progress' | 'weak';
  progressPercent: number;
  weak: boolean;
};

export type PrepKartaQuestion = {
  id: string;
  conceptId: string;
  type: 'single_choice' | 'multiple_choice';
  questionText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionOrder: number;
  options: Array<{ id: string; text: string }>;
};

export async function listPrepKartaSubjects(token: string): Promise<{ subjects: PrepKartaSubject[] }> {
  return request('/api/prepkarta/subjects', { token });
}

export async function createPrepKartaSubject(token: string, payload: { name: string }): Promise<{ message: string }> {
  return request('/api/prepkarta/subjects', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updatePrepKartaSubject(token: string, subjectId: string, payload: { name: string }): Promise<{ message: string }> {
  return request(`/api/prepkarta/subjects/${subjectId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function deletePrepKartaSubject(token: string, subjectId: string): Promise<{ message: string }> {
  return request(`/api/prepkarta/subjects/${subjectId}`, {
    method: 'DELETE',
    token,
  });
}

export async function listPrepKartaConcepts(token: string, subjectId: string): Promise<{ concepts: PrepKartaConcept[] }> {
  return request(`/api/prepkarta/subjects/${subjectId}/concepts`, { token });
}

export async function listPrepKartaChapters(token: string, subjectId: string): Promise<{ chapters: Array<{ id: string; subjectId: string; name: string; totalQuestions: number }> }> {
  return request(`/api/prepkarta/subjects/${subjectId}/chapters`, { token });
}

export async function createPrepKartaChapter(token: string, subjectId: string, payload: { name: string }): Promise<{ message: string }> {
  return request(`/api/prepkarta/subjects/${subjectId}/chapters`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updatePrepKartaChapter(token: string, chapterId: string, payload: { name: string }): Promise<{ message: string }> {
  return request(`/api/prepkarta/chapters/${chapterId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function deletePrepKartaChapter(token: string, chapterId: string): Promise<{ message: string }> {
  return request(`/api/prepkarta/chapters/${chapterId}`, {
    method: 'DELETE',
    token,
  });
}

export async function listPrepKartaSubchapters(token: string, chapterId: string): Promise<{ subchapters: Array<{ id: string; chapterId: string; name: string }> }> {
  return request(`/api/prepkarta/chapters/${chapterId}/subchapters`, { token });
}

export async function createPrepKartaSubchapter(token: string, chapterId: string, payload: { name: string }): Promise<{ message: string }> {
  return request(`/api/prepkarta/chapters/${chapterId}/subchapters`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updatePrepKartaSubchapter(token: string, subchapterId: string, payload: { name: string }): Promise<{ message: string }> {
  return request(`/api/prepkarta/subchapters/${subchapterId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function deletePrepKartaSubchapter(token: string, subchapterId: string): Promise<{ message: string }> {
  return request(`/api/prepkarta/subchapters/${subchapterId}`, {
    method: 'DELETE',
    token,
  });
}

export type PrepKartaSubchapterDetails = {
  id: string;
  name: string;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
};

export async function getPrepKartaSubchapter(token: string, subchapterId: string): Promise<{ subchapter: PrepKartaSubchapterDetails }> {
  return request(`/api/prepkarta/subchapters/${subchapterId}`, { token });
}

export async function summarizePrepKartaSubchapter(
  token: string,
  subchapterId: string,
  payload: {
    ask?: string;
    history?: Array<{ question: string; answer: string }>;
  },
): Promise<{ summary: string; context: { subject: string; chapter: string; subchapter: string } }> {
  return request(`/api/prepkarta/subchapters/${subchapterId}/summary`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getPrepKartaQuestion(
  token: string,
  conceptId: string,
  mode: 'resume' | 'weak' | 'random',
): Promise<{ mode: string; question: PrepKartaQuestion; progress: { attempted: number; total: number } }> {
  return request(`/api/prepkarta/concepts/${conceptId}/questions?mode=${mode}`, { token });
}

export async function submitPrepKartaAnswer(
  token: string,
  questionId: string,
  payload: { selectedOptionIds: string[]; timeSpentSeconds: number },
): Promise<{
  attempt: {
    questionId: string;
    conceptId: string;
    isCorrect: boolean;
    correctOptionIds: string[];
    explanation: string;
    repetitionLevel: number;
    repeatAfterAttempts: number;
  };
}> {
  return request(`/api/prepkarta/questions/${questionId}/answer`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getPrepKartaConceptProgress(
  token: string,
  conceptId: string,
): Promise<{ progress: Record<string, unknown> }> {
  return request(`/api/prepkarta/concepts/${conceptId}/progress`, { token });
}

export async function getPrepKartaConceptResume(
  token: string,
  conceptId: string,
): Promise<{ resume: Record<string, unknown> }> {
  return request(`/api/prepkarta/concepts/${conceptId}/resume`, { token });
}

export async function getPrepKartaAnalytics(
  token: string,
): Promise<{ analytics: Record<string, unknown> }> {
  return request('/api/prepkarta/user/analytics', { token });
}

export async function createTask(token: string, rawInput: string): Promise<{ task: TaskItem }> {
  return request('/api/todokarta/tasks/parse-create', {
    method: 'POST',
    token,
    body: { rawInput },
  });
}

export async function listTasks(token: string, bucket: 'all' | 'now' | 'later' | 'featured' = 'all'): Promise<{ tasks: TaskItem[] }> {
  return request(`/api/todokarta/tasks?bucket=${bucket}`, { token });
}

export async function featureTask(token: string, id: string, featured: boolean): Promise<{ task: TaskItem }> {
  return request(`/api/todokarta/tasks/${id}/feature`, {
    method: 'PATCH',
    token,
    body: { featured },
  });
}

export type BillingPlan = {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  priceMonthly: string | number | null;
  priceYearly: string | number | null;
  currency: string;
  type: 'module' | 'package';
  modules: string[];
};

export type UserSubscription = {
  subscriptionId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  renewDate: string | null;
  autoRenew: boolean;
  paymentProvider: string | null;
  providerSubscriptionId: string | null;
  plan: BillingPlan;
};

export async function listPaidModules(token: string): Promise<{ modules: Array<Record<string, unknown>> }> {
  return request('/api/billing/catalog/modules', { token });
}

export async function getMyAccess(token: string): Promise<{ modules: string[] }> {
  return request('/api/billing/my-access', { token });
}

export async function getMySubscriptions(token: string): Promise<{ subscriptions: UserSubscription[] }> {
  return request('/api/billing/my-subscriptions', { token });
}

export async function buyModule(token: string, moduleName: string): Promise<{ message: string; modules: string[] }> {
  return request('/api/billing/buy-module', {
    method: 'POST',
    token,
    body: { moduleName },
  });
}

export type ManageableUser = {
  id: string;
  email: string;
  role: 'root' | 'superadmin' | 'admin' | 'member';
  isRoot: boolean;
  isActive: boolean;
  status: 'active' | 'invited' | 'disabled';
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  createdAt: string;
};

export async function listUsers(token: string): Promise<{ users: ManageableUser[] }> {
  return request('/api/auth/users', { token });
}

export async function createUserByRoot(
  token: string,
  payload: {
    email: string;
    password: string;
    organizationId: string;
    role: 'admin' | 'superadmin' | 'member';
    status?: 'active' | 'invited' | 'disabled';
  },
): Promise<{ message: string }> {
  return request('/api/auth/users', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateUserRole(
  token: string,
  userId: string,
  role: 'admin' | 'superadmin' | 'member',
): Promise<{ user: User }> {
  return request(`/api/auth/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: { role },
  });
}

export async function updateUserStatus(
  token: string,
  userId: string,
  status: 'active' | 'invited' | 'disabled',
): Promise<{ message: string }> {
  return request(`/api/auth/users/${userId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export type OrganizationItem = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  ownerUserId: string | null;
  ownerEmail: string | null;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export async function listOrganizations(token: string): Promise<{ organizations: OrganizationItem[] }> {
  return request('/api/auth/organizations', { token });
}

export async function createOrganization(
  token: string,
  payload: { name: string; slug?: string; plan?: string; ownerUserId?: string },
): Promise<{ message: string }> {
  return request('/api/auth/organizations', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateOrganizationStatus(
  token: string,
  organizationId: string,
  isActive: boolean,
): Promise<{ message: string }> {
  return request(`/api/auth/organizations/${organizationId}/status`, {
    method: 'PATCH',
    token,
    body: { isActive },
  });
}

export async function updateOrganizationOwner(
  token: string,
  organizationId: string,
  ownerUserId: string | null,
): Promise<{ message: string }> {
  return request(`/api/auth/organizations/${organizationId}/owner`, {
    method: 'PATCH',
    token,
    body: { ownerUserId },
  });
}

export async function getRbacMe(token: string): Promise<RbacSnapshot> {
  return request('/api/rbac/me', { token });
}

export async function canPermission(token: string, permission: string): Promise<{ allowed: boolean; reason?: string }> {
  const encoded = encodeURIComponent(permission);
  return request(`/api/rbac/can/${encoded}`, { token });
}

export type OrgAdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'superadmin' | 'member' | 'root';
  status: 'active' | 'invited' | 'disabled';
  is_root: 0 | 1;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type OrgAdminRole = {
  id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  is_system_role: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type OrgPermission = {
  id: string;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description: string | null;
};

export type OrgModule = {
  id: string;
  name: string;
  slug: string;
  display_name: string | null;
  description: string | null;
  is_core: 0 | 1;
  is_active: 0 | 1;
  organization_module_id: string | null;
  status: 'active' | 'expired' | 'suspended' | null;
  starts_at: string | null;
  expires_at: string | null;
};

export type OrgMemberModuleAccess = {
  id: string;
  name: string;
  slug: string;
  display_name: string | null;
  organization_module_status: 'active' | 'expired' | 'suspended' | null;
  access_granted: 0 | 1 | null;
  expires_at: string | null;
};

export type ModuleAccessRequestItem = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  review_note?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_email?: string;
  module_id?: string;
  module_name?: string;
  module_display_name?: string | null;
};

export type OrgApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  is_active: 0 | 1;
  last_used_at: string | null;
  created_at: string;
};

export async function getOrgAdminOverview(token: string): Promise<{
  organization: Record<string, unknown> | null;
  userBreakdown: Array<Record<string, unknown>>;
  moduleBreakdown: Array<Record<string, unknown>>;
}> {
  return request('/api/org-admin/overview', { token });
}

export async function listOrgAdminUsers(token: string): Promise<{ users: OrgAdminUser[] }> {
  return request('/api/org-admin/users', { token });
}

export async function createOrgAdminUser(
  token: string,
  payload: {
    email: string;
    password: string;
    role: 'admin' | 'superadmin' | 'member';
    status?: 'active' | 'invited' | 'disabled';
  },
): Promise<{ message: string }> {
  return request('/api/org-admin/users', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateOrgAdminUserRole(
  token: string,
  userId: string,
  role: 'admin' | 'superadmin' | 'member',
): Promise<{ message: string }> {
  return request(`/api/org-admin/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: { role },
  });
}

export async function updateOrgAdminUserStatus(
  token: string,
  userId: string,
  status: 'active' | 'invited' | 'disabled',
): Promise<{ message: string }> {
  return request(`/api/org-admin/users/${userId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export async function listOrgAdminMemberModules(
  token: string,
  userId: string,
): Promise<{ modules: OrgMemberModuleAccess[] }> {
  return request(`/api/org-admin/users/${userId}/modules`, { token });
}

export async function updateOrgAdminMemberModuleAccess(
  token: string,
  userId: string,
  payload: { moduleId: string; grant: boolean; expiresAt?: string | null },
): Promise<{ message: string }> {
  return request(`/api/org-admin/users/${userId}/modules`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function createModuleAccessRequest(
  token: string,
  payload: { moduleSlug: string; reason?: string },
): Promise<{ message: string }> {
  return request('/api/org-admin/module-requests', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function listMyModuleAccessRequests(token: string): Promise<{ requests: ModuleAccessRequestItem[] }> {
  return request('/api/org-admin/module-requests/mine', { token });
}

export async function listOrgModuleAccessRequests(token: string): Promise<{ requests: ModuleAccessRequestItem[] }> {
  return request('/api/org-admin/module-requests', { token });
}

export async function resolveOrgModuleAccessRequest(
  token: string,
  requestId: string,
  payload: { action: 'approved' | 'rejected'; note?: string },
): Promise<{ message: string }> {
  return request(`/api/org-admin/module-requests/${requestId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function listOrgAdminRoles(token: string): Promise<{ roles: OrgAdminRole[] }> {
  return request('/api/org-admin/roles', { token });
}

export async function createOrgAdminRole(
  token: string,
  payload: { name: string; slug: string; description?: string },
): Promise<{ message: string }> {
  return request('/api/org-admin/roles', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function listOrgAdminPermissions(token: string): Promise<{ permissions: OrgPermission[] }> {
  return request('/api/org-admin/permissions', { token });
}

export async function getOrgAdminRolePermissions(token: string, roleId: string): Promise<{ permissions: Array<{ id: string; slug: string }> }> {
  return request(`/api/org-admin/roles/${roleId}/permissions`, { token });
}

export async function updateOrgAdminRolePermissions(
  token: string,
  roleId: string,
  permissionIds: string[],
): Promise<{ message: string }> {
  return request(`/api/org-admin/roles/${roleId}/permissions`, {
    method: 'PUT',
    token,
    body: { permissionIds },
  });
}

export async function listOrgAdminModules(token: string): Promise<{ modules: OrgModule[] }> {
  return request('/api/org-admin/modules', { token });
}

export async function updateOrgAdminModule(
  token: string,
  moduleId: string,
  payload: { status: 'active' | 'expired' | 'suspended'; startsAt?: string | null; expiresAt?: string | null },
): Promise<{ message: string }> {
  return request(`/api/org-admin/modules/${moduleId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function getOrgAdminSettings(token: string): Promise<{ organization: Record<string, unknown> | null }> {
  return request('/api/org-admin/settings', { token });
}

export async function updateOrgAdminSettings(
  token: string,
  payload: { name?: string; plan?: string },
): Promise<{ message: string }> {
  return request('/api/org-admin/settings', {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function getOrgAdminReports(token: string): Promise<{
  userByStatus: Array<Record<string, unknown>>;
  userByRole: Array<Record<string, unknown>>;
  moduleByStatus: Array<Record<string, unknown>>;
}> {
  return request('/api/org-admin/reports', { token });
}

export async function getOrgAdminBilling(token: string): Promise<{ plans: Array<Record<string, unknown>> }> {
  return request('/api/org-admin/billing', { token });
}

export async function getOrgBillingCatalogModules(token: string): Promise<{ modules: Array<Record<string, unknown>> }> {
  return request('/api/org-admin/billing/catalog/modules', { token });
}

export async function getOrgBillingSubscriptions(token: string): Promise<{ subscriptions: Array<Record<string, unknown>> }> {
  return request('/api/org-admin/billing/subscriptions', { token });
}

export async function buyOrgModule(token: string, moduleName: string): Promise<{ message: string; subscriptions: Array<Record<string, unknown>> }> {
  return request('/api/org-admin/billing/buy-module', {
    method: 'POST',
    token,
    body: { moduleName },
  });
}

export type CreateModulePayload = {
  name: string;
  slug: string;
  displayName?: string | null;
  description?: string | null;
  icon?: string | null;
  routePrefix?: string | null;
  version?: string | null;
  isCore?: boolean;
  isActive?: boolean;
};

export async function createBillingModule(token: string, payload: CreateModulePayload): Promise<{ message: string }> {
  return request('/api/billing/admin/modules', {
    method: 'POST',
    token,
    body: payload,
  });
}

export type BillingModuleItem = {
  id: string;
  name: string;
  slug: string;
  display_name?: string | null;
  description?: string | null;
  icon?: string | null;
  route_prefix?: string | null;
  version?: string | null;
  is_core: 0 | 1;
  is_active: 0 | 1;
  created_at?: string;
};

export async function listBillingModules(token: string): Promise<{ modules: BillingModuleItem[] }> {
  return request('/api/billing/admin/modules', { token });
}

export type OrgModulePurchaseRequest = {
  subscriptionId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  planId: string;
  planName: string;
  planDisplayName: string | null;
  modules: string[];
  status: 'pending_approval' | 'approved' | 'active' | 'rejected';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listOrgModulePurchaseRequests(token: string): Promise<{ requests: OrgModulePurchaseRequest[] }> {
  return request('/api/billing/admin/org-module-requests', { token });
}

export async function resolveOrgModulePurchaseRequest(
  token: string,
  subscriptionId: string,
  action: 'approved' | 'rejected',
): Promise<{ message: string }> {
  return request(`/api/billing/admin/org-module-requests/${subscriptionId}`, {
    method: 'PATCH',
    token,
    body: { action },
  });
}

export async function listOrgAdminApiKeys(token: string): Promise<{ apiKeys: OrgApiKey[] }> {
  return request('/api/org-admin/api-keys', { token });
}

export async function createOrgAdminApiKey(token: string, name: string): Promise<{ apiKey: string; keyPrefix: string }> {
  return request('/api/org-admin/api-keys', {
    method: 'POST',
    token,
    body: { name },
  });
}

export async function revokeOrgAdminApiKey(token: string, keyId: string): Promise<{ message: string }> {
  return request(`/api/org-admin/api-keys/${keyId}`, {
    method: 'DELETE',
    token,
  });
}
