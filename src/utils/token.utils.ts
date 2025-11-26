export const decodeToken = (token: string) => {
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
};

export const getUserIdFromToken = (token: string): number | null => {
  const decoded = decodeToken(token);
  
  if (!decoded) {
    console.error("❌ Token tidak valid atau gagal di-decode.");
    return null;
  }

  const userId = decoded.userId || decoded.id || decoded.sub || decoded.user_id;

  if (!userId) {
    console.error("❌ User ID tidak ditemukan dalam token.");
    console.log("🔍 Isi token:", decoded);
    return null;
  }

  return userId;
};