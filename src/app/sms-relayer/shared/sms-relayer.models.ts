export interface SmsSendRequest {
  phoneNumber: string;
  message: string;
  senderId?: string;
  providerId?: string;
  externalId?: string;
  priority?: string;
}

export interface SmsSendResponse {
  id: number;
  status: string;
  statusCode: number;
  providerId: string;
  providerMessageId?: string;
  cost?: string;
  correlationId: string;
  errorMessage?: string;
}

export interface SmsMessage {
  id: number;
  internalId?: number;
  externalId?: string;
  tenantIdentifier?: string;
  phoneNumber: string;
  message: string;
  senderId?: string;
  providerId: string;
  providerMessageId?: string;
  status: string;
  statusCode: number;
  cost?: string;
  errorMessage?: string;
  retryCount: number;
  correlationId: string;
  submittedOn: string;
  sentOn?: string;
  deliveredOn?: string;
  failedOn?: string;
}

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface SmsMessageFilter {
  status?: string;
  from?: string;
  to?: string;
  phoneNumber?: string;
  senderId?: string;
  providerId?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface FspSmsAccount {
  tenantIdentifier: string;
  fspName: string;
  balance: number;
  smsPurchased: number;
  smsUsed: number;
  active: boolean;
}

export interface SmsCreditTransaction {
  id: number;
  tenantIdentifier: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference?: string;
  description?: string;
  initiatedBy: string;
  transactionDate: string;
}

export interface SmsModuleStatus {
  moduleId: string;
  tenantIdentifier: string;
  status: string;
  enabledOn?: string;
  balance?: number;
  defaultProviderId?: string;
  defaultSenderId?: string;
}

export interface SmsDashboardSummary {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  balanceRemaining: number;
  creditsPurchased: number;
  creditsUsed: number;
}

// ─── Admin Models ───

export interface PlatformDashboard {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalMessagesSentToday: number;
  totalMessagesSentThisMonth: number;
  totalDeliveredToday: number;
  totalFailedToday: number;
  platformDeliveryRate: number;
  activeProviders: number;
  providerHealthSummary: ProviderHealth[];
}

export interface ProviderHealth {
  providerId: string;
  displayName: string;
  healthy: boolean;
}

export interface TenantSmsAccount {
  tenantIdentifier: string;
  fspName: string;
  moduleStatus: string;
  balance: number;
  smsPurchased: number;
  smsUsed: number;
  active: boolean;
  sentToday: number;
  deliveredToday: number;
  failedToday: number;
  defaultProvider: string;
  enabledOn: string;
  createdOn: string;
}

export interface BackgroundJob {
  id: number;
  jobId: string;
  jobName: string;
  description: string;
  jobType: string;
  cronExpression?: string;
  status: string;
  lastRunAt?: string;
  lastDurationMs?: number;
  lastError?: string;
  lastRecordsProcessed?: number;
  nextRunAt?: string;
  consecutiveFailures: number;
}

export interface AuditEntry {
  id: number;
  action: string;
  tenantIdentifier?: string;
  performedBy: string;
  performedByRole: string;
  entityType: string;
  entityId?: string;
  summary: string;
  ipAddress?: string;
  createdOn: string;
}

export interface SystemHealth {
  status: string;
  providers: ProviderHealth[];
  pendingMessages: number;
  failedMessages: number;
  jvm: { usedMb: number; maxMb: number; threadCount: number };
}
