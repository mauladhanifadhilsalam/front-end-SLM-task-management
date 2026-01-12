import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchProjectRoleByCode,
  deleteProjectRoleByCode,
} from "@/services/project-role.service"
import { projectRoleKeys } from "@/lib/query-keys"
import type { ProjectRole } from "@/types/project-roles.type"

export const useViewProjectRole = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [deleting, setDeleting] = React.useState(false)

  const {
    data: projectRole,
    isLoading: loading,
    error: queryError,
  } = useQuery<ProjectRole>({
    queryKey: projectRoleKeys.detail(code ?? ""),
    queryFn: () => fetchProjectRoleByCode(code!),
    enabled: !!code,
  })

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load project role"
    : ""

  const handleBack = React.useCallback(() => {
    navigate("/admin/dashboard/project-roles")
  }, [navigate])

  const handleDelete = React.useCallback(async () => {
    if (!projectRole?.code) return

    setDeleting(true)
    try {
      await deleteProjectRoleByCode(projectRole.code)
      toast.success("Project Role deleted", {
        description: `Project role "${projectRole.name}" has been deleted.`,
      })
      navigate("/admin/dashboard/project-roles")
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete project role"
      toast.error("Delete failed", { description: msg })
    } finally {
      setDeleting(false)
    }
  }, [projectRole, navigate])

  const getEditHref = React.useCallback(() => {
    return `/admin/dashboard/project-roles/edit/${code}`
  }, [code])

  return {
    projectRole,
    loading,
    error,
    deleting,
    handleDelete,
    handleBack,
    getEditHref,
  }
}
