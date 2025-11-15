import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-red-100 py-8 px-4">
      <main className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold mb-2">
            Términos y Condiciones — Localy MX
          </h1>
          <p className="text-sm text-gray-600">
            Última actualización: 14 de noviembre de 2025
          </p>
          <p className="mt-3 text-gray-700">
            Dominio: <span className="font-medium">localymx.com</span>
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Introducción</h2>
          <p className="text-gray-700">
            Estos Términos y Condiciones regulan el uso del sitio web y los
            servicios ofrecidos por <strong>Localy MX</strong> ("nosotros",
            "nuestro" o "Localy"). Al acceder o usar localymx.com aceptas estar
            sujeto a estos Términos. Si no estás de acuerdo, no uses el
            servicio.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">2. Responsable</h2>
          <p className="text-gray-700">
            Responsable: <strong>Localy MX</strong>
          </p>
          <p className="text-gray-700">Domicilio: Durango, Dgo. México</p>
          <p className="text-gray-700">
            Contacto:{" "}
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">3. Servicios y alcance</h2>
          <p className="text-gray-700">
            Localy ofrece una plataforma para la creación y gestión de cuentas
            de usuario y cuentas de negocio, además de
            funcionalidades de publicación, gestión de catálogos y procesado de
            pagos mediante pasarelas externas.
          </p>
          <p className="text-gray-700">
            Los servicios pueden incluir versiones gratuitas y de pago,
            suscripciones mensuales para negocios y funcionalidades adicionales
            sujetas a tarifas publicadas en la plataforma.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">4. Registro y cuentas</h2>
          <p className="text-gray-700">
            Para usar ciertas funciones es necesario crear una cuenta. Durante
            el registro deberás proporcionar datos veraces y mantenerlos
            actualizados. Eres responsable de mantener la confidencialidad de tu
            contraseña.
          </p>
          <p className="text-gray-700">
            Tipos de acceso: invitado, usuario, administrador, negocio. Al crear una cuenta aceptas
            recibir comunicaciones operativas y de seguridad.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">5. Suscripciones y pagos</h2>
          <p className="text-gray-700">
            Las cuentas de negocio pueden requerir una suscripción mensual para
            acceder a funciones premium. Los pagos se procesan a través de{" "}
            <strong>Stripe</strong> u otros proveedores que indiquemos.
          </p>
          <p className="text-gray-700">
            Al autorizar un pago confirmas que posees los medios de pago y que
            la información proporcionada es correcta. Nos reservamos el derecho
            de rechazar transacciones en caso de sospecha de fraude.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">6. Política de reembolsos</h2>
          <p className="text-gray-700">
            No ofrecemos reembolsos de forma general. Se considerarán
            devoluciones únicamente en casos excepcionales y demostrables, como
            fallas del sistema que impidieran el registro o la confirmación de
            un pago. Las solicitudes de reembolso deben enviarse a{" "}
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>{" "}
            con la información de la transacción y una explicación detallada.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            7. Cancelación y eliminación de datos
          </h2>
          <p className="text-gray-700">
            Los usuarios pueden mantener su cuenta de forma indefinida. Las
            cuentas de negocio cuyos pagos no sean renovados permanecerán en el
            sistema hasta por 6 meses antes de proceder a la eliminación
            permanente de los datos relacionados al negocio.
          </p>
          <p className="text-gray-700">
            La eliminación automática de cuentas de usuario no está definida
            actualmente; si deseas la cancelación o eliminación, contáctanos a{" "}
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>{" "}
            para evaluar el caso.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">8. Obligaciones del usuario</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Proporcionar información veraz y actualizada.</li>
            <li>
              No usar la plataforma para actividades ilegales o prohibidas.
            </li>
            <li>
              Respetar los derechos de terceros, incluidos derechos de propiedad
              intelectual.
            </li>
            <li>Notificar cualquier uso no autorizado de su cuenta.</li>
          </ul>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            9. Contenido y propiedad intelectual
          </h2>
          <p className="text-gray-700">
            Todo el contenido original de Localy (marcas, logos, diseño, código
            y documentación) es propiedad de Localy o de sus licenciantes y está
            protegido por derechos de autor y demás leyes. El usuario puede
            cargar contenido (fotos, descripciones) siempre que tenga derechos
            sobre el mismo y nos concede una licencia limitada para exhibirlo y
            hospedarlo en la plataforma.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">10. Prohibiciones</h2>
          <p className="text-gray-700">
            Queda prohibido, entre otras conductas:
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              Usar la plataforma para actividades ilegales o infringir derechos
              de terceros.
            </li>
            <li>Intentar acceder a cuentas de otros usuarios sin permiso.</li>
            <li>
              Distribuir malware o intentar vulnerar la seguridad del sistema.
            </li>
          </ul>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            11. Limitación de responsabilidad
          </h2>
          <p className="text-gray-700">
            En la medida máxima permitida por la ley, Localy no será responsable
            por daños indirectos, incidentales, especiales o punitivos
            relacionados con el uso del servicio. Nuestra responsabilidad total
            por reclamos directos relacionados con servicios pagados estará
            limitada al monto efectivamente pagado por el usuario en los últimos
            12 meses, salvo disposición legal en contrario.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            12. Seguridad y medidas técnicas
          </h2>
          <p className="text-gray-700">
            Implementamos medidas de seguridad razonables: cifrado de
            contraseñas, control de acceso por roles, validación de sesiones y
            uso de HTTPS. Sin embargo, ninguna medida es infalible y no
            garantizamos la absoluta invulnerabilidad del sistema.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            13. Almacenamiento y transferencias
          </h2>
          <p className="text-gray-700">
            Los datos se almacenan en servidores de Google (Firebase) ubicados
            en Estados Unidos. Para el procesamiento de pagos y envío de correos
            se utilizan proveedores ubicados en Estados Unidos (por ejemplo,
            Stripe y Resend). Al usar nuestros servicios aceptas estas
            transferencias internacionales con las salvaguardas aplicables.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            14. Término y suspensión del servicio
          </h2>
          <p className="text-gray-700">
            Podemos suspender o terminar tu acceso al servicio en caso de
            incumplimiento de estos Términos, actividades fraudulentas o
            requerimiento legal. En la medida de lo posible se notificará con
            antelación cuando sea aplicable.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            15. Enlace a la Política de Privacidad
          </h2>
          <p className="text-gray-700">
            Nuestra{" "}
            <a href="/politica_privacidad" className="text-blue-600 underline">
              Política de Privacidad
            </a>{" "}
            describe cómo recogemos y tratamos tus datos personales. Al aceptar
            estos Términos confirmas haber leído y aceptado la Política de
            Privacidad.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">16. Cambios a los Términos</h2>
          <p className="text-gray-700">
            Nos reservamos el derecho de modificar estos Términos. Los cambios
            relevantes serán notificados en la plataforma o por correo
            electrónico. La fecha de la última actualización figura al inicio
            del documento.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">
            17. Ley aplicable y jurisdicción
          </h2>
          <p className="text-gray-700">
            Estos Términos se rigen por las leyes aplicables de México. Para la
            resolución de controversias, las partes se someten a los tribunales
            competentes del domicilio de Localy, salvo disposición contraria de
            orden público.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">18. Contacto</h2>
          <p className="text-gray-700">
            Si tienes preguntas sobre estos Términos contáctanos en:
          </p>
          <p className="text-gray-700">
            <a
              href="mailto:localymx@gmail.com"
              className="text-blue-600 underline"
            >
              localymx@gmail.com
            </a>
          </p>
        </section>

        <footer className="mt-8 border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Localy MX — Durango, Dgo. México
          </p>
          <div className="flex gap-2">
            <a
              href="mailto:localymx@gmail.com"
              className="px-3 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm hover:bg-gray-200"
            >
              Contacto
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
