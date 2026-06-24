import { useCallback, useRef } from "react";

interface Options {
  /** Si es true, no se cierra al interactuar con el backdrop. */
  disabled?: boolean;
  /** Si se define, solo cierra cuando el evento ocurre en el elemento con ese id. */
  matchId?: string;
}

function isBackdropTarget(
  e: React.MouseEvent<HTMLElement>,
  matchId?: string
): boolean {
  const target = e.target as HTMLElement;
  if (matchId != null) {
    return target.id === matchId;
  }
  return target === e.currentTarget;
}

/**
 * Evita cerrar el modal al soltar el click fuera si el mousedown comenzó dentro
 * del contenido (arrastre accidental). Solo cierra cuando press y release ocurren
 * sobre el backdrop.
 */
export function useDialogBackdropClose(
  onClose: () => void,
  options?: Options
) {
  const mouseDownOnBackdrop = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (options?.disabled) return;
      mouseDownOnBackdrop.current = isBackdropTarget(e, options?.matchId);
    },
    [options?.disabled, options?.matchId]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (options?.disabled) return;
      if (isBackdropTarget(e, options?.matchId) && mouseDownOnBackdrop.current) {
        onClose();
      }
      mouseDownOnBackdrop.current = false;
    },
    [onClose, options?.disabled, options?.matchId]
  );

  return { onMouseDown, onMouseUp };
}
