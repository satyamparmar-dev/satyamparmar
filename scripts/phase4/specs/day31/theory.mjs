export const theoryTitle = "Optional and modern Java APIs";

export const theoryBase = `### Plain-language overview

**Optional<T>** models absent values without null. It is **not** a general collections replacement—misuse turns Optional into a second null. Interviews probe **map/flatMap/filter**, **orElse** vs **orElseGet**, and **orElseThrow**.

**Interview angle:** Optional is for return types and chain exits—not for fields or parameters usually.

### Creation

| Factory | Use |
| --- | --- |
| of(value) | Non-null required |
| ofNullable | Maybe null |
| empty | Absent |

### map vs flatMap

**map** wraps result in Optional; **flatMap** avoids nested Optional.

### orElse vs orElseGet

**orElse** evaluates argument eagerly; **orElseGet** Supplier defers cost.

### ifPresent vs ifPresentOrElse

Side-effect style; prefer returning values when possible.

### Stream bridge

**optional.stream()** gives 0/1 stream—useful in flatMap pipelines.

### Modern APIs

**String** lines/isBlank, **List.of**, **Files.readString**—reduce ceremony.

### JSON and DTOs

Optional fields controversial—frameworks may not support well.

### Production angle

Do not use Optional in entity fields persisted to JPA without care.

### 60-second story

“I use Optional for clear absent semantics in returns. I chain map/flatMap. I pick orElseGet for lazy defaults. I avoid Optional fields. I combine with stream() for fluent pipelines.”
`;
