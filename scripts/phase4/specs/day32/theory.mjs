export const theoryTitle = "Java 17 records and sealed classes";

export const theoryBase = `### Plain-language overview

**Records** are transparent carriers for data: immutable components, generated accessors, equals/hashCode/toString, and canonical constructor. **Sealed** types restrict which classes may implement or extend them, enabling **exhaustive** pattern matching.

**Interview angle:** records are not JavaBeans; do not expect setters.

### Record components

| Feature | Behavior |
| --- | --- |
| Accessors | name() not getName |
| Immutability | Final fields |
| Validation | Compact constructor |

### Sealed class or interface

**permits** lists allowed subclasses; subclasses must be final, sealed, or non-sealed.

### Exhaustive switch

Compiler ensures all permitted subtypes handled—refactor-friendly.

### Serialization

Records Serializable cautiously—component-wise state.

### Domain modeling

Value objects: Money, Point, IDs—great fit.

### JPA

Records as entities debated—often DTOs not entities.

### Production angle

Use records for commands/events in clean architectures.

### 60-second story

“I model immutable DTOs with records. I seal hierarchies for closed domains. I rely on exhaustive switches for business rules. I validate in compact constructors. I avoid abusing records for services.”
`;
