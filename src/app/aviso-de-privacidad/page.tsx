import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { EMAIL } from '@/lib/config';

/*
 * Aviso de Privacidad Integral conforme a la Ley Federal de Protección de Datos Personales
 * en Posesión de los Particulares (LFPDPPP, publicada en el DOF el 20 de marzo de 2025).
 *
 * IMPORTANTE antes de publicar:
 *  - Confirmar el domicilio del responsable (RESPONSABLE_DOMICILIO).
 *  - Confirmar los proveedores reales del backend de Randall (hosting y servicio de IA).
 *  - Recomendable: revisión por un abogado.
 *  - Actualizar UPDATED cada vez que cambie el contenido.
 */
const UPDATED = '28 de octubre de 2026';
const RESPONSABLE_DOMICILIO = 'Ciudad de México, México';

export const metadata: Metadata = {
    title: 'Aviso de Privacidad | Quasar Devs',
    description:
        'Aviso de Privacidad Integral de Quasar Devs: qué datos personales recabamos, para qué los usamos, uso de cookies y cómo ejercer tus derechos ARCO.',
    alternates: { canonical: '/aviso-de-privacidad' },
};

export default function AvisoDePrivacidad() {
    return (
        <>
            <main id="contenido" className="veil-deep relative min-h-screen px-6 pb-24 pt-32 md:px-10">
                <article
                    className="mx-auto max-w-3xl text-[1.02rem] leading-relaxed text-ink/90
                        [&_a]:text-cyan-neon [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-white
                        [&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white
                        [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white
                        [&_li]:mt-2 [&_p]:mt-4 [&_strong]:text-white
                        [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6"
                >
                    <header>
                        <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                            Aviso de Privacidad Integral
                        </h1>
                        <p className="!mt-3 text-sm text-dim">Última actualización: {UPDATED}</p>
                    </header>

                    <p>
                        Este aviso explica cómo se tratan los datos personales que compartes a través del sitio
                        web de Quasar Devs, en cumplimiento de la Ley Federal de Protección de Datos Personales en
                        Posesión de los Particulares (en adelante, &ldquo;la Ley&rdquo;).
                    </p>

                    <h2 id="responsable">1. Responsable de tus datos</h2>
                    <p>
                        <strong>Alonso Correa</strong>, persona física que opera bajo el nombre comercial
                        <strong> Quasar Devs</strong>, con domicilio en {RESPONSABLE_DOMICILIO} y correo
                        electrónico <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, es el responsable del tratamiento de
                        tus datos personales.
                    </p>

                    <h2 id="datos">2. Datos personales que recabamos</h2>
                    <p>Recabamos únicamente los datos que tú nos proporcionas o que tu navegador envía al usar el sitio:</p>
                    <ul>
                        <li>
                            <strong>Formulario de contacto:</strong> nombre, correo electrónico, tipo de proyecto y el
                            contenido de tu mensaje, así como la fecha y hora en que aceptaste este aviso.
                        </li>
                        <li>
                            <strong>Chat con Randall (asistente virtual):</strong> el texto de tus preguntas y las
                            respuestas. Randall no te pide datos personales; si decides escribirlos, se procesan solo
                            para responderte.
                        </li>
                        <li>
                            <strong>Datos técnicos:</strong> dirección IP, tipo de navegador y fecha y hora de la
                            visita, que los servidores registran automáticamente por seguridad y para limitar el
                            número de mensajes enviados al chat.
                        </li>
                        <li>
                            <strong>Preferencias guardadas en tu navegador:</strong> idioma del sitio, tu elección
                            sobre el aviso de cookies y el historial temporal del chat (ver apartado 8).
                        </li>
                    </ul>
                    <p>
                        <strong>Datos sensibles.</strong> Este sitio no solicita datos personales sensibles (por
                        ejemplo, sobre tu salud, origen étnico, creencias o datos financieros). Te pedimos no
                        incluirlos en el formulario ni en el chat.
                    </p>

                    <h2 id="finalidades">3. Para qué usamos tus datos</h2>
                    <h3>Finalidades necesarias (primarias)</h3>
                    <ul>
                        <li>Responder tus mensajes y solicitudes de información.</li>
                        <li>Preparar y enviarte cotizaciones o propuestas de servicios de desarrollo de software o de consultoría de supply chain.</li>
                        <li>Dar seguimiento a la relación comercial que, en su caso, se establezca contigo.</li>
                        <li>Responder tus preguntas a través de Randall.</li>
                        <li>Mantener la seguridad del sitio y prevenir el uso abusivo del formulario y del chat.</li>
                    </ul>
                    <h3>Finalidades adicionales (secundarias)</h3>
                    <p>
                        No usamos tus datos para finalidades secundarias: no te enviaremos publicidad ni boletines
                        sin tu consentimiento previo, y no elaboramos perfiles con fines comerciales.
                    </p>

                    <h2 id="proveedores">4. Proveedores que nos ayudan a tratar tus datos</h2>
                    <p>
                        Para operar el sitio nos apoyamos en proveedores que tratan tus datos únicamente por
                        cuenta nuestra y para las finalidades de este aviso. Algunos se ubican fuera de México:
                    </p>
                    <ul>
                        <li><strong>Vercel Inc.</strong>: alojamiento del sitio web (registros técnicos de visita).</li>
                        <li><strong>EmailJS</strong>: envío a nuestro correo del mensaje del formulario de contacto.</li>
                        <li><strong>Google LLC (Gmail)</strong>: recepción y gestión de los correos que nos envías.</li>
                        <li>
                            <strong>Proveedor de alojamiento del servidor de Randall</strong> y{' '}
                            <strong>proveedor del servicio de inteligencia artificial</strong> que genera las
                            respuestas del chat. A estos proveedores solo se envía el texto de la conversación, sin
                            tu nombre ni tu correo.
                        </li>
                    </ul>

                    <h2 id="transferencias">5. Transferencias de datos</h2>
                    <p>
                        No vendemos ni compartimos tus datos personales con terceros para sus propios fines.
                        Únicamente podríamos transferirlos sin tu consentimiento en los casos previstos por la Ley,
                        por ejemplo, cuando lo requiera una autoridad competente.
                    </p>

                    <h2 id="arco">6. Derechos ARCO</h2>
                    <p>
                        Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si
                        son inexactos, <strong>Cancelarlos</strong> cuando consideres que no se requieren y
                        <strong> Oponerte</strong> a su uso para fines específicos.
                    </p>
                    <p>
                        Para ejercerlos, envía tu solicitud a <a href={`mailto:${EMAIL}`}>{EMAIL}</a> con:
                    </p>
                    <ol>
                        <li>Tu nombre y un medio para comunicarte la respuesta.</li>
                        <li>Un documento que acredite tu identidad (o, en su caso, la de tu representante legal).</li>
                        <li>La descripción clara de los datos y del derecho que quieres ejercer.</li>
                        <li>Cualquier documento que facilite la localización de tus datos.</li>
                    </ol>
                    <p>
                        Te responderemos en un plazo máximo de <strong>20 días hábiles</strong> contados desde que
                        recibamos tu solicitud. Si resulta procedente, la haremos efectiva dentro de los
                        <strong> 15 días hábiles</strong> siguientes a la fecha de la respuesta.
                    </p>

                    <h2 id="revocacion">7. Revocar tu consentimiento o limitar el uso de tus datos</h2>
                    <p>
                        Puedes revocar en cualquier momento el consentimiento que nos diste, o pedir que limitemos
                        el uso de tus datos, escribiendo a <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Ten en cuenta
                        que, si revocas tu consentimiento, es posible que no podamos seguir atendiendo tu
                        solicitud o proyecto.
                    </p>

                    <h2 id="cookies">8. Cookies y tecnologías similares</h2>
                    <p>
                        Este sitio <strong>no usa cookies de publicidad, de analítica ni de redes sociales</strong>.
                        Las fuentes tipográficas se sirven desde nuestro propio dominio, sin conexiones a terceros.
                        Solo usamos almacenamiento local de tu navegador, indispensable para que el sitio funcione:
                    </p>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-violet-neon/40 text-white">
                                    <th className="py-2 pr-4 font-display font-semibold">Qué se guarda</th>
                                    <th className="py-2 pr-4 font-display font-semibold">Para qué</th>
                                    <th className="py-2 font-display font-semibold">Duración</th>
                                </tr>
                            </thead>
                            <tbody className="[&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_tr]:border-b [&_tr]:border-white/10">
                                <tr>
                                    <td><code>quasar-lang</code></td>
                                    <td>Recordar el idioma que elegiste (español o inglés).</td>
                                    <td>Hasta que borres los datos del navegador.</td>
                                </tr>
                                <tr>
                                    <td><code>quasar-cookie-notice-v2</code></td>
                                    <td>Recordar que ya viste este aviso, para no mostrarlo en cada visita.</td>
                                    <td>Hasta que borres los datos del navegador.</td>
                                </tr>
                                <tr>
                                    <td><code>randall-history</code></td>
                                    <td>Conservar la conversación con Randall mientras navegas.</td>
                                    <td>Se borra al cerrar la pestaña.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>
                        Estos datos se quedan en tu dispositivo y no se usan para identificarte. Puedes borrarlos
                        en cualquier momento desde la configuración de tu navegador. Si en el futuro incorporamos
                        cookies de analítica o de terceros, te pediremos tu consentimiento antes de activarlas y
                        actualizaremos este aviso.
                    </p>

                    <h2 id="menores">9. Menores de edad</h2>
                    <p>
                        Este sitio está dirigido a empresas y profesionales, no a menores de 18 años. Si eres menor
                        de edad, no nos envíes datos personales sin la autorización de tu madre, padre o tutor.
                    </p>

                    <h2 id="cambios">10. Cambios a este aviso</h2>
                    <p>
                        Cualquier cambio a este Aviso de Privacidad se publicará en esta misma página, con la fecha
                        de su última actualización.
                    </p>

                    <h2 id="autoridad">11. Autoridad</h2>
                    <p>
                        Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes
                        acudir a la Secretaría Anticorrupción y Buen Gobierno, autoridad encargada de vigilar el
                        cumplimiento de la Ley.
                    </p>

                    <p className="!mt-12">
                        <a href="/">Volver al inicio</a>
                    </p>
                </article>
            </main>
            <Footer />
        </>
    );
}
