// configs.js

const config = {
  // Desarrollo
  development: {
    apiUrl: "http://localhost:3000/api",
  },
  // Producción
  production: {
    apiUrl: "https://localy-mx-b.vercel.app/api",
  },
};

// Determinar el entorno actual
const environment = import.meta.env.MODE || "production";

// Exportar la configuración según el entorno
export const API_BASE_URL = config[environment].apiUrl;

// También puedes exportar endpoints específicos si quieres
export const API_ENDPOINTS = {
  NEGOCIOS: {
    MOSTRAR: "/negocios/mostrar",
    OBTENER_CADA_NEGOCIO: "/negocios/obtener-cada-negocio",
    PERFIL: (negocioId) => `/negocios/perfil/${negocioId}`,
    
    REACTIVAR_SESION_PAGO: (negocioId) =>
      `/negocios/reactivar-sesion-pago/${negocioId}`,
    SUBIR_MENU: (negocioId) => `/negocios/subir-menu/${negocioId}`,
    BORRAR_MENU: (negocioId, imagenAEliminar) =>
      `/negocios/borrar-menu/${negocioId}/${imagenAEliminar}`,
    CREAR_SESION_PAGO: "/negocios/crear-sesion-pago",
  },
  PRODUCTOS: {
    MOSTRAR: "/productos/mostrar",
    CREAR: (negocioId) => `/productos/crear/${negocioId}`,
    ELIMINAR: (negocioId, productoId) =>
      `/productos/eliminar/${negocioId}/${productoId}`,
    OBTENER_PRODUCTO: (id) => `/productos/obtener-producto/${id}`,
    ACTUALIZAR: (negocioId, productoId) =>
      `/productos/actualizar/${negocioId}/${productoId}`,
    OBTENER_PRODUCTOS: (negocioId) =>
      `/productos/obtener-productos/${negocioId}`,
  },
  USUARIOS: {
    AUTENTICAR_SESION: "/usuarios/autenticar-sesion",
    LOGOUT: "/usuarios/logout",
    PETICION_CAMBIAR_CONTRASENA: "/usuarios/peticion-cambiar-contrasena",
    CONFIRMAR_CAMBIO_CONTRASENA: (tramite, token) =>
      `/usuarios/cambiar-contrasena?tramite=${tramite}&token=${token}`,
    LOGIN: "/usuarios/login",
    REGISTRO: "/usuarios/registro",
    FAVORITOS: (usuarioId) => `/usuarios/favoritos/${usuarioId}`,
    BORRAR_FAVORITO: (usuarioId, productoId, tipo) =>
      `/usuarios/borrar-favorito/${usuarioId}/${productoId}/${tipo}`,
    CREAR_FAVORITO: (usuarioId) => `/usuarios/crear-favorito/${usuarioId}`,
    AUTENTICAR_NEGOCIO: (negocioId) =>
      `/usuarios/autenticar-negocio/${negocioId}`,
  },
  SUGERENCIAS: {
    OBTENER_TODA_SUGERENCIA: "/sugerencias/obtener-toda-sugerencia",
    BORRAR_SUGERENCIA: (sugerenciaAEliminar) =>
      `/sugerencias/borrar-sugerencia/${sugerenciaAEliminar}`,
    OBTENER_SUGERENCIAS: (negocioId) =>
      `/sugerencias/obtener-sugerencias/${negocioId}`,
    CREAR_SUGERENCIA: (negocioId) =>
      `/sugerencias/crear-sugerencia/${negocioId}`,
  },
  TRAMITES: {
    OBTENER_TRAMITE: (tramiteId) => `/tramites/${tramiteId}`,
  },
};
