// src/pages/PerfilRestaurante.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogOut,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Clock,
  Edit,
  Loader,
  ArrowLeft,
  Shield,
  Globe,
  Mail,
  User,
  Plus,
  Image as ImageIcon,
  Utensils,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Heart,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import MapaUbicacion from "../components/MapaUbicacion";

export default function PerfilRestaurante() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [menuImages, setMenuImages] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [cargandoMenu, setCargandoMenu] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewLogo, setPreviewLogo] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);

  // Estados para sugerencias
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [enviandoSugerencia, setEnviandoSugerencia] = useState(false);
  const [formSugerencia, setFormSugerencia] = useState({
    titulo: "",
    descripcion: "",
  });
  const [errorSugerencia, setErrorSugerencia] = useState("");
  const [successSugerencia, setSuccessSugerencia] = useState("");
  const [mostrarFormSugerencia, setMostrarFormSugerencia] = useState(false);

  const navigate = useNavigate();
  const { negocioId } = useParams();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setVerificandoSesion(true);

        if (!negocioId) {
          throw new Error("No se proporcionó un ID de negocio");
        }

        // 1. Primero verificar sesión del usuario
        try {
          const sesionRes = await fetch(
            "http://localhost:3000/api/usuarios/autenticar-sesion",
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (sesionRes.ok) {
            const sesionData = await sesionRes.json();
            if (sesionData.exito) {
              setUsuario(sesionData.datos);
            }
          }
        } catch (err) {
          console.log("No hay sesión activa o error al verificar sesión:", err);
        } finally {
          setVerificandoSesion(false);
        }

        // 2. Cargar perfil del negocio
        await cargarPerfilYMenu();

        // 3. Cargar productos desde el endpoint real
        await cargarProductos();

        // 4. Cargar sugerencias si el usuario es propietario
        if (usuario && perfil && usuario.correo === perfil.correo) {
          await cargarSugerencias();
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setCargandoMenu(false);
      }
    };

    cargarDatos();
  }, [negocioId]);

  // Cargar sugerencias cuando el usuario esté disponible
  useEffect(() => {
    if (usuario && perfil && usuario.correo === perfil.correo) {
      cargarSugerencias();
    }
  }, [usuario, perfil]);

  // Función para cargar sugerencias
  const cargarSugerencias = async () => {
    if (!usuario || !esPropietario) return;

    setCargandoSugerencias(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/sugerencias/obtener-sugerencias/${negocioId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar las sugerencias`);
      }

      const result = await response.json();

      if (result.exito) {
        setSugerencias(result.datos || []);
      } else {
        setSugerencias([]);
        console.warn("Respuesta del servidor:", result.mensaje);
      }
    } catch (error) {
      console.error("Error al cargar sugerencias:", error);
      setSugerencias([]);
    } finally {
      setCargandoSugerencias(false);
    }
  };

  // Función para enviar sugerencia
  const enviarSugerencia = async (e) => {
    e.preventDefault();
    setEnviandoSugerencia(true);
    setErrorSugerencia("");
    setSuccessSugerencia("");

    // Validaciones básicas
    if (!formSugerencia.titulo.trim()) {
      setErrorSugerencia("El título es requerido");
      setEnviandoSugerencia(false);
      return;
    }

    if (!formSugerencia.descripcion.trim()) {
      setErrorSugerencia("La descripción es requerida");
      setEnviandoSugerencia(false);
      return;
    }

    if (formSugerencia.titulo.length > 100) {
      setErrorSugerencia("El título no puede exceder los 100 caracteres");
      setEnviandoSugerencia(false);
      return;
    }

    if (formSugerencia.descripcion.length > 5000) {
      setErrorSugerencia("La descripción no puede exceder los 5000 caracteres");
      setEnviandoSugerencia(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/sugerencias/crear-sugerencia/${negocioId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: formSugerencia.titulo.trim(),
            descripcion: formSugerencia.descripcion.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.mensaje || `Error ${response.status}: ${response.statusText}`
        );
      }

      if (!result.exito) {
        throw new Error(result.mensaje || "Error al crear la sugerencia");
      }

      setSuccessSugerencia(
        "¡Sugerencia enviada exitosamente a los administradores!"
      );
      setFormSugerencia({ titulo: "", descripcion: "" });
      setMostrarFormSugerencia(false);

      // Recargar las sugerencias para mostrar la nueva
      await cargarSugerencias();
    } catch (err) {
      console.error("Error al enviar sugerencia:", err);
      setErrorSugerencia(err.message || "Error de conexión al servidor");
    } finally {
      setEnviandoSugerencia(false);
    }
  };

  const handleInputSugerenciaChange = (e) => {
    const { name, value } = e.target;
    setFormSugerencia((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para agregar/remover de favoritos
  const toggleFavorito = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión para agregar restaurantes a favoritos");
      return;
    }

    setCargandoFavorito(true);

    try {
      if (esFavorito) {
        // Remover de favoritos
        const response = await fetch(
          `http://localhost:3000/api/usuarios/borrar-favorito/${usuario.id}/${negocioId}/negocio`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const resultado = await response.json();

        if (response.ok && resultado.exito) {
          setEsFavorito(false);
        } else {
          throw new Error(resultado.mensaje || "Error al remover de favoritos");
        }
      } else {
        // Agregar a favoritos
        const body = {
          tipo: "negocio",
          favorito_id: negocioId,
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
        } else {
          throw new Error(resultado.mensaje || "Error al agregar a favoritos");
        }
      }
    } catch (error) {
      console.error("❌ Error al gestionar favorito:", error);
      alert("Error: " + error.message);
    } finally {
      setCargandoFavorito(false);
    }
  };

  // Función para cargar perfil y extraer imágenes del menú
  const cargarPerfilYMenu = async () => {
    try {
      const perfilRes = await fetch(
        `http://localhost:3000/api/negocios/perfil/${negocioId}`,
        {
          credentials: "include",
        }
      );

      if (!perfilRes.ok) {
        if (perfilRes.status === 404) {
          throw new Error("Negocio no encontrado");
        } else if (perfilRes.status === 403) {
          throw new Error("No tienes permisos para ver este perfil");
        } else {
          throw new Error(`Error ${perfilRes.status} al cargar el perfil`);
        }
      }

      const perfilData = await perfilRes.json();

      if (!perfilData.exito) {
        throw new Error(
          perfilData.mensaje || "Error al cargar los datos del negocio"
        );
      }

      setPerfil(perfilData.datos);
      setEsFavorito(perfilData.datos.esFavorito);

      // Extraer imágenes del menú del objeto "menus"
      if (
        perfilData.datos.menus &&
        typeof perfilData.datos.menus === "object"
      ) {
        const imagenesMenu = Object.entries(perfilData.datos.menus).map(
          ([id, url]) => ({
            id: id,
            url: url,
          })
        );
        setMenuImages(imagenesMenu);
      } else {
        setMenuImages([]);
      }
    } catch (error) {
      console.error("Error al cargar perfil y menú:", error);
      throw error;
    }
  };

  // Función para cargar imágenes del menú desde el perfil
  const cargarImagenesMenu = async () => {
    try {
      setCargandoMenu(true);

      // Recargar el perfil para obtener las imágenes actualizadas del menú
      await cargarPerfilYMenu();
    } catch (error) {
      console.error("Error al cargar imágenes del menú:", error);
      setMenuImages([]);
    } finally {
      setCargandoMenu(false);
    }
  };

  // Función REAL para cargar productos desde el endpoint
  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const response = await fetch(
        `http://localhost:3000/api/productos/obtener-productos/${negocioId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No hay productos, es normal
          setProductos([]);
          return;
        }
        throw new Error(`Error ${response.status} al cargar los productos`);
      }

      const result = await response.json();

      if (result.exito) {
        setProductos(result.datos || []);
      } else {
        // Si no hay éxito pero tampoco error crítico, mostrar array vacío
        setProductos([]);
        console.warn("Respuesta del servidor:", result.mensaje);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      // En caso de error, mostrar array vacío para no romper la UI
      setProductos([]);
    } finally {
      setCargandoProductos(false);
    }
  };

  // Función para abrir preview de imagen del menú
  const openImagePreview = (image, index) => {
    setPreviewImage(image);
    setCurrentImageIndex(index);
  };

  // Función para abrir preview del logo
  const openLogoPreview = () => {
    if (perfil?.logo) {
      setPreviewLogo(true);
    }
  };

  // Función para cerrar preview del logo
  const closeLogoPreview = () => {
    setPreviewLogo(false);
  };

  // Función para cerrar preview de menú
  const closeImagePreview = () => {
    setPreviewImage(null);
    setCurrentImageIndex(0);
  };

  // Función para navegar entre imágenes en el preview del menú
  const goToNextImage = () => {
    if (currentImageIndex < menuImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setPreviewImage(menuImages[currentImageIndex + 1]);
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setPreviewImage(menuImages[currentImageIndex - 1]);
    }
  };

  // Manejar teclado en los previews
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (previewImage) {
        if (e.key === "Escape") {
          closeImagePreview();
        } else if (e.key === "ArrowRight") {
          goToNextImage();
        } else if (e.key === "ArrowLeft") {
          goToPrevImage();
        }
      } else if (previewLogo) {
        if (e.key === "Escape") {
          closeLogoPreview();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewImage, previewLogo, currentImageIndex]);

  const handleEditarPerfil = () => {
    if (perfil && usuario) {
      navigate("/configura_perfil", {
        state: {
          negocio: perfil,
          negocioId: negocioId,
        },
      });
    }
  };

  const handleAgregarProducto = () => {
    if (usuario && perfil) {
      navigate("/agregar_producto", {
        state: {
          negocioId: negocioId,
          negocioNombre: perfil.nombre,
        },
      });
    }
  };

  // Función REAL para subir imagen del menú
  const handleUploadMenu = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen debe ser menor a 2MB");
      return;
    }

    setUploadingMenu(true);

    try {
      const formData = new FormData();
      formData.append("imagen", file); // Campo debe llamarse "imagen"

      const response = await fetch(
        `http://localhost:3000/api/negocios/subir-menu/${negocioId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.exito) {
        // Recargar las imágenes del menú después de subir
        await cargarImagenesMenu();
        alert("Imagen del menú agregada exitosamente");
      } else {
        throw new Error(result.mensaje || "Error al subir la imagen");
      }

      // Limpiar input
      event.target.value = "";
    } catch (error) {
      console.error("Error al subir imagen del menú:", error);
      alert("Error al subir la imagen del menú: " + error.message);
    } finally {
      setUploadingMenu(false);
    }
  };

  // Función REAL para eliminar imagen del menú
  const handleDeleteMenuImage = async (imageId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta imagen del menú?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/negocios/borrar-menu/${negocioId}/${imageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok && result.exito) {
        // Recargar las imágenes del menú después de eliminar
        await cargarImagenesMenu();
        alert("Imagen del menú eliminada exitosamente");
      } else {
        throw new Error(result.mensaje || "Error al eliminar la imagen");
      }
    } catch (error) {
      console.error("Error al eliminar imagen del menú:", error);
      alert("Error al eliminar la imagen del menú: " + error.message);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      const logoutRes = await fetch(
        "http://localhost:3000/api/usuarios/logout",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (logoutRes.ok) {
        const logoutData = await logoutRes.json();
        if (logoutData.exito) {
          console.log("Sesión cerrada exitosamente");
        }
      }

      setUsuario(null);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      setUsuario(null);
      navigate("/login");
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegistrar = () => {
    navigate("/login");
  };

  // Función para formatear horarios
  const formatearHorario = (apertura, cierre) => {
    if (!apertura || !cierre) return "Cerrado";
    const formatHora = (hora) => {
      const [horas, minutos] = hora.split(":");
      const horaNum = parseInt(horas);
      const periodo = horaNum >= 12 ? "PM" : "AM";
      const hora12 = horaNum % 12 || 12;
      return `${hora12}:${minutos} ${periodo}`;
    };
    return `${formatHora(apertura)} - ${formatHora(cierre)}`;
  };

  // Función para generar enlaces de redes sociales
  const generarEnlaceRedSocial = (plataforma, valor) => {
    if (!valor) return null;

    switch (plataforma) {
      case "WhatsApp":
        return `https://wa.me/${valor.replace("+", "")}`;
      case "Facebook":
        return valor.startsWith("http")
          ? valor
          : `https://facebook.com/${valor}`;
      case "Instagram":
        return valor.startsWith("http")
          ? valor
          : `https://instagram.com/${valor}`;
      case "X":
        return valor.startsWith("http") ? valor : `https://x.com/${valor}`;
      case "TikTok":
        return valor.startsWith("http")
          ? valor
          : `https://tiktok.com/@${valor}`;
      default:
        return valor;
    }
  };

  // Verificar si el usuario actual es el propietario del negocio
  const esPropietario = usuario && perfil && usuario.correo === perfil.correo;

  // Mostrar loading principal
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil del negocio...</p>
          <p className="text-sm text-gray-500">ID: {negocioId}</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !perfil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">
              {error || "No se pudieron cargar los datos del negocio"}
            </span>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Ir al Inicio
            </button>
            <button
              onClick={handleVolver}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Volver Atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Modal de Preview del Logo */}
      {previewLogo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={closeLogoPreview}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Imagen del logo */}
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={perfil.logo}
                alt={`Logo de ${perfil.nombre}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Información del logo */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              Logo de {perfil.nombre}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview de Imagen del Menú */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Botón anterior */}
            {currentImageIndex > 0 && (
              <button
                onClick={goToPrevImage}
                className="absolute left-4 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Imagen */}
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={previewImage.url}
                alt="Vista previa del menú"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Botón siguiente */}
            {currentImageIndex < menuImages.length - 1 && (
              <button
                onClick={goToNextImage}
                className="absolute right-4 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Contador */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {menuImages.length}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con información de usuario */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex space-x-2">
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
              Perfil del Negocio
            </h1>
          </div>

          <div className="flex gap-3 flex-wrap">
            {verificandoSesion ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader className="w-4 h-4 animate-spin" />
                Verificando sesión...
              </div>
            ) : usuario ? (
              <>
                {esPropietario && (
                  <button
                    onClick={handleEditarPerfil}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Perfil
                  </button>
                )}
                <button
                  onClick={handleCerrarSesion}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={handleRegistrar}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta principal del negocio */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header con imagen y información básica */}
          <div className="relative">
            {perfil.logo && (
              <>
                {/* Botón de favoritos en la esquina superior derecha - FUERA del contenedor de la imagen */}
                {!esPropietario && usuario && (
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={toggleFavorito}
                      disabled={cargandoFavorito}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition duration-200 ${
                        esFavorito
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                      } ${
                        cargandoFavorito ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {cargandoFavorito ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Heart
                          className={`w-4 h-4 ${
                            esFavorito ? "fill-current" : ""
                          }`}
                        />
                      )}
                      {esFavorito ? "En Favoritos" : "Agregar a Favoritos"}
                    </button>
                  </div>
                )}

                {/* Contenedor de la imagen - SIN el botón dentro */}
                <div
                  className="h-64 bg-gray-200 overflow-hidden group cursor-pointer"
                  onClick={openLogoPreview}
                >
                  <img
                    src={perfil.logo}
                    alt={`Logo de ${perfil.nombre}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.classList.add(
                        "bg-gradient-to-br",
                        "from-blue-100",
                        "to-purple-100"
                      );
                    }}
                  />

                  {/* Overlay con efecto hover para el logo */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg">
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700 font-medium text-sm">
                        Ver imagen
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div
              className={`p-6 ${
                perfil.logo
                  ? "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent"
                  : "bg-gradient-to-br from-blue-100 to-purple-100"
              }`}
            >
              <div
                className={`${perfil.logo ? "text-white" : "text-gray-900"}`}
              >
                <h2 className="text-4xl font-bold mb-2">{perfil.nombre}</h2>
                {perfil.descripcion && (
                  <p className="text-lg opacity-90">{perfil.descripcion}</p>
                )}
                {!perfil.activo && (
                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm mt-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    Negocio inactivo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna izquierda - Información de contacto */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Información de Contacto
                  </h3>
                  <div className="space-y-3">
                    {perfil.correo && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a
                          href={`mailto:${perfil.correo}`}
                          className="text-green-600 hover:text-green-800 break-all underline"
                        >
                          {perfil.correo}
                        </a>
                      </div>
                    )}
                    {perfil.telefono && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a
                          href={`tel:${perfil.telefono}`}
                          className="text-green-600 hover:text-gray-800 underline"
                        >
                          {perfil.telefono}
                        </a>
                      </div>
                    )}
                    {perfil.ubicacion && (
                      <MapaUbicacion
                        geopoint={{
                          latitude: perfil.ubicacion.latitude,
                          longitude: perfil.ubicacion.longitude,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Redes Sociales */}
                {perfil.redes &&
                  Object.values(perfil.redes).some((val) => val) && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Redes Sociales
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(perfil.redes).map(
                          ([plataforma, valor]) => {
                            if (!valor) return null;

                            const enlace = generarEnlaceRedSocial(
                              plataforma,
                              valor
                            );
                            const Icono =
                              plataforma === "WhatsApp"
                                ? MessageCircle
                                : plataforma === "Facebook"
                                ? Facebook
                                : plataforma === "Instagram"
                                ? Instagram
                                : plataforma === "X"
                                ? Twitter
                                : Globe;

                            return (
                              <a
                                key={plataforma}
                                href={enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                              >
                                <Icono className="w-4 h-4" />
                                <span>{plataforma}</span>
                              </a>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Columna derecha - Horario */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horario de Atención
                </h3>
                <div className="space-y-2">
                  {perfil.horario &&
                    Object.entries(perfil.horario).map(([dia, horario]) => (
                      <div
                        key={dia}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <span className="font-medium capitalize">{dia}:</span>
                        <span className="text-gray-600">
                          {formatearHorario(horario.apertura, horario.cierre)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-2 ${
                      perfil.activo ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        perfil.activo ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span>
                      {perfil.activo ? "Negocio activo" : "Negocio inactivo"}
                    </span>
                  </div>

                  {esPropietario && (
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <User className="w-3 h-3" />
                      Eres el propietario
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Menú */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-green-600" />
                Menú
              </h3>
              {esPropietario && (
                <div className="flex items-center gap-3">
                  <label
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                      uploadingMenu
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {uploadingMenu ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Agregar Imagen
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMenu}
                      className="hidden"
                      disabled={uploadingMenu}
                    />
                  </label>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-6">
              Imágenes del menú del restaurante.
            </p>

            {cargandoMenu ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Cargando menú...</p>
              </div>
            ) : menuImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div
                      className="cursor-pointer"
                      onClick={() => openImagePreview(image, index)}
                    >
                      <img
                        src={image.url?.logo || image.url}
                        alt={image.nombre || "Imagen del menú"}
                        className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg transition-opacity duration-300">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    {esPropietario && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-lg p-1  group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMenuImage(image.id);
                          }}
                          className="text-white hover:text-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No hay imágenes del menú cargadas
                </p>
                {esPropietario && (
                  <p className="text-sm text-gray-400 mt-2">
                    Haz clic en "Agregar Imagen" para comenzar
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Utensils className="w-6 h-6 text-green-600" />
                Productos
              </h3>
              {esPropietario && (
                <button
                  onClick={handleAgregarProducto}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </button>
              )}
            </div>

            <p className="text-gray-600 mb-6">
              Agrega los productos y su información.
            </p>

            {cargandoProductos ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            ) : productos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos.map((producto) => (
                  <div
                    key={producto.producto_id}
                    onClick={() =>
                      navigate("/informacion_producto", {
                        state: {
                          producto_id: producto.producto_id,
                          negocioId: negocioId,
                          negocioNombre: perfil.nombre,
                        },
                      })
                    }
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    {/* Imagen grande arriba */}
                    {producto.imagen_URL && (
                      <img
                        src={producto.imagen_URL}
                        alt={producto.nombre}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    {/* Contenido debajo */}
                    <div className="p-4">
                      <h4 className="font-bold text-2xl mb-2">
                        {producto.nombre}
                      </h4>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-green-500 font-bold">
                          ${producto.precio}
                        </span>

                        {producto.en_oferta && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Oferta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay productos cargados</p>
                {esPropietario && (
                  <p className="text-sm text-gray-400 mt-2">
                    Haz clic en "Agregar Producto" para comenzar
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Sugerencias para los Administradores */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-4 sm:p-6">
            {/* Header responsivo */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-green-600 flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Sugerencias para los Administradores
                </h3>
              </div>

              {esPropietario && (
                <button
                  onClick={() =>
                    setMostrarFormSugerencia(!mostrarFormSugerencia)
                  }
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
                >
                  {mostrarFormSugerencia ? (
                    <EyeOff className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Eye className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-sm sm:text-base">
                    {mostrarFormSugerencia ? "Ocultar" : "Nueva Sugerencia"}
                  </span>
                </button>
              )}
            </div>

            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {esPropietario
                ? "Envía sugerencias a los administradores para mejorar el servicio de la plataforma."
                : "Esta sección es exclusiva para el propietario del negocio."}
            </p>

            {/* Formulario para enviar sugerencia (solo para propietarios) */}
            {esPropietario && mostrarFormSugerencia && (
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6 border border-blue-200">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800">
                  <Send className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base sm:text-lg">
                    Envía una sugerencia a los administradores
                  </span>
                </h4>

                <form onSubmit={enviarSugerencia} className="space-y-4">
                  <div>
                    <label
                      htmlFor="titulo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Título de la sugerencia *
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={formSugerencia.titulo}
                      onChange={handleInputSugerenciaChange}
                      placeholder="Ej: Mejorar la interfaz de gestión de productos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      maxLength={100}
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {formSugerencia.titulo.length}/100 caracteres
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="descripcion"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Descripción detallada *
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formSugerencia.descripcion}
                      onChange={handleInputSugerenciaChange}
                      placeholder="Describe tu sugerencia de manera detallada para que los administradores puedan entenderla mejor..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      maxLength={5000}
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {formSugerencia.descripcion.length}/5000 caracteres
                    </p>
                  </div>

                  {/* Mensajes de error y éxito */}
                  {errorSugerencia && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errorSugerencia}
                    </div>
                  )}

                  {successSugerencia && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {successSugerencia}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setMostrarFormSugerencia(false)}
                      className="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviandoSugerencia}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base w-full sm:w-auto"
                    >
                      {enviandoSugerencia ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 flex-shrink-0" />
                          <span>Enviar Sugerencia</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de sugerencias enviadas (solo visible para el propietario) */}
            {esPropietario && (
              <div>
                <h4 className="text-lg font-semibold mb-4 text-base sm:text-lg">
                  Mis Sugerencias Enviadas ({sugerencias.length})
                </h4>

                {cargandoSugerencias ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      Cargando sugerencias...
                    </p>
                  </div>
                ) : sugerencias.length > 0 ? (
                  <div className="space-y-4">
                    {sugerencias.map((sugerencia) => {
                      // Convertir el timestamp de Firebase a Date
                      const fechaCreacion =
                        sugerencia.creado && sugerencia.creado._seconds
                          ? new Date(sugerencia.creado._seconds * 1000)
                          : new Date();

                      return (
                        <div
                          key={sugerencia.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <h5 className="font-semibold text-gray-900 text-base sm:text-lg break-words">
                              {sugerencia.titulo}
                            </h5>
                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0 mt-1 sm:mt-0">
                              {fechaCreacion.toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                            {sugerencia.description || sugerencia.descripcion}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base mb-2">
                      No has enviado sugerencias aún
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Haz clic en "Nueva Sugerencia" para compartir tus ideas
                      con los administradores
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje para usuarios no propietarios */}
            {!esPropietario && usuario && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  Esta sección es exclusiva para el propietario del negocio
                </p>
              </div>
            )}

            {/* Mensaje para usuarios no autenticados */}
            {!usuario && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base mb-4">
                  Inicia sesión para ver las sugerencias del negocio
                </p>
                <button
                  onClick={handleLogin}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje para no propietarios */}
        {!esPropietario && usuario && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Solo lectura</p>
                <p className="text-yellow-700 text-sm">
                  Estás viendo este perfil como visitante. Solo el propietario
                  puede editarlo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
