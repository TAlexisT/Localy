import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TarjetaRestaurante from "../components/tarjeta_restaurante";
import TarjetaProducto from "../components/tarjeta_producto";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function PaginaPrincipal() {
  // #region Parametros
  const [restaurantes, setRestaurantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Productos");
  const [cargandoRestaurantes, setCargandoRestaurantes] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorRestaurantes, setErrorRestaurantes] = useState("");
  const [errorProductos, setErrorProductos] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [solicitandoUbicacion, setSolicitandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState("");

  // Estados para scroll infinito - Restaurantes
  const [cargandoMasRestaurantes, setCargandoMasRestaurantes] = useState(false);
  const [hayMasRestaurantes, setHayMasRestaurantes] = useState(true);
  const [ultimoTokenRestaurantes, setUltimoTokenRestaurantes] = useState(null);

  // Estados para scroll infinito - Productos
  const [cargandoMasProductos, setCargandoMasProductos] = useState(false);
  const [hayMasProductos, setHayMasProductos] = useState(true);
  const [ultimoTokenProductos, setUltimoTokenProductos] = useState(null);

  // Estados para filtros de Restaurantes
  const [mostrarFiltrosRestaurantes, setMostrarFiltrosRestaurantes] =
    useState(false);
  const [filtrosRestaurantes, setFiltrosRestaurantes] = useState({
    distancia_orden: "ASC",
    distancia_rango: 25,
    tipo: "", // nuevo campo
  });

  const [filtrosAplicadosRestaurantes, setFiltrosAplicadosRestaurantes] =
    useState({
      distancia_orden: "ASC",
      distancia_rango: 25,
      tipo: "", // nuevo campo
    });
  const [mostrarTipo, setMostrarTipo] = useState(false);

  // Estados para los dropdowns personalizados
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [mostrarOrdenPrecio, setMostrarOrdenPrecio] = useState(false);
  const [mostrarOrdenDistancia, setMostrarOrdenDistancia] = useState(false);

  // Estados para filtros de Productos
  const [mostrarFiltrosProductos, setMostrarFiltrosProductos] = useState(false);
  const [filtrosProductos, setFiltrosProductos] = useState({
    categoria: "",
    precio_orden: "",
    precio_min: "",
    precio_max: "",
  });
  const [filtrosAplicadosProductos, setFiltrosAplicadosProductos] = useState({
    categoria: "",
    precio_orden: "",
    precio_min: "",
    precio_max: "",
  });
  const [errorPrecio, setErrorPrecio] = useState("");

  // Estados para cambiar contraseña
  const [mostrarPopupCambiarContrasena, setMostrarPopupCambiarContrasena] =
    useState(false);
  const [cargandoCambioContrasena, setCargandoCambioContrasena] =
    useState(false);
  const [mensajeCambioContrasena, setMensajeCambioContrasena] = useState("");

  // seguimiento del estado de la peticion de datos
  const reqNegociosActivo = useRef(false);
  const reqProductosActivo = useRef(false);

  const navigate = useNavigate();

  // Categorías disponibles para productos
  const categoriasDisponibles = [
    "Mexicana",
    "China",
    "Italiana",
    "Americana",
    "Internacional",
    "Francesa",
    "Asiatica",
    "Vegetariana",
    "Mariscos",
    "Postres",
    "Bebidas",
    "Otras",
  ];

  // Estados para el menú desplegable móvil
  const [mostrarMenuMobile, setMostrarMenuMobile] = useState(false);
 // #endregion


  // Efecto para deshabilitar scroll cuando el popup está abierto O el menú móvil está abierto
  useEffect(() => {
    if (mostrarPopupCambiarContrasena || mostrarMenuMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mostrarPopupCambiarContrasena, mostrarMenuMobile]);

  // Efecto para deshabilitar scroll cuando el popup está abierto
  useEffect(() => {
    if (mostrarPopupCambiarContrasena) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mostrarPopupCambiarContrasena]);

  // Cerrar filtros y dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Para filtros de restaurantes
      if (mostrarFiltrosRestaurantes) {
        const filtrosRestaurantesElement = document.getElementById(
          "filtros-restaurantes",
        );
        const botonFiltrosRestaurantes = document.getElementById(
          "boton-filtros-restaurantes",
        );

        if (
          filtrosRestaurantesElement &&
          botonFiltrosRestaurantes &&
          !filtrosRestaurantesElement.contains(event.target) &&
          !botonFiltrosRestaurantes.contains(event.target)
        ) {
          setMostrarFiltrosRestaurantes(false);
        }
      }

      // Para el menú móvil
      if (mostrarMenuMobile) {
        const menuMobileElement = document.getElementById("menu-mobile");
        const botonMenuMobile = document.getElementById("boton-menu-mobile");

        if (
          menuMobileElement &&
          botonMenuMobile &&
          !menuMobileElement.contains(event.target) &&
          !botonMenuMobile.contains(event.target)
        ) {
          setMostrarMenuMobile(false);
        }
      }

      // Para filtros de productos
      if (mostrarFiltrosProductos) {
        const filtrosProductosElement =
          document.getElementById("filtros-productos");
        const botonFiltrosProductos = document.getElementById(
          "boton-filtros-productos",
        );

        if (
          filtrosProductosElement &&
          botonFiltrosProductos &&
          !filtrosProductosElement.contains(event.target) &&
          !botonFiltrosProductos.contains(event.target)
        ) {
          setMostrarFiltrosProductos(false);
        }
      }

      // Para dropdown de categorías
      if (mostrarCategorias) {
        const categoriasElement = document.querySelector(
          '[data-dropdown="categorias"]',
        );
        if (categoriasElement && !categoriasElement.contains(event.target)) {
          setMostrarCategorias(false);
        }
      }

      // Para dropdown de orden precio
      if (mostrarOrdenPrecio) {
        const ordenPrecioElement = document.querySelector(
          '[data-dropdown="orden-precio"]',
        );
        if (ordenPrecioElement && !ordenPrecioElement.contains(event.target)) {
          setMostrarOrdenPrecio(false);
        }
      }

      // Para dropdown de orden distancia
      if (mostrarOrdenDistancia) {
        const ordenDistanciaElement = document.querySelector(
          '[data-dropdown="orden-distancia"]',
        );
        if (
          ordenDistanciaElement &&
          !ordenDistanciaElement.contains(event.target)
        ) {
          setMostrarOrdenDistancia(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    mostrarFiltrosRestaurantes,
    mostrarFiltrosProductos,
    mostrarCategorias,
    mostrarOrdenPrecio,
    mostrarOrdenDistancia,
    mostrarMenuMobile,
  ]);

  // Obtener ubicación del usuario
  useEffect(() => {
    const obtenerUbicacion = () => {
      if (!navigator.geolocation) {
        setErrorUbicacion(
          "La geolocalización no es soportada por este navegador",
        );
        return;
      }

      setSolicitandoUbicacion(true);
      setErrorUbicacion("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const ubicacion = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUbicacionUsuario(ubicacion);
          setSolicitandoUbicacion(false);
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
              mensajeError +=
                "Tiempo de espera agotado al obtener la ubicación.";
              break;
            default:
              mensajeError += "Error desconocido.";
          }

          setErrorUbicacion(mensajeError);
          setSolicitandoUbicacion(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    };

    // Solicitar ubicación al usuario
    obtenerUbicacion();
  }, []);

  // Verificar sesión del usuario
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        setVerificandoSesion(true);

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
        console.log("No hay sesión activa o error al verificar sesión:", error);
      } finally {
        setVerificandoSesion(false);
      }
    };

    verificarSesion();
  }, []);

  // Función para obtener restaurantes
  const obtenerRestaurantes = async (cargarMas = false) => {
    // Prevenir peticiones simultaneas
    if (reqNegociosActivo.current) return;

    try {
      reqNegociosActivo.current = true;

      if (cargarMas) {
        setCargandoMasRestaurantes(true);
      } else {
        setCargandoRestaurantes(true);
      }
      setErrorRestaurantes("");

      const body = {
        tamano: 8,
        direccion: "siguiente",
        seed: 0.3,
        cursor: cargarMas ? ultimoTokenRestaurantes : null,
        general: busquedaAplicada,
        usuario_locacion: ubicacionUsuario,
        distancia_orden: filtrosAplicadosRestaurantes.distancia_orden,
        distancia_rango: filtrosAplicadosRestaurantes.distancia_rango,
        membresia: filtrosAplicadosRestaurantes.tipo,
      };

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.MOSTRAR}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener restaurantes`);
      }

      const result = await response.json();

      if (result.exito && result.datos && Array.isArray(result.datos)) {
        const restaurantesMapeados = result.datos.map((negocio) => ({
          id: negocio.negocio_id,
          nombre: negocio.nombre,
          distancia: negocio.distancia
            ? Math.round(negocio.distancia * 1000)
            : null,
          imagen: negocio.logo || "/images/imagen_defecto.jpg",
          descripcion: negocio.descripcion || "",
          categoria: negocio.categoria || "Restaurante",
          activo: negocio.activo || false,
        }));

        if (cargarMas) {
          setRestaurantes((prev) => [...prev, ...restaurantesMapeados]);
        } else {
          setRestaurantes(restaurantesMapeados);
        }

        if (result.ultimoToken) {
          setUltimoTokenRestaurantes(result.ultimoToken);
          setHayMasRestaurantes(true);
        } else setHayMasRestaurantes(false);
      } else {
        if (!cargarMas) {
          setRestaurantes([]);
        }
        setHayMasRestaurantes(false);
        console.warn(
          "No se pudieron obtener los restaurantes:",
          result.mensaje,
        );
      }
    } catch (error) {
      console.error("Error al cargar restaurantes:", error);
      if (!cargarMas) {
        setErrorRestaurantes(
          "No se pudieron cargar los restaurantes. Intenta nuevamente.",
        );
        setRestaurantes([]);
      }
    } finally {
      reqNegociosActivo.current = false;

      if (cargarMas) {
        setCargandoMasRestaurantes(false);
      } else {
        setCargandoRestaurantes(false);
      }
    }
  };

  const handleAdmin = () => navigate(`/administrador`);

  const handlePerfil = () =>
    navigate(`/perfil_restaurante/${usuario.negocioId}`);

  // Función para obtener productos
  const obtenerProductos = async (cargarMas = false) => {
    if (reqProductosActivo.current) return;

    try {
      reqProductosActivo.current = true;

      if (cargarMas) {
        setCargandoMasProductos(true);
      } else {
        setCargandoProductos(true);
      }
      setErrorProductos("");

      const body = {
        tamano: 8,
        direccion: "siguiente",
        seed: 0.3,
        cursor: cargarMas ? ultimoTokenProductos : null,
        general: busquedaAplicada,
        categoria: filtrosAplicadosProductos.categoria,
        precio_orden: filtrosAplicadosProductos.precio_orden,
        precio_rango:
          filtrosAplicadosProductos.precio_min ||
          filtrosAplicadosProductos.precio_max
            ? `${filtrosAplicadosProductos.precio_min || "0"}-${
                filtrosAplicadosProductos.precio_max || "999999"
              }`
            : "",
      };

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTOS.MOSTRAR}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener productos`);
      }

      const result = await response.json();

      if (result.exito && result.datos && Array.isArray(result.datos)) {
        const productosMapeados = result.datos.map((producto) => ({
          producto_id: producto.producto_id,
          nombre: producto.nombre,
          precio: producto.precio,
          restaurante: producto.nombre_negocio || "Restaurante",
          categoria: producto.categoria || "General",
          imagen: producto.imagen_URL || "/images/imagen_defecto.jpg",
          negocio_id: producto.negocio_id,
          nombre_negocio: producto.nombre_negocio,
          descripcion: producto.descripcion || "",
          en_oferta: producto.en_oferta || false,
        }));

        if (cargarMas) {
          setProductos((prev) => [...prev, ...productosMapeados]);
        } else {
          setProductos(productosMapeados);
        }

        if (result.ultimoToken) {
          setUltimoTokenProductos(result.ultimoToken);
          setHayMasProductos(true);
        } else setHayMasProductos(false);
      } else {
        if (!cargarMas) {
          setProductos([]);
        }
        setHayMasProductos(false);
        console.warn("No se pudieron obtener los productos:", result.mensaje);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      if (!cargarMas) {
        setErrorProductos(
          "No se pudieron cargar los productos. Intenta nuevamente.",
        );
        setProductos([]);
      }
    } finally {
      reqProductosActivo.current = false;
      if (cargarMas) {
        setCargandoMasProductos(false);
      } else {
        setCargandoProductos(false);
      }
    }
  };

  // Obtener datos iniciales
  useEffect(() => {
    if (!solicitandoUbicacion) {
      if (categoriaActiva === "Restaurantes") {
        obtenerRestaurantes(false);
      } else {
        obtenerProductos(false);
      }
    }
  }, [ubicacionUsuario, solicitandoUbicacion]);

  // Obtener datos cuando cambian los filtros aplicados o la búsqueda
  useEffect(() => {
    if (!solicitandoUbicacion) {
      if (categoriaActiva === "Restaurantes") {
        setUltimoTokenRestaurantes(null);
        setHayMasRestaurantes(true);
        obtenerRestaurantes(false);
      } else {
        setUltimoTokenProductos(null);
        setHayMasProductos(true);
        obtenerProductos(false);
      }
    }
  }, [
    busquedaAplicada,
    categoriaActiva,
    filtrosAplicadosRestaurantes,
    filtrosAplicadosProductos,
  ]);

  // Función para aplicar búsqueda
  const aplicarBusqueda = () => {
    setBusquedaAplicada(busqueda);
  };

  // Función para manejar Enter en el input de búsqueda
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      aplicarBusqueda();
    }
  };

  // Funciones para filtros de Restaurantes
  const aplicarFiltrosRestaurantes = () => {
    setFiltrosAplicadosRestaurantes({ ...filtrosRestaurantes });
    setMostrarFiltrosRestaurantes(false);
  };

  const resetearFiltrosRestaurantes = () => {
    const filtrosPorDefecto = {
      distancia_orden: "ASC",
      distancia_rango: 25,
      tipo: "", // nuevo campo
    };
    setFiltrosRestaurantes(filtrosPorDefecto);
    setFiltrosAplicadosRestaurantes(filtrosPorDefecto);
    setMostrarFiltrosRestaurantes(false);
  };

  // Funciones para filtros de Productos
  const aplicarFiltrosProductos = () => {
    // Validar precios
    if (filtrosProductos.precio_min && filtrosProductos.precio_max) {
      const min = parseFloat(filtrosProductos.precio_min);
      const max = parseFloat(filtrosProductos.precio_max);

      if (min > max) {
        setErrorPrecio("El precio máximo debe ser mayor al precio mínimo");
        return;
      }
    }

    // Si solo se llena mínimo, establecer máximo como un valor muy alto
    // Si solo se llena máximo, establecer mínimo como 0
    const filtrosAplicar = { ...filtrosProductos };

    if (filtrosAplicar.precio_min && !filtrosAplicar.precio_max) {
      // Mínimo lleno, máximo vacío: usar un valor muy alto como máximo
      filtrosAplicar.precio_max = "999999";
    } else if (!filtrosAplicar.precio_min && filtrosAplicar.precio_max) {
      // Máximo lleno, mínimo vacío: establecer mínimo como 0
      filtrosAplicar.precio_min = "0";
    }

    setErrorPrecio("");
    setFiltrosAplicadosProductos(filtrosAplicar);
    setMostrarFiltrosProductos(false);
  };

  const resetearFiltrosProductos = () => {
    const filtrosPorDefecto = {
      categoria: "",
      precio_orden: "",
      precio_min: "",
      precio_max: "",
    };
    setFiltrosProductos(filtrosPorDefecto);
    setFiltrosAplicadosProductos(filtrosPorDefecto);
    setErrorPrecio("");
    setMostrarFiltrosProductos(false);
  };

  // Función para cargar más datos
  const cargarMasDatos = () => {
    if (categoriaActiva === "Restaurantes") {
      if (
        !cargandoMasRestaurantes &&
        hayMasRestaurantes &&
        ultimoTokenRestaurantes
      ) {
        obtenerRestaurantes(true);
      }
    } else {
      if (!cargandoMasProductos && hayMasProductos && ultimoTokenProductos) {
        obtenerProductos(true);
      }
    }
  };

  // Efecto para detectar cuando el usuario llega al final de la página
  useEffect(() => {
    const handleScroll = () => {
      if (cargandoMasRestaurantes || cargandoMasProductos) {
        return;
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 200) {
        cargarMasDatos();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    cargandoMasRestaurantes,
    cargandoMasProductos,
    categoriaActiva,
    ultimoTokenRestaurantes,
    ultimoTokenProductos,
  ]);

  // Función para solicitar cambio de contraseña
  const handleSolicitarCambioContrasena = async () => {
    if (!usuario || !usuario.correo) {
      setMensajeCambioContrasena(
        "No se pudo obtener la información del usuario",
      );
      return;
    }

    setCargandoCambioContrasena(true);
    setMensajeCambioContrasena("");

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.PETICION_CAMBIAR_CONTRASENA}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo: usuario.correo }),
        },
      );

      const result = await response.json();

      if (response.ok && result.exito) {
        setMensajeCambioContrasena(
          "Se ha enviado un correo para cambiar tu contraseña",
        );

        // Cerrar el popup después de 3 segundos
        setTimeout(() => {
          setMostrarPopupCambiarContrasena(false);
          setMensajeCambioContrasena("");
        }, 3000);
      } else {
        setMensajeCambioContrasena(
          result.message || "Error al enviar la solicitud",
        );
      }
    } catch (error) {
      console.error("Error al solicitar cambio de contraseña:", error);
      setMensajeCambioContrasena("Error al conectar con el servidor");
    } finally {
      setCargandoCambioContrasena(false);
    }
  };

  const filtrarItems = () => {
    if (categoriaActiva === "Restaurantes") {
      return restaurantes.filter((restaurante) => {
        return (
          restaurante.nombre
            .toLowerCase()
            .includes(busquedaAplicada.toLowerCase()) ||
          (restaurante.descripcion &&
            restaurante.descripcion
              .toLowerCase()
              .includes(busquedaAplicada.toLowerCase())) ||
          (restaurante.categoria &&
            restaurante.categoria
              .toLowerCase()
              .includes(busquedaAplicada.toLowerCase()))
        );
      });
    } else {
      return productos.filter((producto) => {
        return (
          (producto.nombre &&
            producto.nombre
              .toLowerCase()
              .includes(busquedaAplicada.toLowerCase())) ||
          (producto.restaurante &&
            producto.restaurante
              .toLowerCase()
              .includes(busquedaAplicada.toLowerCase())) ||
          (producto.categoria &&
            producto.categoria
              .toLowerCase()
              .includes(busquedaAplicada.toLowerCase())) ||
          (producto.descripcion &&
            producto.descripcion
              .toLowerCase()
              .includes(busquedaAplicada.toLowerCase()))
        );
      });
    }
  };

  const itemsFiltrados = filtrarItems();

  // Función para reintentar obtener ubicación
  const handleReintentarUbicacion = () => {
    setUbicacionUsuario(null);
    setErrorUbicacion("");

    const obtenerUbicacion = () => {
      if (!navigator.geolocation) {
        setErrorUbicacion(
          "La geolocalización no es soportada por este navegador",
        );
        return;
      }

      setSolicitandoUbicacion(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const ubicacion = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUbicacionUsuario(ubicacion);
          setSolicitandoUbicacion(false);
        },
        (error) => {
          console.error("Error al obtener ubicación:", error);
          setErrorUbicacion(
            "No se pudo obtener tu ubicación. Los restaurantes se mostrarán sin información de distancia.",
          );
          setSolicitandoUbicacion(false);
        },
      );
    };

    obtenerUbicacion();
  };

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.LOGOUT}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.exito) {
          console.log("Sesión cerrada exitosamente");
        }
      }

      setUsuario(null);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setUsuario(null);
    }
  };

  // Función para determinar qué botones mostrar según el tipo de usuario
  const renderizarBotonesRegistro = () => {
    // Si no hay usuario o está verificando, mostrar ambos botones
    if (!usuario || verificandoSesion) {
      return (
        <>
          <button
            onClick={() => navigate("/registro_anunciante")}
            className="relative bg-gradient-to-r from-red-800 to-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 overflow-hidden group"
          >
            <span className="relative z-10">Anunciate ahora</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <button
            onClick={() => navigate("/registro_usuario")}
            className="relative bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 overflow-hidden group hover:scale-105"
          >
            <span className="relative z-10">Registrate como usuario</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </>
      );
    }

    // Si el usuario es de tipo "negocio", mostrar solo "Registrate como usuario"
    if (usuario.tipo === "negocio") {
      return (
        <button
          onClick={() => navigate("/registro_usuario")}
          className="relative bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 overflow-hidden group hover:scale-105"
        >
          <span className="relative z-10">Registrate como usuario</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      );
    }

    // Si el usuario es de tipo "usuario", mostrar solo "Anunciate ahora"
    if (usuario.tipo === "usuario") {
      return (
        <button
          onClick={() => navigate("/registro_anunciante")}
          className="relative bg-gradient-to-r from-red-800 to-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 overflow-hidden group"
        >
          <span className="relative z-10">Anunciate ahora</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      );
    }

    // Por defecto, mostrar ambos botones
    return (
      <>
        <button
          onClick={() => navigate("/registro_anunciante")}
          className="relative bg-gradient-to-r from-red-800 to-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 overflow-hidden group"
        >
          <span className="relative z-10">Anunciate ahora</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
        <button
          onClick={() => navigate("/registro_usuario")}
          className="relative bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 overflow-hidden group hover:scale-105"
        >
          <span className="relative z-10">Registrate como usuario</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-6">
        {/* Imagen de fondo con opacidad */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/fondo_hero.jpg')",
            }}
          ></div>
          {/* Capa oscura con opacidad */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Botón de Favoritos en la esquina superior izquierda */}
        {(usuario || verificandoSesion) && (
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => navigate("/favoritos")}
              className="flex items-center gap-2 bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30 transition hover:scale-105 duration-300"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="hidden sm:inline">Favoritos</span>
            </button>
          </div>
        )}

        {/* Botón de Sesión en la esquina superior derecha */}
        <div className="absolute top-6 right-6 z-20">
          {verificandoSesion ? (
            <div className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30">
              Verificando...
            </div>
          ) : usuario ? (
            <>
              {/* Versión Desktop - visible en pantallas medianas y grandes */}
              <div className="hidden md:flex items-center gap-3">
                {/* Botón Cambiar Contraseña */}
                <button
                  onClick={() => setMostrarPopupCambiarContrasena(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition hover:scale-105 duration-300"
                >
                  Cambiar contraseña
                </button>

                {usuario.tipo == "usuario" ? (
                  <span className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30">
                    {usuario.correo}
                  </span>
                ) : usuario.tipo == "negocio" ? (
                  <button
                    className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30 hover:scale-105 duration-300"
                    onClick={handlePerfil}
                  >
                    Perfil
                  </button>
                ) : (
                  usuario.tipo == "admin" && (
                    <button
                      className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30 hover:scale-105 duration-300"
                      onClick={handleAdmin}
                    >
                      Administrador
                    </button>
                  )
                )}

                <button
                  onClick={handleCerrarSesion}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition hover:scale-105 duration-300"
                >
                  Cerrar sesión
                </button>
              </div>

              {/* Versión Mobile - menú hamburguesa */}
              <div className="md:hidden">
                <button
                  id="boton-menu-mobile"
                  onClick={() => setMostrarMenuMobile(!mostrarMenuMobile)}
                  className="bg-white bg-opacity-20 text-white p-3 rounded-full backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30 transition"
                >
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Menú desplegable móvil */}
                {mostrarMenuMobile && (
                  <div
                    id="menu-mobile"
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {/* Información del usuario */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Sesión activa</p>
                      <p className="text-gray-800 font-medium truncate">
                        {usuario.correo}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {usuario.tipo}
                      </p>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setMostrarPopupCambiarContrasena(true);
                          setMostrarMenuMobile(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        Cambiar contraseña
                      </button>

                      {usuario.tipo === "negocio" && (
                        <button
                          onClick={() => {
                            handlePerfil();
                            setMostrarMenuMobile(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                        >
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Perfil del negocio
                        </button>
                      )}

                      {usuario.tipo === "admin" && (
                        <button
                          onClick={() => {
                            handleAdmin();
                            setMostrarMenuMobile(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                        >
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Panel de administrador
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleCerrarSesion();
                          setMostrarMenuMobile(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition flex items-center gap-3 border-t border-gray-100 mt-1"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-6 rounded-full transition backdrop-blur-sm border border-white border-opacity-30 hover:scale-105 duration-300"
            >
              Iniciar sesión
            </button>
          )}
        </div>

        {/* Contenido principal */}
        <div className="relative container mx-auto text-center z-10 pt-16">
          <h2 className="text-4xl md:text-7xl font-bold mb-4 text-white">
            Explora, visita y<br />
            <span className="text-yellow-300">disfruta</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            {renderizarBotonesRegistro()}
          </div>
        </div>
      </section>

      {/* Estado de ubicación */}
      {solicitandoUbicacion && (
        <div className="rounded-lg mx-6 mt-4 p-4">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 text-sm">
              Obteniendo tu ubicación para mostrar distancias precisas...
            </p>
          </div>
        </div>
      )}

      {errorUbicacion && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg mx-6 mt-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-yellow-700 text-sm">{errorUbicacion}</p>
            <button
              onClick={handleReintentarUbicacion}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition ml-2 hover:scale-105 duration-300"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Busca tu producto o restaurante favorito"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-green-400 rounded-full focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              <button
                onClick={aplicarBusqueda}
                className="border border-green-600 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition hover:scale-105 duration-300"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-6 px-6">
        <div className="container mx-auto">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setCategoriaActiva("Productos")}
              className={`px-6 py-3 rounded-full transition font-medium hover:scale-105 duration-300 ${
                categoriaActiva === "Productos"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setCategoriaActiva("Restaurantes")}
              className={`px-6 py-3 rounded-full transition font-medium hover:scale-105 duration-300 ${
                categoriaActiva === "Restaurantes"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Restaurantes
            </button>
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {categoriaActiva === "Productos" ? "Productos" : "Restaurantes"}
          </h3>
          <p className="text-center text-gray-600 mb-8">
            {categoriaActiva === "Productos"
              ? "Descubre los mejores productos cerca de ti"
              : "Encuentra los mejores restaurantes en tu área"}
          </p>

          {/* Filtros para Restaurantes */}
          {categoriaActiva === "Restaurantes" && (
            <div className="mb-6 relative">
              <div className="flex justify-center items-center gap-4">
                <button
                  id="boton-filtros-restaurantes"
                  onClick={() =>
                    setMostrarFiltrosRestaurantes(!mostrarFiltrosRestaurantes)
                  }
                  className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition z-20 hover:scale-105 duration-300"
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filtros
                  {mostrarFiltrosRestaurantes ? (
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {/* Mostrar filtros aplicados actualmente */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {filtrosAplicadosRestaurantes.tipo && (
                    <>
                      <span>
                        Tipo:{" "}
                        {filtrosAplicadosRestaurantes.tipo === "ambulante"
                          ? "Ambulante"
                          : "Restaurante"}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>
                    Orden:{" "}
                    {filtrosAplicadosRestaurantes.distancia_orden === "ASC"
                      ? "Más cercanos"
                      : "Más lejanos"}
                  </span>
                  <span>•</span>
                  <span>
                    Rango: {filtrosAplicadosRestaurantes.distancia_rango} km
                  </span>
                </div>
              </div>

              {/* Panel de filtros - POSITION ABSOLUTE */}
              {mostrarFiltrosRestaurantes && (
                <div
                  id="filtros-restaurantes"
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-6 max-w-md w-full z-50 border border-gray-200"
                >
                  <h4 className="text-lg font-semibold mb-4">
                    Filtrar Restaurantes
                  </h4>

                  {/* Filtro de orden por distancia */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por distancia
                    </label>
                    <div className="relative" data-dropdown="orden-distancia">
                      <button
                        type="button"
                        onClick={() =>
                          setMostrarOrdenDistancia(!mostrarOrdenDistancia)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-left flex justify-between items-center hover:scale-105 duration-300"
                      >
                        <span>
                          {filtrosRestaurantes.distancia_orden === "ASC"
                            ? "Más cercanos primero"
                            : "Más lejanos primero"}
                        </span>
                        <svg
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            mostrarOrdenDistancia ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Lista desplegable de orden por distancia */}
                      {mostrarOrdenDistancia && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div
                            className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                            onClick={() => {
                              setFiltrosRestaurantes((prev) => ({
                                ...prev,
                                distancia_orden: "ASC",
                              }));
                              setMostrarOrdenDistancia(false);
                            }}
                          >
                            <span className="text-gray-700">
                              Más cercanos primero
                            </span>
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-green-50 cursor-pointer"
                            onClick={() => {
                              setFiltrosRestaurantes((prev) => ({
                                ...prev,
                                distancia_orden: "DESC",
                              }));
                              setMostrarOrdenDistancia(false);
                            }}
                          >
                            <span className="text-gray-700">
                              Más lejanos primero
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Filtro de rango de distancia */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de distancia máximo:{" "}
                      {filtrosRestaurantes.distancia_rango} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={filtrosRestaurantes.distancia_rango}
                      onChange={(e) =>
                        setFiltrosRestaurantes((prev) => ({
                          ...prev,
                          distancia_rango: parseInt(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 km</span>
                      <span>25 km</span>
                    </div>
                  </div>

                  {/* Filtro de tipo de negocio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarTipo(!mostrarTipo)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-left flex justify-between items-center hover:scale-105 duration-300"
                      >
                        <span>
                          {filtrosRestaurantes.tipo === "ambulante"
                            ? "Ambulante"
                            : filtrosRestaurantes.tipo === "restaurante"
                              ? "Restaurante"
                              : "Todos los tipos"}
                        </span>
                        <svg
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            mostrarTipo ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Lista desplegable de tipos */}
                      {mostrarTipo && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div
                            className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                            onClick={() => {
                              setFiltrosRestaurantes((prev) => ({
                                ...prev,
                                tipo: "",
                              }));
                              setMostrarTipo(false);
                            }}
                          >
                            <span className="text-gray-700">
                              Todos los tipos
                            </span>
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                            onClick={() => {
                              setFiltrosRestaurantes((prev) => ({
                                ...prev,
                                tipo: "restaurante",
                              }));
                              setMostrarTipo(false);
                            }}
                          >
                            <span className="text-gray-700">Restaurante</span>
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-green-50 cursor-pointer"
                            onClick={() => {
                              setFiltrosRestaurantes((prev) => ({
                                ...prev,
                                tipo: "ambulante",
                              }));
                              setMostrarTipo(false);
                            }}
                          >
                            <span className="text-gray-700">Ambulante</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={aplicarFiltrosRestaurantes}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium hover:scale-105 duration-300"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={resetearFiltrosRestaurantes}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-medium hover:scale-105 duration-300"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtros para Productos */}
          {categoriaActiva === "Productos" && (
            <div className="mb-6 relative">
              <div className="flex justify-center items-center gap-4">
                <button
                  id="boton-filtros-productos"
                  onClick={() =>
                    setMostrarFiltrosProductos(!mostrarFiltrosProductos)
                  }
                  className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition z-20 hover:scale-105 duration-300"
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filtros
                  {mostrarFiltrosProductos ? (
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {/* Mostrar filtros aplicados actualmente */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {filtrosAplicadosProductos.categoria && (
                    <>
                      <span>
                        Categoría: {filtrosAplicadosProductos.categoria}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  {filtrosAplicadosProductos.precio_orden && (
                    <>
                      <span>
                        Precio:{" "}
                        {filtrosAplicadosProductos.precio_orden === "ASC"
                          ? "Menor a mayor"
                          : "Mayor a menor"}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  {(filtrosAplicadosProductos.precio_min ||
                    filtrosAplicadosProductos.precio_max) && (
                    <span>
                      Rango: {filtrosAplicadosProductos.precio_min || "0"} -{" "}
                      {filtrosAplicadosProductos.precio_max === "999999"
                        ? "∞"
                        : filtrosAplicadosProductos.precio_max || "∞"}
                    </span>
                  )}
                  {!filtrosAplicadosProductos.categoria &&
                    !filtrosAplicadosProductos.precio_orden &&
                    !filtrosAplicadosProductos.precio_min &&
                    !filtrosAplicadosProductos.precio_max && (
                      <span>Sin filtros aplicados</span>
                    )}
                </div>
              </div>

              {/* Panel de filtros - POSITION ABSOLUTE */}
              {mostrarFiltrosProductos && (
                <div
                  id="filtros-productos"
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-6 max-w-md w-full z-50 border border-gray-200"
                >
                  <h4 className="text-lg font-semibold mb-4">
                    Filtrar Productos
                  </h4>

                  {/* Filtro de categoría */}
                  <div className="mb-4" data-dropdown="categorias">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setMostrarCategorias(!mostrarCategorias)
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-left flex justify-between items-center hover:scale-105 duration-300"
                        >
                          <span>
                            {filtrosProductos.categoria ||
                              "Todas las categorías"}
                          </span>
                          <svg
                            className={`h-4 w-4 text-gray-500 transition-transform ${
                              mostrarCategorias ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Lista desplegable de categorías */}
                        {mostrarCategorias && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                              onClick={() => {
                                setFiltrosProductos((prev) => ({
                                  ...prev,
                                  categoria: "",
                                }));
                                setMostrarCategorias(false);
                              }}
                            >
                              <span className="text-gray-700">
                                Todas las categorías
                              </span>
                            </div>
                            {categoriasDisponibles.map((categoria) => (
                              <div
                                key={categoria}
                                className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  setFiltrosProductos((prev) => ({
                                    ...prev,
                                    categoria,
                                  }));
                                  setMostrarCategorias(false);
                                }}
                              >
                                <span className="text-gray-700">
                                  {categoria}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filtro de orden por precio */}
                  <div className="mb-4" data-dropdown="orden-precio">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordenar por precio
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setMostrarOrdenPrecio(!mostrarOrdenPrecio)
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-left flex justify-between items-center hover:scale-105 duration-300"
                        >
                          <span>
                            {filtrosProductos.precio_orden === ""
                              ? "Sin orden específico"
                              : filtrosProductos.precio_orden === "ASC"
                                ? "Menor a mayor"
                                : "Mayor a menor"}
                          </span>
                          <svg
                            className={`h-4 w-4 text-gray-500 transition-transform ${
                              mostrarOrdenPrecio ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Lista desplegable de orden por precio */}
                        {mostrarOrdenPrecio && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                            <div
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                              onClick={() => {
                                setFiltrosProductos((prev) => ({
                                  ...prev,
                                  precio_orden: "",
                                }));
                                setMostrarOrdenPrecio(false);
                              }}
                            >
                              <span className="text-gray-700">
                                Sin orden específico
                              </span>
                            </div>
                            <div
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                              onClick={() => {
                                setFiltrosProductos((prev) => ({
                                  ...prev,
                                  precio_orden: "ASC",
                                }));
                                setMostrarOrdenPrecio(false);
                              }}
                            >
                              <span className="text-gray-700">
                                Menor a mayor
                              </span>
                            </div>
                            <div
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer"
                              onClick={() => {
                                setFiltrosProductos((prev) => ({
                                  ...prev,
                                  precio_orden: "DESC",
                                }));
                                setMostrarOrdenPrecio(false);
                              }}
                            >
                              <span className="text-gray-700">
                                Mayor a menor
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filtro de rango de precio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de precio
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Mínimo
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={filtrosProductos.precio_min}
                          onChange={(e) => {
                            setFiltrosProductos((prev) => ({
                              ...prev,
                              precio_min: e.target.value,
                            }));
                            setErrorPrecio("");
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Máximo
                        </label>
                        <input
                          type="number"
                          placeholder="∞"
                          value={filtrosProductos.precio_max}
                          onChange={(e) => {
                            setFiltrosProductos((prev) => ({
                              ...prev,
                              precio_max: e.target.value,
                            }));
                            setErrorPrecio("");
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                          min="0"
                        />
                      </div>
                    </div>
                    {errorPrecio && (
                      <p className="text-red-500 text-xs mt-2">{errorPrecio}</p>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={aplicarFiltrosProductos}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium hover:scale-105 duration-300"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={resetearFiltrosProductos}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-medium hover:scale-105 duration-300"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Lista de Items */}
      <section className="py-6 px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          {categoriaActiva === "Restaurantes" && cargandoRestaurantes ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-4">Cargando restaurantes...</p>
            </div>
          ) : categoriaActiva === "Productos" && cargandoProductos ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-4">Cargando productos...</p>
            </div>
          ) : errorRestaurantes && categoriaActiva === "Restaurantes" ? (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
                <p>{errorRestaurantes}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition hover:scale-105 duration-300"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : errorProductos && categoriaActiva === "Productos" ? (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
                <p>{errorProductos}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition hover:scale-105 duration-300"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {categoriaActiva === "Restaurantes"
                  ? "No se encontraron restaurantes que coincidan con tu búsqueda."
                  : "No se encontraron productos que coincidan con tu búsqueda."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoriaActiva === "Restaurantes"
                  ? itemsFiltrados.map((item) => (
                      <TarjetaRestaurante
                        key={item.id}
                        imagenUrl={item.imagen}
                        nombreRestaurante={item.nombre}
                        descripcion={item.descripcion}
                        distancia={item.distancia}
                        restauranteId={item.id}
                      />
                    ))
                  : productos.map((item) => (
                      <TarjetaProducto
                        key={item.producto_id}
                        url={item.imagen}
                        nombreProducto={item.nombre}
                        nombreRestaurante={item.restaurante}
                        categoria={item.categoria}
                        precio={item.precio}
                        productoId={item.producto_id}
                        negocioId={item.negocio_id}
                        negocioNombre={item.nombre_negocio}
                        enOferta={item.en_oferta}
                      />
                    ))}
              </div>

              {/* Indicador de carga para scroll infinito */}
              {categoriaActiva === "Restaurantes" &&
                cargandoMasRestaurantes && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-500 mt-2">
                      Cargando más restaurantes...
                    </p>
                  </div>
                )}

              {categoriaActiva === "Productos" && cargandoMasProductos && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-gray-500 mt-2">
                    Cargando más productos...
                  </p>
                </div>
              )}

              {/* Mensaje cuando no hay más datos */}
              {categoriaActiva === "Restaurantes" &&
                !hayMasRestaurantes &&
                restaurantes.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Has llegado al final de la lista de restaurantes
                    </p>
                  </div>
                )}

              {categoriaActiva === "Productos" &&
                !hayMasProductos &&
                productos.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Has llegado al final de la lista de productos
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-gray-200">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2025 LOCALY. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Popup para cambiar contraseña */}
      {mostrarPopupCambiarContrasena && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Cambiar Contraseña
            </h3>

            {!mensajeCambioContrasena ? (
              <>
                <p className="text-gray-600 mb-6 text-center">
                  ¿Estás seguro de que quieres cambiar tu contraseña? Se enviará
                  un enlace de recuperación a tu correo electrónico.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMostrarPopupCambiarContrasena(false);
                      setMensajeCambioContrasena("");
                    }}
                    disabled={cargandoCambioContrasena}
                    className="flex-1 bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-full hover:bg-gray-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed hover:scale-105 duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSolicitarCambioContrasena}
                    disabled={cargandoCambioContrasena}
                    className={`flex-1 text-white font-medium py-2 px-4 rounded-full transition hover:scale-105 duration-300 ${
                      cargandoCambioContrasena
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {cargandoCambioContrasena ? "Enviando..." : "Continuar"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-700 text-sm font-medium">
                    {mensajeCambioContrasena}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMostrarPopupCambiarContrasena(false);
                    setMensajeCambioContrasena("");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition hover:scale-105 duration-300"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estilos para el slider */}
      {/* <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          border: none;
        }
      `}</style> */}
    </div>
  );
}
