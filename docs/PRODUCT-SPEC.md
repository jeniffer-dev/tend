# Tend — Especificación de producto

**Estado:** Borrador
**Versión:** 0.3
**Fecha:** 2026-09-07
**Última enmienda:** 2026-09-09 — la semana empieza el lunes; `abandoned`
sale del enum de `Session.outcome`

---

## 1. Problema

Tengo pendientes de todos los tamaños: desde "comprar huevos" hasta "jubilarme a los 60". Las apps de tareas tradicionales los tratan igual y me empujan a hacer listas infinitas que no reflejan a qué le estoy dedicando realmente mi vida.

Lo que necesito no es una lista más larga, sino un sistema que:

1. Me deje declarar **a qué áreas de mi vida le presto atención** y cuánto tiempo semanal quiero darle a cada una.
2. Me deje **sentarme 15 minutos** en un área concreta, agarrar una tarea, y avanzar.
3. Mida si **cumplí el ritual**, no solo si cerré tareas.

La unidad de éxito de este sistema es la **sesión cumplida**, no la tarea completada.

---

## 2. Alcance

### En alcance (v1)

- Definir áreas de vida con presupuesto de tiempo semanal.
- Capturar tareas rápido, sin clasificar (inbox).
- Clasificar tareas en un área.
- Subdividir tareas en subtareas jerárquicas.
- Fecha objetivo opcional por tarea.
- Lista de prioridades de la semana.
- Ejecutar sesiones cronometradas contra una tarea.
- Registrar tiempo planeado vs. tiempo real por sesión.
- Aviso (no bloqueo) cuando un área excede su presupuesto semanal.
- Ritual de revisión semanal.

### Fuera de alcance (v1)

- Tareas recurrentes.
- Etiquetas o filtros avanzados.
- Notificaciones push.
- Panel de estadísticas o gráficas.
- Multiusuario, compartir, sincronización entre dispositivos.
- Integración con calendario.

**Principio rector:** minimalismo. Si una función no sirve al ciclo `capturar → clasificar → priorizar → sesión`, no entra en v1.

---

## 3. Modelo de dominio

### 3.1 Area

Un ámbito de vida al que le dedico atención recurrente.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | |
| `name` | string | Ej: "Personal / alma", "Admin life", "Crecimiento profesional" |
| `weekly_budget_minutes` | int | Presupuesto semanal objetivo |
| `default_session_minutes` | int | Duración por defecto de una sesión (ej. 15) |
| `is_daily` | bool | Si aparece en la pantalla principal cada día |
| `sort_order` | int | |

**Restricción:** se recomiendan 3–5 áreas. La app no impone un máximo duro, pero advierte al crear la sexta.

### 3.2 Task

Un pendiente de cualquier tamaño.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | |
| `title` | string | Obligatorio |
| `notes` | text | Opcional |
| `area_id` | uuid \| null | `null` = está en el inbox, sin clasificar |
| `parent_id` | uuid \| null | Referencia a la tarea madre |
| `target_date` | date \| null | Opcional. Admite fechas lejanas (ej. 2050) |
| `status` | enum | `open`, `done`, `dropped` |
| `is_weekly_priority` | bool | Está en la lista de esta semana |
| `created_at` | datetime | |
| `completed_at` | datetime \| null | |

**Regla de jerarquía:** las subtareas existen únicamente para que la tarea madre se cumpla. No hay límite duro de profundidad, pero la interfaz solo muestra un nivel a la vez.

**Regla de herencia:** una subtarea hereda el `area_id` de su madre y no puede cambiarlo por separado.

### 3.3 Session

Un bloque de tiempo trabajado contra una tarea.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | |
| `task_id` | uuid | Tarea trabajada |
| `area_id` | uuid | Denormalizado para reportes semanales |
| `planned_minutes` | int | Lo que me propuse (ej. 15) |
| `actual_minutes` | int | Lo que realmente gasté (ej. 120) |
| `started_at` | datetime | |
| `ended_at` | datetime | |
| `outcome` | enum | `completed`, `progressed` |
| `progress_note` | text \| null | Qué avancé y qué falta |
| `spawned_task_id` | uuid \| null | Si el cierre generó una tarea nueva |

`planned_minutes` y `actual_minutes` son campos **separados y ambos obligatorios**. La diferencia entre los dos es el dato central del sistema.

**Sobre `abandoned`:** el enum lo incluía en la v0.2, pero ningún flujo de la RF-19 lo produce — una sesión se cierra como `completed` o como `progressed`, y "no avancé nada" es `progressed` con una nota que lo dice. Se retira. Si la feature 003 descubre sesiones huérfanas (la app se cerró a mitad y nadie registró un resultado), se reconsidera ahí, con el caso real a la vista y no por anticipado.

---

## 4. Requisitos funcionales

### 4.1 Captura rápida

- **RF-01** El sistema DEBE ofrecer capturar una tarea escribiendo solo un título.
- **RF-02** El sistema NO DEBE exigir área, fecha ni prioridad al momento de capturar.
- **RF-03** Una tarea sin `area_id` DEBE aparecer en el inbox.

### 4.2 Áreas y presupuesto

- **RF-04** El usuario DEBE poder crear, editar y archivar áreas.
- **RF-05** Cada área DEBE tener un presupuesto semanal en minutos.
- **RF-06** CUANDO la suma de `actual_minutes` de un área en la semana en curso (lunes 00:00 a domingo 23:59, hora local) supere su `weekly_budget_minutes`, el sistema DEBE mostrar un aviso visible.
- **RF-07** El sistema NO DEBE bloquear la creación ni la ejecución de sesiones por exceso de presupuesto. Solo avisa y sigue registrando.

### 4.3 Tareas y subdivisión

- **RF-08** El usuario DEBE poder asignar una tarea a un área.
- **RF-09** El usuario DEBE poder subdividir cualquier tarea en subtareas.
- **RF-10** CUANDO todas las subtareas de una tarea estén en `done`, el sistema DEBE preguntar si la tarea madre también se completó.
- **RF-11** El usuario DEBE poder ponerle `target_date` a una tarea, y esta DEBE ser opcional.
- **RF-12** Una tarea con `target_date` a más de 90 días DEBE requerir al menos una subtarea antes de poder entrar a la lista semanal.

> Justificación de RF-12: "jubilarme a los 60" no es accionable en 15 minutos. La app obliga a bajarla a un siguiente paso concreto.

### 4.4 Lista semanal

**La semana empieza el lunes.** El presupuesto semanal de cada área se corta el lunes a las 00:00 hora local, y la revisión semanal cierra la semana que termina el domingo. Este corte es único para todo el sistema: no hay semanas por área ni semana configurable.

- **RF-13** El usuario DEBE poder marcar tareas como prioridad de la semana.
- **RF-14** El sistema DEBE ofrecer un flujo de revisión semanal que: (a) muestre el inbox para clasificar, (b) muestre el resumen de la semana que termina, (c) permita armar la lista de la semana entrante.
- **RF-15** AL iniciar una semana nueva, las tareas de la lista anterior que sigan `open` DEBEN permanecer en la lista hasta que el usuario las quite explícitamente.

### 4.5 Sesión

- **RF-16** El usuario DEBE poder iniciar una sesión eligiendo un área y una tarea de la lista semanal de esa área.
- **RF-17** El sistema DEBE cronometrar la sesión y registrar `actual_minutes` reales, aunque excedan `planned_minutes`.
- **RF-18** CUANDO se agote el tiempo planeado, el sistema DEBE avisar sin detener el cronómetro.
- **RF-19** AL cerrar una sesión, el usuario DEBE elegir uno de tres resultados:
  - `completed` — la tarea queda `done`.
  - `progressed` — la tarea vuelve a la lista con la nota de avance guardada.
  - `progressed` + tarea nueva — la tarea original se cierra y nace una tarea con lo que falta.
- **RF-20** El sistema NO DEBE permitir cerrar una sesión sin registrar un resultado.

### 4.6 Pantalla principal

- **RF-21** LA pantalla de inicio DEBE mostrar únicamente: las áreas diarias con su sesión del día y un botón para iniciar.
- **RF-22** El inbox, la lista semanal y el historial DEBEN estar en navegación secundaria.
- **RF-23** La pantalla de inicio DEBE ser accionable en un solo toque desde el arranque de la app.

---

## 5. Criterios de aceptación

1. Puedo capturar una tarea en menos de 5 segundos sin tocar ningún selector.
2. Puedo crear un área con presupuesto de 105 min/semana y sesión por defecto de 15 min.
3. Si hago una sesión de 15 min planeados y gasto 120 reales, el resumen semanal refleja 120 y no 15.
4. Si un área tiene 105 min de presupuesto y llevo 260 gastados, veo un aviso y puedo seguir trabajando igual.
5. Una tarea con `target_date` en 2050 y sin subtareas no me deja marcarla como prioridad semanal.
6. Al cerrar una sesión sin terminar, la tarea sigue en la lista con mi nota de avance visible la próxima vez.
7. Al cerrar una sesión eligiendo "crear tarea nueva", la original queda `done` y la nueva aparece en la misma área.
8. Al abrir la app veo mis áreas del día y nada más.

---

## 6. Léxico

Los nombres de campo de este documento son internos. La copy de la interfaz
sigue el Artículo II de la constitución: *Tend*, *Session*, *Area*,
*Unattended*, *Attended*, *Capture*. Nunca *Start task*, *Category*,
*Overdue* ni *Missed*.

---

## 7. Preguntas abiertas

- ~~¿La semana empieza lunes o domingo?~~ **Resuelto (2026-09-09):** lunes. Ver §4.4.
- ~~¿Plataforma?~~ **Resuelto:** web móvil primero, 390px de base, Next.js.
- ¿Persistencia: local (IndexedDB) o con backend? Fuera de alcance de la feature 001.
- ¿Qué pasa con una sesión que se abandona sin cerrar (la app se cierra a mitad)? Se decide en la feature 003, junto con la persistencia que la haría detectable. Hasta entonces el enum no lleva `abandoned`.
