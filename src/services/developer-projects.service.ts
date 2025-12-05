import axios from "axios";
import { ProjectResponse } from "@/types/developer-projects.types";
import { extractArrayFromApi } from "@/utils/api-response.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

export const developerProjectService = {
  /**
   * Fetch all projects
   */
  async getAllProjects(token: string): Promise<ProjectResponse[]> {
    const response = await axios.get(`${API_BASE_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return extractArrayFromApi<ProjectResponse>(response.data, ["projects"]);
  },

  /**
   * Decode JWT token
   */
  decodeToken(token: string) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return null;
    }
  },

  /**
   * Get user ID from decoded token
   */
  getUserIdFromToken(decoded: any): number | null {
    const userId = decoded.userId || decoded.id || decoded.sub || decoded.user_id;
    return userId ? Number(userId) : null;
  },
};
