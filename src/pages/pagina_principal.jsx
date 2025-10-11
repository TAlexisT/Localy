import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TarjetaRestaurante from "../components/tarjeta_restaurante";
import TarjetaProducto from "../components/tarjeta_producto";

export default function PaginaPrincipal() {
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
  });
  const [filtrosAplicadosRestaurantes, setFiltrosAplicadosRestaurantes] =
    useState({
      distancia_orden: "ASC",
      distancia_rango: 25,
    });

  // Estados para filtros de Productos
  const [mostrarFiltrosProductos, setMostrarFiltrosProductos] = useState(false);
  const [filtrosProductos, setFiltrosProductos] = useState({
    categoria: "",
    precio_orden: "",
    precio_rango: "",
  });
  const [filtrosAplicadosProductos, setFiltrosAplicadosProductos] = useState({
    categoria: "",
    precio_orden: "",
    precio_rango: "",
  });

  // seguimiento del estado de la peticion de datos
  const reqNegociosActivo = useRef(false);
  const reqProductosActivo = useRef(false);

  const navigate = useNavigate();

  // Cerrar filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Para filtros de restaurantes
      if (mostrarFiltrosRestaurantes) {
        const filtrosRestaurantesElement = document.getElementById(
          "filtros-restaurantes"
        );
        const botonFiltrosRestaurantes = document.getElementById(
          "boton-filtros-restaurantes"
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

      // Para filtros de productos
      if (mostrarFiltrosProductos) {
        const filtrosProductosElement =
          document.getElementById("filtros-productos");
        const botonFiltrosProductos = document.getElementById(
          "boton-filtros-productos"
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarFiltrosRestaurantes, mostrarFiltrosProductos]);

  // Obtener ubicación del usuario
  useEffect(() => {
    const obtenerUbicacion = () => {
      if (!navigator.geolocation) {
        setErrorUbicacion(
          "La geolocalización no es soportada por este navegador"
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
        }
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
      };

      const response = await fetch(
        "http://localhost:3000/api/negocios/mostrar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
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
          result.mensaje
        );
      }
    } catch (error) {
      console.error("Error al cargar restaurantes:", error);
      if (!cargarMas) {
        setErrorRestaurantes(
          "No se pudieron cargar los restaurantes. Intenta nuevamente."
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
        precio_rango: filtrosAplicadosProductos.precio_rango,
      };

      const response = await fetch(
        "http://localhost:3000/api/productos/mostrar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
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
          "No se pudieron cargar los productos. Intenta nuevamente."
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
    };
    setFiltrosRestaurantes(filtrosPorDefecto);
    setFiltrosAplicadosRestaurantes(filtrosPorDefecto);
    setMostrarFiltrosRestaurantes(false);
  };

  // Funciones para filtros de Productos
  //Checar funcion
  const aplicarFiltrosProductos = () => {
    setFiltrosAplicadosProductos({ ...filtrosProductos });
    setMostrarFiltrosProductos(false);
  };

  // Cambio requerido **correcto reinicio de filtros**
  const resetearFiltrosProductos = () => {
    const filtrosPorDefecto = {
      categoria: "",
      precio_orden: "",
      precio_rango: "",
    };
    setFiltrosProductos(filtrosPorDefecto);
    setFiltrosAplicadosProductos(filtrosPorDefecto);
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
          "La geolocalización no es soportada por este navegador"
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
            "No se pudo obtener tu ubicación. Los restaurantes se mostrarán sin información de distancia."
          );
          setSolicitandoUbicacion(false);
        }
      );
    };

    obtenerUbicacion();
  };

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/usuarios/logout",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition"
          >
            Anunciate ahora
          </button>
          <button
            onClick={() => navigate("/registro_usuario")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
          >
            Registrate como usuario
          </button>
        </>
      );
    }

    // Si el usuario es de tipo "negocio", mostrar solo "Registrate como usuario"
    if (usuario.tipo === "negocio") {
      return (
        <button
          onClick={() => navigate("/registro_usuario")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Registrate como usuario
        </button>
      );
    }

    // Si el usuario es de tipo "usuario", mostrar solo "Anunciate ahora"
    if (usuario.tipo === "usuario") {
      return (
        <button
          onClick={() => navigate("/registro_anunciante")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Anunciate ahora
        </button>
      );
    }

    // Por defecto, mostrar ambos botones
    return (
      <>
        <button
          onClick={() => navigate("/registro_anunciante")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Anunciate ahora
        </button>
        <button
          onClick={() => navigate("/registro_usuario")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Registrate como usuario
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
              className="flex items-center gap-2 bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30 transition"
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
              Favoritos
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
            <div className="flex items-center gap-3">
              {usuario.tipo == "usuario" ? (
                <span className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30">
                  {usuario.correo}
                </span>
              ) : (
                <button
                  className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full backdrop-blur-sm border border-white border-opacity-30"
                  onClick={handlePerfil}
                >
                  Perfil
                </button>
              )}

              <button
                onClick={handleCerrarSesion}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-6 rounded-full transition backdrop-blur-sm border border-white border-opacity-30"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg mx-6 mt-4 p-4">
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition ml-2"
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
                className="border border-green-600 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
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
              className={`px-6 py-3 rounded-full transition font-medium ${
                categoriaActiva === "Productos"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setCategoriaActiva("Restaurantes")}
              className={`px-6 py-3 rounded-full transition font-medium ${
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
                  className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition z-20"
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
                    <select
                      value={filtrosRestaurantes.distancia_orden}
                      onChange={(e) =>
                        setFiltrosRestaurantes((prev) => ({
                          ...prev,
                          distancia_orden: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                    >
                      <option value="ASC">Más cercanos primero</option>
                      <option value="DESC">Más lejanos primero</option>
                    </select>
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

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={aplicarFiltrosRestaurantes}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={resetearFiltrosRestaurantes}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-medium"
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
                  className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition z-20"
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
                  {filtrosAplicadosProductos.precio_rango && (
                    <span>Rango: {filtrosAplicadosProductos.precio_rango}</span>
                  )}
                  {!filtrosAplicadosProductos.categoria &&
                    !filtrosAplicadosProductos.precio_orden &&
                    !filtrosAplicadosProductos.precio_rango && (
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Mexicana, Italiana, Postres..."
                      value={filtrosProductos.categoria}
                      onChange={(e) =>
                        setFiltrosProductos((prev) => ({
                          ...prev,
                          categoria: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>

                  {/* Filtro de orden por precio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por precio
                    </label>
                    <select
                      value={filtrosProductos.precio_orden}
                      onChange={(e) =>
                        setFiltrosProductos((prev) => ({
                          ...prev,
                          precio_orden: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                    >
                      <option value="">Sin orden específico</option>
                      <option value="ASC">Menor a mayor</option>
                      <option value="DESC">Mayor a menor</option>
                    </select>
                  </div>

                  {/* Filtro de rango de precio */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de precio (min-max)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 50-200"
                      value={filtrosProductos.precio_rango}
                      onChange={(e) =>
                        setFiltrosProductos((prev) => ({
                          ...prev,
                          precio_rango: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: número mínimo - número máximo
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={aplicarFiltrosProductos}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={resetearFiltrosProductos}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-medium"
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
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
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
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
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
      <footer className="py-6 px-6 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 LOCALY. Todos los derechos reservados.</p>
        </div>
      </footer>

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
