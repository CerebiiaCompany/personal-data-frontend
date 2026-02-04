/**
 * 📖 EJEMPLOS DE USO DEL SISTEMA DE PERMISOS
 * 
 * Este archivo contiene ejemplos prácticos que puedes copiar y adaptar
 * a tus componentes.
 */

// ============================================
// EJEMPLO 1: Página básica con botones condicionados
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import Button from '@/components/base/Button';
import CheckPermission from '@/components/checkers/CheckPermission';

export function EjemploBotonCondicional() {
  const { canCreate, canEdit, isSuperAdmin } = usePermissions();

  return (
    <div>
      <h1>Mis Campañas</h1>

      {/* Método 1: Usando el hook directamente */}
      {canCreate('campaigns') && (
        <Button href="/admin/campanas/crear">
          Crear Nueva Campaña
        </Button>
      )}

      {/* Método 2: Usando el componente CheckPermission */}
      <CheckPermission group="campaigns" permission="edit">
        <Button>Editar Campaña</Button>
      </CheckPermission>

      {/* Mostrar distintivo si es superadmin */}
      {isSuperAdmin && (
        <span className="badge">ADMIN</span>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 2: Formulario con campos deshabilitados
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';

export function EjemploFormulario() {
  const { canEdit } = usePermissions();
  const puedeEditar = canEdit('collect');

  return (
    <form>
      <input 
        type="text"
        placeholder="Nombre del formulario"
        disabled={!puedeEditar}
        className={!puedeEditar ? 'opacity-50 cursor-not-allowed' : ''}
      />
      
      <textarea 
        placeholder="Descripción"
        disabled={!puedeEditar}
      />

      <button 
        type="submit" 
        disabled={!puedeEditar}
      >
        {puedeEditar ? 'Guardar Cambios' : 'No tienes permiso para editar'}
      </button>
    </form>
  );
}

// ============================================
// EJEMPLO 3: Tabla con acciones condicionales
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import CheckPermission from '@/components/checkers/CheckPermission';

interface Campaign {
  id: string;
  name: string;
  status: string;
}

export function EjemploTabla({ campaigns }: { campaigns: Campaign[] }) {
  const { canEdit, canSend } = usePermissions();

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((campaign) => (
          <tr key={campaign.id}>
            <td>{campaign.name}</td>
            <td>{campaign.status}</td>
            <td className="flex gap-2">
              {/* Botón de editar - solo si tiene permiso */}
              {canEdit('campaigns') && (
                <button 
                  onClick={() => console.log('Editar', campaign.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Editar
                </button>
              )}
              
              {/* Botón de enviar - usando componente */}
              <CheckPermission group="campaigns" permission="send">
                <button 
                  onClick={() => console.log('Enviar', campaign.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Enviar
                </button>
              </CheckPermission>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================
// EJEMPLO 4: Navegación con permisos
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';

export function EjemploNavegacion() {
  const { canView, isSuperAdmin } = usePermissions();

  return (
    <nav className="flex flex-col gap-2">
      {/* Dashboard - todos pueden ver */}
      {canView('dashboard') && (
        <Link href="/admin" className="nav-link">
          📊 Dashboard
        </Link>
      )}

      {/* Campañas */}
      {canView('campaigns') && (
        <Link href="/admin/campanas" className="nav-link">
          📧 Campañas
        </Link>
      )}

      {/* Formularios */}
      {canView('collect') && (
        <Link href="/admin/recoleccion" className="nav-link">
          📋 Formularios
        </Link>
      )}

      {/* Clasificación */}
      {canView('classification') && (
        <Link href="/admin/clasificacion" className="nav-link">
          🗂️ Clasificación
        </Link>
      )}

      {/* Plantillas */}
      {canView('templates') && (
        <Link href="/admin/plantillas" className="nav-link">
          📄 Plantillas
        </Link>
      )}

      {/* Administración - solo para admins */}
      {isSuperAdmin && (
        <Link href="/admin/administracion" className="nav-link">
          ⚙️ Administración
        </Link>
      )}
    </nav>
  );
}

// ============================================
// EJEMPLO 5: Verificar múltiples permisos
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import CheckPermission from '@/components/checkers/CheckPermission';

export function EjemploMultiplesPermisos() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Verificar un permiso específico
  const puedeCrearCampañas = hasPermission('campaigns', 'create');

  // Verificar si tiene AL MENOS UNO de varios permisos
  const puedeGestionarFormularios = hasAnyPermission('collect', ['create', 'edit']);

  // Verificar si tiene TODOS los permisos
  const puedeGestionarCompletamente = hasAllPermissions('campaigns', ['create', 'edit', 'send']);

  return (
    <div>
      <h2>Panel de Gestión</h2>

      {/* Mostrar botón solo si puede crear campañas */}
      {puedeCrearCampañas && (
        <button>Crear Campaña</button>
      )}

      {/* Mostrar sección si puede crear O editar */}
      {puedeGestionarFormularios && (
        <div className="section">
          <h3>Gestión de Formularios</h3>
          <p>Puedes crear o editar formularios</p>
        </div>
      )}

      {/* Usando componente - requiere TODOS los permisos */}
      <CheckPermission 
        group="campaigns" 
        permission="create"
        additionalPermissions={["edit", "send"]}
        requireAll={true}
      >
        <button>Gestión Completa de Campañas</button>
      </CheckPermission>

      {/* Usando componente - requiere AL MENOS UNO */}
      <CheckPermission 
        group="collect" 
        permission="create"
        additionalPermissions={["edit"]}
        requireAll={false}
      >
        <button>Crear o Editar Formulario</button>
      </CheckPermission>
    </div>
  );
}

// ============================================
// EJEMPLO 6: Proteger una página completa
// ============================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

export default function PaginaProtegida() {
  const router = useRouter();
  const { canView, permissions } = usePermissions();

  useEffect(() => {
    // Verificar si el usuario tiene permiso para ver esta página
    if (permissions && !canView('campaigns')) {
      router.push('/sin-acceso');
    }
  }, [canView, permissions, router]);

  // Mostrar loading mientras se cargan los permisos
  if (!permissions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando permisos...</p>
      </div>
    );
  }

  // Si no tiene permisos, no mostrar nada (ya se redirigió)
  if (!canView('campaigns')) {
    return null;
  }

  // Contenido de la página protegida
  return (
    <div>
      <h1>Página de Campañas</h1>
      <p>Solo usuarios con permiso pueden ver esto</p>
    </div>
  );
}

// ============================================
// EJEMPLO 7: Mensaje cuando no tiene permisos
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';

export function EjemploSinPermisos() {
  const { permissions, canCreate } = usePermissions();

  // Si no hay permisos cargados
  if (!permissions) {
    return (
      <div className="alert alert-warning">
        <p>No se pudieron cargar tus permisos.</p>
        <p>Por favor, recarga la página o contacta al administrador.</p>
      </div>
    );
  }

  // Si no tiene el permiso específico
  if (!canCreate('campaigns')) {
    return (
      <div className="alert alert-info">
        <p>No tienes permiso para crear campañas.</p>
        <p>Contacta al administrador de tu empresa para obtener acceso.</p>
      </div>
    );
  }

  // Si tiene permisos, mostrar contenido
  return (
    <div>
      <h2>Crear Nueva Campaña</h2>
      {/* Formulario aquí */}
    </div>
  );
}

// ============================================
// EJEMPLO 8: Usando el helper hasPermissionByPath
// ============================================

'use client';

import { useSessionStore } from '@/store/useSessionStore';
import { hasPermissionByPath } from '@/utils/permissions.utils';

export function EjemploConHelper() {
  const permissions = useSessionStore((store) => store.permissions);

  return (
    <div>
      {/* Verificar con formato 'modulo.accion' */}
      {hasPermissionByPath(permissions, 'campaigns.create') && (
        <button>Crear Campaña</button>
      )}

      {hasPermissionByPath(permissions, 'collect.edit') && (
        <button>Editar Formulario</button>
      )}

      {hasPermissionByPath(permissions, 'campaigns.send') && (
        <button>Enviar Campaña</button>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 9: Componente de sección completa condicional
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import CheckPermission from '@/components/checkers/CheckPermission';

export function EjemploSeccionCompleta() {
  const { canView, canCreate, canEdit } = usePermissions();

  return (
    <div className="page">
      <h1>Gestión de Formularios</h1>

      {/* Sección solo visible con permiso */}
      {canView('collect') ? (
        <div className="content">
          <div className="toolbar">
            {/* Botón de crear */}
            <CheckPermission group="collect" permission="create">
              <button className="btn-primary">
                Crear Formulario
              </button>
            </CheckPermission>

            {/* Botón de importar */}
            <CheckPermission group="collect" permission="create">
              <button className="btn-secondary">
                Importar desde Excel
              </button>
            </CheckPermission>
          </div>

          <div className="list">
            {/* Lista de formularios */}
            <FormularioItem 
              canEdit={canEdit('collect')} 
            />
          </div>
        </div>
      ) : (
        <div className="no-access">
          <p>No tienes acceso a esta sección</p>
          <p>Contacta al administrador para obtener permisos</p>
        </div>
      )}
    </div>
  );
}

function FormularioItem({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="item">
      <h3>Mi Formulario</h3>
      {canEdit && (
        <button>Editar</button>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 10: Cargar datos según permisos
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

export function EjemploCargaDatos() {
  const { canView, canEdit } = usePermissions();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo cargar datos si tiene permiso para verlos
    if (canView('campaigns')) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [canView]);

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error al cargar campañas', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!canView('campaigns')) {
    return (
      <div>
        <p>No tienes permiso para ver las campañas</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Lista de Campañas</h2>
      <ul>
        {data.map((campaign: any) => (
          <li key={campaign.id}>
            {campaign.name}
            {canEdit('campaigns') && (
              <button onClick={() => console.log('Editar', campaign.id)}>
                Editar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EJEMPLO 11: Dropdown con opciones condicionales
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';

export function EjemploDropdown() {
  const { canEdit, canSend, isSuperAdmin } = usePermissions();

  return (
    <div className="dropdown">
      <button className="dropdown-toggle">
        Acciones
      </button>
      <ul className="dropdown-menu">
        <li>
          <a href="#">Ver Detalles</a>
        </li>

        {canEdit('campaigns') && (
          <li>
            <a href="#">Editar</a>
          </li>
        )}

        {canSend('campaigns') && (
          <li>
            <a href="#">Enviar Ahora</a>
          </li>
        )}

        {isSuperAdmin && (
          <>
            <li className="divider"></li>
            <li>
              <a href="#" className="text-red-600">Eliminar</a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

// ============================================
// EJEMPLO 12: Mensaje personalizado según rol
// ============================================

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { useSessionStore } from '@/store/useSessionStore';

export function EjemploMensajePersonalizado() {
  const { isSuperAdmin, permissions } = usePermissions();
  const user = useSessionStore((store) => store.user);

  if (isSuperAdmin) {
    return (
      <div className="alert alert-info">
        <p><strong>¡Hola, Administrador!</strong></p>
        <p>Tienes acceso completo a todas las funcionalidades del sistema.</p>
      </div>
    );
  }

  if (permissions) {
    const permisosConcedidos = Object.entries(permissions.permissions)
      .map(([module, perms]) => {
        const actions = Object.entries(perms)
          .filter(([_, value]) => value === true)
          .map(([action]) => action);
        
        if (actions.length > 0) {
          return `${module}: ${actions.join(', ')}`;
        }
        return null;
      })
      .filter(Boolean);

    return (
      <div className="alert alert-info">
        <p><strong>Bienvenido, {user?.name}!</strong></p>
        <p>Rol: {permissions.companyRoleName}</p>
        <details>
          <summary>Ver mis permisos</summary>
          <ul>
            {permisosConcedidos.map((permiso, index) => (
              <li key={index}>{permiso}</li>
            ))}
          </ul>
        </details>
      </div>
    );
  }

  return (
    <div className="alert alert-warning">
      <p>Cargando información de permisos...</p>
    </div>
  );
}

// ============================================
// TIPOS ÚTILES PARA REFERENCIA
// ============================================

/*
interface UserPermissionsResponse {
  role: "USER" | "COMPANY_ADMIN" | "SUPERADMIN";
  isSuperAdmin: boolean;
  companyRoleId?: string;
  companyRoleName?: string;
  permissions: {
    dashboard: { view: boolean };
    collect: { create: boolean; view: boolean; edit: boolean };
    templates: { create: boolean; view: boolean };
    classification: { create: boolean; view: boolean; edit: boolean };
    campaigns: { create: boolean; view: boolean; send: boolean };
  };
}
*/

// ============================================
// PERMISOS DISPONIBLES (REFERENCIA RÁPIDA)
// ============================================

/*
MÓDULOS Y ACCIONES:

dashboard.view           - Ver dashboard
collect.create          - Crear formularios
collect.view            - Ver formularios
collect.edit            - Editar formularios
templates.create        - Crear plantillas
templates.view          - Ver plantillas
classification.create   - Crear clasificaciones
classification.view     - Ver clasificaciones
classification.edit     - Editar clasificaciones
campaigns.create        - Crear campañas
campaigns.view          - Ver campañas
campaigns.send          - Enviar campañas
*/
