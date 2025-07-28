"use client";

import { useSession } from "next-auth/react";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/userAtoms";
import { usePermissions } from "@/app/hooks/usePermissions";

export const DebugInfo = () => {
  const { data: session } = useSession();
  const [user] = useAtom(userAtom);
  const { canViewDashboard, hasRole } = usePermissions();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>

      <div className="mb-2">
        <strong>Session:</strong>
        <pre className="text-xs">{JSON.stringify(session?.user, null, 2)}</pre>
      </div>

      <div className="mb-2">
        <strong>UserAtom:</strong>
        <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="mb-2">
        <strong>Permissions:</strong>
        <div className="text-xs">
          <div>canViewDashboard: {canViewDashboard ? "true" : "false"}</div>
          <div>hasRole(admin): {hasRole("admin") ? "true" : "false"}</div>
          <div>
            hasRole(attendant): {hasRole("attendant") ? "true" : "false"}
          </div>
          <div>hasRole(user): {hasRole("user") ? "true" : "false"}</div>
        </div>
      </div>
    </div>
  );
};
