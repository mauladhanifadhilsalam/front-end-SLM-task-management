import { ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectAccess } from "@/hooks/use-project-access";
import { ForbiddenError } from "@/pages/errors/forbidden";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface ProtectedTicketRouteProps {
  children: ReactNode;
}

export function ProtectedTicketRoute({ children }: ProtectedTicketRouteProps) {
  const { id } = useParams<{ id: string }>();
  const [ticketProjectId, setTicketProjectId] = useState<number | undefined>();
  const [fetchingTicket, setFetchingTicket] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const { hasAccess, loading: accessLoading } = useProjectAccess(ticketProjectId);

  useEffect(() => {
    const fetchTicketProject = async () => {
      if (!id) {
        setFetchError(true);
        setFetchingTicket(false);
        return;
      }

      try {
        setFetchingTicket(true);
        const response = await api.get(`/tickets/${id}`);
        const projectId = response.data?.data?.projectId || response.data?.projectId;
        
        console.log('🎫 Ticket fetch result:', { ticketId: id, projectId, response: response.data });
        
        if (projectId) {
          setTicketProjectId(Number(projectId));
        } else {
          console.error('❌ No projectId found in ticket');
          setFetchError(true);
        }
      } catch (error) {
        console.error("❌ Failed to fetch ticket:", error);
        setFetchError(true);
      } finally {
        setFetchingTicket(false);
      }
    };

    fetchTicketProject();
  }, [id]);

  const loading = fetchingTicket || accessLoading;

  useEffect(() => {
    console.log('🛡️ ProtectedTicketRoute State:', {
      ticketId: id,
      ticketProjectId,
      fetchingTicket,
      accessLoading,
      hasAccess,
      fetchError
    });
  }, [id, ticketProjectId, fetchingTicket, accessLoading, hasAccess, fetchError]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  if (fetchError) {
    console.warn('❌ Ticket fetch error or not found');
    return <ForbiddenError />;
  }

  if (!hasAccess) {
    console.warn('❌ Access denied to ticket:', id, 'from project:', ticketProjectId);
    return <ForbiddenError />;
  }

  console.log('✅ Access granted to ticket:', id);
  return <>{children}</>;
}
