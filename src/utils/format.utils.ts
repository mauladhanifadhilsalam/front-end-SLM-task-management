export const formatStatus = (status: string): string => {
  return status.replace(/_/g, " ");
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID");
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "TO_DO":
      return "text-blue-400";
    case "IN_PROGRESS":
      return "text-yellow-500";
    case "IN_REVIEW":
      return "text-purple-500";
    case "DONE":
      return "text-green-500";
    case "RESOLVED":
      return "text-teal-500";
    case "CLOSED":
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
};

export const getPriorityVariant = (priority: string): "destructive" | "outline" => {
  return priority === "CRITICAL" || priority === "HIGH" ? "destructive" : "outline";
};

export const getPriorityClassName = (priority: string): string => {
  return priority === "CRITICAL"
    ? "bg-red-900/50 text-red-300 border-red-800"
    : "";
};