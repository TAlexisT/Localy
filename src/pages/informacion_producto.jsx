import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, X, ZoomIn, Trash2, Heart } from "lucide-react";

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
        "http://localhost:3000/api/usuarios/autenticar-sesion",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
          `http://localhost:3000/api/usuarios/borrar-favorito/${usuario.id}/${productoId}/producto`,
          {
            method: "DELETE",
            credentials: "include",
          }
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
          `http://localhost:3000/api/usuarios/crear-favorito/${usuario.id}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
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
    if (!usuarioEsPropietario) {
      setMensaje("Error: No tienes permisos para eliminar este producto");
      return;
    }

    setEliminando(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/productos/eliminar/${negocioId}/${productoId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
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
        `http://localhost:3000/api/usuarios/autenticar-negocio/${negocioId}`,
        {
          method: "POST",
          credentials: "include",
        }
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
        `http://localhost:3000/api/productos/obtener-producto/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const resultado = await response.json();

      if (resultado.exito && resultado.datos) {
        const productoData = {
          ...resultado.datos,
          producto_id: id,
        };
        setProducto(productoData);
        setEsFavorito(resultado.datos.esFavorito);

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

    if (!usuarioEsPropietario) {
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
        `http://localhost:3000/api/productos/actualizar/${negocioId}/${productoId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formDataToSend,
        }
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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {cargandoProducto
                ? "Cargando producto..."
                : "Verificando permisos..."}
            </h2>
            <p className="text-gray-600">
              {cargandoProducto
                ? "Obteniendo información del producto"
                : "Verificando acceso al negocio"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
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
        <p className="text-gray-600 mb-4">
          No se pudo cargar la información del producto.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
        >
          Volver Atrás
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto ">
        <div className="flex space-x-2 my-2">
          <button
            onClick={handleVolver}
            className="bg-gray-300 text-white p-3 rounded-full hover:bg-gray-700 transition duration-300"
            title="Atrás"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Información del Producto
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Banner superior con imagen del producto */}
          <div className="relative h-64 bg-gray-200">
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                    <span className="text-gray-700 font-medium text-sm">
                      Ver imagen
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">Imagen no disponible</span>
              </div>
            )}

            {/* Botón de favoritos */}
            {!usuarioEsPropietario && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={toggleFavorito}
                  disabled={agregandoFavorito}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition duration-200 ${
                    esFavorito
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                  } ${
                    agregandoFavorito ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {agregandoFavorito ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart
                      className={`w-4 h-4 ${esFavorito ? "fill-current" : ""}`}
                    />
                  )}
                  {esFavorito ? "En Favoritos" : "Agregar a Favoritos"}
                </button>
              </div>
            )}

            {/* Botones de editar y eliminar para propietarios */}
            {usuarioEsPropietario && !editando && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setEditando(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                >
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar Producto
                </button>
                <button
                  onClick={abrirModalEliminar}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Producto
                </button>
              </div>
            )}

            {/* Indicador de propietario */}
            {usuarioEsPropietario && (
              <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Propietario
              </div>
            )}
          </div>

          <div className="p-6">
            {mensaje && (
              <div
                className={`mb-4 p-3 rounded ${
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del producto"
                  />
                </div>

                {/* Campos de precio y categoría */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={cargando}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
                  >
                    {cargando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              /* Vista de solo lectura */
              <div className="space-y-12">
                {/* Información del producto */}
                <div className="flex space-x-2 justify-between items-stretch mb-2">
                  {/* Product name */}
                  <h1
                    className="text-3xl font-bold py-2 px-4 rounded-tr-full rounded-r-full flex items-center"
                    style={{
                      backgroundColor: Colores_Interfaz.bright_green,
                      color: Colores_Font.white,
                    }}
                  >
                    {producto.nombre}
                  </h1>

                  {/* Price + Offer */}
                  <div
                    className="flex flex-col justify-center items-center pl-2 border-l"
                    style={{
                      borderColor: Colores_Interfaz.bright_green,
                      borderLeftWidth: "3px",
                    }}
                  >
                    {producto.en_oferta && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Oferta
                      </span>
                    )}
                    <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-2xl font-bold">
                      ${producto.precio}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className={`h-fit border-b`}
                    style={{ borderColor: Colores_Interfaz.bright_green }}
                  >
                    <h2
                      className={`rounded-tr-xl text-2xl font-bold py-2 px-4 w-fit`}
                      style={{
                        background: Colores_Interfaz.bright_green,
                        color: Colores_Font.white,
                      }}
                    >
                      Descripción
                    </h2>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-lg">
                    {producto.descripcion ||
                      "Este producto no tiene descripción."}
                  </p>
                  {producto.categoria && (
                    <div className="flex space-x-2">
                      <span className="font-medium">Categoria:</span>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        {producto.categoria}
                      </span>
                    </div>
                  )}
                </div>

                {/* Información del restaurante */}
                <div className=" space-y-2">
                  <div
                    className={`h-fit border-b`}
                    style={{ borderColor: Colores_Interfaz.bright_green }}
                  >
                    <h2
                      className={`rounded-tr-xl text-2xl font-bold py-2 px-4 w-fit`}
                      style={{
                        background: Colores_Interfaz.bright_green,
                        color: Colores_Font.white,
                      }}
                    >
                      Detalles de restaurante
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <span className="font-medium text-gray-700">
                        Nombre del restaurante:
                      </span>
                      <button
                        onClick={irAPerfilRestaurante}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition duration-200"
                      >
                        {negocioNombre}
                      </button>
                    </div>

                    {producto.negocio_ubicacion && (
                      <MapaUbicacion geopoint={producto.negocio_ubicacion}/>
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
                        <p className="text-blue-800 font-medium">
                          Información de solo lectura
                        </p>
                        <p className="text-blue-700 text-sm mt-1">
                          Solo el propietario del restaurante puede editar esta
                          información. Si necesitas modificar algo, contacta al
                          establecimiento.
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

      {/* Modal para imagen en grande */}
      {modalImagenAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
          <div className="relative max-w-4xl max-h-full">
            {/* Botón cerrar */}
            <button
              onClick={cerrarModalImagen}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition duration-200 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Imagen en grande */}
            <div className="relative">
              <img
                src={producto.imagen_URL}
                alt={producto.nombre}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {/* Información de la imagen */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white rounded-b-lg">
                <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
                <p className="text-gray-200">
                  ${producto.precio} • {producto.categoria}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación */}
      {modalEliminarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              {/* Icono de advertencia */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Título y mensaje */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                ¿Eliminar Producto?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar el producto{" "}
                <strong>"{producto.nombre}"</strong>? Esta acción no se puede
                deshacer.
              </p>

              {/* Información adicional */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
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
                  <p className="text-yellow-800 text-sm">
                    Se eliminará permanentemente toda la información del
                    producto, incluyendo su imagen.
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={cerrarModalEliminar}
                  disabled={eliminando}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarProducto}
                  disabled={eliminando}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-4 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2"
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
