// src/pages/PagoExito.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function PagoExito() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const procesarPagoExitoso = async () => {
      const tramiteId = searchParams.get("tramite_id");
      console.log("🔍 Tramite ID obtenido:", tramiteId);

      if (!tramiteId) {
        console.error("❌ No se encontró tramite_id en la URL");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.TRAMITES.OBTENER_TRAMITE(tramiteId)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("📋 Status de respuesta:", response.status);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Datos recibidos:", data);

        // Redirigir a la página de configuración
        navigate("/configura_perfil", { state: { negocio: data } });
      } catch (error) {
        console.error("❌ Error al procesar pago:", error);
        navigate("/");
      }
    };

    procesarPagoExitoso();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Procesando tu pago exitoso...</p>
    </div>
  );
}
