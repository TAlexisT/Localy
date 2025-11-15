import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-red-100 py-8 px-4">
      <main className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold mb-2">
            Política de Privacidad — Localy MX
          </h1>
          <p className="text-sm text-gray-600">
            Última actualización: 14 de noviembre de 2025
          </p>
          <p className="mt-3 text-gray-700">
            Dominio: <span className="font-medium">localymx.com</span>
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Identidad del responsable</h2>
          <p className="text-gray-700">
            Responsable del tratamiento: <strong>Localy MX</strong>
          </p>
          <p className="text-gray-700">
            Domicilio: <strong>Durango, Dgo. México</strong>
          </p>
          <p className="text-gray-700">
            Correo de contacto:{" "}
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            2. Datos personales que recopilamos
          </h2>
          <p className="text-gray-700">
            Recolectamos los siguientes datos personales:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">
                Datos proporcionados por el usuario
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Nombre</li>
                <li>Email</li>
                <li>Teléfono</li>
                <li>Contraseña</li>
                <li>Datos de pago</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Datos obtenidos automáticamente</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Dirección IP</li>
                <li>Cookies</li>
                <li>Datos de navegación</li>
                <li>Ubicación aproximada</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">3. Finalidades del tratamiento</h2>
          <h3 className="font-semibold">Finalidades principales</h3>
          <ul className="list-decimal list-inside text-gray-700">
            <li>Crear y gestionar cuentas de usuario</li>
            <li>Procesar pagos y suscripciones</li>
            <li>Enviar correos de confirmación u operativos</li>
            <li>Mantener y mejorar la seguridad del sitio</li>
          </ul>

          <h3 className="font-semibold mt-3">Finalidades secundarias</h3>
          <p className="text-gray-700">
            Marketing y analítica. Estas finalidades no son necesarias para
            prestar el servicio; puedes oponerte a ellas contactando a{" "}
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">4. Fundamento legal</h2>
          <p className="text-gray-700">
            El tratamiento de datos se realiza con base en:
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li>Consentimiento explícito del titular.</li>
            <li>Ejecución de un contrato (crear cuenta, realizar compras).</li>
            <li>Interés legítimo (seguridad, prevención de fraude).</li>
          </ul>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            5. Transferencia de datos a terceros
          </h2>
          <p className="text-gray-700">
            Para cumplir con las finalidades descritas, podemos compartir datos
            con:
          </p>
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="pb-2">Tercero</th>
                  <th className="pb-2">Finalidad</th>
                  <th className="pb-2">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-2">Stripe</td>
                  <td className="py-2">Procesamiento de pagos</td>
                  <td className="py-2">Estados Unidos (EE. UU.)</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2">Firebase (Google)</td>
                  <td className="py-2">
                    Almacenamiento y servicios de back-end
                  </td>
                  <td className="py-2">Estados Unidos (EE. UU.)</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2">Resend</td>
                  <td className="py-2">
                    Envío de correos electrónicos transaccionales
                  </td>
                  <td className="py-2">Estados Unidos (EE. UU.)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-700 mt-3">
            No vendemos tu información personal a terceros con fines
            comerciales.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            6. Cookies y tecnologías similares
          </h2>
          <p className="text-gray-700">
            Usamos cookies propias para gestionar la sesión de usuario y mejorar
            la seguridad. No utilizamos cookies de terceros.
          </p>
          <p className="text-gray-700">
            Si te registras e inicias sesión, puedes desactivar la cookie
            cerrando sesión en tu cuenta; recuerda que esto puede afectar la
            funcionalidad del sitio.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            7. Derechos del titular de datos (ARCO)
          </h2>
          <p className="text-gray-700">
            Tienes derecho a acceder, rectificar, cancelar u oponerte al uso de
            tus datos personales. Para ejercer cualquiera de estos derechos,
            contáctanos en:
          </p>
          <p className="text-gray-700">
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>
          </p>

          <h3 className="font-semibold mt-2">Información adicional</h3>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              Tipos de acceso dentro del sistema: invitado, usuario,
              administrador, negocio (ambulante) y negocio (restaurante).
            </li>
            <li>
              No hay devolución de dinero de forma general; se procesarán
              reembolsos solo en casos excepcionales (por ejemplo, fallas del
              sistema al registrar pagos).
            </li>
            <li>
              La eliminación automática de la cuenta de usuario no está definida
              actualmente.
            </li>
          </ul>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">8. Conservación de los datos</h2>
          <p className="text-gray-700">
            Los usuarios pueden mantener su cuenta de forma indefinida. Las
            cuentas de negocios funcionan con suscripciones mensuales; si no
            renuevan, sus datos se conservarán durante un periodo de 6 meses
            antes de su eliminación permanente.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">9. Medidas de seguridad</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Contraseñas cifradas.</li>
            <li>Control de acceso por roles y distinción de privilegios.</li>
            <li>Validación de sesiones.</li>
            <li>Comunicación segura mediante HTTPS.</li>
            <li>No se realizan auditorías internas de momento.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            Aunque aplicamos medidas razonables, ninguna transmisión por
            Internet es 100% segura.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            10. Transferencias internacionales
          </h2>
          <p className="text-gray-700">
            Los datos se almacenan en servidores de Google (Firebase) ubicados
            en Estados Unidos (EE. UU.). Se aplican medidas para proteger la
            información conforme a la legislación aplicable.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            11. Modificaciones a este aviso
          </h2>
          <p className="text-gray-700">
            Fecha de última actualización:{" "}
            <strong>14 de noviembre de 2025</strong>. Se notificará a los
            usuarios en caso de cambios importantes que afecten directamente al
            consumidor.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">12. Aceptación</h2>
          <p className="text-gray-700">
            Al usar localymx.com aceptas los términos de esta Política de
            Privacidad. Si no estás de acuerdo, evita usar el sitio o solicita
            la restricción del uso de tus datos personales contactando a{" "}
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>
            .
          </p>
        </section>

        <footer className="mt-8 border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Localy MX — Durango, Dgo. México
          </p>
          <div className="flex gap-2">
            <a
              href="mailto:localymx@gmail.com"
              className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-gray-200"
            >
              Contacto
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
