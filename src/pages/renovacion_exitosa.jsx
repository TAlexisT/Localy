// src/pages/renovacion_exitosa.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function RenovacionExitosa() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("procesando"); // procesando, exito, error
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const procesarRenovacionExitosa = async () => {
      const tramiteId = searchParams.get("tramite_id");
      console.log("🔍 Tramite ID obtenido:", tramiteId);

      if (!tramiteId) {
        console.error("❌ No se encontró tramite_id en la URL");
        setEstado("error");
        setMensaje("No se pudo identificar el trámite de renovación");

        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
        return;
      }

      try {
        setEstado("procesando");
        setMensaje("Verificando el estado de tu renovación...");

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

        if (data.exito && data.datos) {
          setEstado("exito");
          setMensaje("¡Renovación exitosa! Redirigiendo a tu perfil...");

          // Obtener el ID del negocio desde los datos del trámite
          const negocioId = data.datos.negocioId || data.datos.negocio_id;

          if (negocioId) {
            // Redirigir al perfil del negocio después de 2 segundos
            setTimeout(() => {
              navigate(`/perfil_restaurante/${negocioId}`);
            }, 2000);
          } else {
            // Si no hay negocioId, redirigir al inicio
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        } else {
          throw new Error(data.mensaje || "Error en la respuesta del servidor");
        }
      } catch (error) {
        console.error("❌ Error al procesar renovación:", error);
        setEstado("error");
        setMensaje(
          "Error al verificar la renovación. Serás redirigido al inicio.",
        );

        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    procesarRenovacionExitosa();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {estado === "procesando" && (
          <>
            <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando renovación
            </h2>
            <p className="text-gray-600">{mensaje}</p>
          </>
        )}

        {estado === "exito" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Renovación Exitosa!
            </h2>
            <p className="text-gray-600 mb-6">{mensaje}</p>
            <div className="flex justify-center">
              <Loader className="w-6 h-6 animate-spin text-green-600" />
            </div>
          </>
        )}

        {estado === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error en la renovación
            </h2>
            <p className="text-gray-600 mb-6">{mensaje}</p>
            <p className="text-sm text-gray-500">Redirigiendo al inicio...</p>
          </>
        )}
      </div>
    </div>
  );
}
