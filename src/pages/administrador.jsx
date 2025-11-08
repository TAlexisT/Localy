import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";
// src/pages/Administrador.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  CheckCircle,
  Store,
  MessageSquare,
  Loader,
  AlertCircle,
  Shield,
  X,
} from "lucide-react";

const Administrador = () => {
  const [sugerencias, setSugerencias] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(true);
  const [cargandoNegocios, setCargandoNegocios] = useState(true);
  const [eliminandoSugerencia, setEliminandoSugerencia] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [activoTab, setActivoTab] = useState("sugerencias");

  // Estados para el modal de confirmación
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sugerenciaAEliminar, setSugerenciaAEliminar] = useState(null);

  // Cargar sugerencias
  const cargarSugerencias = async () => {
    try {
      setCargandoSugerencias(true);
      setError("");

      // Obtener todos los negocios primero para luego obtener sus sugerencias
      const negociosRes = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.OBTENER_CADA_NEGOCIO}`,

        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!negociosRes.ok) {
        throw new Error("Error al cargar los negocios");
      }

      const negociosData = await negociosRes.json();

      if (!negociosData.exito) {
        throw new Error(negociosData.mensaje || "Error al obtener negocios");
      }

      // Obtener sugerencias de cada negocio
      const todasSugerencias = [];

      try {
        const sugerenciasRes = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.SUGERENCIAS.OBTENER_TODA_SUGERENCIA}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (sugerenciasRes.ok) {
          const sugerenciasData = await sugerenciasRes.json();
          if (sugerenciasData.exito && sugerenciasData.datos) {
            // Agregar información del negocio a cada sugerencia
            const sugerenciasConNegocio = sugerenciasData.datos.map(
              (sugerencia) => ({
                ...sugerencia,
              }),
            );
            todasSugerencias.push(...sugerenciasConNegocio);
          }
        }
      } catch (error) {
        console.error(`Error al cargar sugerencias del negocio`, error);
      }

      setSugerencias(todasSugerencias);
    } catch (error) {
      console.error("Error al cargar sugerencias:", error);
      setError(error.message || "Error al cargar las sugerencias");
    } finally {
      setCargandoSugerencias(false);
    }
  };

  // Cargar negocios
  const cargarNegocios = async () => {
    try {
      setCargandoNegocios(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.OBTENER_CADA_NEGOCIO}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar los negocios`);
      }

      const result = await response.json();

      if (result.exito) {
        setNegocios(result.datos || []);
      } else {
        throw new Error(result.mensaje || "Error al cargar los negocios");
      }
    } catch (error) {
      console.error("Error al cargar negocios:", error);
      setError(error.message || "Error al cargar los negocios");
    } finally {
      setCargandoNegocios(false);
    }
  };

  // Abrir modal de confirmación para eliminar
  const confirmarEliminarSugerencia = (sugerenciaId) => {
    setSugerenciaAEliminar(sugerenciaId);
    setMostrarModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setSugerenciaAEliminar(null);
  };

  // Eliminar sugerencia
  const eliminarSugerencia = async () => {
    if (!sugerenciaAEliminar) return;

    setEliminandoSugerencia(sugerenciaAEliminar);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SUGERENCIAS.BORRAR_SUGERENCIA(sugerenciaAEliminar)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (response.ok && result.exito) {
        // CORREGIDO: Eliminar la sugerencia del estado local correctamente
        setSugerencias((prev) =>
          prev.filter((s) => s.id !== sugerenciaAEliminar),
        );
        cerrarModal();
      } else {
        throw new Error(result.mensaje || "Error al eliminar la sugerencia");
      }
    } catch (error) {
      console.error("Error al eliminar sugerencia:", error);
      alert("Error al eliminar la sugerencia: " + error.message);
    } finally {
      setEliminandoSugerencia(null);
    }
  };

  // Filtrar negocios por búsqueda
  const negociosFiltrados = negocios.filter((negocio) =>
    negocio.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  useEffect(() => {
    if (activoTab === "sugerencias") {
      cargarSugerencias();
    } else {
      cargarNegocios();
    }
  }, [activoTab]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
          </div>
          <p className="text-gray-600">
            Gestiona las sugerencias y restaurantes de la plataforma
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActivoTab("sugerencias")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:scale-105 duration-300 ${
                  activoTab === "sugerencias"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Sugerencias ({sugerencias.length})
                </div>
              </button>
              <button
                onClick={() => setActivoTab("negocios")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:scale-105 duration-300 ${
                  activoTab === "negocios"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Restaurantes ({negocios.length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Modal de confirmación */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar eliminación
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600 transition hover:scale-105 duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que quieres eliminar esta sugerencia? Esta
                  acción no se puede deshacer.
                </p>

                {/* Botones de acción */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cerrarModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition hover:scale-105 duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={eliminarSugerencia}
                    disabled={eliminandoSugerencia}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition hover:scale-105 duration-300 flex items-center gap-2"
                  >
                    {eliminandoSugerencia ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de las pestañas */}
        {activoTab === "sugerencias" ? (
          <div>
            {/* Header de sugerencias */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Sugerencias de Restaurantes
                </h2>
                <p className="text-gray-600 text-sm">
                  {sugerencias.length === 0
                    ? "No hay sugerencias pendientes"
                    : `${sugerencias.length} sugerencia${
                        sugerencias.length !== 1 ? "s" : ""
                      } recibida${sugerencias.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Lista de sugerencias */}
            {cargandoSugerencias ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-500">Cargando sugerencias...</p>
              </div>
            ) : sugerencias.length > 0 ? (
              <div className="space-y-4">
                {sugerencias.map((sugerencia) => {
                  const fechaCreacion =
                    sugerencia.creado && sugerencia.creado._seconds
                      ? new Date(sugerencia.creado._seconds * 1000)
                      : new Date();

                  return (
                    <div
                      key={sugerencia.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {sugerencia.titulo}
                            </h3>
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                              {fechaCreacion.toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {sugerencia.description || sugerencia.descripcion}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Store className="w-4 h-4" />
                              <span className="font-medium">Restaurante:</span>
                              <span>
                                {sugerencia.negocio_nombre || "No especificado"}
                              </span>
                            </div>
                            {sugerencia.propietario_nombre && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  Propietario:
                                </span>
                                <span>{sugerencia.propietario_nombre}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 sm:gap-1">
                          <button
                            onClick={() =>
                              confirmarEliminarSugerencia(sugerencia.id)
                            }
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition hover:scale-105 duration-300 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay sugerencias
                </h3>
                <p className="text-gray-500">
                  No se han recibido sugerencias de los restaurantes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Header de negocios */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Restaurantes Registrados
                </h2>
                <p className="text-gray-600 text-sm">
                  {negociosFiltrados.length} de {negocios.length} restaurantes
                  mostrados
                </p>
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar restaurante..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Lista de negocios */}
            {cargandoNegocios ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-500">Cargando restaurantes...</p>
              </div>
            ) : negociosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {negociosFiltrados.map((negocio) => {
                  // Formatear fecha de pago
                  const fechaPago =
                    negocio.pago_fecha && negocio.pago_fecha._seconds
                      ? new Date(negocio.pago_fecha._seconds * 1000)
                      : null;

                  return (
                    <div
                      key={negocio.id}
                      onClick={() =>
                        (window.location.href = `/perfil_restaurante/${
                          negocio.negocio_id || negocio.id
                        }`)
                      }
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                    >
                      {negocio.logo && (
                        <div className="h-32 bg-gray-200 overflow-hidden">
                          <img
                            src={negocio.logo}
                            alt={`Logo de ${negocio.nombre}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {negocio.nombre}
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600">
                          {negocio.descripcion && (
                            <p className="line-clamp-2">
                              {negocio.descripcion}
                            </p>
                          )}

                          {negocio.correo && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Email:</span>
                              <span className="truncate">{negocio.correo}</span>
                            </div>
                          )}

                          {negocio.telefono && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Teléfono:</span>
                              <span>{negocio.telefono}</span>
                            </div>
                          )}

                          {/* Fecha de pago */}
                          {fechaPago && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Pago:</span>
                              <span>
                                {fechaPago.toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}

                          {/* Estado del negocio */}
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Estado:</span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                negocio.activo
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {negocio.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {busqueda
                    ? "No se encontraron restaurantes"
                    : "No hay restaurantes registrados"}
                </h3>
                <p className="text-gray-500">
                  {busqueda
                    ? "No hay restaurantes que coincidan con tu búsqueda."
                    : "No se han registrado restaurantes en la plataforma."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Administrador;
