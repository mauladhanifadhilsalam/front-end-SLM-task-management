import axios from "axios";
import { ProjectResponse } from "@/types/developer-projects.types";

const API_BASE_URL = "http://localhost:3000";

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
    return response.data;
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