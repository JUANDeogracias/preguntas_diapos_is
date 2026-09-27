# Preguntas IS

## Objetivo

Construir una aplicación web local de estudio para la asignatura
Ingeniería del Software.

La aplicación estará inicialmente centrada exclusivamente en:

Tema 2: El proceso de desarrollo del software.
Paradigmas o modelos de desarrollo del Software.

La fuente académica principal es:

docs/source/TEMA_2.pdf

NO se debe introducir contenido académico que no pueda justificarse
mediante dicha fuente, salvo que el usuario lo solicite expresamente.

---

# Objetivo académico

La aplicación debe permitir dominar el Tema 2 a nivel de examen tipo test.

Las preguntas deben comprobar:

- comprensión
- memoria
- diferencias entre conceptos
- identificación de modelos
- características
- ventajas e inconvenientes
- fases
- situaciones de aplicación
- relaciones entre conceptos
- excepciones
- detalles susceptibles de aparecer en un examen

Evitar preguntas excesivamente evidentes.

Los distractores deben ser plausibles.

---

# Bloques del Tema 2

El banco de preguntas debe cubrir de forma equilibrada:

1. Procesos en el Ciclo de Vida del Software
2. Paradigmas o Modelos de Desarrollo del Software
3. Modelos Tradicionales de Desarrollo de Software
4. Proceso Unificado de Desarrollo
5. Modelos Ágiles de Desarrollo de Software
6. DevOps y la Integración Continua

No generar cientos de preguntas de un bloque mientras otros quedan
sin cobertura.

---

# Stack tecnológico

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS

Persistencia:

- localStorage

No crear backend salvo que sea solicitado explícitamente.

---

# Arquitectura

Separar:

- UI
- lógica de dominio
- datos
- persistencia
- banco de preguntas

Los componentes React no deben contener directamente lógica compleja
de selección o evaluación de preguntas.

---

# Banco de preguntas

Las preguntas se almacenan en:

src/data/questions/

Cada bloque temático tendrá su propio fichero.

Una pregunta debe incluir al menos:

- id
- topic
- subtopic
- difficulty
- type
- question
- options
- correctAnswers
- explanation
- sourcePage
- tags

---

# Tipos

Tipos iniciales:

- single-choice
- multiple-choice

True/false puede añadirse posteriormente.

---

# Calidad del contenido

Todas las preguntas deben:

1. estar sustentadas por TEMA_2.pdf
2. tener respuesta inequívoca
3. incluir explicación
4. tener distractores plausibles
5. evitar duplicados
6. evitar reformular repetidamente la misma pregunta
7. incluir sourcePage
8. utilizar terminología del documento

Si una afirmación no puede verificarse en el PDF, NO generar la
pregunta.

---

# Dificultad

easy:
recuerdo directo de conceptos.

medium:
requiere comprender diferencias o relaciones.

hard:
opciones próximas entre sí, escenarios, comparación de modelos,
características específicas o confusiones habituales.

Priorizar medium y hard.

---

# Modos de estudio

La aplicación debe soportar:

## Practice
Preguntas sin límite y feedback después de cada respuesta.

## Exam
Número configurable de preguntas.
No mostrar respuestas hasta terminar.

## Mistakes
Preguntas falladas anteriormente.

## Topic
Preguntas únicamente de un bloque seleccionado.

## Random
Preguntas mezcladas de todo el Tema 2.

---

# UX

Diseño:

- limpio
- moderno
- oscuro
- similar a una plataforma profesional de aprendizaje
- altamente legible
- responsive

El objetivo principal es estudiar durante sesiones largas.

No sobrecargar visualmente la interfaz.

---

# Progreso

Guardar en localStorage:

- preguntas contestadas
- aciertos
- fallos
- preguntas falladas
- favoritos
- estadísticas por tema
- estadísticas por dificultad

---

# Regla crítica

Antes de realizar cambios importantes:

1. leer PROJECT_STATE.md
2. leer la SPEC correspondiente
3. implementar
4. ejecutar tests
5. actualizar PROJECT_STATE.md

No modificar arquitectura fundamental sin justificarlo.

---

# Definition of Done

Una tarea no se considera terminada hasta que:

- TypeScript compile
- la aplicación arranque
- tests pasen
- no haya errores visibles en consola
- se haya actualizado PROJECT_STATE.md