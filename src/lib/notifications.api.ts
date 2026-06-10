import { APIResponse } from "@/types/api.types";
import {
  AppNotification,
  MarkAllNotificationsReadPayload,
  NotificationsQuery,
  UnreadNotificationsCount,
} from "@/types/notification.types";
import { customFetch } from "@/utils/customFetch";

const BASE = "/notifications";

/** customFetch omite query params cuya clave contiene "id"; aquí se construye a mano. */
function buildNotificationsQuery(params?: NotificationsQuery): string {
  if (!params) return "";
  const parts: string[] = [];
  if (params.companyId) {
    parts.push(`companyId=${encodeURIComponent(params.companyId)}`);
  }
  if (params.isRead !== undefined) {
    parts.push(`isRead=${encodeURIComponent(String(params.isRead))}`);
  }
  if (params.page !== undefined) {
    parts.push(`page=${encodeURIComponent(String(params.page))}`);
  }
  if (params.pageSize !== undefined) {
    parts.push(`pageSize=${encodeURIComponent(String(params.pageSize))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export function fetchNotifications(params?: NotificationsQuery) {
  return customFetch<AppNotification[]>(
    `${BASE}${buildNotificationsQuery(params)}`
  );
}

export function fetchUnreadNotificationsCount(companyId?: string) {
  const qs = companyId
    ? `?companyId=${encodeURIComponent(companyId)}`
    : "";
  return customFetch<UnreadNotificationsCount>(`${BASE}/unread-count${qs}`);
}

export function markNotificationAsRead(notificationId: string) {
  return customFetch<{ id: string; isRead: boolean }>(
    `${BASE}/${notificationId}/read`,
    { method: "PATCH" }
  );
}

export function markAllNotificationsAsRead(
  payload?: MarkAllNotificationsReadPayload
) {
  return customFetch<{ updated: number }>(`${BASE}/read-all`, {
    method: "PATCH",
    body: JSON.stringify(payload ?? {}),
  });
}
