import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Clock } from "lucide-react";
import TarjetaProducto from "../components/tarjeta_producto"; // Ajusta la ruta según tu estructura
import TarjetaRestaurante from "../components/tarjeta_restaurante"; // Ajusta la ruta según tu estructura

const Favoritos = () => {
  const [usuario, setUsuario] = useState(null);
  const [ubicacion, setUbicacion] = useState({ latitude: 0, longitude: 0 });
  const [productosFavoritos, setProductosFavoritos] = useState([]);
  const [restaurantesFavoritos, setRestaurantesFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);
  const navigate = useNavigate();

  // Verificar sesión del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUbicacion(coords);
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
        let mensajeError = "No se pudo obtener tu ubicación. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensajeError +=
              "Permiso de ubicación denegado. Los restaurantes se mostrarán sin información de distancia.";
            break;
          case error.POSITION_UNAVAILABLE:
            mensajeError += "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            mensajeError += "Tiempo de espera agotado al obtener la ubicación.";
            break;
          default:
            mensajeError += "Error desconocido.";
        }

        console.error(mensajeError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Run session check only after ubicacion updates (not 0,0)
  useEffect(() => {
    if (ubicacion.latitude === 0 && ubicacion.longitude === 0) return;

    const verificarSesion = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/usuarios/autenticar-sesion",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          const sesionData = await response.json();
          if (sesionData.exito) {
            setUsuario(sesionData.datos);
            obtenerFavoritos(sesionData.datos.id, ubicacion); // pass ubicacion here
          } else {
            setError("Debes iniciar sesión para ver tus favoritos");
            setCargando(false);
          }
        } else {
          setError("Error al verificar sesión");
          setCargando(false);
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
        setError("Error de conexión");
        setCargando(false);
      }
    };

    verificarSesion();
  }, [ubicacion]);

  // Obtener favoritos del usuario
  const obtenerFavoritos = async (usuarioId, usuarioUbicacion) => {
    try {
      setCargando(true);
      const response = await fetch(
        `http://localhost:3000/api/usuarios/favoritos/${usuarioId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ubicacion: usuarioUbicacion }), // shorthand works fine
        }
      );

      if (response.ok) {
        const resultado = await response.json();
        if (resultado.exito) {
          setProductosFavoritos(resultado.datos.productos_favoritos || []);
          setRestaurantesFavoritos(resultado.datos.negocios_favoritos || []);
        } else {
          setError("Error al cargar favoritos");
        }
      } else {
        setError("Error al cargar favoritos");
      }
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      setError("Error de conexión al cargar favoritos");
    } finally {
      setCargando(false);
    }
  };

  // Eliminar favorito
  const eliminarFavorito = async (favoritoId, tipo) => {
    try {
      setEliminandoId(favoritoId);

      // Construir el endpoint según el tipo
      const endpoint = `http://localhost:3000/api/usuarios/borrar-favorito/${usuario.id}/${favoritoId}/${tipo}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      const resultado = await response.json();

      if (response.ok && resultado.exito) {
        // Actualizar lista localmente según el tipo
        if (tipo === "producto") {
          setProductosFavoritos((prev) =>
            prev.filter((producto) => producto.producto_id !== favoritoId)
          );
        } else if (tipo === "negocio") {
          setRestaurantesFavoritos((prev) =>
            prev.filter((restaurante) => restaurante.negocio_id !== favoritoId)
          );
        }
      } else {
        setError("Error al eliminar de favoritos");
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      setError("Error de conexión al eliminar favorito");
    } finally {
      setEliminandoId(null);
    }
  };

  // Calcular total de favoritos
  const totalFavoritos =
    productosFavoritos.length + restaurantesFavoritos.length;

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Cargando tus favoritos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Volver Atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Acceso Requerido
            </h2>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para ver tus favoritos.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Favoritos
          </h1>
          <p className="text-gray-600">
            Gestiona tus productos y restaurantes favoritos
          </p>
        </div>

        {totalFavoritos === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Heart className="w-24 h-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No tienes favoritos aún
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comienza explorando productos y restaurantes para agregarlos a tus
              favoritos.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition duration-200 font-medium"
            >
              Explorar Ahora
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sección de Productos Favoritos */}
            {productosFavoritos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Productos Favoritos
                  </h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {productosFavoritos.length} producto
                    {productosFavoritos.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productosFavoritos.map((producto) => (
                    <div
                      key={`producto-${producto.producto_id}`}
                      className="relative"
                    >
                      {/* Botón para eliminar favorito */}
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarFavorito(producto.producto_id, "producto");
                          }}
                          disabled={eliminandoId === producto.producto_id}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
                        >
                          {eliminandoId === producto.producto_id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Heart className="w-4 h-4 text-red-600 fill-current" />
                          )}
                        </button>
                      </div>

                      {/* Tarjeta de Producto */}
                      <TarjetaProducto
                        url={producto.imagen_URL}
                        nombreProducto={producto.nombre}
                        nombreRestaurante={producto.nombre_negocio}
                        categoria={producto.categoria}
                        precio={producto.precio}
                        productoId={producto.producto_id}
                        negocioId={producto.negocio_id}
                        negocioNombre={producto.nombre_negocio}
                        enOferta={producto.en_oferta}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sección de Restaurantes Favoritos */}
            {restaurantesFavoritos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Restaurantes Favoritos
                  </h2>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {restaurantesFavoritos.length} restaurante
                    {restaurantesFavoritos.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {restaurantesFavoritos.map((restaurante) => (
                    <div
                      key={`negocio-${restaurante.negocio_id}`}
                      className="relative"
                    >
                      {/* Botón para eliminar favorito */}
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarFavorito(restaurante.negocio_id, "negocio");
                          }}
                          disabled={eliminandoId === restaurante.negocio_id}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
                        >
                          {eliminandoId === restaurante.negocio_id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Heart className="w-4 h-4 text-red-600 fill-current" />
                          )}
                        </button>
                      </div>

                      {/* Tarjeta de Restaurante */}
                      <TarjetaRestaurante
                        imagenUrl={restaurante.logo}
                        nombreRestaurante={restaurante.nombre}
                        descripcion={restaurante.descripcion}
                        distancia={restaurante.distancia * 1000}
                        restauranteId={restaurante.negocio_id}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Mensaje de estado vacío por sección */}
        {productosFavoritos.length === 0 &&
          restaurantesFavoritos.length === 0 &&
          totalFavoritos > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Heart className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                No hay elementos en esta sección
              </h2>
              <p className="text-gray-600">
                Los favoritos que tengas aparecerán organizados por categorías
                aquí.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Favoritos;
