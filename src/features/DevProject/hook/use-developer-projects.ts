import * as React from "react";
import axios from "axios";
import { AssignmentCard } from "@/types/developer-projects.types";
import { developerProjectService } from "@/services/developer-projects.service";

export function useDeveloperProjects() {
  const [assignments, setAssignments] = React.useState<AssignmentCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          console.error("❌ Token tidak ditemukan.");
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        // Decode token untuk mendapatkan userId
        const decoded = developerProjectService.decodeToken(token);

        if (!decoded) {
          console.error("❌ Token tidak valid atau gagal di-decode.");
          setError("Token tidak valid");
          setLoading(false);
          return;
        }

        // Ambil userId dari token
        const userId = developerProjectService.getUserIdFromToken(decoded);

        if (!userId) {

          setError("User ID tidak ditemukan");
          setLoading(false);
          return;
        }


        // Fetch semua projects
        const projects = await developerProjectService.getAllProjects(token);

        // Filter projects yang assigned ke user ini
        const filtered: AssignmentCard[] = projects
          .filter((project) => {
            const hasUserAssignment = project.assignments.some((a) => {
              const assignmentUserId = Number(a.user.id);
              const currentUserId = Number(userId);
              return assignmentUserId === currentUserId;
            });

            if (hasUserAssignment) {
            }

            return hasUserAssignment;
          })
          .map((project) => {
            const assignment = project.assignments.find(
              (a) => Number(a.user.id) === Number(userId)
            );

            return {
              id: assignment!.user.id + project.id,
              projectId: project.id,
              name: project.name,
              roleInProject: assignment!.user.projectRole ?? "-",
              status: project.status,
              startDate: project.startDate,
              endDate: project.endDate,
            };
          });

        setAssignments(filtered);
      } catch (err) {
        console.error("❌ Error fetching developer projects:", err);
        if (axios.isAxiosError(err)) {
          console.error("📡 Response error:", err.response?.data);
        }
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    assignments,
    loading,
    error,
  };
}
