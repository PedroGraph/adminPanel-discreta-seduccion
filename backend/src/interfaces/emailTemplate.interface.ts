export interface Template {
  id: number;
  name: string;
  subject: string;
  html: string;
  type: "transactional" | "marketing";
  status: "active" | "inactive";
  description?: string;
  createdById?: number;
  lastEditedById?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  templateId: number;
  scheduledAt?: string;
  sentAt?: string;
  createdById?: number;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSubscriber {
  id: number;
  email: string;
  name?: string;
  status: "active" | "inactive" | "unsubscribed";
  subscribedAt: string;
  lastActivityAt?: string;
}

export interface EmailRecipient {
  id: number;
  campaignId: number;
  subscriberId: number;
  opened: boolean;
  clicked: boolean;
  openCount?: number;
  clickCount?: number;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export interface EmailSettings {
  id: number;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  useTls: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  includeUnsubscribeLink: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface CreateEmailTemplate {
  template: {
    name: string;
    subject: string;
    html: string;
    type: "transactional" | "marketing";
    status?: "active" | "inactive";
    description?: string;
    createdById: number;
    lastEditedById?: number;
  };
  campaign?: {
    name: string;
    subject: string;
    status?: "draft" | "scheduled" | "sent" | "cancelled";
    scheduledAt?: string | null;
    createdById: number;
  };
}
