# Estado del proyecto

Última actualización: 2026-09-26.

## SPEC implementada

- **SPEC-001 (fundación de la aplicación): implementada y cerrada** para su
  alcance mínimo (modo Practice + arquitectura base). Ver
  [docs/specs/SPEC-001-app-foundation.md](./specs/SPEC-001-app-foundation.md).
- **SPEC-005 (banco de preguntas): implementada para su primera iteración
  de contenido**, ampliando el banco de 18 a 100 preguntas con cobertura
  prácticamente completa del PDF. No existe un fichero
  `SPEC-005-question-bank.md` con contenido (sigue vacío en el repositorio);
  esta sección documenta el trabajo realizado en su lugar.
- **SPEC-003 (modos de estudio): implementada para el modo Exam**
  (configuración, examen sin feedback, corrección diferida, resultados
  completos). El fichero `SPEC-003-study-modes.md` sigue vacío en el
  repositorio; esta sección documenta el trabajo realizado en su lugar.
  Otros posibles "modos de estudio" futuros (más variantes de Exam,
  temporizador, etc.) no estaban pedidos y no se han añadido.
- **SPEC-004 (progreso): implementada.** Modelo de progreso ampliado
  (preguntas únicas vistas, historial de exámenes), favoritos expuestos en
  la UI (marcar/desmarcar, página propia, practicar solo favoritas),
  repaso de fallos mejorado (lista por pregunta), puntos débiles por
  bloque, y `StatisticsPage` rediseñada con 5 secciones. El fichero
  `SPEC-004-progress.md` sigue vacío en el repositorio; esta sección y las
  siguientes documentan el trabajo realizado en su lugar.

## Deuda técnica corregida: doble registro de progreso bajo React.StrictMode

El riesgo documentado tras SPEC-003 (`recordAnswer` dentro del updater de
`setSession`, potencialmente duplicado por `React.StrictMode` en
desarrollo) se corrigió antes de empezar SPEC-004. El mismo patrón seguro
(efectos secundarios en el cuerpo del callback, nunca dentro de un
updater) se ha mantenido al añadir `appendExamAttempt` en `finishExam`;
ver `tests/use-quiz-strictmode.test.tsx`, que ahora también comprueba que
un examen finalizado una sola vez genera exactamente una entrada en el
historial.

## Qué funciona hoy

- **Práctica aleatoria**: preguntas mezcladas de todo el temario, sin
  límite, con feedback inmediato (correcto/incorrecto + explicación +
  página fuente) tras cada respuesta, y ahora un botón para marcar/
  desmarcar la pregunta como favorita directamente desde el feedback. Al
  agotar el conjunto, se reinicia con una nueva mezcla (modo "sin fin").
- **Estudiar por bloque**: selector modal de los 6 bloques del Tema 2;
  lanza una práctica filtrada a ese bloque.
- **Repaso de fallos**: lista, pregunta a pregunta, el bloque, la
  dificultad y el enunciado de cada pregunta fallada pendiente, con opción
  de marcarla como favorita y de iniciar una ronda de práctica solo con
  ellas. Una pregunta sale de esta lista en cuanto se responde
  correctamente (comportamiento heredado de SPEC-001, sin cambios).
- **Favoritas** (nuevo): página propia con el número total de favoritas,
  bloque, dificultad y enunciado de cada una, acción para quitarla y
  botón para practicar solo las favoritas. Se puede marcar/desmarcar desde
  Practice, Repaso de fallos y los resultados de un examen (en las
  preguntas falladas). Solo se guardan IDs (`favorites: string[]` en
  `ProgressState`); si un ID favorito dejara de existir en el banco,
  simplemente no aparece (sin romper la página).
- **Modo examen**: configurable desde la Home (número de preguntas
  10/20/30/50, uno o varios bloques o todo el tema, una o varias
  dificultades o todas). Selección aleatoria sin duplicados, con las
  opciones de cada pregunta también mezcladas. Durante el examen no hay
  feedback ni se revela la respuesta correcta; se puede navegar libremente
  con «Anterior»/«Siguiente» y cambiar de respuesta en cualquier momento
  antes de finalizar. Al pulsar «Finalizar examen» con preguntas sin
  responder, se avisa (con el número exacto) antes de corregir. La
  corrección es diferida y de una sola vez; la pantalla de resultados
  muestra aciertos, fallos, porcentaje, nota sobre 10, desglose por bloque
  cuando el examen abarca más de uno, y el listado completo de preguntas
  falladas con la respuesta elegida, la correcta, la explicación y la
  opción de guardarlas como favoritas.
- **Historial de exámenes** (nuevo): cada examen finalizado añade un
  resumen (fecha, preguntas, aciertos, fallos, nota, bloques y
  dificultades reales del examen) al historial, visible en Estadísticas,
  más reciente primero, limitado a los últimos 20 intentos.
- **Estadísticas** (rediseñada): resumen global, progreso del banco
  ("Has visto X de Y preguntas" / "Z% explorado", basado en preguntas
  únicas, no en respuestas), rendimiento por los 6 bloques (siempre
  visibles, también con 0 respuestas), puntos débiles (bloques con al
  menos 5 respuestas y menos del 70% de acierto), y los últimos exámenes.
  Reinicio de progreso con confirmación explícita de qué se borra.
- **Persistencia real en `localStorage`**: respondidas, aciertos, fallos,
  preguntas únicas vistas, preguntas falladas, favoritos, historial de
  exámenes, estadísticas por tema y por dificultad. Progreso guardado por
  una versión anterior de la app (sin estos campos nuevos) se normaliza al
  cargar en lugar de romper la aplicación o perderse.

## Arquitectura

Capas separadas según CLAUDE.md, sin cambios de fondo respecto a
SPEC-001/003:

- `src/domain/` — tipos y funciones puras sin dependencias externas:
  - `question.ts` — modelo de pregunta.
  - `quiz.ts` — sesión de cuestionario, corrección, puntuación, y (nuevo)
    `ExamAttempt` + `buildExamAttempt(session, id, timestamp)` para
    construir el resumen de un examen a partir de una sesión ya corregida
    (`id`/`timestamp` se reciben como parámetros para que la función siga
    siendo pura).
  - `progress.ts` — modelo de progreso y toda su lógica de agregación
    (ver "Modelo de progreso" más abajo). Sin mutación.
- `src/utils/` — `shuffle.ts`, `questionFilters.ts`, `questionValidation.ts`
  (sin cambios en esta iteración).
- `src/services/`:
  - `questionService.ts`, `quizService.ts` (+ `buildFavoritesSession`,
    análoga a `buildMistakesSession`), `storageService.ts` — sin cambios
    de fondo.
  - `progressService.ts` (nuevo) — único punto donde el progreso guardado
    se cruza con el banco de preguntas (`questionService`) y la lista de
    bloques (`data/topics`) para producir `getProgressReport(progress)`:
    resumen global, cobertura del banco, estadísticas por bloque y
    bloques débiles. Las funciones de `domain/progress.ts` siguen sin
    importar ni el banco ni los bloques; reciben esos datos como
    parámetros desde aquí.
- `src/store/progressStore.ts` — store externo mínimo (sin librerías
  añadidas), ahora también normaliza el valor leído de `localStorage`
  (`normalizeProgress`) y expone `appendExamAttempt`.
- `src/hooks/`:
  - `useProgress.ts` — además de `progress`, ahora también expone `stats`
    (memoizado con `useMemo`, resultado de `getProgressReport`) y
    `appendExamAttempt`, para que las páginas no computen nada por su
    cuenta.
  - `useQuiz.ts` — **sigue siendo un único hook para Practice, Mistakes,
    Favoritas y Exam**: no existe un `useExam` ni un `useFavorites`
    paralelos. Añade `startFavoritesPractice` (análoga a
    `startMistakesPractice`) y, en `finishExam`, la llamada a
    `appendExamAttempt` justo al lado de `recordAnswer`, en el cuerpo del
    callback (nunca dentro de un updater de `setSession`).
- `src/components/` y `src/pages/` — solo presentación:
  - `components/quiz/FavoriteToggle.tsx` (nuevo) — botón reutilizado en
    `QuestionFeedback`, `MistakesPage`, `FavoritesPage` y `ResultsPage`.
  - `pages/FavoritesPage.tsx` (nuevo), `pages/MistakesPage.tsx`
    (reescrita a lista por pregunta), `pages/ResultsPage.tsx` (+ favorito
    por pregunta fallada), `pages/StatisticsPage.tsx` (reescrita, 5
    secciones), `pages/HomePage.tsx` (+ tarjeta «Favoritas», reutiliza
    `stats.global.accuracy` en vez de recalcularlo).
  - `data/topics.ts` — nuevas funciones `getTopicName(id)` y
    `formatTopicNames(ids)`, usadas por `ResultsPage`, `MistakesPage`,
    `FavoritesPage` y `StatisticsPage` para no duplicar ese lookup.

No se han añadido dependencias de gestión de estado ni de enrutado; la
navegación sigue resolviéndose con un `switch` de estado local en
`App.tsx` (ahora con una vista `favorites` más).

## Modelo de progreso

`ProgressState` (en `domain/progress.ts`) se amplió de forma aditiva,
respetando los campos y nombres ya existentes:

```ts
interface ProgressState {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  mistakes: string[];        // sin cambios
  favorites: string[];       // ya existía desde SPEC-001; se usó tal cual
  seenQuestionIds: string[]; // NUEVO: IDs únicos de preguntas respondidas al menos una vez
  examHistory: ExamAttempt[]; // NUEVO: resúmenes de examen, más reciente primero, máx. 20
  byTopic: Record<string, { answered: number; correct: number }>;
  byDifficulty: Record<Difficulty, { answered: number; correct: number }>;
}
```

Decisiones de diseño relevantes:

- **`seenQuestionIds` es la única fuente de verdad para "vistas únicas"**,
  tanto a nivel global como por bloque. Las estadísticas por bloque
  (`getTopicProgressStats`) NO guardan su propio array de IDs vistos por
  bloque: lo derivan cruzando `seenQuestionIds` con las preguntas del
  banco que pertenecen a ese bloque (recibidas como parámetro desde
  `progressService`). Así se evita, tal como pedía la consigna, tener
  "varios arrays que representen la misma información".
- **`ExamAttempt` no guarda las preguntas ni las respuestas del examen**,
  solo el resumen (id, fecha, nº preguntas, aciertos, fallos, nota,
  bloques y dificultades reales). Tampoco guarda un campo "porcentaje"
  aparte: es `grade * 10` y se deriva en la UI, porque guardarlo aparte
  sería puramente redundante con `grade`.
- **Los bloques/dificultades de un `ExamAttempt` se derivan de las
  preguntas reales del examen finalizado**, no de la configuración
  solicitada al iniciarlo. Si se pide "todo el tema" pero el examen
  aleatorio termina sin ninguna pregunta de un bloque concreto, el
  historial refleja lo que realmente se examinó, no la intención.
- **Favoritos sigue siendo un `toggleFavorite` único** (añade si no está,
  quita si ya está), como ya existía; no se separó en `addFavorite`/
  `removeFavorite` porque no aportaba nada y la consigna pedía respetar lo
  existente. Internamente usa un `Set`, por lo que es imposible acabar con
  IDs duplicados aunque el estado de partida ya viniera corrupto con
  duplicados (cubierto por test).

## Estadísticas disponibles

Todas centralizadas en `domain/progress.ts` (puras) + `services/progressService.ts`
(las cruza con el banco/bloques), nunca calculadas en JSX:

- `getGlobalProgressStats(progress)` — respondidas, aciertos, fallos,
  precisión global (0 si `totalAnswered === 0`, nunca `NaN`).
- `getBankCoverage(progress, totalEnBanco)` — preguntas únicas vistas,
  total del banco, % explorado.
- `getTopicProgressStats(progress, todasLasPreguntas, idsDeBloques)` — por
  cada bloque (siempre los 6, aunque tengan 0 respuestas): respondidas,
  aciertos, fallos, precisión, vistas únicas, total disponible, %
  explorado del bloque.
- `getWeakTopics(topicStats)` — bloques débiles (ver criterio abajo),
  calculados a partir del resultado anterior para no repetir la división.

## Criterio de puntos débiles

Centralizado como constantes en `domain/progress.ts`, no en la UI:

```ts
export const WEAK_TOPIC_MIN_ANSWERS = 5;
export const WEAK_TOPIC_MAX_ACCURACY = 70; // porcentaje
```

Un bloque se marca como débil si tiene **al menos 5 respuestas
registradas** y su **porcentaje de acierto es inferior al 70%**. Con
menos de 5 respuestas, nunca se marca como débil aunque el acierto
parcial sea bajo (muestra insignificante). No existía un
`SPEC-004-progress.md` con un criterio propio que respetar, así que se
aplicó tal cual el criterio acordado con el usuario en la propia
consigna. Si no hay bloques débiles, la UI muestra explícitamente "No hay
suficientes datos o no se han detectado bloques débiles." en lugar de
ocultar la sección.

## Favoritos: funcionamiento

Marcar/desmarcar disponible desde: el feedback de Practice (incluye
Mistakes y Favoritas, que reutilizan el mismo componente), la lista de
Repaso de fallos, la lista de Favoritas y el listado de preguntas
falladas en los resultados de un examen. Se decidió no forzarlo también
en la pantalla activa del examen (sin feedback visible, encajaba peor) ni
en cada pregunta de Practice antes de responder (se añade complejidad sin
necesidad real). Practicar favoritas es una ronda acotada (como Mistakes,
no "sin fin"): al terminarla se muestra el resumen genérico
(`QuizResults`, "Ronda completada").

## Repaso de fallos: funcionamiento

Comportamiento de fondo sin cambios: una pregunta entra en `mistakes` al
fallarla y sale en cuanto se responde correctamente (`recordAnswer` en
`domain/progress.ts`, intacto). Lo que cambia es la presentación:
`MistakesPage` pasó de mostrar solo un recuento por bloque a listar cada
pregunta pendiente (bloque, dificultad, enunciado) con su propio botón de
favorito, más el botón para iniciar la ronda de repaso. Sigue siendo la
misma fuente de verdad (`progress.mistakes`), sin un segundo almacén.

## Historial de exámenes: funcionamiento

Se guarda **una sola vez**, exactamente cuando `finishExam` corrige el
examen (no al abrir Exam, no por pregunta, no al navegar, no al volver a
`ResultsPage`, y no dos veces bajo `React.StrictMode`: el registro ocurre
en el cuerpo del callback de `finishExam`, nunca dentro del updater de
`setSession`, siguiendo el mismo patrón ya corregido para `recordAnswer`).
`finishExam` además está protegido por `if (!session || isSessionComplete(session)) return;`,
así que una segunda llamada — por doble clic o cualquier otra causa — no
hace nada.

El límite de 20 intentos está centralizado en
`MAX_EXAM_HISTORY = 20` (`domain/progress.ts`); `appendExamAttempt`
antepone el intento nuevo y recorta el array a ese tamaño, así que el
historial queda siempre ordenado de más reciente a más antiguo y nunca
crece sin límite.

## Compatibilidad con progreso antiguo

`domain/progress.ts` exporta `normalizeProgress(raw: unknown): ProgressState`,
que `progressStore.ts` aplica a cualquier valor leído de `localStorage`
(incluida su ausencia total o un JSON corrupto, que `storageService` ya
convierte en `null`). Cada campo se valida por separado y, si falta o
tiene una forma inesperada, se sustituye por su valor vacío
(`createEmptyProgress()`), **sin descartar el resto del progreso real que
sí sea válido** (p. ej., un progreso guardado antes de `SPEC-004` sin
`favorites` ni `examHistory` conserva intactos `totalAnswered`,
`mistakes`, `byTopic`, etc., y solo esos dos campos nuevos se inicializan
a `[]`). Cubierto por `tests/progress-domain.test.ts` y, a nivel de
integración real con `localStorage`, por `tests/progress-store.test.ts`.

## Archivos creados/modificados

**Nuevos**: `src/services/progressService.ts`, `src/components/quiz/FavoriteToggle.tsx`,
`src/pages/FavoritesPage.tsx`, `tests/progress-domain.test.ts`,
`tests/progress-store.test.ts`.

**Modificados**: `src/domain/quiz.ts` (+ `ExamAttempt`, `buildExamAttempt`,
`"favorites"` en `QuizMode`), `src/domain/progress.ts` (reescrito: nuevos
campos, `normalizeProgress`, estadísticas, puntos débiles, historial),
`src/data/topics.ts` (+ `getTopicName`, `formatTopicNames`),
`src/services/quizService.ts` (+ `buildFavoritesSession`),
`src/store/progressStore.ts` (normalización al cargar, +
`appendExamAttempt`), `src/hooks/useProgress.ts` (+ `stats`,
`appendExamAttempt`), `src/hooks/useQuiz.ts` (+ `startFavoritesPractice`,
historial en `finishExam`), `src/components/quiz/QuestionFeedback.tsx`
(+ favorito), `src/pages/QuizPage.tsx` (+ modo `favorites`, `onRestart`
consciente del modo — antes reiniciaba siempre Mistakes, ahora también
funciona para Favoritas), `src/pages/MistakesPage.tsx` (reescrita),
`src/pages/ResultsPage.tsx` (+ favorito por pregunta fallada, usa
`getTopicName` compartido), `src/pages/StatisticsPage.tsx` (reescrita),
`src/pages/HomePage.tsx` (+ tarjeta Favoritas), `src/App.tsx` (+ vista
`favorites`), `tests/use-quiz-strictmode.test.tsx` (+ aserciones sobre
`examHistory`).

## Tests ejecutados

```
corepack pnpm test
```

**63 tests, 6 archivos, todos en verde**:

- `tests/quiz-engine.test.ts` (6) — sin cambios.
- `tests/question-validation.test.ts` (5) — sin cambios.
- `tests/exam-mode.test.ts` (18) — sin cambios.
- `tests/use-quiz-strictmode.test.tsx` (4) — ampliado: ahora también
  comprueba que un examen finalizado genera exactamente una entrada en
  `examHistory`, y que llamarlo dos veces no la duplica.
- `tests/progress-domain.test.ts` (25, nuevo) — estadísticas globales
  (incluyendo el caso de 0 respuestas sin `NaN`), preguntas únicas vistas
  (una pregunta respondida 8 veces cuenta 1 vez como vista), cobertura del
  banco, estadísticas por bloque (incluye bloques con 0 respuestas),
  puntos débiles (bloque con <5 respuestas nunca es débil; bloque con >=5
  y <70% sí lo es; bloque con acierto exactamente 70% no lo es; orden de
  peor a mejor; el caso límite 69.5% real que redondearía a 70% mostrado
  sigue marcándose débil), favoritos (añadir, eliminar, no duplicar ni con
  estado de partida corrupto), historial de examen (añadir, orden más
  reciente primero, límite de 20, el intento 21 descarta el más antiguo),
  `normalizeProgress` (sin datos, sin favoritos/historial, objeto mínimo
  muy antiguo, JSON inesperado como array/string/número), y reset
  completo (`createEmptyProgress` no deja rastro de nada previo).
- `tests/progress-store.test.ts` (5, nuevo, `jsdom`) — persistencia real:
  `toggleFavorite` escribe en `localStorage` de inmediato; el progreso
  persiste entre "sesiones" (reimportando el store con `vi.resetModules()`,
  ya que `localStorage` de `jsdom` sí persiste entre imports); un progreso
  antiguo guardado sin `favorites`/`examHistory` se carga sin romperse;
  `resetProgress` limpia por completo tanto el estado en memoria como lo
  guardado en `localStorage`, y notifica a los suscriptores; el reset
  nunca toca otras claves de `localStorage` ajenas al progreso.

## Validación manual realizada

Además de los tests automatizados, se recorrió la aplicación real con
Chromium headless (`puppeteer-core`, instalado solo temporalmente fuera
del proyecto, en el directorio de scratchpad, para no añadirlo como
dependencia — se descartó tras la comprobación):

- **Practice**: responder una pregunta, comprobar que aparece el feedback
  y el botón de favorito, marcarla como favorita, avanzar a la siguiente.
- **Favoritas**: la Home refleja el nuevo recuento; abrir la página de
  Favoritas muestra la pregunta guardada con su bloque/dificultad;
  «Practicar favoritas» arranca correctamente una ronda.
- **Exam**: completar un examen de 10 preguntas de principio a fin;
  comprobar la pantalla de resultados con la nota.
- **Statistics**: las 5 secciones presentes (resumen global, progreso del
  banco con la frase "Has visto X de Y preguntas del banco", rendimiento
  por bloque mostrando los 6 bloques con nombre completo, puntos débiles,
  últimos exámenes); el examen recién completado aparece **exactamente
  una vez** en "Últimos exámenes".
- **Reset**: el modal de confirmación aparece antes de borrar; tras
  confirmar, el historial de exámenes y el recuento de favoritas vuelven
  de inmediato a su estado vacío.

Cero errores de página (`pageerror`) y cero errores de consola aparte del
404 preexistente de `/favicon.ico` (ver riesgos).

## Pendiente / fuera de alcance de esta iteración

- No se ha verificado responsividad en dispositivo móvil real, solo
  mediante las clases responsive de Tailwind aplicadas a cada componente.
- **Ampliación futura del banco**: sigue en 100 preguntas, tal como pedía
  esta iteración explícitamente («No amplíes ahora el banco»).
- **Exam: sin persistencia de un examen a medias.** Si se recarga la
  página durante un examen en curso, se pierde (las respuestas
  provisionales viven en estado de React, no en `localStorage`). No
  estaba pedido y se documenta como limitación conocida.
- **Exam: sin límite de tiempo.** No se pidió temporizador.
- **Sin recomendaciones "inteligentes"**: puntos débiles es una lista
  filtrada y ordenada por un criterio simple y fijo, tal como pedía la
  consigna («no inventes IA ni algoritmos complejos»).

## Riesgos y limitaciones detectados

- El entorno de ejecución no tiene `npm`; cualquier automatización futura
  debe usar `pnpm` vía Corepack o instalar `npm` explícitamente.
- `sourcePage` usa la numeración de página que devuelve el lector de PDF
  usado en esta sesión (1 = portada), un número por delante del pie de
  página impreso en cada diapositiva.
- La detección de duplicados de preguntas solo compara el enunciado
  exacto, no duplicados semánticos.
- Algunas preguntas de opción múltiple tienen 4 de 5 opciones correctas
  (formato válido pero con menor dificultad de descarte); señalado por
  transparencia, no es un defecto.
- Hay una petición a `/favicon.ico` que devuelve 404 en consola;
  preexistente desde SPEC-001 (`index.html` nunca declaró un favicon), no
  corregido por ser cosmético y ajeno al alcance de las últimas
  iteraciones.
- ~~Riesgo de doble registro de progreso bajo `React.StrictMode`~~ —
  corregido antes de SPEC-004, y verificado que sigue corregido también
  para el nuevo registro del historial de exámenes.
- Las opciones de cada pregunta de examen se mezclan de nuevo en cada
  examen nuevo; intencionado.
- `getWeakTopics` compara el criterio de "menos del 70% de acierto"
  contra el ratio exacto (`correct/answered`), no contra el porcentaje ya
  redondeado a entero que se muestra en la UI. Se detectó durante la
  redacción de este documento que la primera versión sí comparaba contra
  el valor redondeado (p. ej. 69.5% real redondea a 70%, que ya no es
  "< 70", dejando escapar un bloque realmente débil); se corrigió antes
  de cerrar la tarea y se añadió un test específico para ese límite
  (`tests/progress-domain.test.ts`, caso 139/200 = 69.5%). Los porcentajes
  mostrados en pantalla siguen redondeados a entero, solo el criterio
  interno usa la precisión exacta.

## Siguiente paso recomendado

Con SPEC-001, SPEC-003, SPEC-004 y SPEC-005 completadas, no queda ningún
bloque funcional grande pendiente de las specs numeradas originalmente
(SPEC-002, motor de preguntas, ya quedó cubierto en la práctica por el
trabajo de SPEC-001/003). Recomendación: **pulir en base a uso real**
antes de añadir alcance nuevo — usar la app para estudiar de verdad,
detectar fricciones o preguntas ambiguas, y corregir puntualmente. Si se
quiere alcance nuevo deliberadamente, las opciones más naturales sobre la
arquitectura actual, de menor a mayor esfuerzo, son: exportar/importar el
progreso como JSON (útil para cambiar de navegador sin backend), un
temporizador opcional en Exam, y una vista de "favoritos" filtrable por
bloque.
