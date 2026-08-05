import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminToken } from "./adminApi";

export function useNavigateToLoginIfNoToken() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);
}
