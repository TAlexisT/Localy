import { useNavigate } from "react-router-dom";

export default function TarjetaRestaurante({ 
  imagenUrl, 
  nombreRestaurante, 
  descripcion, 
  distancia,
  restauranteId 
}) {
  const navigate = useNavigate();

  // Función para formatear la distancia
  const formatearDistancia = (metros) => {
    if (!metros) return "Distancia no disponible";
    
    if (metros < 1000) {
      return `${metros} m`;
    } else {
      const km = (metros / 1000).toFixed(1);
      return `${km} km`;
    }
  };

  // Función para manejar clic en la tarjeta
  const handleClick = () => {
    if (restauranteId) {
      navigate(`/perfil_restaurante/${restauranteId}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      {/* Imagen del restaurante */}
      <div className="h-48 overflow-hidden bg-gray-200">
        <img 
          src={imagenUrl} 
          alt={nombreRestaurante}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/imagen_defecto.jpg';
          }}
        />
      </div>
      
      {/* Contenido de la tarjeta */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{nombreRestaurante}</h3>
        {descripcion && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {descripcion}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-semibold">
            {formatearDistancia(distancia)}
          </span>
        </div>
      </div>
    </div>
  );
}