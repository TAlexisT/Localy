import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";
import {
  MapPin,
  X,
  ZoomIn,
  Trash2,
  Heart,
  Edit,
  ArrowLeft,
  Ban,
  Star,
  Shield,
  Info,
} from "lucide-react";

import { Colores_Interfaz, Colores_Font } from "../assets/Colores";
import MapaUbicacion from "../components/MapaUbicacion";

const InformacionProducto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [negocioId, setNegocioId] = useState(null);
  const [negocioNombre, setNegocioNombre] = useState("");
  const [productoId, setProductoId] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    en_oferta: false,
    image: null,
  });
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);
  const [usuarioEsPropietario, setUsuarioEsPropietario] = useState(false);
  const [verificandoPropietario, setVerificandoPropietario] = useState(false);
  const [modalImagenAbierto, setModalImagenAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [agregandoFavorito, setAgregandoFavorito] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);
  const [productoActivo, setProductoActivo] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleVolver = () => {
    navigate(-1);
  };

  // Obtener datos del state de navegación
  useEffect(() => {
    if (location.state) {
      const { producto_id, negocioId, negocioNombre } = location.state;

      if (producto_id && negocioId) {
        setProductoId(producto_id);
        setNegocioId(negocioId);
        setNegocioNombre(negocioNombre);
        obtenerProducto(producto_id);
        verificarPropietario(negocioId);
        verificarSesionUsuario(producto_id);
      }
    }
  }, [location.state]);

  // Verificar sesión del usuario
  const verificarSesionUsuario = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.AUTENTICAR_SESION}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const sesionData = await response.json();
        if (sesionData.exito) {
          setUsuario(sesionData.datos);
        }
      }
    } catch (error) {
      console.error("No hay sesión activa o error al verificar sesión:", error);
    }
  };

  // Función para agregar/remover de favoritos
  const toggleFavorito = async () => {
    if (!usuario) {
      setMensaje("Debes iniciar sesión para agregar productos a favoritos");
      return;
    }

    setAgregandoFavorito(true);

    try {
      if (esFavorito) {
        // Remover de favoritos
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.BORRAR_FAVORITO(usuario.id, productoId, "producto")}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const resultado = await response.json();

        if (response.ok && resultado.exito) {
          setEsFavorito(false);
          setMensaje("Producto removido de favoritos");
        } else {
          throw new Error(resultado.mensaje || "Error al remover de favoritos");
        }
      } else {
        // Agregar a favoritos
        const body = {
          tipo: "producto",
          favorito_id: productoId,
        };

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.CREAR_FAVORITO(usuario.id)}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        );

        const resultado = await response.json();

        if (response.ok && resultado.exito) {
          setEsFavorito(true);
          setMensaje("Producto agregado a favoritos");
        } else {
          throw new Error(resultado.mensaje || "Error al agregar a favoritos");
        }
      }
    } catch (error) {
      console.error("❌ Error al gestionar favorito:", error);
      setMensaje("Error: " + error.message);
    } finally {
      setAgregandoFavorito(false);
    }
  };

  // Función para navegar al perfil del restaurante
  const irAPerfilRestaurante = () => {
    if (negocioId) {
      navigate(`/perfil_restaurante/${negocioId}`);
    }
  };

  // Función para abrir el modal de imagen
  const abrirModalImagen = () => {
    if (producto?.imagen_URL) {
      setModalImagenAbierto(true);
    }
  };

  // Función para cerrar el modal de imagen
  const cerrarModalImagen = () => {
    setModalImagenAbierto(false);
  };

  // Función para abrir el modal de eliminar
  const abrirModalEliminar = () => {
    if (!productoActivo) {
      setMensaje("El producto está inhabilitado y no se puede eliminar");
      return;
    }
    setModalEliminarAbierto(true);
  };

  

  // Cerrar modales con Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (modalImagenAbierto) {
          cerrarModalImagen();
        }
        if (modalEliminarAbierto) {
          cerrarModalEliminar();
        }
      }
    };

    if (modalImagenAbierto || modalEliminarAbierto) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [modalImagenAbierto, modalEliminarAbierto]);

  // Función para eliminar producto
  const eliminarProducto = async () => {
    if (!usuarioEsPropietario || !productoActivo) {
      setMensaje("Error: No tienes permisos para eliminar este producto");
      return;
    }

    setEliminando(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTOS.ELIMINAR(negocioId, productoId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const resultado = await response.json();

      if (response.ok && resultado.exito) {
        setMensaje("Producto eliminado exitosamente");
        cerrarModalEliminar();

        // Redirigir al perfil del restaurante después de 1.5 segundos
        setTimeout(() => {
          navigate(`/perfil_restaurante/${negocioId}`);
        }, 1500);
      } else {
        throw new Error(resultado.mensaje || "Error al eliminar el producto");
      }
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      setMensaje("Error al eliminar el producto: " + error.message);
    } finally {
      setEliminando(false);
    }
  };

  // Función para verificar si el usuario es propietario del negocio
  const verificarPropietario = async (negocioId) => {
    try {
      setVerificandoPropietario(true);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.AUTENTICAR_NEGOCIO(negocioId)}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const resultado = await response.json();

      if (resultado.exito) {
        setUsuarioEsPropietario(true);
      } else {
        setUsuarioEsPropietario(false);
      }
    } catch (error) {
      console.error("❌ Error al verificar propietario:", error);
      setUsuarioEsPropietario(false);
    } finally {
      setVerificandoPropietario(false);
    }
  };

  // Función para obtener el producto del endpoint
  const obtenerProducto = async (id) => {
    try {
      setCargandoProducto(true);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTOS.OBTENER_PRODUCTO(id)}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const resultado = await response.json();

      if (resultado.exito && resultado.datos) {
        const productoData = {
          ...resultado.datos,
          producto_id: id,
        };
        setProducto(productoData);
        setEsFavorito(resultado.datos.esFavorito);
        // Establecer el estado activo del producto
        setProductoActivo(resultado.datos.activo !== false);

        // Inicializar formData con todos los datos del producto
        setFormData({
          nombre: productoData.nombre || "",
          descripcion: productoData.descripcion || "",
          precio: productoData.precio?.toString() || "",
          categoria: productoData.categoria || "",
          en_oferta: productoData.en_oferta || false,
          image: null,
        });
      } else {
        setMensaje("Error: No se pudo cargar el producto");
      }
    } catch (error) {
      console.error("❌ Error al obtener producto:", error);
      setMensaje("Error de conexión al cargar el producto");
    } finally {
      setCargandoProducto(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuarioEsPropietario || !productoActivo) {
      setMensaje("Error: No tienes permisos para editar este producto");
      return;
    }

    // Validar campos requeridos
    if (!formData.precio || !formData.categoria) {
      setMensaje("Error: El precio y la categoría son campos requeridos");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("precio", formData.precio);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("en_oferta", formData.en_oferta.toString());

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTOS.ACTUALIZAR(negocioId, productoId)}`,
        {
          method: "PUT",
          credentials: "include",
          body: formDataToSend,
        },
      );

      const resultado = await response.json();

      if (response.ok) {
        setMensaje("Producto actualizado exitosamente");
        setEditando(false);
        obtenerProducto(productoId);
      } else {
        // Mostrar errores específicos del servidor
        if (resultado.error && Array.isArray(resultado.error)) {
          const errores = resultado.error.map((err) => err.mensaje).join(", ");
          setMensaje(`Error: ${errores}`);
        } else {
          setMensaje(resultado.message || "Error al actualizar el producto");
        }
      }
    } catch (error) {
      setMensaje("Error de conexión: " + error.message);
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = () => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio?.toString() || "",
        categoria: producto.categoria || "",
        en_oferta: producto.en_oferta || false,
        image: null,
      });
    }
    setEditando(false);
    setMensaje("");
  };

  // Estados de carga combinados
  if (cargandoProducto || verificandoPropietario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-105">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-transparent">
                {cargandoProducto
                  ? "Cargando producto..."
                  : "Verificando permisos..."}
              </h2>
              <p className="text-gray-600 text-sm">
                {cargandoProducto
                  ? "Obteniendo información del producto"
                  : "Verificando acceso al negocio"}
              </p>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500">
          <div className="text-red-500 mb-6 transform transition-transform duration-500 hover:scale-110">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12"
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
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent mb-3">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            No se pudo cargar la información del producto solicitado.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header mejorado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="group bg-white/80 backdrop-blur-sm text-gray-700 p-3 rounded-2xl hover:bg-white hover:shadow-2xl transition-all duration-300 flex-shrink-0 transform hover:-translate-x-1 border border-gray-200"
                title="Atrás"
              >
                <ArrowLeft className="w-5 h-5 group-hover:text-emerald-600 transition-colors duration-300" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                  Información del Producto
                </h1>
                <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Detalles completos del producto seleccionado
                </p>
              </div>
            </div>
            
            {/* Indicadores de estado */}
            <div className="flex flex-wrap gap-2">
              {producto.en_oferta && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  ¡En Oferta!
                </span>
              )}
              {!productoActivo && (
                <span className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  Producto Inactivo
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 transform transition-all duration-500 hover:shadow-3xl">
            {/* Banner superior con imagen del producto - Mejorado */}
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-gray-100 to-emerald-50">
              {producto.imagen_URL ? (
                <div
                  className="relative w-full h-full group cursor-pointer overflow-hidden"
                  onClick={abrirModalImagen}
                >
                  <div className={`w-full h-full transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                    <img
                      src={producto.imagen_URL}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                  
                  {/* Overlay mejorado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-between p-6">
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900">{producto.nombre}</h3>
                        <p className="text-gray-600 text-sm">Haz clic para ver en grande</p>
                      </div>
                    </div>
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-2xl">
                        <ZoomIn className="w-6 h-6 text-gray-700" />
                      </div>
                    </div>
                  </div>

                  {/* Efecto de brillo al hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-emerald-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Imagen no disponible</span>
                  </div>
                </div>
              )}

              {/* Botón de favoritos mejorado */}
              {!usuarioEsPropietario && (
                <div className="absolute top-4 right-4 transform transition-all duration-300 hover:scale-110">
                  <button
                    onClick={toggleFavorito}
                    disabled={agregandoFavorito}
                    className={`group flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 font-semibold ${
                      esFavorito
                        ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-red-200"
                        : "bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 shadow-gray-200"
                    } ${
                      agregandoFavorito ? "opacity-50 cursor-not-allowed" : "hover:shadow-3xl"
                    }`}
                  >
                    {agregandoFavorito ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          esFavorito ? "fill-current scale-110" : "group-hover:scale-110"
                        }`}
                      />
                    )}
                    <span className="hidden xs:inline">
                      {esFavorito ? "En Favoritos" : "Agregar a Favoritos"}
                    </span>
                  </button>
                </div>
              )}

              {/* Botones de editar y eliminar para propietarios - Mejorados */}
              {usuarioEsPropietario && !editando && (
                <div className="absolute top-4 right-4 flex flex-col xs:flex-row gap-3 transform transition-all duration-300">
                  {productoActivo ? (
                    <>
                      <button
                        onClick={() => setEditando(true)}
                        className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2 font-semibold transform hover:scale-105 hover:shadow-3xl"
                      >
                        <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={abrirModalEliminar}
                        className="group bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2 font-semibold transform hover:scale-105 hover:shadow-3xl"
                      >
                        <Trash2 className="w-4 h-4 group-hover:shake transition-transform duration-300" />
                        <span>Eliminar</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        disabled
                        className="bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-semibold cursor-not-allowed"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Inhabilitado</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Indicador de propietario mejorado */}
              {usuarioEsPropietario && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Propietario
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {mensaje && (
                <div
                  className={`mb-6 p-4 rounded-2xl border-2 backdrop-blur-sm transition-all duration-500 transform ${
                    mensaje.includes("éxito") ||
                    mensaje.includes("exitosa") ||
                    mensaje.includes("favoritos")
                      ? "bg-green-50/80 border-green-200 text-green-800 shadow-green-100"
                      : "bg-red-50/80 border-red-200 text-red-800 shadow-red-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      mensaje.includes("éxito") || mensaje.includes("exitosa") || mensaje.includes("favoritos")
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500 animate-pulse"
                    }`}></div>
                    <span className="font-medium">{mensaje}</span>
                  </div>
                </div>
              )}

              {editando ? (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Campo para cambiar imagen mejorado */}
                  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                    <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Cambiar imagen del producto
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1">
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                      </div>
                      {producto.imagen_URL && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                          <img
                            src={producto.imagen_URL}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Formatos: JPG, PNG, GIF. Tamaño máximo: 2MB
                    </p>
                  </div>

                  {/* Grid de campos mejorado */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campo nombre */}
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm bg-white"
                        placeholder="Ingresa el nombre del producto"
                      />
                    </div>

                    {/* Campo categoría */}
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Categoría *
                      </label>
                      <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm bg-white appearance-none"
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="Mexicana">Mexicana</option>
                        <option value="Italiana">Italiana</option>
                        <option value="Asiática">Asiática</option>
                        <option value="Americana">Americana</option>
                        <option value="Vegetariana">Vegetariana</option>
                        <option value="Mariscos">Mariscos</option>
                        <option value="Postres">Postres</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Francesa">Francesa</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                  </div>

                  {/* Campo descripción */}
                  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm bg-white resize-none"
                      placeholder="Describe el producto..."
                    />
                  </div>

                  {/* Campo precio y oferta */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campo precio */}
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Precio *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                          $
                        </span>
                        <input
                          type="number"
                          name="precio"
                          value={formData.precio}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Campo en oferta */}
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200 flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          ¿En oferta?
                        </label>
                        <p className="text-xs text-gray-600">Activa si el producto está en promoción</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="en_oferta"
                          id="en_oferta"
                          checked={formData.en_oferta}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor="en_oferta"
                          className={`block w-14 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                            formData.en_oferta ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 transform ${
                              formData.en_oferta ? 'translate-x-6' : ''
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción mejorados */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none"
                    >
                      {cargando ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Guardar Cambios
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      disabled={cargando}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                /* Vista de solo lectura - Mejorada */
                <div className="space-y-8">
                  {/* Header del producto */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-2">
                    {/* Nombre del producto con diseño mejorado */}
                    <div className="flex-1">
                      <h1
                        className="text-2xl sm:text-4xl lg:text-5xl font-bold py-4 px-6 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 inline-block"
                        style={{
                          background: `linear-gradient(135deg, ${Colores_Interfaz.bright_green}, #10b981)`,
                          color: Colores_Font.white,
                        }}
                      >
                        {producto.nombre}
                      </h1>
                    </div>

                    {/* Precio y oferta - Diseño premium */}
                    <div className="flex flex-col lg:items-end gap-4">
                      {producto.en_oferta && (
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-current animate-pulse" />
                            <span className="font-bold text-lg">¡EN OFERTA!</span>
                          </div>
                        </div>
                      )}
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
                      >
                        <div className="text-center">
                          <div className="text-sm opacity-90">Precio</div>
                          <div className="text-4xl font-bold">${producto.precio}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección Descripción */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: Colores_Interfaz.bright_green }}
                      ></div>
                      <h2
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: Colores_Interfaz.bright_green }}
                      >
                        Descripción
                      </h2>
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-lg">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {producto.descripcion || (
                          <span className="text-gray-400 italic">
                            Este producto no tiene descripción.
                          </span>
                        )}
                      </p>
                      
                      {producto.categoria && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                          <span className="font-semibold text-gray-800 text-lg">
                            Categoría:
                          </span>
                          <span 
                            className="px-4 py-2 rounded-full text-sm font-semibold shadow-lg border-2 border-white"
                            style={{
                              background: `linear-gradient(135deg, ${Colores_Interfaz.bright_green}, #10b981)`,
                              color: 'white'
                            }}
                          >
                            {producto.categoria}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del restaurante */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: Colores_Interfaz.bright_green }}
                      ></div>
                      <h2
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: Colores_Interfaz.bright_green }}
                      >
                        Detalles del Restaurante
                      </h2>
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-lg space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-semibold text-gray-800 text-lg">
                          Nombre del restaurante:
                        </span>
                        <button
                          onClick={irAPerfilRestaurante}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-300 text-lg text-left transform hover:scale-105 flex items-center gap-2 group"
                        >
                          {negocioNombre}
                          <MapPin className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>

                      {producto.negocio_ubicacion && (
                        <div className="mt-4 rounded-2xl overflow-hidden shadow-2xl border-2 border-white transform transition-all duration-500 hover:scale-105">
                          <MapaUbicacion
                            geopoint={producto.negocio_ubicacion}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mensaje para no propietarios mejorado */}
                  {!usuarioEsPropietario && (
                    <div 
                      className="rounded-2xl p-6 shadow-2xl border-2 border-white/50 backdrop-blur-sm transform transition-all duration-500 hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${Colores_Interfaz.bright_green}20, #10b98120)`,
                        borderColor: Colores_Interfaz.bright_green
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="p-3 rounded-2xl flex-shrink-0"
                          style={{ backgroundColor: Colores_Interfaz.bright_green }}
                        >
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p 
                            className="font-bold text-lg mb-2"
                            style={{ color: Colores_Interfaz.bright_green }}
                          >
                            Información de solo lectura
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            Solo el propietario del restaurante puede editar esta información. 
                            Si necesitas modificar algo, contacta directamente al establecimiento.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para imagen en grande - Mejorado */}
      {modalImagenAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="relative max-w-6xl max-h-full w-full animate-scale-in">
            {/* Botón cerrar mejorado */}
            <button
              onClick={cerrarModalImagen}
              className="absolute -top-16 sm:-top-20 right-0 text-white hover:text-gray-300 transition-all duration-300 z-10 transform hover:scale-125 bg-black/50 rounded-full p-3 backdrop-blur-sm"
            >
              <X className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            {/* Contenedor de imagen mejorado */}
            <div className="relative flex items-center justify-center min-h-[70vh]">
              <div className="relative group">
                <img
                  src={producto.imagen_URL}
                  alt={producto.nombre}
                  className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-3xl shadow-2xl transform transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay informativo */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 rounded-b-3xl transform transition-transform duration-500 group-hover:translate-y-0">
                  <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-white/90">
                      <span className="text-xl font-semibold">${producto.precio}</span>
                      <span className="w-1 h-1 bg-white/70 rounded-full"></span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                        {producto.categoria}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación - Mejorado */}
      {modalEliminarAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto transform animate-scale-in border border-white/20">
            <div className="p-6 sm:p-8">
              {/* Icono de advertencia mejorado */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
              </div>

              {/* Contenido textual */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  ¿Eliminar Producto?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ¿Estás seguro de que quieres eliminar el producto{" "}
                  <strong className="text-gray-800">"{producto.nombre}"</strong>? 
                  Esta acción no se puede deshacer.
                </p>
              </div>

              {/* Información de advertencia mejorada */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-orange-800 text-sm leading-relaxed">
                    Se eliminará permanentemente toda la información del producto, 
                    incluyendo su imagen y datos asociados.
                  </p>
                </div>
              </div>

              {/* Botones de acción mejorados */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cerrarModalEliminar}
                  disabled={eliminando}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarProducto}
                  disabled={eliminando}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 disabled:from-red-400 disabled:to-orange-500 text-white py-4 px-6 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  {eliminando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .group-hover\\:shake:hover {
          animation: shake 0.5s ease-in-out;
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
};

export default InformacionProducto;