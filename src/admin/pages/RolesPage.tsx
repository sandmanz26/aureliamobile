import { Check, Minus, Plus } from 'lucide-react'
import { Fragment, useState } from 'react'
import { PageHeader, Panel } from '../components/ui'
import { PERMISSION_GROUPS, ROLES } from '../data/mock'

export function RolesPage() {
  // Local edit state so the matrix is actually operable in the demo; a real
  // build would PATCH the role and write an audit entry per change.
  const [grants, setGrants] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(ROLES.map((role) => [role.id, new Set(role.permissions)])),
  )
  const [dirty, setDirty] = useState(false)

  function toggle(roleId: string, permission: string) {
    if (roleId === 'super_admin') return // Super Admin keeps everything by definition.
    setGrants((current) => {
      const next = new Set(current[roleId])
      if (next.has(permission)) next.delete(permission)
      else next.add(permission)
      return { ...current, [roleId]: next }
    })
    setDirty(true)
  }

  return (
    <>
      <PageHeader
        title="Roles & permissions"
        description="What each role can do. Super Admin is fixed at full access; every other role is edited here and takes effect at the next sign-in."
        actions={
          <div className="flex items-center gap-8">
            {dirty && <span className="text-12 text-adm-serious">Unsaved changes</span>}
            <button
              type="button"
              disabled={!dirty}
              onClick={() => setDirty(false)}
              className="h-34 rounded-8 bg-adm-ink px-14 text-13 font-medium text-adm-surface disabled:opacity-40"
            >
              Save changes
            </button>
          </div>
        }
      />

      <div className="grid gap-12 md:grid-cols-3 xl:grid-cols-5">
        {ROLES.map((role) => (
          <div key={role.id} className="flex flex-col gap-6 rounded-10 border border-adm-line bg-adm-surface p-14">
            <div className="flex items-baseline justify-between gap-8">
              <h3 className="text-13 font-semibold text-adm-ink">{role.name}</h3>
              <span className="text-12 tabular-nums text-adm-muted">{role.members}</span>
            </div>
            <p className="text-12 leading-relaxed text-adm-ink-2">{role.description}</p>
            <p className="mt-auto pt-6 text-11 text-adm-muted">
              {grants[role.id].size} of {PERMISSION_GROUPS.flatMap((g) => g.permissions).length} permissions
            </p>
          </div>
        ))}
      </div>

      <Panel
        title="Permission matrix"
        description="Click a cell to grant or revoke. Super Admin is locked."
        actions={
          <button
            type="button"
            className="flex h-30 items-center gap-6 rounded-8 border border-adm-line px-12 text-12 font-medium text-adm-ink hover:bg-adm-hover"
          >
            <Plus size={13} />
            New role
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line">
                <th className="sticky left-0 z-10 bg-adm-surface px-10 py-8 text-left text-11 font-semibold uppercase tracking-wider text-adm-muted">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role.id}
                    className="px-8 py-8 text-center text-11 font-semibold uppercase tracking-wider text-adm-muted"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <Fragment key={group.group}>
                  <tr className="bg-adm-hover">
                    <td
                      colSpan={ROLES.length + 1}
                      className="px-10 py-6 text-11 font-semibold uppercase tracking-wider text-adm-ink-2"
                    >
                      {group.group}
                    </td>
                  </tr>
                  {group.permissions.map((permission) => (
                    <tr key={permission.id} className="border-b border-adm-line last:border-0">
                      <td className="sticky left-0 z-10 bg-adm-surface px-10 py-8">
                        <span className="text-adm-ink">{permission.label}</span>
                        <code className="ml-8 text-11 text-adm-muted">{permission.id}</code>
                      </td>
                      {ROLES.map((role) => {
                        const granted = grants[role.id].has(permission.id)
                        const locked = role.id === 'super_admin'
                        return (
                          <td key={role.id} className="px-8 py-8 text-center">
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => toggle(role.id, permission.id)}
                              aria-label={`${granted ? 'Revoke' : 'Grant'} ${permission.label} for ${role.name}`}
                              aria-pressed={granted}
                              className={`inline-flex size-22 items-center justify-center rounded-6 transition-colors ${
                                granted ? 'bg-adm-good/15 text-adm-good' : 'bg-adm-hover text-adm-muted'
                              } ${locked ? 'cursor-not-allowed opacity-60' : 'hover:ring-1 hover:ring-adm-line'}`}
                            >
                              {granted ? <Check size={13} /> : <Minus size={13} />}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
