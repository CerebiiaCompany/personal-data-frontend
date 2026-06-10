import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications.api";
import { AppNotification } from "@/types/notification.types";
import { useCallback, useEffect, useRef, useState } from "react";

const UNREAD_POLL_MS = 30_000;

interface Params {
  companyId: string | undefined;
  enabled?: boolean;
}

export function useNotifications({ companyId, enabled = true }: Params) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const wasPanelOpenRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    if (!companyId) return;
    const res = await fetchUnreadNotificationsCount(companyId);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      return;
    }
    const count = Number(res.data?.count ?? 0);
    setUnreadCount(Number.isFinite(count) && count > 0 ? count : 0);
  }, [companyId]);

  const loadNotifications = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const res = await fetchNotifications({
      companyId,
      isRead: false,
      page: 1,
      pageSize: 20,
    });
    setLoading(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    setItems(res.data ?? []);
  }, [companyId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const res = await markNotificationAsRead(notificationId);
      if (res.error) {
        showApiErrorToast(res.error, res.error.status);
        return false;
      }
      setItems((prev) =>
        prev?.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ) ?? null
      );
      await refreshUnreadCount();
      return true;
    },
    [refreshUnreadCount]
  );

  const markAllAsRead = useCallback(async () => {
    if (!companyId) return false;
    const res = await markAllNotificationsAsRead({ companyId });
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return false;
    }
    setItems([]);
    await refreshUnreadCount();
    return true;
  }, [companyId, refreshUnreadCount]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, UNREAD_POLL_MS);
    const onFocus = () => refreshUnreadCount();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, companyId, refreshUnreadCount]);

  useEffect(() => {
    if (!panelOpen || !companyId) return;
    loadNotifications();
  }, [panelOpen, companyId, loadNotifications]);

  useEffect(() => {
    if (wasPanelOpenRef.current && !panelOpen) {
      refreshUnreadCount();
    }
    wasPanelOpenRef.current = panelOpen;
  }, [panelOpen, refreshUnreadCount]);

  return {
    unreadCount,
    items,
    loading,
    panelOpen,
    setPanelOpen,
    refreshUnreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}
