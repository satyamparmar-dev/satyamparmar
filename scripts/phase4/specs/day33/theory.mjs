export const theoryTitle = "Pattern matching and switch expressions";

export const theoryBase = `### Plain-language overview

**Pattern matching** combines type test and binding. **Switch expressions** return values and can use **arrow cases** with exhaustiveness checks when combined with sealed types.

**Interview angle:** pattern variables are final and scoped to case.

### instanceof patterns

\`if (o instanceof String s)\` binds s in true branch—no separate cast.

### Switch expression

Yields value; compiler checks exhaustiveness for enums and sealed hierarchies; **default** sometimes required.

### Guarded patterns

\`case String s when s.length()>0\` adds boolean guard (modern Java).

### Null handling

Switch can include **case null** explicitly in newer versions—avoid silent NPE surprises.

### Records in switch

Deconstruct record components in case labels when supported.

### Fall-through vs arrows

Arrow cases avoid accidental fall-through; traditional colon style still exists.

### Compiler vs runtime

Patterns are compile-time rich; still respect erasure limits on generics.

### Production angle

Prefer clarity: pattern switches reduce instanceof chains in business routers.

### 60-second story

“I replace instanceof+cast with patterns. I use switch expressions for routing. I handle null explicitly. I keep sealed types exhaustive. I avoid cramming business logic into giant switches without helpers.”
`;
