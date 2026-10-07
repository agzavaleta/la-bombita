# La Bombita — Especificación Maestra del Proyecto

## 1. Identidad del proyecto

**Nombre final de la app:** La Bombita  
**Bajada de marca:** de Tulín Bombín  
**Versión inicial:** v1.0.0  
**Tipo de producto:** PWA 100% móvil  
**Distribución:** GitHub + Vercel  
**Persistencia:** local en el dispositivo, sin login y sin backend en la v1.0.0

Este documento es la fuente de verdad funcional, visual y técnica para trabajar el proyecto con ChatGPT y Codex.

---

## 2. Objetivo de la app

La Bombita es una aplicación móvil de premios aleatorios de uso personal.

Cada instalación funciona de manera independiente. El usuario crea su propio universo de premios, puede administrarlo libremente y una vez al día puede raspar una composición protagonizada por Tulín Bombín y una bomba para descubrir el premio del día.

No hay cuentas, login, sincronización entre dispositivos ni historial de premios en la v1.0.0.

---

## 3. Principios base

- La app es **100% móvil**.
- La experiencia debe priorizar uso táctil con una sola mano.
- No se diseña pensando en escritorio.
- El estilo visual general es **flat design**.
- No usar glassmorphism, 3D, sombras pesadas ni efectos visuales innecesarios.
- La única excepción al flat design es la superficie raspable, que puede simular material real para mejorar la experiencia.
- La UI se construye con **shadcn/ui**.
- La iconografía usa **Lucide React**.
- Los estilos y colores se implementan con **Tailwind CSS**.
- La tipografía principal es **Nunito**.
- La app debe mantenerse simple, clara, rápida y fácil de mantener.

---

## 4. Stack técnico aprobado

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- Nunito
- IndexedDB
- Librería liviana tipo `idb` para acceso a IndexedDB
- Canvas nativo para el efecto de raspado
- `vite-plugin-pwa`
- GitHub
- Vercel

### Criterio técnico

No usar Next.js en esta etapa. La app no necesita SSR, backend, autenticación, SEO complejo ni rutas de servidor.

---

## 5. Navegación principal

La app tiene una barra de navegación inferior fija con tres secciones:

1. **Inicio**
2. **Premios**
3. **Ajustes**

No agregar más secciones principales en la v1.0.0.

La historia de Tulín Bombín se accede desde Ajustes y también puede abrirse tocando a Tulín desde Inicio.

---

# 6. MVP v1.0.0

La primera versión funcional incluye:

- Crear premios.
- Editar premios.
- Eliminar premios.
- Premios ilimitados.
- Nombre de premio único.
- Sorteo aleatorio con repetición entre días.
- Un premio disponible por día.
- Raspado táctil realista.
- Bloqueo del premio después de descubrirlo.
- Reinicio automático diario a las 00:00.
- Persistencia local.
- Exportación de respaldo de premios.
- Importación de respaldo de premios.
- Pantalla con historia de Tulín Bombín.
- Visualización de versión de la app.
- Instalación como PWA.

No incluye:

- Login.
- Cuentas.
- Backend.
- Sincronización.
- Historial de premios.
- Ranking.
- Estadísticas.
- Compartir resultados.
- Notificaciones push.
- Multiusuario dentro de una misma instalación.

---

# 7. Reglas funcionales de premios

## 7.1 Universo de premios

- No existe una cantidad máxima fija de premios.
- El usuario puede agregar todos los premios que quiera.
- Los premios permanecen disponibles después de salir sorteados.
- Un mismo premio puede volver a salir en días posteriores.
- Todos los premios tienen inicialmente la misma probabilidad de salir.

## 7.2 Nombre único

No pueden existir dos premios con el mismo nombre.

La validación debe:

- ignorar mayúsculas y minúsculas;
- eliminar espacios sobrantes al inicio y al final;
- considerar equivalentes, por ejemplo:
  - `Masaje de pies`
  - `masaje de pies`
  - `  Masaje de pies  `

En todos esos casos se considera el mismo nombre.

La validación se aplica al:

- crear;
- editar;
- importar.

## 7.3 Premio del día

- Cada instalación puede descubrir un solo premio por día.
- El resultado es aleatorio.
- Puede repetirse respecto de días anteriores.
- No existe botón para volver a sortear.
- Una vez descubierto, permanece guardado hasta el siguiente día.

## 7.4 Momento del sorteo

El resultado no debe sortearse simplemente al abrir la app.

El premio debe quedar definido durante la interacción de raspado, antes de que pueda producirse cualquier recarga o cierre que permita cambiarlo.

Una vez seleccionado, debe persistirse inmediatamente como premio del día.

## 7.5 Cambio de día

- El nuevo día se considera habilitado a las **00:00 según la hora local del dispositivo**.
- Después de las 00:00, el usuario puede raspar nuevamente.
- No se requiere botón de reinicio.
- No implementar mecanismos complejos antitrampa en la v1.0.0.

### Limitación aceptada

Al no existir servidor, si el usuario cambia manualmente la fecha u hora del teléfono puede alterar el comportamiento diario. Esto se acepta en el MVP.

---

# 8. Persistencia

Usar IndexedDB para guardar al menos:

- lista de premios;
- identificadores internos;
- premio actual del día;
- fecha asociada al premio actual;
- información mínima necesaria para restaurar correctamente el estado de la app.

El premio del día debe guardar una copia del nombre que tenía al momento de salir.

Esto evita que editar o eliminar el premio original cambie retroactivamente el resultado ya obtenido.

---

# 9. Pantalla Inicio

Inicio es la pantalla principal y la experiencia central de La Bombita.

Debe contemplar tres estados:

1. Sin premios.
2. Premio disponible para raspar.
3. Premio ya descubierto.

---

## 9.1 Estado sin premios

Cuando no existen premios:

- No mostrar la bomba raspable.
- Mostrar a Tulín Bombín solo, centrado.
- Mostrar mensaje simple.
- Mostrar un único CTA.

### Texto recomendado

**Aún no tienes premios**  
Agrega tu primer premio para comenzar.

CTA:

**Agregar mi primer premio**

El CTA abre directamente el flujo de creación de premio.

---

## 9.2 Estado premio disponible

La composición principal se basa en:

- Tulín Bombín al lado izquierdo.
- La bomba a la derecha o centro-derecha.
- La bomba debe respetar visualmente la forma de la ilustración de referencia definida para el proyecto.
- Tulín no va sentado sobre la bomba en la versión final del raspado.
- Tulín aparece apoyado al lado izquierdo para liberar espacio horizontal.

### Zona raspable

Idealmente toda la composición debe quedar cubierta por la superficie raspable:

- Tulín;
- bomba;
- área del premio.

El usuario debe poder pasar el dedo por toda esa zona y descubrir progresivamente la ilustración y el premio.

### Texto previo

Antes de raspar debe aparecer:

**Premio del día**

No usar el texto “Raspa aquí” como texto principal.

---

## 9.3 Premio revelado

El premio debe aparecer principalmente integrado dentro de la bomba.

Reglas:

- texto centrado;
- una línea si cabe;
- hasta 2 o 3 líneas si es necesario;
- tamaño tipográfico adaptable;
- prioridad absoluta a la legibilidad;
- nunca cortar el nombre sin una estrategia visual clara.

Ejemplo:

**Masaje de pies**  
**5 minutos**

---

## 9.4 Raspado

El raspado debe sentirse lo más real posible dentro de una app web móvil.

### Técnica

- Canvas nativo superpuesto sobre la composición.
- Interacción táctil mediante pointer events.
- Uso de máscara o `destination-out`.
- El dedo borra realmente la capa superior.
- El contenido inferior aparece exactamente por donde pasa el usuario.

### Superficie raspable

Debe simular una superficie de raspe real:

- tono gris / plateado;
- textura granular;
- pequeñas variaciones visuales;
- sin parecer 3D;
- compatible con el lenguaje flat general.

### Pincel

- circular o ligeramente irregular;
- borde suave;
- tamaño cómodo para dedo;
- sin cortes bruscos;
- movimiento fluido.

### Umbral de revelado

Al alcanzar aproximadamente **60%** del área raspada:

- completar el revelado automáticamente;
- retirar suavemente la superficie restante;
- bloquear nuevos sorteos;
- persistir el resultado del día.

### Rendimiento

- evitar lag;
- evitar scroll accidental durante el gesto;
- optimizar resolución del canvas;
- validar en teléfonos reales;
- no usar imágenes o texturas innecesariamente pesadas.

---

## 9.5 Celebración

Al revelar el premio:

- Tulín cambia a una expresión de celebración.
- Puede haber una animación flat breve.
- Puede encenderse brevemente la mecha.
- Puede usarse confeti flat discreto.
- Puede incorporarse vibración breve si el dispositivo lo permite.
- Puede incorporarse sonido de raspado y sonido de revelado si se implementan de forma ligera.

No sobrecargar la experiencia.

---

## 9.6 Estado ya raspado

Si el usuario vuelve a abrir la app el mismo día:

- debe ver el mismo premio;
- no debe reaparecer la superficie raspable;
- no debe poder volver a sortear;
- debe mostrarse la composición descubierta.

Texto inferior recomendado:

**Nuevo premio disponible mañana**

No es necesario mostrar contador horario en la v1.0.0.

---

# 10. Pantalla Premios

La pantalla permite administrar el universo de premios.

## 10.1 Estructura

- Título de pantalla.
- Contador de premios.
- Acción principal para agregar.
- Lista vertical de cards.

Ejemplo:

**Mis premios**  
`18 premios`

Botón:

**Agregar premio**

---

## 10.2 Card de premio

Cada premio aparece en una card simple con:

- nombre;
- acción Editar;
- acción Eliminar.

Usar Lucide para las acciones.

Mantener composición limpia y táctil.

---

## 10.3 Crear premio

Crear se realiza mediante **sheet inferior**.

No usar diálogo centrado para el formulario.

Contenido:

- título: **Agregar premio**;
- campo: **Nombre del premio**;
- botón **Cancelar**;
- botón **Guardar**.

### Validaciones

- nombre obligatorio;
- nombre único;
- limpiar espacios sobrantes;
- error visible asociado al campo;
- no cerrar el sheet al guardar si existen errores.

---

## 10.4 Editar premio

También mediante sheet inferior.

Contenido:

- título: **Editar premio**;
- valor actual cargado;
- Cancelar;
- Guardar.

La validación de unicidad debe excluir correctamente el propio premio que se está editando.

---

## 10.5 Cerrar con cambios sin guardar

Si el usuario intenta:

- cerrar el sheet;
- deslizarlo;
- tocar Cancelar;
- tocar fuera, si el componente lo permite;

y existen cambios sin guardar, mostrar confirmación.

### Confirmación

**¿Descartar cambios?**  
Los cambios realizados no se guardarán.

Acciones:

- **Seguir editando**
- **Descartar cambios**

Si no existen cambios, cerrar directamente.

---

## 10.6 Eliminar premio

Eliminar requiere confirmación.

### Texto recomendado

**¿Eliminar premio?**  
Este premio dejará de estar disponible para futuros sorteos.

Acciones:

- **Cancelar**
- **Eliminar**

### Regla importante

Si ese premio ya salió hoy:

- el premio del día no cambia;
- permanece visible hasta el siguiente día;
- solo se elimina del universo de sorteos futuros.

---

## 10.7 Estado vacío

Si no existen premios:

**Aún no tienes premios**  
Agrega tu primer premio para comenzar.

CTA:

**Agregar premio**

---

# 11. Pantalla Ajustes

La pantalla Ajustes debe mantenerse mínima en la v1.0.0.

## 11.1 Respaldo

Mostrar:

- **Exportar premios**
- **Importar premios**

## 11.2 Tulín Bombín

Mostrar acceso:

**Conoce la historia de Tulín**

Este acceso abre una pantalla completa dedicada a su historia.

## 11.3 Acerca de

Mostrar:

**Versión 1.0.0**

La versión no debe duplicarse manualmente en varios archivos.

Debe existir una fuente única de versión, idealmente `package.json`, y la interfaz debe leer ese valor.

---

# 12. Respaldo de premios

El respaldo contiene únicamente la lista de premios.

No incluir:

- premio actual;
- fecha;
- estado de raspado;
- historial;
- configuración interna.

## 12.1 Exportar

Generar un archivo JSON.

Nombre recomendado:

`la-bombita-premios.json`

Debe tener una estructura versionable y validable.

Ejemplo conceptual:

```json
{
  "app": "La Bombita",
  "backupVersion": 1,
  "premios": [
    {
      "nombre": "Masaje de pies 5 minutos"
    }
  ]
}
```

No depender exclusivamente del texto `app` para validar el archivo; usar también una versión de esquema clara.

---

## 12.2 Importar

Al seleccionar un archivo:

1. validar JSON;
2. validar estructura;
3. validar nombres;
4. normalizar espacios;
5. detectar duplicados;
6. no modificar datos hasta tener la importación completa validada.

Luego ofrecer:

### Reemplazar mis premios

- reemplaza la lista actual;
- deja únicamente los premios válidos importados;
- requiere confirmación por ser una acción destructiva.

### Agregar a mis premios

- conserva los actuales;
- agrega solo premios no duplicados;
- omite duplicados existentes;
- no crear copias repetidas.

La importación nunca modifica el premio del día ya obtenido.

---

# 13. Historia de Tulín Bombín

La historia de Tulín no será una cuarta opción en la navegación inferior.

Se accede desde:

- Ajustes → **Conoce la historia de Tulín**
- opcionalmente tocando a Tulín en Inicio.

## Pantalla

- pantalla completa;
- botón volver;
- ilustraciones flat;
- texto dividido en bloques breves;
- lectura cómoda en móvil;
- sin navegación compleja.

El contenido narrativo y las ilustraciones definitivas pueden completarse después sin bloquear el desarrollo estructural.

---

# 14. Lenguaje visual

## 14.1 Estilo

**Flat design**

Características:

- formas simples;
- colores planos;
- bordes limpios;
- profundidad mínima;
- sin efectos 3D;
- sin glassmorphism;
- sin sombras pesadas;
- animaciones cortas y funcionales.

Tulín y la bomba también deben respetar este lenguaje.

---

## 14.2 Paleta base aprobada

Usar colores Tailwind.

| Uso | Tailwind |
|---|---|
| Fondo general | `red-50` |
| Superficies | `white` |
| Principal | `red-600` |
| Principal activo | `red-700` |
| Principal suave | `red-100` |
| Acento premio | `amber-400` |
| Acento suave | `amber-100` |
| Texto principal | `slate-900` |
| Texto secundario | `slate-500` |
| Bordes | `slate-200` |
| Éxito | `emerald-500` |
| Error / destructivo | `rose-600` |

### Raspado

Para la superficie raspable se puede trabajar con:

- `slate-300`
- `slate-400`
- `zinc-300`

La textura puede añadir pequeñas variaciones sin romper el lenguaje general.

---

# 15. Tipografía

Usar **Nunito** para toda la app.

Recomendación:

- títulos principales: 700;
- premio: 700 u 800;
- títulos de cards y sheets: 700;
- botones: 600;
- texto normal: 400 o 500;
- texto secundario: 400.

No mezclar familias tipográficas en la v1.0.0.

---

# 16. Componentes y patrones UI

Usar shadcn/ui como base.

Priorizar:

- Button
- Card
- Sheet
- AlertDialog
- Input
- Label
- Separator
- Toast/Sonner según la configuración elegida
- navegación inferior personalizada

### Regla de overlays

- Formularios: **sheet inferior**.
- Confirmaciones destructivas o de descarte: **AlertDialog / diálogo de confirmación**.
- No usar diálogos centrados como formulario.

### Accesibilidad táctil

- targets cómodos para pulgar;
- evitar controles diminutos;
- iconos siempre acompañados por aria-label;
- estados activos claros;
- feedback inmediato.

---

# 17. Comportamiento ante cambios de premios

## Agregar después de haber raspado

- permitido;
- no modifica el premio actual;
- entra en sorteos futuros.

## Editar después de haber raspado

- permitido;
- no modifica el texto guardado del premio del día;
- la nueva versión entra en sorteos futuros.

## Eliminar después de haber raspado

- permitido;
- el premio del día se mantiene visible;
- deja de participar en sorteos futuros.

## Eliminar todos

- permitido;
- si ya existe premio del día, sigue visible ese día;
- al día siguiente Inicio muestra estado sin premios.

---

# 18. Versionado

Usar versionado semántico.

- `1.0.0`: primera versión funcional.
- `1.0.1`: correcciones.
- `1.1.0`: nueva funcionalidad compatible.
- `2.0.0`: cambio mayor o incompatible.

La versión visible en Ajustes debe venir de una fuente única del proyecto.

---

# 19. PWA

La Bombita debe ser instalable en móvil.

La PWA debe definir:

- nombre: La Bombita;
- short name: La Bombita;
- iconos;
- color de tema;
- color de fondo;
- display standalone;
- manifest;
- service worker.

No cerrar icono definitivo hasta tener la ilustración final aprobada.

---

# 20. Reglas para Codex

Codex debe respetar estas reglas:

1. No cambiar decisiones funcionales sin autorización.
2. No agregar funcionalidades no solicitadas.
3. Mantener la app 100% móvil.
4. No diseñar layouts específicos para escritorio.
5. Mantener estilo flat.
6. Usar shadcn/ui y Lucide.
7. Usar Tailwind para estilos y colores.
8. Mantener Nunito como tipografía.
9. No introducir backend ni autenticación.
10. No reemplazar IndexedDB por otra persistencia sin aprobación.
11. No usar librerías pesadas para raspado si Canvas nativo resuelve la necesidad.
12. Centralizar constantes, versión y claves de persistencia.
13. Separar lógica de negocio de la UI.
14. Mantener TypeScript estricto.
15. Evitar duplicación de lógica.
16. Mantener componentes pequeños y claros.
17. Probar interacciones táctiles reales.
18. No romper datos locales existentes al actualizar versiones.
19. Toda migración de estructura local debe ser explícita.
20. No modificar el comportamiento diario sin revisar esta especificación.

---

# 21. Estructura técnica sugerida

Estructura orientativa:

```text
src/
  app/
  components/
    ui/
    navigation/
    scratch/
    prizes/
  pages/
    Home/
    Prizes/
    Settings/
    TulinStory/
  hooks/
  lib/
    db/
    prizes/
    daily-prize/
    backup/
    version/
  types/
  assets/
    tulin/
    bomb/
  styles/
```

La estructura puede adaptarse si Codex propone una organización equivalente más limpia, siempre que respete separación de responsabilidades.

---

# 22. Modelo conceptual de datos

Ejemplo orientativo:

```ts
type Prize = {
  id: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

type DailyPrize = {
  dateKey: string;
  prizeId: string | null;
  prizeNameSnapshot: string;
  revealed: boolean;
  revealedAt: string;
};
```

`normalizedName` sirve para validación de unicidad.

`prizeNameSnapshot` garantiza que el premio del día no cambie retroactivamente.

---

# 23. Normalización de nombres

Función conceptual:

```ts
normalizePrizeName(name)
```

Debe:

1. aplicar `trim()`;
2. compactar espacios internos si se decide como regla común;
3. convertir a una forma comparable case-insensitive.

La app puede conservar la capitalización visual original para mostrar el nombre.

---

# 24. Criterios de aceptación generales de v1.0.0

La versión 1.0.0 estará lista cuando:

- se pueda instalar como PWA;
- se puedan crear premios sin límite práctico;
- no se permitan nombres duplicados;
- crear y editar funcionen mediante sheet inferior;
- se protejan cambios sin guardar;
- eliminar requiera confirmación;
- Inicio maneje correctamente sus tres estados;
- solo pueda descubrirse un premio por día;
- el resultado persista al cerrar y abrir;
- el raspado funcione fluidamente con el dedo;
- el premio se autorevele cerca del 60%;
- la app se desbloquee al nuevo día;
- exportar genere un respaldo válido;
- importar funcione en modo reemplazar y agregar;
- los duplicados de importación se controlen;
- Ajustes muestre la versión;
- la historia de Tulín sea accesible;
- no exista historial de premios;
- no exista login;
- no exista dependencia de backend;
- el diseño respete flat + shadcn/ui + Lucide + Tailwind + Nunito;
- la experiencia haya sido probada en móvil real.

---

# 25. Pendientes que no bloquean el desarrollo inicial

- Ilustración flat definitiva de Tulín.
- Ilustración flat definitiva de la bomba.
- Icono final de PWA.
- Contenido narrativo definitivo de la historia de Tulín.
- Sonido final de raspado.
- Sonido final de revelado.
- Ajustes finos de animación.

---

# 26. Fuente de verdad

Cuando exista una diferencia entre una implementación y este documento, se debe revisar la decisión antes de asumir que el código es correcto.

Las decisiones nuevas aprobadas durante el proyecto deben incorporarse aquí cuando cambien el comportamiento, el diseño o la arquitectura de La Bombita.
