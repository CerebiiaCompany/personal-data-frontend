import { ArcoRequestType } from "@/types/arco.types";

export type NotificationType = "ARCO_NEW_REQUEST" | (string & {});

export interface NotificationData {
  requestId?: string;
  requestType?: ArcoRequestType;
  docNumber?: string;
  dueDate?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  isRead: boolean;
  readAt: string | null;
  companyId: string;
  createdAt: string;
}

export interface NotificationsQuery {
  companyId?: string;
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UnreadNotificationsCount {
  count: number;
}

export interface MarkAllNotificationsReadPayload {
  companyId?: string;
}
