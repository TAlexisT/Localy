import { useNavigate } from "react-router-dom";

export default function TarjetaProducto({
  url,
  nombreProducto,
  nombreRestaurante,
  categoria,
  precio,
  productoId,
  negocioId,
  negocioNombre,
}) {
  const navigate = useNavigate(); // Agregar esta línea

  // Función para manejar clic en la tarjeta
  const handleClick = () =>
    navigate("/informacion_producto", {
      state: {
        producto_id: productoId,
        negocioId: negocioId,
        negocioNombre: negocioNombre,
      },
    });

  return (
    /* Tarjeta de Producto */
    <div
      key={productoId}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={handleClick} // Cambiar a handleClick sin paréntesis
    >
      <div className="h-48 overflow-hidden bg-gray-200">
        <img
          src={url}
          alt={nombreProducto}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/images/imagen_defecto.jpg";
          }}
        />
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {nombreProducto}
        </h3>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Restaurante:</span> {nombreRestaurante}
        </p>
        <p className="text-gray-600 mb-3">
          <span className="font-medium">Categoría:</span> {categoria}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-bold text-3xl">${precio}</span>
        </div>
      </div>
    </div>
  );
}