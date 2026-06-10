"use client";

import LoadingCover from "@/components/layout/LoadingCover";
import { useNotifications } from "@/hooks/useNotifications";
import { AppNotification } from "@/types/notification.types";
import { formatArcoDateTime } from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  companyId: string | undefined;
  enabled?: boolean;
  isCollapsed?: boolean;
}

function NotificationItem({
  item,
  onClick,
}: {
  item: AppNotification;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-[#E8EDF7] hover:bg-[#F8FAFC]"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <Icon icon="tabler:scale" className="text-lg" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-medium text-[#1A2B5B]">
          {item.title}
        </span>
        <span className="mt-1 line-clamp-2 text-xs text-[#64748B]">
          {item.body}
        </span>
        <span className="mt-1.5 block text-[11px] text-[#94A3B8]">
          {formatArcoDateTime(item.createdAt)}
        </span>
      </span>
      {!item.isRead && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2D7BFF]"
          aria-hidden
        />
      )}
    </button>
  );
}

const NotificationsBell = ({
  companyId,
  enabled = true,
  isCollapsed = false,
}: Props) => {
  const router = useRouter();
  const bellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    unreadCount,
    items,
    loading,
    panelOpen,
    setPanelOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ companyId, enabled });

  useEffect(() => {
    if (!panelOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        bellRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setPanelOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen, setPanelOpen]);

  async function handleNotificationClick(notification: AppNotification) {
    await markAsRead(notification.id);
    setPanelOpen(false);
    const requestId = notification.data?.requestId;
    if (requestId) {
      router.push(`/admin/arco/${requestId}`);
    }
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
  }

  const hasUnread = unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={bellRef} className="relative w-full overflow-visible">
      <button
        type="button"
        onClick={() => setPanelOpen((open) => !open)}
        className={clsx(
          "relative flex w-full items-center gap-2 overflow-visible rounded-xl px-3 py-2.5 text-[#D1DCF5] transition-colors hover:bg-white/5",
          { "justify-center px-2": isCollapsed },
          hasUnread && "bg-white/[0.04]"
        )}
        aria-label={
          hasUnread
            ? `Notificaciones, ${unreadCount} sin leer`
            : "Notificaciones"
        }
        aria-expanded={panelOpen}
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <Icon icon="tabler:bell" className="text-[18px]" />
          {hasUnread && (
            <span
              className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#071431]"
              aria-hidden
            >
              {badgeLabel}
            </span>
          )}
        </span>
        {!isCollapsed && (
          <span className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">
            Notificaciones
            {hasUnread && (
              <span className="rounded-full bg-[#E5484D]/20 px-2 py-0.5 text-[11px] font-semibold text-[#FF8A8A]">
                {badgeLabel} nueva{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </span>
        )}
      </button>

      {panelOpen &&
        createPortal(
          <div
            ref={panelRef}
            className={clsx(
              "fixed z-[300] flex w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_16px_48px_rgba(15,35,70,0.18)]",
              isCollapsed ? "bottom-24 left-20" : "bottom-24 left-[calc(270px+0.75rem)]"
            )}
            role="dialog"
            aria-label="Panel de notificaciones"
          >
            <div className="flex items-center justify-between border-b border-[#EEF2F8] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#1A2B5B]">
                  Notificaciones
                </p>
                {unreadCount > 0 && (
                  <p className="text-xs text-[#64748B]">
                    {unreadCount} sin leer
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-primary-700 hover:underline"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            <div className="relative max-h-[min(24rem,60vh)] overflow-y-auto sidebar-scroll">
              {loading && <LoadingCover />}
              {!loading && !items?.length && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-[#64748B]">
                  <Icon icon="tabler:bell-off" className="text-3xl text-[#94A3B8]" />
                  <p>No tienes notificaciones pendientes.</p>
                </div>
              )}
              {!loading && items && items.length > 0 && (
                <ul className="flex flex-col gap-0.5 p-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <NotificationItem
                        item={item}
                        onClick={() => handleNotificationClick(item)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NotificationsBell;
