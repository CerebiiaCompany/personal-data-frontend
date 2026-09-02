"use client";

interface Props {
  children: React.ReactNode;
}

/**
 * @deprecated El setup inicial ONB-01 ya no bloquea la app. Los datos base
 * de la empresa se capturan en la Fase 1 del asistente (SetupWizard).
 * Se mantiene este componente como passthrough por compatibilidad.
 */
export default function InitialSetupGate({ children }: Props) {
  return <>{children}</>;
}
