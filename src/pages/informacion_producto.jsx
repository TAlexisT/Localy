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
  const [productoActivo, setProductoActivo] = useState(true); // Nuevo estado para producto activo

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

  // Función para cerrar el modal de eliminar
  const cerrarModalEliminar = () => {
    setModalEliminarAbierto(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {cargandoProducto
                  ? "Cargando producto..."
                  : "Verificando permisos..."}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {cargandoProducto
                  ? "Obteniendo información del producto"
                  : "Verificando acceso al negocio"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            No se pudo cargar la información del producto.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 text-sm hover:scale-105"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleVolver}
                className="bg-gray-300 text-white p-2 sm:p-3 rounded-full hover:bg-gray-700 transition duration-300 flex-shrink-0 hover:scale-105"
                title="Atrás"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Información del Producto
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Banner superior con imagen del producto */}
            <div className="relative h-48 sm:h-64 bg-gray-200">
              {producto.imagen_URL ? (
                <div
                  className="relative w-full h-full group cursor-pointer"
                  onClick={abrirModalImagen}
                >
                  <img
                    src={producto.imagen_URL}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Overlay con efecto hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white bg-opacity-90 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg">
                      <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">
                        Ver imagen
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400 text-sm sm:text-base">
                    Imagen no disponible
                  </span>
                </div>
              )}

              {/* Botón de favoritos */}
              {!usuarioEsPropietario && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <button
                    onClick={toggleFavorito}
                    disabled={agregandoFavorito}
                    className={`flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md transition duration-200 text-xs sm:text-sm hover:scale-105 ${
                      esFavorito
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-white hover:bg-red-300 text-gray-700 hover:text-black "
                    } ${
                      agregandoFavorito ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {agregandoFavorito ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          esFavorito ? "fill-current" : ""
                        }`}
                      />
                    )}
                    <span className="hidden xs:inline">
                      {esFavorito ? "En Favoritos" : "Agregar a Favoritos"}
                    </span>
                  </button>
                </div>
              )}

              {/* Botones de editar y eliminar para propietarios */}
              {usuarioEsPropietario && !editando && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col xs:flex-row gap-2">
                  {productoActivo ? (
                    <>
                      <button
                        onClick={() => setEditando(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:scale-105"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={abrirModalEliminar}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:scale-105"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Eliminar</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        disabled
                        className="bg-gray-400 text-gray-200 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm cursor-not-allowed"
                      >
                        <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Inhabilitado</span>
                      </button>
                      <button
                        disabled
                        className="bg-gray-400 text-gray-200 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm cursor-not-allowed"
                      >
                        <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Inhabilitado</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Indicador de propietario */}
              {usuarioEsPropietario && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-green-100 text-green-800 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  Propietario
                </div>
              )}

              {/* Indicador de producto inactivo */}
              {!productoActivo && (
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-red-100 text-red-800 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                  <Ban className="w-3 h-3" />
                  Producto Inactivo
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {mensaje && (
                <div
                  className={`mb-4 p-3 rounded text-sm ${
                    mensaje.includes("éxito") ||
                    mensaje.includes("exitosa") ||
                    mensaje.includes("favoritos")
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {mensaje}
                </div>
              )}

              {editando ? (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Campo para cambiar imagen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar imagen del producto
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 2MB
                    </p>
                  </div>

                  {/* Campo nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Nombre del producto"
                    />
                  </div>

                  {/* Campo descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Descripción del producto"
                    />
                  </div>

                  {/* Campos de precio y categoría */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Campo precio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Campo categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                  {/* Campo en oferta */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="en_oferta"
                      id="en_oferta"
                      checked={formData.en_oferta}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="en_oferta"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Este producto está en oferta
                    </label>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2 text-sm hover:scale-105"
                    >
                      {cargando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin hover:scale-105 duration-300"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
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
                      className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition duration-200 text-sm hover:scale-105"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                /* Vista de solo lectura */
                <div className="space-y-6 sm:space-y-8">
                  {/* Información del producto - Versión compacta */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-2">
                    {/* Product name */}
                    <h1
                      className="text-xl sm:text-2xl lg:text-3xl font-bold py-2 px-4 rounded-tr-full rounded-r-full flex items-center break-words lg:flex-1"
                      style={{
                        backgroundColor: Colores_Interfaz.bright_green,
                        color: Colores_Font.white,
                      }}
                    >
                      {producto.nombre}
                    </h1>

                    {/* Price + Offer - En línea en desktop */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-3 lg:mt-0">
                      {producto.en_oferta && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xl font-medium order-1 lg:order-1">
                          Oferta
                        </span>
                      )}
                      <span
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-3xl sm:text-3xl font-bold order-2 lg:order-2"
                        style={{
                          border: `2px solid ${Colores_Interfaz.bright_green}`,
                        }}
                      >
                        ${producto.precio}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div
                      className={`h-fit border-b`}
                      style={{ borderColor: Colores_Interfaz.bright_green }}
                    >
                      <h2
                        className={`rounded-tr-xl text-xl sm:text-2xl font-bold py-2 px-4 w-fit`}
                        style={{
                          background: Colores_Interfaz.bright_green,
                          color: Colores_Font.white,
                        }}
                      >
                        Descripción
                      </h2>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                      {producto.descripcion ||
                        "Este producto no tiene descripción."}
                    </p>
                    {producto.categoria && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          Categoría:
                        </span>
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          {producto.categoria}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información del restaurante */}
                  <div className="space-y-3">
                    <div
                      className={`h-fit border-b`}
                      style={{ borderColor: Colores_Interfaz.bright_green }}
                    >
                      <h2
                        className={`rounded-tr-xl text-xl sm:text-2xl font-bold py-2 px-4 w-fit`}
                        style={{
                          background: Colores_Interfaz.bright_green,
                          color: Colores_Font.white,
                        }}
                      >
                        Detalles de restaurante
                      </h2>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center  gap-1 sm:gap-2">
                        <span className="font-medium text-gray-700 text-sm sm:text-xl">
                          Nombre del restaurante:
                        </span>
                        <button
                          onClick={irAPerfilRestaurante}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition duration-200 text-sm sm:text-xl text-left hover:scale-105"
                        >
                          {negocioNombre}
                        </button>
                      </div>

                      {producto.negocio_ubicacion && (
                        <div className="mt-3 relative z-10">
                          {" "}
                          {/* Añadido relative z-10 aquí */}
                          <MapaUbicacion
                            geopoint={producto.negocio_ubicacion}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mensaje para no propietarios */}
                  {!usuarioEsPropietario && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-blue-800 font-medium text-sm sm:text-base">
                            Información de solo lectura
                          </p>
                          <p className="text-blue-700 text-xs sm:text-sm mt-1">
                            Solo el propietario del restaurante puede editar
                            esta información. Si necesitas modificar algo,
                            contacta al establecimiento.
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

      {/* Modal para imagen en grande */}
      {modalImagenAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-90">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Botón cerrar */}
            <button
              onClick={cerrarModalImagen}
              className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-gray-300 transition duration-200 z-10 hover:scale-105"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Imagen en grande */}
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <img
                src={producto.imagen_URL}
                alt={producto.nombre}
                className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg"
              />

              {/* Información de la imagen */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 sm:p-6 text-white rounded-b-lg">
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  {producto.nombre}
                </h3>
                <p className="text-gray-200 text-sm sm:text-base">
                  ${producto.precio} • {producto.categoria}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación */}
      {modalEliminarAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-4 sm:p-6">
              {/* Icono de advertencia */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </div>

              {/* Título y mensaje */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">
                ¿Eliminar Producto?
              </h3>
              <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                ¿Estás seguro de que quieres eliminar el producto{" "}
                <strong>"{producto.nombre}"</strong>? Esta acción no se puede
                deshacer.
              </p>

              {/* Información adicional */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 sm:mb-6">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-yellow-800 text-xs sm:text-sm">
                    Se eliminará permanentemente toda la información del
                    producto, incluyendo su imagen.
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cerrarModalEliminar}
                  disabled={eliminando}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 sm:py-3 px-4 rounded-lg transition duration-200 font-medium text-sm sm:text-base hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarProducto}
                  disabled={eliminando}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 sm:py-3 px-4 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105"
                >
                  {eliminando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </>
  );
};

export default InformacionProducto;
