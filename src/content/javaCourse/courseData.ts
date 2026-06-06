// ─── Java Modern Features Complete Course ─────────────────────────────────────
// 6 phases · 19 lessons · ~20 hours

export type SectionType = 'why' | 'analogy' | 'concept' | 'code' | 'task' | 'summary';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CourseSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
}

export interface CourseLesson {
  id: string;
  phase: number;
  lesson: number;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: Difficulty;
  tags: string[];
  sections: CourseSection[];
  checkpoints: string[];
}

export interface CoursePhase {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalDuration: string;
}

// ─── Phases ───────────────────────────────────────────────────────────────────

export const COURSE_PHASES: CoursePhase[] = [
  {
    number: 1,
    id: 'phase-1',
    title: 'Why Modern Java Exists',
    subtitle: 'Context & Big Picture — No code yet',
    description: 'Understand what was wrong with Java before Java 8 and why the language had to change. Learn the difference between imperative and declarative style using plain English and everyday analogies — before writing a single line of code.',
    icon: '☕',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    totalDuration: '2 hours',
  },
  {
    number: 2,
    id: 'phase-2',
    title: 'Lambdas & Functional Interfaces',
    subtitle: 'Beginner Coding — Your first Java 8 code',
    description: 'Write your first lambda expression and master the four core functional interfaces: Predicate, Function, Consumer, and Supplier. Each explained with a real-world analogy and hands-on code from the actual source files.',
    icon: 'λ',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    totalDuration: '5 hours',
  },
  {
    number: 3,
    id: 'phase-3',
    title: 'The Streams API',
    subtitle: 'Intermediate Coding — The conveyor belt',
    description: 'Use Java Streams to process collections of data cleanly without messy for-loops. Master filter, map, flatMap, collect, reduce, and advanced collectors like groupingBy and partitioningBy — step by step.',
    icon: '🌊',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    totalDuration: '5 hours',
  },
  {
    number: 4,
    id: 'phase-4',
    title: 'Optional — Safe Null Handling',
    subtitle: 'Intermediate — Stop crashing on null',
    description: 'Stop writing null checks everywhere. Learn how Optional wraps values safely, how to chain transformations, and the golden rule that prevents NoSuchElementException. Break things on purpose, then fix them.',
    icon: '📦',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)',
    totalDuration: '2 hours',
  },
  {
    number: 5,
    id: 'phase-5',
    title: 'Java 9–17 Superpowers',
    subtitle: 'Intermediate+ — What modern teams use daily',
    description: 'Learn the features modern companies use every day: var, Records, pattern matching instanceof, sealed classes, switch expressions, and quality-of-life improvements to Strings, Streams, and Optional.',
    icon: '🚀',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    totalDuration: '3 hours',
  },
  {
    number: 6,
    id: 'phase-6',
    title: 'Build Like a Senior Engineer',
    subtitle: 'Enterprise Real-World — Interview ready',
    description: 'Walk through a production-level OrderProcessingService and see every Java 8 feature working together. Then tackle the production scenarios interviewers love: OutOfMemoryError, Deadlock, and Connection Pool exhaustion. Finish with 20 interview Q&As.',
    icon: '🏗️',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    totalDuration: '3 hours',
  },
];

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const COURSE_LESSONS: CourseLesson[] = [

  // ── Phase 1 ──────────────────────────────────────────────────────────────────

  {
    id: 'p1-l1',
    phase: 1,
    lesson: 1,
    title: 'The Problem with Old Java',
    subtitle: 'Why Java before Java 8 felt heavy, and what had to change',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['java-history', 'boilerplate', 'anonymous-class'],
    checkpoints: [
      'In your own words, what is "boilerplate code"? Give a real-life example.',
      'Why was sorting a list in Java 7 so much more code than it should be?',
      'What is an anonymous class and why did Java 8 replace it with lambdas?',
    ],
    sections: [
      {
        id: 'p1-l1-why',
        type: 'why',
        title: 'Why This Matters',
        content: `Before Java 8, writing even simple tasks required a surprising amount of code. You had to write full class definitions just to say "sort these names alphabetically." You had to write for-loops that mixed *what* you wanted with *how* to get it.

Understanding **why** Java changed is more important than memorising syntax. When you know the pain Java 8 solved, every new feature will make perfect sense.`,
      },
      {
        id: 'p1-l1-analogy',
        type: 'analogy',
        title: 'The Recipe Book Problem',
        content: `> Imagine you want a cup of tea. In old Java, someone hands you a 10-step recipe: "Walk to kitchen. Open cupboard. Pick up kettle. Fill kettle with exactly 300ml of water. Place kettle on element. Wait for red light. Open drawer. Remove teabag…" — when all you wanted to say was: **"Make me a cup of tea."**

Old Java forced you to spell out every step, every time, even when the steps were obvious. Java 8 said: *just tell me what outcome you want, and I'll figure out the steps.*`,
      },
      {
        id: 'p1-l1-concept',
        type: 'concept',
        title: 'What Was Wrong: Boilerplate and Anonymous Classes',
        content: `**"Boilerplate"** [code you write not because it adds value, but because the language forces you to] was the main complaint about Java before Java 8.

Here is a real example. In Java 7, sorting a list of names required this:

\`\`\`java
// Java 7 — sorting a list of names
List<String> names = Arrays.asList("Charlie", "Alice", "Bob");

Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});
\`\`\`

Look at how much code surrounds the one idea that matters: **\`a.compareTo(b)\`**. Everything else is ceremony — \`new Comparator<String>()\`, \`@Override\`, \`public int compare\` — just to satisfy the compiler.

This ceremony is called an **"anonymous class"** [a class you define inline without giving it a name, just to implement one method]. It was the only way before Java 8 to pass behaviour (like "how to compare two things") as a value.

Java 8 brought **"lambdas"** [short, nameless functions written inline] that collapsed this to one line:

\`\`\`java
// Java 8 — same sort, one line
names.sort((a, b) -> a.compareTo(b));
\`\`\`

Or even shorter using a method reference:

\`\`\`java
names.sort(String::compareTo);
\`\`\`

Same result. A fraction of the code.`,
      },
      {
        id: 'p1-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `Java before Java 8 required **anonymous classes** — full class definitions — just to pass a simple behaviour like "compare two strings." This produced excessive **boilerplate code** that buried the actual intent under ceremony. Java 8 introduced **lambdas** to eliminate that ceremony and let you write what you mean directly.`,
      },
    ],
  },

  {
    id: 'p1-l2',
    phase: 1,
    lesson: 2,
    title: 'Imperative vs Declarative — Think Different',
    subtitle: 'The mental model shift that makes Java 8 click',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['imperative', 'declarative', 'mental-model'],
    checkpoints: [
      'Describe imperative style in one sentence using the GPS analogy.',
      'Describe declarative style in one sentence using the taxi analogy.',
      'Look at a Java for-loop and a Stream pipeline side by side — which is imperative and which is declarative?',
    ],
    sections: [
      {
        id: 'p1-l2-why',
        type: 'why',
        title: 'Why This Matters',
        content: `Java 8 is not just a syntax upgrade — it is a **different way of thinking**. If you try to learn Streams and lambdas without understanding this mental shift, you will always feel like you are fighting the language.

Once you see the difference between *imperative* and *declarative* style, modern Java will feel natural rather than confusing.`,
      },
      {
        id: 'p1-l2-analogy',
        type: 'analogy',
        title: 'GPS Directions vs "Take Me to the Airport"',
        content: `> **Imperative** is like giving someone turn-by-turn GPS directions: "Leave the driveway. Turn left on Oak Street. Drive 200 metres. Turn right at the traffic light. Merge onto the motorway…" — you are describing *every step of the journey*.

> **Declarative** is like telling a taxi driver: **"Take me to the airport."** You state the *destination* and let the driver figure out the route. You do not care how — you just want the outcome.

Imperative code describes *how* to achieve a result, step by step. Declarative code describes *what* result you want and lets the language/runtime figure out the steps.`,
      },
      {
        id: 'p1-l2-concept',
        type: 'concept',
        title: 'Imperative vs Declarative — Side by Side',
        content: `Here is the same task in both styles. Goal: get the names of all employees with salary greater than 50,000.

**Imperative (old style — Java 7):**

\`\`\`java
List<String> highEarners = new ArrayList<>();
for (Employee emp : employees) {
    if (emp.getSalary() > 50000) {
        highEarners.add(emp.getName());
    }
}
\`\`\`

You are telling the computer: create a list, loop through employees, check condition, add to list. Step by step.

**Declarative (Java 8 style):**

\`\`\`java
List<String> highEarners = employees.stream()
    .filter(emp -> emp.getSalary() > 50000)
    .map(Employee::getName)
    .collect(Collectors.toList());
\`\`\`

You are saying: *from employees, keep those earning over 50k, take their names, collect into a list.* You describe the **what**, not the **how**.

**Key benefits of declarative style:**
- **Easier to read** — the code reads like a sentence describing the goal
- **Less error-prone** — no manual index management, no risk of off-by-one bugs
- **Parallelisable** — the runtime can run it in parallel with almost no code change
- **Composable** — operations chain naturally, like links in a pipe

Neither style is always better for every situation. But for data processing tasks — filtering, mapping, grouping — declarative wins every time.`,
      },
      {
        id: 'p1-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**Imperative code** describes *how* to achieve something step by step — like giving turn-by-turn directions. **Declarative code** describes *what* outcome you want and lets the language handle the steps — like telling a taxi driver your destination. Java 8 introduced the Streams API to let you write data processing tasks in a clean, readable, declarative style.`,
      },
    ],
  },

  // ── Phase 2 ──────────────────────────────────────────────────────────────────

  {
    id: 'p2-l1',
    phase: 2,
    lesson: 1,
    title: 'Your First Lambda Expression',
    subtitle: 'Write inline behaviour without the anonymous class ceremony',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['lambda', 'anonymous-class', 'functional-interface'],
    checkpoints: [
      'Write a lambda that takes a String and returns its length as an Integer.',
      'What is the difference between `(n) -> n * 2` and `n -> n * 2`? (Trick question — know why.)',
      'What is a "functional interface"? Why must it have exactly one abstract method?',
    ],
    sections: [
      {
        id: 'p2-l1-why',
        type: 'why',
        title: 'Why This Matters',
        content: `**"Lambda"** [a short, nameless function you write inline — like a sticky note instruction instead of a full manual] is the foundation of every Java 8 feature. Streams use lambdas. Optional uses lambdas. Functional interfaces are the type system for lambdas.

Learn this once and every other Java 8 feature will feel familiar.`,
      },
      {
        id: 'p2-l1-analogy',
        type: 'analogy',
        title: 'Sticky Note vs Full Instruction Manual',
        content: `> Before Java 8, passing behaviour required writing a full **instruction manual** (anonymous class): cover page, table of contents, chapter headings, just to say "double this number."

> A **lambda** is a sticky note: you write the instruction directly on the spot — \`n -> n * 2\` — and stick it where it is needed. No cover page. No ceremony. Just the instruction.

A lambda is always one of: \`parameter -> expression\` or \`(param1, param2) -> { body; }\`.`,
      },
      {
        id: 'p2-l1-concept',
        type: 'concept',
        title: 'Lambda Syntax — Anonymous Class vs Lambda',
        content: `A **"functional interface"** [an interface with exactly one abstract method — a single contract] is what makes lambdas work. Java uses the interface's single method as the template for the lambda.

**Old way — anonymous class:**

\`\`\`java
// Java 7: anonymous class to define behaviour
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello from old Java!");
    }
};
\`\`\`

**New way — lambda:**

\`\`\`java
// Java 8: lambda collapses 5 lines to 1
Runnable r = () -> System.out.println("Hello from Java 8!");
\`\`\`

**Lambda syntax rules:**
- \`() -> expression\` — no parameters, returns expression
- \`x -> x * 2\` — one parameter (brackets optional), returns result
- \`(x, y) -> x + y\` — two parameters, returns result
- \`(x) -> { doSomething(); return x; }\` — block body with explicit return

The lambda's shape must match the functional interface's single method signature. Java infers the types from context — you never write the types in the lambda itself.`,
      },
      {
        id: 'p2-l1-code',
        type: 'code',
        title: 'Code: Lambda in Action (from FunctionalInterfacesDemo.java)',
        content: `Here is how the actual source file uses a lambda as a \`Predicate\` to filter a list. Notice how the lambda \`n -> n % 2 == 0\` replaces what would have been a 5-line anonymous class:

\`\`\`java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Lambda stored in a variable — this is a Predicate<Integer>
Predicate<Integer> isEven = n -> n % 2 == 0;

List<Integer> evens = numbers.stream()
    .filter(isEven)
    .collect(Collectors.toList());
System.out.println("Even numbers: " + evens);
// Output: Even numbers: [2, 4, 6, 8, 10]
\`\`\`

**What is happening:**
- \`n -> n % 2 == 0\` — a lambda that takes Integer \`n\` and returns true if \`n\` is even
- \`Predicate<Integer>\` — the functional interface whose single method is \`boolean test(T t)\`
- Java sees the interface, sees one method (\`test\`), and uses the lambda as that method's body`,
      },
      {
        id: 'p2-l1-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Try this — step by step:**

1. Open \`FunctionalInterfacesDemo.java\` and find the \`predicateExamples()\` method.
2. Look at this lambda: \`Predicate<Integer> isEven = n -> n % 2 == 0;\`
3. Without looking at the file, write a Predicate that checks if a number is **greater than 5**.
4. Chain your two predicates with \`.and()\`: \`isEven.and(isGreaterThan5)\`
5. Use it in a \`.filter()\` call and print the results.

**Expected result:** \`[6, 8, 10]\`

**Modification task:** Change the list to include negative numbers. Do the predicates still work correctly?`,
      },
      {
        id: 'p2-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `A **lambda** is a short, nameless function you write inline — replacing the verbose anonymous class ceremony of old Java. Every lambda must match a **functional interface** (one abstract method), and Java infers the types from context so you never spell them out. The syntax is always: \`parameters -> body\`, with optional brackets and braces depending on complexity.`,
      },
    ],
  },

  {
    id: 'p2-l2',
    phase: 2,
    lesson: 2,
    title: 'Predicate — The Truth Tester',
    subtitle: 'Write yes/no functions and chain them together',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['predicate', 'filter', 'functional-interface'],
    checkpoints: [
      'Write a `Predicate<String>` that returns true if a String starts with the letter "A".',
      'How do you combine two Predicates so BOTH must be true? How about EITHER one?',
      'What method on Predicate flips the result from true to false?',
    ],
    sections: [
      {
        id: 'p2-l2-analogy',
        type: 'analogy',
        title: 'The Bouncer at the Door',
        content: `> Imagine a bouncer at a club entrance. His job is simple: look at each person and answer **yes or no** — can this person enter?

> He might check: "Is this person over 18?" or "Is this person on the VIP list?" He takes one input (the person), applies his rule, and gives one output: yes or no.

A **\`Predicate<T>\`** is exactly that bouncer. It takes one value of type T and returns **\`boolean\`** — true (let them in) or false (turn them away). Its single method is \`boolean test(T t)\`.`,
      },
      {
        id: 'p2-l2-code',
        type: 'code',
        title: 'Code: Predicate Examples (from FunctionalInterfacesDemo.java)',
        content: `\`\`\`java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Simple predicate
Predicate<Integer> isEven = n -> n % 2 == 0;
List<Integer> evens = numbers.stream()
    .filter(isEven)
    .collect(Collectors.toList());
System.out.println("Even numbers: " + evens);
// Output: [2, 4, 6, 8, 10]

// Predicate chaining — AND
Predicate<Integer> isGreaterThan5 = n -> n > 5;
Predicate<Integer> isEvenAndGreaterThan5 = isEven.and(isGreaterThan5);

List<Integer> result = numbers.stream()
    .filter(isEvenAndGreaterThan5)
    .collect(Collectors.toList());
System.out.println("Even and > 5: " + result);
// Output: [6, 8, 10]

// Negate predicate — flips true to false
Predicate<Integer> isOdd = isEven.negate();
List<Integer> odds = numbers.stream()
    .filter(isOdd)
    .collect(Collectors.toList());
System.out.println("Odd numbers: " + odds);
// Output: [1, 3, 5, 7, 9]

// OR predicate
Predicate<Integer> isLessThan3 = n -> n < 3;
Predicate<Integer> isLessThan3OrGreaterThan8 = isLessThan3.or(n -> n > 8);
List<Integer> result2 = numbers.stream()
    .filter(isLessThan3OrGreaterThan8)
    .collect(Collectors.toList());
System.out.println("< 3 or > 8: " + result2);
// Output: [1, 2, 9, 10]
\`\`\`

**Three chaining methods on Predicate:**
- \`.and(other)\` — both predicates must return true (logical AND)
- \`.or(other)\` — either predicate may return true (logical OR)
- \`.negate()\` — flips the result (logical NOT)`,
      },
      {
        id: 'p2-l2-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Write these predicates without looking at the file:**

\`\`\`java
List<String> words = Arrays.asList("apple", "ant", "banana", "avocado", "cherry", "almond");

// 1. Predicate: String starts with "a"
Predicate<String> startsWithA = ???;

// 2. Predicate: String has more than 5 characters
Predicate<String> isLong = ???;

// 3. Combine: starts with "a" AND longer than 5 chars
// Filter the list with the combined predicate and print results
// Expected: [avocado, almond]
\`\`\`

**Bonus:** Add a third predicate that checks if the String contains the letter "n". Chain all three with \`.and()\`.`,
      },
      {
        id: 'p2-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `A **\`Predicate<T>\`** is a function that takes one value and returns **true or false** — like a bouncer testing each item at a door. You can combine predicates using \`.and()\`, \`.or()\`, and \`.negate()\` to build complex conditions from simple building blocks. Predicates are most commonly used with the Stream \`.filter()\` method to keep only the items that pass the test.`,
      },
    ],
  },

  {
    id: 'p2-l3',
    phase: 2,
    lesson: 3,
    title: 'Function — The Transformer',
    subtitle: 'Give me X, I will return Y — the shape-shifter of functional programming',
    duration: '40 min',
    difficulty: 'Beginner',
    tags: ['function', 'map', 'transformation', 'andThen'],
    checkpoints: [
      'What is the difference between `Predicate<T>` and `Function<T, R>`?',
      'Write a `Function<String, Integer>` that returns the number of vowels in a String.',
      'What does `.andThen()` do? How is it different from `.compose()`?',
    ],
    sections: [
      {
        id: 'p2-l3-analogy',
        type: 'analogy',
        title: 'The Vending Machine',
        content: `> Think of a vending machine. You insert a coin (the input X) and press a button. The machine does its thing and gives you a snack (the output Y). The machine is a **transformer** — it takes one thing and produces a different thing.

> A **\`Function<T, R>\`** is that vending machine. Give it a value of type **T**, get back a value of type **R**. The types can be different — String in, Integer out. Number in, String out. Anything in, anything out.`,
      },
      {
        id: 'p2-l3-code',
        type: 'code',
        title: 'Code: Function Examples (from FunctionalInterfacesDemo.java)',
        content: `\`\`\`java
// Simple function — String in, Integer out
Function<String, Integer> length = String::length;
System.out.println("Length of 'Hello': " + length.apply("Hello"));
// Output: 5

// Function chaining with andThen
Function<Integer, Integer> square = n -> n * n;
Function<String, Integer> lengthSquared = length.andThen(square);
System.out.println("Length squared of 'Hello': " + lengthSquared.apply("Hello"));
// Output: 25 (length=5, then 5*5=25)

// Compose — runs the OTHER function first
Function<Integer, Integer> multiplyBy2 = n -> n * 2;
Function<Integer, Integer> add3 = n -> n + 3;
Function<Integer, Integer> multiplyThenAdd = multiplyBy2.andThen(add3);  // (5*2)+3 = 13
Function<Integer, Integer> addThenMultiply = multiplyBy2.compose(add3);  // (5+3)*2 = 16

System.out.println("(5 * 2) + 3 = " + multiplyThenAdd.apply(5)); // 13
System.out.println("(5 + 3) * 2 = " + addThenMultiply.apply(5)); // 16

// Use Function in a stream with .map()
List<String> words = Arrays.asList("apple", "banana", "cherry");
List<Integer> lengths = words.stream()
    .map(length)
    .collect(Collectors.toList());
System.out.println("Word lengths: " + lengths);
// Output: [5, 6, 6]
\`\`\`

**Key difference:**
- \`.andThen(g)\` — run **this** function first, then **g**
- \`.compose(g)\` — run **g** first, then **this** function`,
      },
      {
        id: 'p2-l3-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Build a transformation pipeline:**

\`\`\`java
// 1. Create a Function that converts String to uppercase
Function<String, String> toUpper = ???;

// 2. Create a Function that adds "!" to the end of a String
Function<String, String> addExclamation = ???;

// 3. Chain them with andThen — uppercase first, then add "!"
Function<String, String> shout = ???;

// 4. Apply to a list of words using .map()
List<String> words = Arrays.asList("hello", "world", "java");
// Expected: ["HELLO!", "WORLD!", "JAVA!"]
\`\`\``,
      },
      {
        id: 'p2-l3-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `A **\`Function<T, R>\`** takes a value of type T and returns a value of type R — like a vending machine transforming an input into a different output. You chain functions with \`.andThen()\` (this → then that) or \`.compose()\` (that → then this) to build pipelines. In streams, \`.map(function)\` applies the function to every element.`,
      },
    ],
  },

  {
    id: 'p2-l4',
    phase: 2,
    lesson: 4,
    title: 'Consumer & Supplier — Doer and Maker',
    subtitle: 'Handle side effects and lazy creation without return values',
    duration: '40 min',
    difficulty: 'Beginner',
    tags: ['consumer', 'supplier', 'forEach', 'orElseGet'],
    checkpoints: [
      'What does a `Consumer<T>` do with its input? What does it return?',
      'What does a `Supplier<T>` take as input? What does it return?',
      'When would you use `orElseGet(() -> expensiveCall())` instead of `orElse(expensiveCall())`?',
    ],
    sections: [
      {
        id: 'p2-l4-analogy',
        type: 'analogy',
        title: 'The Printer and the Coffee Machine',
        content: `> A **printer** takes your document (the input), does something with it (prints it), and gives you nothing back. No return value. Just the side effect of ink on paper.

> A **coffee machine** takes nothing from you (no input), and produces something fresh: a hot cup of coffee. You press the button, it creates the output.

- **\`Consumer<T>\`** = the printer: takes T, does something, returns nothing (\`void\`)
- **\`Supplier<T>\`** = the coffee machine: takes nothing, returns T`,
      },
      {
        id: 'p2-l4-code',
        type: 'code',
        title: 'Code: Consumer and Supplier (from FunctionalInterfacesDemo.java)',
        content: `**Consumer — takes T, returns void:**

\`\`\`java
// Simple consumer
Consumer<String> printer = System.out::println;
printer.accept("Hello, World!"); // prints it, returns nothing

// Consumer chaining — do multiple things
Consumer<String> logger = s -> System.out.println("LOG: " + s);
Consumer<String> both = printer.andThen(logger);
both.accept("Test message");
// Output: Test message
//         LOG: Test message

// Use in stream with forEach
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(printer); // applies printer to each name
\`\`\`

**Supplier — takes nothing, returns T:**

\`\`\`java
// Simple supplier
Supplier<String> greeting = () -> "Hello, World!";
System.out.println(greeting.get()); // Output: Hello, World!

// Supplier for current time
Supplier<Long> currentTime = System::currentTimeMillis;
System.out.println("Current time: " + currentTime.get());

// Supplier for empty list — lazy creation
Supplier<List<String>> emptyList = ArrayList::new;
List<String> list = emptyList.get();

// Supplier with Optional — only called if Optional is empty
Optional<String> optional = Optional.empty();
String value = optional.orElseGet(() -> "Default value");
System.out.println("Optional with supplier: " + value);
// Output: Default value
\`\`\`

**Key insight:** \`orElse(value)\` evaluates \`value\` **always**. \`orElseGet(supplier)\` evaluates it **only if needed**. If the default is expensive to compute, always use \`orElseGet\`.`,
      },
      {
        id: 'p2-l4-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Task 1 — Consumer:**
Create a \`Consumer<String>\` that prints the string in all caps with a prefix of \`">> "\`. Chain it with another Consumer that counts the characters and prints the count. Apply both to a list of names.

**Task 2 — Supplier:**
\`\`\`java
// Create a Supplier that produces a random number between 1 and 100
Supplier<Integer> randomBetween1And100 = ???;

// Call it 5 times and print each result
// (Hint: each call should give a different number)
\`\`\``,
      },
      {
        id: 'p2-l4-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `A **\`Consumer<T>\`** takes a value and does something with it (like printing) but returns nothing — it exists purely for side effects. A **\`Supplier<T>\`** takes no input and produces a value — it is used for lazy creation or deferred computation. Consumers power \`.forEach()\` in streams; Suppliers power \`orElseGet()\` in Optional for efficient default values.`,
      },
    ],
  },

  {
    id: 'p2-l5',
    phase: 2,
    lesson: 5,
    title: 'Method References — The Speed Dial',
    subtitle: 'Shorthand for lambdas that call exactly one existing method',
    duration: '35 min',
    difficulty: 'Beginner',
    tags: ['method-reference', '::', 'constructor-reference'],
    checkpoints: [
      'What are the four types of method references? Give one example of each.',
      'When can you replace a lambda with a method reference? When can you NOT?',
      'What does `ArrayList::new` mean? Which functional interface does it match?',
    ],
    sections: [
      {
        id: 'p2-l5-analogy',
        type: 'analogy',
        title: 'Speed Dial vs Dialling the Full Number',
        content: `> Imagine you call your mum every day. You could dial her full 10-digit phone number every time. Or you could save her number under "Mum" and press one button.

> **Method references** are that speed dial. When your lambda does nothing but call one existing method — \`s -> s.toUpperCase()\` — you can replace it with \`String::toUpperCase\`. Same result, less noise.

The \`::\` operator is Java's way of saying: "use this method as the implementation, but do not call it yet."`,
      },
      {
        id: 'p2-l5-code',
        type: 'code',
        title: 'Code: Method References (from FunctionalInterfacesDemo.java)',
        content: `\`\`\`java
List<String> names = Arrays.asList("alice", "bob", "charlie");

// 1. Static method reference — ClassName::staticMethod
Function<String, Integer> parseInt = Integer::parseInt;
System.out.println("Parse '123': " + parseInt.apply("123")); // 123

// 2. Instance method reference on arbitrary object — ClassName::instanceMethod
//    (the first parameter becomes "this")
List<String> upper = names.stream()
    .map(String::toUpperCase)  // same as: s -> s.toUpperCase()
    .collect(Collectors.toList());
System.out.println("Uppercase: " + upper); // [ALICE, BOB, CHARLIE]

// 3. Instance method reference on a specific object — instance::method
String prefix = "Hello, ";
Function<String, String> addPrefix = prefix::concat;
System.out.println("Add prefix: " + addPrefix.apply("World")); // Hello, World

// 4. Constructor reference — ClassName::new
Supplier<List<String>> listSupplier = ArrayList::new;
List<String> newList = listSupplier.get(); // creates new empty ArrayList

// Method reference in forEach
System.out.println("Printing names:");
names.forEach(System.out::println); // same as: name -> System.out.println(name)
\`\`\`

**The four types at a glance:**

| Type | Syntax | Lambda Equivalent |
|------|--------|-------------------|
| Static method | \`Integer::parseInt\` | \`s -> Integer.parseInt(s)\` |
| Instance (any object) | \`String::toUpperCase\` | \`s -> s.toUpperCase()\` |
| Instance (specific object) | \`prefix::concat\` | \`s -> prefix.concat(s)\` |
| Constructor | \`ArrayList::new\` | \`() -> new ArrayList<>()\` |`,
      },
      {
        id: 'p2-l5-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Replace each lambda with a method reference:**

\`\`\`java
// Before (lambdas):
names.stream().map(s -> s.toLowerCase()).collect(Collectors.toList());
numbers.stream().forEach(n -> System.out.println(n));
words.stream().filter(s -> s.isEmpty()).collect(Collectors.toList());
Supplier<StringBuilder> sb = () -> new StringBuilder();

// After (method references — fill in the ???):
names.stream().map(???).collect(Collectors.toList());
numbers.stream().forEach(???);
words.stream().filter(???).collect(Collectors.toList());
Supplier<StringBuilder> sb = ???;
\`\`\``,
      },
      {
        id: 'p2-l5-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**Method references** (\`::\`) are shorthand for lambdas that do nothing but call one existing method. There are four kinds: static methods (\`Integer::parseInt\`), instance methods on any object (\`String::toUpperCase\`), instance methods on a specific object (\`prefix::concat\`), and constructors (\`ArrayList::new\`). Use them to reduce noise — but only when the lambda does a single, clear thing.`,
      },
    ],
  },

  // ── Phase 3 ──────────────────────────────────────────────────────────────────

  {
    id: 'p3-l1',
    phase: 3,
    lesson: 1,
    title: 'What is a Stream? The Conveyor Belt',
    subtitle: 'Process collections without messy for-loops',
    duration: '45 min',
    difficulty: 'Intermediate',
    tags: ['stream', 'pipeline', 'lazy-evaluation', 'intermediate', 'terminal'],
    checkpoints: [
      'What is the difference between an "intermediate" and a "terminal" operation?',
      'Why are Streams "lazy"? What triggers them to actually start processing?',
      'Can you reuse a Stream after calling a terminal operation on it?',
    ],
    sections: [
      {
        id: 'p3-l1-analogy',
        type: 'analogy',
        title: 'The Factory Conveyor Belt',
        content: `> Picture a conveyor belt in a factory. Raw materials go in at one end. At each station along the belt, a worker does one specific job: one worker filters out defective parts, the next stamps each piece, the next packs them into boxes. At the end, a finished product comes out.

> A **Stream** is that conveyor belt. Your data (a List, an array) goes in at one end. At each station, you plug in a **lambda** to do one job: filter, transform, sort, collect. At the end, you get your processed result.

The belt does not start moving until you ask for the output. That is why Streams are called **"lazy"**.`,
      },
      {
        id: 'p3-l1-concept',
        type: 'concept',
        title: 'Stream Concepts: Pipeline, Lazy, Intermediate vs Terminal',
        content: `A **Stream** is a sequence of elements from a source (List, array, etc.) that supports a sequence of operations forming a pipeline.

**Three key ideas:**

**1. A Stream is not a data structure.** It does not store data — it processes data from another source. Modifying the original list does not affect the stream.

**2. Operations are either intermediate or terminal:**
- **"Intermediate operations"** [like \`filter\`, \`map\`, \`sorted\`] transform the stream and return a new stream. They are lazy — nothing happens yet.
- **"Terminal operations"** [like \`collect\`, \`count\`, \`forEach\`] trigger the entire pipeline to run and produce a result.

**3. A Stream can only be consumed once.** After a terminal operation, the stream is finished. You need a new stream for a new pipeline.

Think of it like this: intermediate operations write the recipe, terminal operations actually cook the meal.`,
      },
      {
        id: 'p3-l1-code',
        type: 'code',
        title: 'Code: Creating Streams (from StreamBasics.java)',
        content: `\`\`\`java
// From Collection (most common)
List<String> list = Arrays.asList("apple", "banana", "cherry");
Stream<String> stream1 = list.stream();
System.out.println("From List: " + stream1.collect(Collectors.toList()));

// From Array
String[] array = {"dog", "cat", "bird"};
Stream<String> stream2 = Arrays.stream(array);
System.out.println("From Array: " + stream2.collect(Collectors.toList()));

// Using Stream.of()
Stream<String> stream3 = Stream.of("one", "two", "three");
System.out.println("Using Stream.of(): " + stream3.collect(Collectors.toList()));

// Infinite stream — generate even numbers, take first 5
Stream<Integer> infinite = Stream.iterate(0, n -> n + 2);
List<Integer> first5 = infinite.limit(5).collect(Collectors.toList());
System.out.println("Infinite stream (first 5): " + first5);
// Output: [0, 2, 4, 6, 8]
\`\`\`

**The most common way:** \`list.stream()\` — call \`.stream()\` on any Collection. That is it.`,
      },
      {
        id: 'p3-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `A **Stream** is a conveyor belt for data — it takes elements from a source and processes them through a pipeline of operations without storing the data itself. Operations are either **intermediate** (lazy, return a stream, do nothing yet) or **terminal** (trigger the pipeline, produce a result). A stream can only be used once — after the terminal operation, create a new stream.`,
      },
    ],
  },

  {
    id: 'p3-l2',
    phase: 3,
    lesson: 2,
    title: 'filter, map, flatMap — The Core Workers',
    subtitle: 'Keep what you need, change its shape, flatten nested structures',
    duration: '50 min',
    difficulty: 'Intermediate',
    tags: ['filter', 'map', 'flatMap', 'stream-operations'],
    checkpoints: [
      'What is the difference between `.map()` and `.flatMap()`? Give an analogy.',
      'Write a stream pipeline: take a list of sentences, split each into words, collect all unique words in uppercase.',
      'Can you call `.filter()` multiple times in one pipeline? What is the effect?',
    ],
    sections: [
      {
        id: 'p3-l2-analogy',
        type: 'analogy',
        title: 'Sieve, Stamp, and Unpack',
        content: `> **\`filter\`** is like a **sieve** — pour everything in, only what passes through the holes comes out. Everything else is discarded.

> **\`map\`** is like a **stamping machine** — every item goes in, gets stamped (transformed), and comes out the other side changed. Nothing is dropped; the shape changes.

> **\`flatMap\`** is like **unpacking boxes inside boxes** — you have a list of parcels, each containing more items. flatMap opens every parcel and puts all the inner items into one single pile.`,
      },
      {
        id: 'p3-l2-code',
        type: 'code',
        title: 'Code: filter, map, flatMap (from StreamBasics.java)',
        content: `**filter — keep what passes the test:**

\`\`\`java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Filter even numbers
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
System.out.println("Even numbers: " + evens); // [2, 4, 6, 8, 10]

// Multiple filters — each is applied in sequence
List<Integer> filtered = numbers.stream()
    .filter(n -> n % 2 == 0)
    .filter(n -> n > 5)
    .collect(Collectors.toList());
System.out.println("Even numbers > 5: " + filtered); // [6, 8, 10]
\`\`\`

**map — transform every element:**

\`\`\`java
List<String> words = Arrays.asList("hello", "world", "java", "streams");

// Convert to uppercase
List<String> upper = words.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
System.out.println("Uppercase: " + upper); // [HELLO, WORLD, JAVA, STREAMS]

// Get lengths — String → Integer
List<Integer> lengths = words.stream()
    .map(String::length)
    .collect(Collectors.toList());
System.out.println("Lengths: " + lengths); // [5, 5, 4, 7]
\`\`\`

**flatMap — flatten nested structures:**

\`\`\`java
// Flatten list of lists
List<List<Integer>> nested = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5),
    Arrays.asList(6, 7, 8, 9)
);

List<Integer> flattened = nested.stream()
    .flatMap(List::stream)   // open each inner list and stream its elements
    .collect(Collectors.toList());
System.out.println("Flattened: " + flattened); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Split strings into individual characters
List<String> wordList = Arrays.asList("hello", "world");
List<String> chars = wordList.stream()
    .flatMap(word -> Arrays.stream(word.split("")))
    .collect(Collectors.toList());
System.out.println("Characters: " + chars); // [h, e, l, l, o, w, o, r, l, d]
\`\`\``,
      },
      {
        id: 'p3-l2-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Challenge pipeline:**

\`\`\`java
List<String> sentences = Arrays.asList(
    "Java 8 is great",
    "Streams are powerful",
    "Lambda expressions are clean"
);

// Build a pipeline that:
// 1. Splits each sentence into words (use .split(" "))
// 2. Flattens all words into one stream (flatMap)
// 3. Filters words longer than 3 characters
// 4. Converts to uppercase
// 5. Sorts alphabetically
// 6. Removes duplicates (.distinct())
// 7. Collects to a List

// Expected output includes: [CLEAN, EXPRESSIONS, GREAT, JAVA, LAMBDA, POWERFUL, STREAMS]
\`\`\``,
      },
      {
        id: 'p3-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**\`filter\`** keeps only elements that pass a Predicate test — like a sieve. **\`map\`** transforms every element into something else using a Function — like a stamping machine. **\`flatMap\`** both transforms and flattens — use it when each element would produce a stream, and you want one flat stream of all results rather than a stream of streams.`,
      },
    ],
  },

  {
    id: 'p3-l3',
    phase: 3,
    lesson: 3,
    title: 'Terminal Operations — Pull the Trigger',
    subtitle: 'collect, count, reduce, findFirst, anyMatch — start the pipeline flowing',
    duration: '45 min',
    difficulty: 'Intermediate',
    tags: ['collect', 'count', 'reduce', 'findFirst', 'anyMatch', 'terminal'],
    checkpoints: [
      'What is `reduce()` in plain English? Give a non-code example.',
      'What does `findFirst()` return? Why does it return `Optional<T>` instead of `T`?',
      'Write a stream that sums a list of integers using `reduce()` with identity 0.',
    ],
    sections: [
      {
        id: 'p3-l3-analogy',
        type: 'analogy',
        title: 'The Order Form That Starts the Kitchen',
        content: `> Imagine a restaurant. You browse the menu (intermediate operations — just looking, nothing happens yet). The kitchen does nothing until you **place your order** (terminal operation). The order form is the trigger that starts all the activity.

> **Terminal operations** are that order form. Until you call \`collect()\`, \`count()\`, or \`forEach()\`, the stream pipeline is just a recipe — no data moves, no computations run. The terminal operation pulls the trigger.`,
      },
      {
        id: 'p3-l3-code',
        type: 'code',
        title: 'Code: Terminal Operations (from StreamBasics.java)',
        content: `\`\`\`java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");

// collect — pack results into a List, Set, or Map
List<String> collected = names.stream()
    .filter(s -> s.length() > 4)
    .collect(Collectors.toList());
System.out.println("Collected (length > 4): " + collected); // [Alice, Charlie, David]

// count — how many elements pass?
long count = names.stream()
    .filter(s -> s.startsWith("C"))
    .count();
System.out.println("Count (starts with 'C'): " + count); // 1

// findFirst — first match, wrapped in Optional
Optional<String> first = names.stream()
    .filter(s -> s.length() > 5)
    .findFirst();
System.out.println("First (length > 5): " + first.orElse("Not found")); // Charlie

// anyMatch — does at least one element satisfy the condition?
boolean hasLongName = names.stream()
    .anyMatch(s -> s.length() > 6);
System.out.println("Has name length > 6: " + hasLongName); // false

// allMatch — do ALL elements satisfy the condition?
boolean allLong = names.stream()
    .allMatch(s -> s.length() > 3);
System.out.println("All names length > 3: " + allLong); // false (Bob = 3)
\`\`\`

**reduce — boil everything down to one value:**

\`\`\`java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Complex pipeline: filter → map → filter → sort → collect
List<Integer> result = numbers.stream()
    .filter(n -> n % 2 == 0)      // Keep even: [2,4,6,8,10]
    .map(n -> n * n)              // Square them: [4,16,36,64,100]
    .filter(n -> n > 20)          // Keep > 20: [36,64,100]
    .sorted()                     // Sort: [36,64,100]
    .collect(Collectors.toList());
System.out.println("Even numbers squared and > 20: " + result);
\`\`\`

**reduce — like totalling a receipt:**
\`\`\`java
// Sum with reduce: start at 0, add each element
int sum = numbers.stream()
    .reduce(0, (acc, n) -> acc + n);
System.out.println("Sum: " + sum); // 55
\`\`\``,
      },
      {
        id: 'p3-l3-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Write these pipelines without looking at the file:**

\`\`\`java
List<String> employees = Arrays.asList(
    "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"
);

// 1. Count how many names are longer than 4 characters
long count = ???;

// 2. Find any name that starts with "D"
Optional<String> dName = ???;

// 3. Do ALL names have at least 3 characters? (allMatch)
boolean allAtLeast3 = ???;

// 4. Concatenate all names longer than 4 chars, uppercase, sorted, into a comma-separated string
// Hint: Collectors.joining(", ")
// Expected: "ALICE, CHARLIE, DIANA, FRANK, GRACE"
\`\`\``,
      },
      {
        id: 'p3-l3-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**Terminal operations** are the trigger that starts a stream pipeline running — without them, no data moves. Key terminals include: \`collect()\` to pack results into a collection, \`count()\` to count elements, \`findFirst()\` to get the first match (wrapped in Optional), \`anyMatch\`/\`allMatch\` to test conditions, and \`reduce()\` to boil all elements down to one value like a sum or product.`,
      },
    ],
  },

  {
    id: 'p3-l4',
    phase: 3,
    lesson: 4,
    title: 'Advanced Collectors — Sort, Split, Join, Analyse',
    subtitle: 'groupingBy, partitioningBy, joining, summarizingInt in one lesson',
    duration: '55 min',
    difficulty: 'Intermediate',
    tags: ['groupingBy', 'partitioningBy', 'joining', 'summarizingInt', 'collectors'],
    checkpoints: [
      'What does `groupingBy` return? Write the type signature.',
      'What is the difference between `groupingBy` and `partitioningBy`?',
      'Write a pipeline that groups a list of employees by department and counts employees in each.',
    ],
    sections: [
      {
        id: 'p3-l4-analogy',
        type: 'analogy',
        title: 'Filing Cabinet, Yes/No Pile, Stapler, Report Card',
        content: `> **\`groupingBy\`** is like a **filing cabinet** with labelled drawers. You sort every document into the drawer matching its label. Pull open "Finance" and you get all Finance employees.

> **\`partitioningBy\`** is like splitting a pile into exactly **two groups**: yes and no. High salary vs low salary. Senior vs junior. Always two keys: \`true\` and \`false\`.

> **\`joining\`** is like a **stapler** — takes all your strings and sticks them together with a separator.

> **\`summarizingInt\`** is like a **report card** — gives you count, sum, min, max, and average all at once.`,
      },
      {
        id: 'p3-l4-code',
        type: 'code',
        title: 'Code: Advanced Collectors (from AdvancedCollectors.java)',
        content: `**groupingBy — file employees into department drawers:**

\`\`\`java
List<Employee> employees = getEmployees(); // Alice, Bob, Charlie, David, Eve, Frank, Grace, Henry

// Simple grouping — Map<department, List<employee>>
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));
// { "IT": [Alice, Bob, Eve, Henry], "HR": [Charlie, David], "Finance": [Frank, Grace] }

// Group and count per department
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.counting()
    ));
System.out.println("Count by department: " + countByDept);
// { IT=4, HR=2, Finance=2 }

// Group and average salary
Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.averagingDouble(Employee::getSalary)
    ));
\`\`\`

**partitioningBy — split into exactly two groups:**

\`\`\`java
Map<Boolean, List<Employee>> partitioned = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.getSalary() > 75000));

System.out.println("High salary: " + partitioned.get(true));
System.out.println("Low salary: " + partitioned.get(false));
\`\`\`

**joining — stitch strings together:**

\`\`\`java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

String joined = names.stream().collect(Collectors.joining(", "));
System.out.println(joined); // Alice, Bob, Charlie, David

String withBrackets = names.stream()
    .collect(Collectors.joining(", ", "[", "]"));
System.out.println(withBrackets); // [Alice, Bob, Charlie, David]
\`\`\`

**summarizingInt — get count, sum, min, max, average at once:**

\`\`\`java
IntSummaryStatistics ageStats = employees.stream()
    .collect(Collectors.summarizingInt(Employee::getAge));

System.out.println("Count: " + ageStats.getCount());
System.out.println("Sum: "   + ageStats.getSum());
System.out.println("Min: "   + ageStats.getMin());
System.out.println("Max: "   + ageStats.getMax());
System.out.println("Avg: "   + ageStats.getAverage());
\`\`\``,
      },
      {
        id: 'p3-l4-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Using the Employee list from AdvancedCollectors.java:**

\`\`\`java
// Task 1: Group employees by department, collect only their names (not full objects)
// Hint: use Collectors.mapping(Employee::getName, Collectors.toList())
Map<String, List<String>> namesByDept = ???;

// Task 2: Partition employees into two groups: age < 30 and age >= 30
// Then count how many are in each group using Collectors.counting()
Map<Boolean, Long> ageCount = ???;

// Task 3: Get all employee names in a formatted string
// Format: "Team: Alice | Bob | Charlie | David | Eve | Frank | Grace | Henry"
String teamString = "Team: " + ???;
\`\`\``,
      },
      {
        id: 'p3-l4-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**\`groupingBy\`** sorts elements into labelled buckets (a Map with any number of keys). **\`partitioningBy\`** always produces exactly two groups — true and false. **\`joining\`** concatenates strings with optional delimiter, prefix, and suffix. **\`summarizingInt\`** gives you all statistics (count, sum, min, max, average) in one collector. These are the collectors you will use every day in real projects.`,
      },
    ],
  },

  // ── Phase 4 ──────────────────────────────────────────────────────────────────

  {
    id: 'p4-l1',
    phase: 4,
    lesson: 1,
    title: 'Optional — The Gift-Wrapped Box',
    subtitle: 'Stop null from crashing your program',
    duration: '45 min',
    difficulty: 'Intermediate',
    tags: ['optional', 'null', 'NullPointerException', 'isPresent'],
    checkpoints: [
      'What is the difference between `Optional.of()` and `Optional.ofNullable()`?',
      'Why should you never use `Optional.get()` without checking first? What exception occurs?',
      'What is the difference between `isPresent()` and `ifPresent()`?',
    ],
    sections: [
      {
        id: 'p4-l1-why',
        type: 'why',
        title: 'Why This Matters',
        content: `**\`NullPointerException\`** [NPE — the error when you try to use a variable that points to nothing] is the most common runtime crash in Java programs. Tony Hoare, who invented the concept of null, later called it his "billion-dollar mistake."

Java 8 introduced **\`Optional<T>\`** to make the possibility of absence explicit in the type system, so you can never accidentally forget to handle it.`,
      },
      {
        id: 'p4-l1-analogy',
        type: 'analogy',
        title: 'Reaching Into an Empty Box',
        content: `> Imagine you reach into a bag expecting to find a wallet. If the bag is empty, your hand finds nothing — and you are surprised. In Java terms: \`NullPointerException\`.

> Now imagine the wallet comes in a **gift-wrapped box**. Before you can use the wallet, you must unwrap the box. If the box is empty, you know before trying to use anything inside. You handle the absence deliberately, not by accident.

> **\`Optional<T>\`** is that gift-wrapped box. It forces you to acknowledge that the value might not be there — you cannot accidentally use it without unwrapping it first.`,
      },
      {
        id: 'p4-l1-code',
        type: 'code',
        title: 'Code: Creating and Checking Optional (from OptionalExamples.java)',
        content: `\`\`\`java
// Three ways to create an Optional:

// 1. Optional.empty() — no value inside
Optional<String> empty = Optional.empty();
System.out.println("Empty Optional: " + empty);       // Optional.empty
System.out.println("Is present: " + empty.isPresent()); // false

// 2. Optional.of() — value guaranteed not null
//    (throws NullPointerException if you pass null)
Optional<String> value = Optional.of("Hello");
System.out.println("Optional with value: " + value);   // Optional[Hello]
System.out.println("Value: " + value.get());           // Hello

// 3. Optional.ofNullable() — use this when value might be null
String nullable = null;
Optional<String> fromNullable = Optional.ofNullable(nullable);
System.out.println("From nullable (null): " + fromNullable); // Optional.empty

String notNull = "World";
Optional<String> fromNotNull = Optional.ofNullable(notNull);
System.out.println("From nullable (not null): " + fromNotNull); // Optional[World]
\`\`\`

**Checking and using the value:**

\`\`\`java
Optional<String> name = Optional.of("Alice");

// isPresent() — check then get (not ideal)
if (name.isPresent()) {
    System.out.println("Name is present: " + name.get());
}

// ifPresent() — preferred: only runs the action if value exists
name.ifPresent(n -> System.out.println("Name (ifPresent): " + n));

// isEmpty() — Java 11+
Optional<String> emptyOpt = Optional.empty();
System.out.println("Is empty: " + emptyOpt.isEmpty()); // true
\`\`\`

> **Golden Rule:** Never call \`.get()\` without first checking \`.isPresent()\` — or better, use \`.orElse()\`, \`.orElseGet()\`, or \`.ifPresent()\` instead. The \`.get()\` method throws \`NoSuchElementException\` on an empty Optional.`,
      },
      {
        id: 'p4-l1-task',
        type: 'task',
        title: 'Hands-On Task — Break It On Purpose',
        content: `**Step 1 — Make it crash (on purpose, so you see the error):**

\`\`\`java
Optional<String> emptyBox = Optional.empty();
String value = emptyBox.get(); // This WILL throw NoSuchElementException
System.out.println(value);     // This line is never reached
\`\`\`

Run this. Observe the \`NoSuchElementException\` and the stack trace.

**Step 2 — Fix it safely:**

\`\`\`java
Optional<String> emptyBox = Optional.empty();

// Fix option 1: orElse
String v1 = emptyBox.orElse("default");

// Fix option 2: ifPresent (only runs if value exists)
emptyBox.ifPresent(v -> System.out.println("Found: " + v));

// Fix option 3: isPresent check
if (emptyBox.isPresent()) {
    System.out.println(emptyBox.get());
} else {
    System.out.println("Nothing here");
}
\`\`\``,
      },
      {
        id: 'p4-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**\`Optional<T>\`** is a container that may or may not hold a value — like a gift-wrapped box you must open deliberately. Create it with \`Optional.of()\` (value guaranteed), \`Optional.ofNullable()\` (value might be null), or \`Optional.empty()\`. Check before using: prefer \`ifPresent()\` or \`orElse()\` over calling \`.get()\` directly — \`.get()\` on an empty Optional throws \`NoSuchElementException\`.`,
      },
    ],
  },

  {
    id: 'p4-l2',
    phase: 4,
    lesson: 2,
    title: 'Chaining Optional Safely',
    subtitle: 'map, flatMap, orElse, orElseGet, orElseThrow in one clean chain',
    duration: '45 min',
    difficulty: 'Intermediate',
    tags: ['optional', 'map', 'flatMap', 'orElse', 'orElseGet', 'orElseThrow'],
    checkpoints: [
      'In one line of code, take an `Optional<String>`, uppercase it if present, and return "UNKNOWN" if absent.',
      'What is the difference between `orElse()` and `orElseGet()`? When does each evaluate its argument?',
      'When would you use `flatMap` on an Optional instead of `map`?',
    ],
    sections: [
      {
        id: 'p4-l2-analogy',
        type: 'analogy',
        title: 'The Post Office Assembly Line',
        content: `> Imagine a parcel moving through a post office. At each station, workers do something to it — if it exists. If the parcel is missing, each station gracefully skips its step rather than crashing.

> **Chaining Optional** works the same way. \`.map()\` applies a transformation if the value is present. \`.filter()\` keeps it only if a condition is met. \`.orElse()\` provides the fallback at the very end if the box is empty. The chain never crashes on absence — it flows gracefully.`,
      },
      {
        id: 'p4-l2-code',
        type: 'code',
        title: 'Code: map, flatMap, orElse (from OptionalExamples.java)',
        content: `**map — transform if present:**

\`\`\`java
Optional<String> name = Optional.of("Alice");

// map transforms the value if it exists
Optional<Integer> length = name.map(String::length);
System.out.println("Length: " + length.orElse(0)); // 5

Optional<String> upper = name.map(String::toUpperCase);
System.out.println("Uppercase: " + upper.orElse("N/A")); // ALICE
\`\`\`

**flatMap — when the transformation itself returns Optional:**

\`\`\`java
// Without flatMap: map would give Optional<Optional<String>>
// flatMap flattens it to Optional<String>
Optional<String> result = name.flatMap(n -> findByName(n));
System.out.println("FlatMap result: " + result.orElse("Not found"));
\`\`\`

**orElse vs orElseGet vs orElseThrow:**

\`\`\`java
Optional<String> empty = Optional.empty();

// orElse — always evaluates the argument (even if Optional has a value)
String value1 = empty.orElse(getDefaultValue());
System.out.println("orElse: " + value1);

// orElseGet — lazy: only evaluates if Optional is empty
String value2 = empty.orElseGet(() -> getDefaultValue());
System.out.println("orElseGet: " + value2);

// orElseThrow — throw a specific exception if empty
try {
    String value3 = empty.orElseThrow(() ->
        new IllegalArgumentException("Value required"));
} catch (IllegalArgumentException e) {
    System.out.println("orElseThrow: " + e.getMessage());
}
\`\`\`

**The common mistake — never do this:**

\`\`\`java
// ❌ MISTAKE: Using get() without check
Optional<String> optional = Optional.empty();
String value = optional.get(); // Throws NoSuchElementException!

// ✅ CORRECT: Use orElse
String safe = optional.orElse("Default");

// ❌ MISTAKE: Nested Optionals — do not use Optional as a field type
Optional<Optional<String>> nested = Optional.of(Optional.of("Nested")); // BAD!

// ✅ CORRECT: Use flatMap to avoid nesting
\`\`\`

**Practical use — check before using, chain naturally:**

\`\`\`java
// Use case: chain of operations
Optional<String> processed = findUser(1)
    .map(String::toUpperCase)
    .filter(s -> s.length() > 3);
System.out.println("Processed: " + processed.orElse("N/A")); // ALICE
\`\`\``,
      },
      {
        id: 'p4-l2-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Task 1 — The one-liner challenge:**

Write a single expression (one chain) that:
- Takes an \`Optional<String>\` called \`maybeName\`
- Uppercases it if present
- Returns \`"UNKNOWN"\` if absent

\`\`\`java
Optional<String> maybeName = Optional.ofNullable(getSomeNameThatMightBeNull());
String result = ???; // one line
\`\`\`

**Task 2 — orElse vs orElseGet:**

\`\`\`java
Optional<String> present = Optional.of("exists");

// Which of these calls getDefaultValue() even though present has a value?
String v1 = present.orElse(getDefaultValue());       // Does it call getDefaultValue()?
String v2 = present.orElseGet(() -> getDefaultValue()); // Does it call getDefaultValue()?

// Hint: add a print statement inside getDefaultValue() to see which gets called.
\`\`\``,
      },
      {
        id: 'p4-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `\`Optional.map()\` transforms the value if present and returns a new Optional. \`Optional.flatMap()\` is used when the transformation itself returns an Optional, to avoid nesting. For the fallback, prefer \`orElseGet(() -> expensive())\` over \`orElse(expensive())\` when the default is costly to compute, because \`orElseGet\` is lazy — it only runs if the Optional is empty.`,
      },
    ],
  },

  // ── Phase 5 ──────────────────────────────────────────────────────────────────

  {
    id: 'p5-l1',
    phase: 5,
    lesson: 1,
    title: 'var, Records, Pattern Matching',
    subtitle: 'Write half the code. Mean twice as much.',
    duration: '45 min',
    difficulty: 'Intermediate',
    tags: ['var', 'records', 'pattern-matching', 'java16', 'java10'],
    checkpoints: [
      'Can you use `var` for a method parameter? Why not?',
      'What makes a Java Record different from a regular class? List three things it gives you for free.',
      'What does `instanceof` pattern matching eliminate compared to the old style?',
    ],
    sections: [
      {
        id: 'p5-l1-analogy',
        type: 'analogy',
        title: 'Autocomplete, Named Containers, and ID+Entry in One Step',
        content: `> **\`var\`** is like autocomplete on your phone. You do not need to type "ArrayList<String>" when the compiler can obviously see it from the right-hand side. You write \`var\` and the compiler fills in the full type.

> **Records** are like **named containers** — a box with a label that just holds data and nothing else. You do not need a constructor, getters, \`equals()\`, \`hashCode()\`, or \`toString()\`. The box comes pre-built.

> **Pattern matching instanceof** is like a bouncer who simultaneously checks your ID AND lets you in — no separate "check, then enter" steps.`,
      },
      {
        id: 'p5-l1-code',
        type: 'code',
        title: 'Code: var, Records, Pattern Matching',
        content: `**var — local type inference (Java 10):**

\`\`\`java
// Before: spell out the full type
ArrayList<String> list = new ArrayList<String>();

// After: let the compiler figure it out
var list = new ArrayList<String>(); // type is still ArrayList<String>, just inferred
var numbers = List.of(1, 2, 3, 4, 5);
var name = "Alice"; // type is String

// var is ONLY for local variables — not for fields, parameters, or return types
// This is illegal: public var getResult() { ... }
\`\`\`

**Records — immutable data carriers (Java 16):**

\`\`\`java
// Old way — a Student class with fields, constructor, getters, equals, hashCode, toString
public class Student {
    private final String name;
    private final int age;
    private final double gpa;

    public Student(String name, int age, double gpa) {
        this.name = name; this.age = age; this.gpa = gpa;
    }
    public String getName() { return name; }
    public int getAge()     { return age; }
    public double getGpa()  { return gpa; }
    // ... equals(), hashCode(), toString() — 30+ more lines
}

// New way — Java Record does all of the above in ONE line
public record Student(String name, int age, double gpa) {}

// Use it exactly the same way:
Student s = new Student("Alice", 20, 3.9);
System.out.println(s.name()); // Alice  (no "get" prefix in records)
System.out.println(s);        // Student[name=Alice, age=20, gpa=3.9]
\`\`\`

**Pattern matching for instanceof (Java 16):**

\`\`\`java
// Old way — check type, then cast separately
Object obj = "Hello, World!";
if (obj instanceof String) {
    String s = (String) obj; // redundant cast
    System.out.println(s.length());
}

// New way — check AND bind in one step
if (obj instanceof String s) {
    System.out.println(s.length()); // s is already a String here
}

// Works with more complex logic too
if (obj instanceof String s && s.length() > 5) {
    System.out.println("Long string: " + s.toUpperCase());
}
\`\`\``,
      },
      {
        id: 'p5-l1-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Task: Rewrite a POJO as a Record**

Convert this old-style class into a single-line Java Record:

\`\`\`java
// Old style — convert this to a Record
public class Employee {
    private final String name;
    private final String department;
    private final double salary;

    public Employee(String name, String department, double salary) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    public String getName()       { return name; }
    public String getDepartment() { return department; }
    public double getSalary()     { return salary; }

    @Override
    public String toString() {
        return "Employee{name=" + name + ", department=" + department + ", salary=" + salary + "}";
    }
}

// Your record (one line):
public record Employee(???) {}

// Then use it:
var emp = new Employee("Alice", "IT", 75000);
System.out.println(emp.name());       // Alice
System.out.println(emp.department()); // IT
System.out.println(emp);             // Employee[name=Alice, department=IT, salary=75000.0]
\`\`\``,
      },
      {
        id: 'p5-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**\`var\`** (Java 10) lets the compiler infer local variable types — reducing boilerplate without losing type safety. **Records** (Java 16) replace full POJO classes with a one-line declaration that auto-generates constructor, accessors, \`equals()\`, \`hashCode()\`, and \`toString()\`. **Pattern matching instanceof** (Java 16) combines the type check and cast into one step, eliminating the redundant cast that old Java required.`,
      },
    ],
  },

  {
    id: 'p5-l2',
    phase: 5,
    lesson: 2,
    title: 'Sealed Classes & Switch Expressions',
    subtitle: 'Control your class hierarchy and make switch return values',
    duration: '40 min',
    difficulty: 'Intermediate',
    tags: ['sealed', 'permits', 'switch-expression', 'java17', 'java14'],
    checkpoints: [
      'What does `sealed` mean on a class? What does `permits` do?',
      'What is the key syntax difference between a `switch statement` and a `switch expression`?',
      'What keyword replaces the old `break` in switch expressions?',
    ],
    sections: [
      {
        id: 'p5-l2-analogy',
        type: 'analogy',
        title: 'The Franchise and the Vending Machine',
        content: `> **Sealed classes** are like a **franchise agreement**. McDonald's says: "Only *approved* partners can open a McDonald's restaurant. You cannot just open one without our permission." The sealed class says: "Only *these specific* subclasses may extend me."

> **Switch expressions** are like a **vending machine**. You press a code (the switch input), and the machine immediately produces a specific item (a return value). The old switch statement was like a worker who performed different tasks — switch expressions produce direct output.`,
      },
      {
        id: 'p5-l2-code',
        type: 'code',
        title: 'Code: Sealed Classes & Switch Expressions',
        content: `**Sealed classes (Java 17):**

\`\`\`java
// sealed class — only these three shapes may extend Shape
public sealed class Shape permits Circle, Rectangle, Triangle {}

public final class Circle    extends Shape { double radius; }
public final class Rectangle extends Shape { double width, height; }
public final class Triangle  extends Shape { double base, height; }

// Now the compiler knows EXACTLY which subclasses exist
// This powers exhaustive pattern matching
\`\`\`

**Switch expressions (Java 14+):**

\`\`\`java
// Old switch STATEMENT — breaks fall through, no return value
String result;
switch (day) {
    case MONDAY:
    case TUESDAY:
        result = "Start of week";
        break;
    case FRIDAY:
        result = "End of week";
        break;
    default:
        result = "Midweek";
}

// New switch EXPRESSION — arrow syntax, returns a value
String result = switch (day) {
    case MONDAY, TUESDAY -> "Start of week";
    case FRIDAY          -> "End of week";
    default              -> "Midweek";
};

// Switch expression with blocks — use yield to return value from block
int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY                -> 7;
    case THURSDAY, SATURDAY     -> 8;
    case WEDNESDAY              -> {
        System.out.println("Longest day name!");
        yield 9; // yield returns the value from a block
    }
};
\`\`\`

**Sealed + switch — exhaustive pattern matching (Java 17+):**

\`\`\`java
// Compiler knows all cases — no default needed if all subclasses are handled
double area = switch (shape) {
    case Circle c    -> Math.PI * c.radius * c.radius;
    case Rectangle r -> r.width * r.height;
    case Triangle t  -> 0.5 * t.base * t.height;
};
\`\`\``,
      },
      {
        id: 'p5-l2-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Task: Rewrite as a switch expression**

\`\`\`java
// Old switch statement:
String category;
int score = 85;
if (score >= 90) {
    category = "Excellent";
} else if (score >= 70) {
    category = "Good";
} else if (score >= 50) {
    category = "Pass";
} else {
    category = "Fail";
}

// Rewrite as a switch expression using ranges:
// Hint: switch expressions work with patterns in Java 21,
// but for Java 17 you can use if-else style inside arrow cases:
String category = switch (score / 10) {
    case 10, 9 -> ???;
    case 8, 7  -> ???;
    case 6, 5  -> ???;
    default    -> ???;
};
\`\`\``,
      },
      {
        id: 'p5-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**Sealed classes** (Java 17) restrict which classes can extend a type — giving the compiler complete knowledge of the hierarchy, enabling exhaustive checks. **Switch expressions** (Java 14) use \`->\` arrow syntax to return a value directly, eliminating \`break\` statements and accidental fall-through bugs. Use \`yield\` inside a block to return a value from a multi-line case.`,
      },
    ],
  },

  {
    id: 'p5-l3',
    phase: 5,
    lesson: 3,
    title: 'Java 11+ Quality-of-Life Improvements',
    subtitle: 'String helpers, Stream additions, and Optional upgrades',
    duration: '35 min',
    difficulty: 'Intermediate',
    tags: ['java11', 'java9', 'isBlank', 'strip', 'takeWhile', 'dropWhile', 'ifPresentOrElse'],
    checkpoints: [
      'What is the difference between `strip()` and `trim()` in Java 11?',
      'What does `takeWhile()` do? When does it stop taking elements?',
      'What does `ifPresentOrElse()` do that `ifPresent()` cannot?',
    ],
    sections: [
      {
        id: 'p5-l3-concept',
        type: 'concept',
        title: 'String Helpers (Java 11)',
        content: `Java 11 added several long-overdue String methods that real projects use daily:

\`\`\`java
// isBlank() — true if empty or contains only whitespace
"   ".isBlank();  // true  (better than trim().isEmpty())
"hi".isBlank();   // false

// strip() — removes whitespace, Unicode-aware (better than trim())
"  hello  ".strip();        // "hello"
"  hello  ".stripLeading(); // "hello  "
"  hello  ".stripTrailing(); // "  hello"

// repeat() — repeat the string n times
"ha".repeat(3); // "hahaha"
"-".repeat(20); // "--------------------"

// lines() — split by newlines into a Stream<String>
String text = "Line one\\nLine two\\nLine three";
text.lines()
    .map(String::strip)
    .filter(s -> !s.isBlank())
    .forEach(System.out::println);
\`\`\``,
      },
      {
        id: 'p5-l3-code',
        type: 'code',
        title: 'Code: Stream & Optional Improvements (Java 9)',
        content: `**takeWhile and dropWhile (Java 9):**

\`\`\`java
// takeWhile — read elements UNTIL the predicate becomes false, then stop
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 1, 2);

List<Integer> taken = numbers.stream()
    .takeWhile(n -> n < 5)  // stops at 5 — does NOT keep going to find 1,2 at the end
    .collect(Collectors.toList());
System.out.println(taken); // [1, 2, 3, 4]

// dropWhile — SKIP elements while predicate is true, then keep the rest
List<Integer> dropped = numbers.stream()
    .dropWhile(n -> n < 5) // drops 1,2,3,4 then keeps everything from 5 onwards
    .collect(Collectors.toList());
System.out.println(dropped); // [5, 6, 1, 2]
\`\`\`

**Optional improvements (Java 9):**

\`\`\`java
Optional<String> name = Optional.of("Alice");
Optional<String> empty = Optional.empty();

// ifPresentOrElse — do something if present, do something else if absent
name.ifPresentOrElse(
    n -> System.out.println("Found: " + n),         // if present
    () -> System.out.println("Not found")            // if absent
);
// Output: Found: Alice

empty.ifPresentOrElse(
    n -> System.out.println("Found: " + n),
    () -> System.out.println("Not found")
);
// Output: Not found

// or() — if empty, provide an alternative Optional (Java 9)
Optional<String> result = empty.or(() -> Optional.of("fallback"));
System.out.println(result); // Optional[fallback]

// stream() — convert Optional to a Stream of 0 or 1 element (Java 9)
List<Optional<String>> optionals = List.of(
    Optional.of("Alice"), Optional.empty(), Optional.of("Bob")
);
List<String> names = optionals.stream()
    .flatMap(Optional::stream)  // only non-empty Optionals contribute elements
    .collect(Collectors.toList());
System.out.println(names); // [Alice, Bob]
\`\`\``,
      },
      {
        id: 'p5-l3-task',
        type: 'task',
        title: 'Hands-On Task',
        content: `**Task: Use Java 11 String methods with a Stream pipeline:**

\`\`\`java
String multilineInput = "  Java 8  \\n\\n  Streams  \\n  \\n  Optional  \\n  Records  \\n";

// 1. Split into lines using .lines()
// 2. Strip whitespace from each line using .map(String::strip)
// 3. Filter out blank lines using .filter(s -> !s.isBlank())
// 4. Sort alphabetically
// 5. Join with " | " separator
// Expected: "Java 8 | Optional | Records | Streams"
String result = ???;

// Bonus: Use takeWhile to take only lines that come before "Records" alphabetically
\`\`\``,
      },
      {
        id: 'p5-l3-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `Java 11 added **\`isBlank()\`**, **\`strip()\`**, **\`repeat()\`**, and **\`lines()\`** to make String processing cleaner. Java 9 added **\`takeWhile()\`** (stop when condition fails) and **\`dropWhile()\`** (skip while condition holds) to Streams for ordered data processing. Optional gained **\`ifPresentOrElse()\`** (handle both present and absent cases) and **\`or()\`** (chain fallback Optionals).`,
      },
    ],
  },

  // ── Phase 6 ──────────────────────────────────────────────────────────────────

  {
    id: 'p6-l1',
    phase: 6,
    lesson: 1,
    title: 'The Order Processing Pipeline',
    subtitle: 'Every Java 8 feature working together in production code',
    duration: '60 min',
    difficulty: 'Advanced',
    tags: ['enterprise', 'streams', 'optional', 'functional-interface', 'pipeline'],
    checkpoints: [
      'In `processOrders()`, what does `.peek()` do and why is it used instead of `.map()`?',
      'In `hasSufficientInventory()`, why is `.allMatch()` used instead of a for-loop?',
      'In `calculatePricing()`, what does `.mapToDouble().sum()` do in plain English?',
    ],
    sections: [
      {
        id: 'p6-l1-why',
        type: 'why',
        title: 'Why This Matters',
        content: `This is what real Java looks like in a company. The \`OrderProcessingService\` is a simplified but realistic example of an e-commerce order pipeline — the kind of code you will write at your first job. Every Java 8 feature you have learned appears here, working together.

Walk through each method carefully. This is the exam — can you spot where each concept is used?`,
      },
      {
        id: 'p6-l1-analogy',
        type: 'analogy',
        title: 'Airport Baggage Handling',
        content: `> At an airport, your bag goes through multiple stations: check-in (validation), security scan (inventory check), customs (pricing), priority lane (discounts), and finally collection belt (result).

> Each station does **one specific job**. If a bag fails at any station, it is removed from the belt. The bags that make it all the way through are the processed results.

> \`OrderProcessingService.processOrders()\` is that baggage belt. Each stream operation is one station.`,
      },
      {
        id: 'p6-l1-code',
        type: 'code',
        title: 'Code: The Full Pipeline (from OrderProcessingService.java)',
        content: `**The main pipeline — \`processOrders()\`:**

\`\`\`java
public ProcessingResult processOrders(List<Order> orders) {
    List<String> errors = new ArrayList<>();

    List<Order> processed = orders.stream()
        .filter(this::isValidOrder)                       // Station 1: validate
        .peek(order -> logOrder(order, "Validated"))      // Logging (peek doesn't change stream)
        .map(this::enrichOrder)                           // Station 2: add customer data
        .filter(order -> hasSufficientInventory(order, errors)) // Station 3: check stock
        .map(this::calculatePricing)                      // Station 4: compute total
        .map(order -> applyDiscounts(order, errors))      // Station 5: apply discount
        .peek(order -> order.setStatus(OrderStatus.PROCESSED))
        .collect(Collectors.toList());                    // Terminal: collect results

    int failedCount = orders.size() - processed.size();
    double totalValue = processed.stream()
        .mapToDouble(Order::getTotal)    // Stream<Order> → DoubleStream
        .sum();                          // sum() is a terminal operation

    return new ProcessingResult(processed.size(), failedCount, totalValue, processed, errors);
}
\`\`\`

**Validation — using method reference as Predicate:**

\`\`\`java
private boolean isValidOrder(Order order) {
    return order != null
        && order.getOrderId() != null
        && order.getCustomerId() != null
        && order.getItems() != null
        && !order.getItems().isEmpty();
}
// Used as: .filter(this::isValidOrder) — a method reference to an instance method
\`\`\`

**Inventory check — Streams inside Streams:**

\`\`\`java
private boolean hasSufficientInventory(Order order, List<String> errors) {
    boolean allInStock = order.getItems().stream()
        .allMatch(item -> {
            Boolean inStock = inventoryDatabase.getOrDefault(item.getProductId(), false);
            if (!inStock) {
                errors.add("Product " + item.getProductId() + " out of stock for order " + order.getOrderId());
            }
            return inStock;
        });
    return allInStock;
}
\`\`\`

**Pricing — mapToDouble + sum (like summing a receipt):**

\`\`\`java
private Order calculatePricing(Order order) {
    double subtotal = order.getItems().stream()
        .mapToDouble(OrderItem::getItemTotal)  // method reference as Function
        .sum();                                // terminal operation

    order.setSubtotal(subtotal);
    order.setTax(subtotal * 0.10);
    order.setTotal(subtotal + order.getTax());
    return order;
}
\`\`\`

**Discounts — switch on CustomerType:**

\`\`\`java
private Order applyDiscounts(Order order, List<String> errors) {
    if (order.getCustomer() == null) {
        errors.add("Customer not found for order " + order.getOrderId());
        return order;
    }
    double discount = 0.0;
    CustomerType type = order.getCustomer().getType();
    switch (type) {
        case VIP:     discount = order.getSubtotal() * 0.20; break;
        case PREMIUM: discount = order.getSubtotal() * 0.10; break;
        case REGULAR: break;
    }
    order.setDiscount(discount);
    order.setTotal(order.getTotal() - discount);
    return order;
}
\`\`\``,
      },
      {
        id: 'p6-l1-task',
        type: 'task',
        title: 'Hands-On Task — Trace the Pipeline',
        content: `**Trace order O001 through the full pipeline:**

Order O001: Customer C001 (Alice — PREMIUM), items P001 (qty=2, price=$50) and P002 (qty=1, price=$30). Both items are in stock.

Work through each stream operation manually:

1. \`isValidOrder\` — does O001 pass? (check: not null, has customerId, has items)
2. \`enrichOrder\` — what customer data is added? (look up "C001" in customerDatabase)
3. \`hasSufficientInventory\` — do P001 and P002 pass? (check inventoryDatabase)
4. \`calculatePricing\` — what is the subtotal? tax? total? (P001: 2×$50=$100, P002: 1×$30=$30)
5. \`applyDiscounts\` — what discount does a PREMIUM customer get?
6. Final total after discount?

**Expected final total: $143.00** ($130 subtotal + $13 tax - $13 PREMIUM discount)`,
      },
      {
        id: 'p6-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `Real enterprise code chains multiple Stream operations — each doing one job — into a readable, linear pipeline. **Method references** (\`this::isValidOrder\`) pass whole methods as Predicates or Functions. **Streams inside streams** (\`order.getItems().stream().allMatch(...)\`) are normal and common. **\`mapToDouble().sum()\`** computes totals cleanly without a manual accumulator variable.`,
      },
    ],
  },

  {
    id: 'p6-l2',
    phase: 6,
    lesson: 2,
    title: 'Production Scenarios — What Goes Wrong at 3am',
    subtitle: 'OutOfMemoryError, Deadlock, and Connection Pool Exhaustion explained simply',
    duration: '55 min',
    difficulty: 'Advanced',
    tags: ['OOM', 'deadlock', 'connection-pool', 'production', 'JVM'],
    checkpoints: [
      'Name two common causes of OutOfMemoryError. What is the first thing you do when you see one?',
      'Describe a deadlock in plain English using the "two people at a door" analogy.',
      'What is connection pool exhaustion? What does setting `maximum-pool-size` too low cause?',
    ],
    sections: [
      {
        id: 'p6-l2-why',
        type: 'why',
        title: 'Why This Matters',
        content: `These three scenarios are what **separate a junior developer from a senior one** in interviews and on the job. Interviewers love asking: "Tell me about a production issue you faced." If you have never worked in production, knowing these scenarios — and how to diagnose and fix them — puts you miles ahead.

Every one of these happens in real systems. Every week, somewhere.`,
      },
      {
        id: 'p6-l2-concept',
        type: 'concept',
        title: 'Scenario 1: OutOfMemoryError (OOM)',
        content: `**What it means:** The JVM ran out of heap memory — it cannot allocate any more objects.

> **Analogy:** Imagine a warehouse that keeps receiving deliveries but never ships anything out. Eventually the warehouse is so full that new deliveries cannot fit. The JVM warehouse is full of objects that no one has thrown away.

**Common causes:**
- **Memory leak** — objects are created but never garbage-collected because something still holds a reference to them (e.g., a static List that grows forever)
- **Loading too much data at once** — fetching 10 million database rows into a List instead of streaming them
- **Infinite cache growth** — a cache with no eviction policy that fills up over time

**How to diagnose:**
1. Look at the error message — \`java.lang.OutOfMemoryError: Java heap space\` vs \`GC overhead limit exceeded\`
2. Take a **heap dump** (\`-XX:+HeapDumpOnOutOfMemoryError\`) and analyse with Eclipse MAT or VisualVM
3. Look for classes with unexpectedly large instance counts

**How to fix:**
- Increase heap with \`-Xmx\` (but this is a band-aid, not a fix)
- Find and fix the memory leak — remove stale references, use weak references for caches
- Stream large datasets instead of loading everything into memory`,
      },
      {
        id: 'p6-l2-analogy',
        type: 'analogy',
        title: 'Scenario 2: Deadlock',
        content: `> Picture two people in a narrow corridor, each holding a door shut. Person A says: "I will open my door only after Person B opens theirs." Person B says the same thing. Neither moves. Forever.

> A **deadlock** in Java happens when Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock 2 and waits for Lock 1. Neither thread can proceed.

\`\`\`java
// Classic deadlock pattern:
Object lock1 = new Object();
Object lock2 = new Object();

// Thread A: acquires lock1, then tries to acquire lock2
synchronized (lock1) {
    Thread.sleep(100); // Thread B grabs lock2 during this sleep
    synchronized (lock2) { /* never reached */ }
}

// Thread B: acquires lock2, then tries to acquire lock1
synchronized (lock2) {
    Thread.sleep(100);
    synchronized (lock1) { /* never reached */ }
}
\`\`\`

**How to detect:** Run \`jstack <pid>\` and look for "BLOCKED" threads in a cycle. Or use VisualVM Thread view.

**How to fix:**
- Always acquire locks in a **consistent order** across all threads (lock1 before lock2, always)
- Use \`tryLock(timeout)\` from \`java.util.concurrent.locks.ReentrantLock\` instead of \`synchronized\`
- Prefer higher-level concurrency tools (\`ConcurrentHashMap\`, \`BlockingQueue\`) that manage locking internally`,
      },
      {
        id: 'p6-l2-code',
        type: 'code',
        title: 'Scenario 3: Connection Pool Exhaustion',
        content: `> **Analogy:** Imagine a city with only 10 taxis. If 10 passengers all take a taxi and their rides take an hour each, passenger 11 must wait — possibly forever if the rides never end. The taxi fleet is **exhausted**.

**A database connection pool** is exactly that taxi fleet. Your app has a fixed number of database connections (e.g., HikariCP with \`maximum-pool-size=10\`). If 10 threads all hold a connection and a slow query holds them for 30 seconds, the 11th thread waits... and times out.

\`\`\`yaml
# Spring Boot application.yml — common configuration
spring:
  datasource:
    hikari:
      maximum-pool-size: 10        # max simultaneous connections
      connection-timeout: 30000    # wait 30s before giving up
      idle-timeout: 600000         # close idle connections after 10 min
\`\`\`

**Symptoms:**
- \`HikariPool-1 - Connection is not available, request timed out after 30000ms\`
- All requests slow down or fail under load

**Common causes:**
- **Pool size too small** for the number of concurrent requests
- **Connection not returned** — exception thrown before connection is closed (missing try-with-resources)
- **Slow queries** holding connections too long

**How to fix:**
\`\`\`java
// Always use try-with-resources to guarantee connection return
try (Connection conn = dataSource.getConnection()) {
    // use conn
} // conn is automatically returned to pool here, even if exception thrown

// Monitor pool with Spring Actuator
// GET /actuator/metrics/hikaricp.connections.active
\`\`\`

**Key Spring Boot settings to know:**
- \`maximum-pool-size\`: total connections (default 10, tune to ~(CPU cores × 2) + disk spindles)
- \`connection-timeout\`: how long to wait before failing (default 30s)
- \`minimum-idle\`: warm connections always ready`,
      },
      {
        id: 'p6-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `**OutOfMemoryError** means the JVM heap is full — diagnose with a heap dump, fix by removing memory leaks or streaming large data. **Deadlock** means two threads are each waiting for a lock the other holds — detect with \`jstack\`, fix by always acquiring locks in the same order. **Connection pool exhaustion** means all database connections are in use — fix by using try-with-resources to guarantee connection return and tuning pool size appropriately.`,
      },
    ],
  },

  {
    id: 'p6-l3',
    phase: 6,
    lesson: 3,
    title: 'Interview Preparation',
    subtitle: '15 fresher Q&As + 5 senior Q&As — answer out loud before reading',
    duration: '60 min',
    difficulty: 'Advanced',
    tags: ['interview', 'Q&A', 'fresher', 'senior'],
    checkpoints: [
      'Answer Q1 (What is a lambda?) out loud using an analogy, without looking at the answer below.',
      'Answer Q8 (Difference between map and flatMap) with a concrete example.',
      'Answer Senior Q1 (Stream performance) with at least two trade-offs.',
    ],
    sections: [
      {
        id: 'p6-l3-why',
        type: 'why',
        title: 'How to Use This Lesson',
        content: `For each question below, **say the answer out loud** before reading the provided answer. Interviews are verbal — your brain needs practice retrieving and speaking answers, not just reading them.

For fresher questions: aim for a clear analogy + one code example reference. For senior questions: include trade-offs, production experience, and edge cases.

Do not memorise word for word. Understand the concept and find your own words.`,
      },
      {
        id: 'p6-l3-concept',
        type: 'concept',
        title: 'Top 15 Fresher Interview Questions',
        content: `---

**Q1. What is a lambda expression in Java?**

A lambda is a short, nameless function you write inline — like a sticky note instruction. Before Java 8, you needed a full anonymous class (5+ lines) just to pass behaviour. A lambda collapses that to one line: \`n -> n * 2\`. It works by matching the shape of a functional interface's single method.

---

**Q2. What is a functional interface?**

An interface with exactly one abstract method. \`Predicate<T>\`, \`Function<T,R>\`, \`Consumer<T>\`, and \`Supplier<T>\` are the four main ones from \`java.util.function\`. The \`@FunctionalInterface\` annotation enforces this contract at compile time.

---

**Q3. What is the difference between \`Predicate\`, \`Function\`, \`Consumer\`, and \`Supplier\`?**

| Interface | Input | Output | Use case |
|-----------|-------|--------|----------|
| Predicate\<T\> | T | boolean | filter / test |
| Function\<T,R\> | T | R | transform / map |
| Consumer\<T\> | T | void | forEach / side effects |
| Supplier\<T\> | none | T | lazy creation / orElseGet |

---

**Q4. What is a Stream in Java?**

A Stream is a sequence of elements from a source (List, array) that you process through a pipeline of operations. Think of a conveyor belt: data flows in, intermediate operations (filter, map) transform it, a terminal operation (collect, count) produces the result. Streams are lazy — nothing runs until a terminal operation is called.

---

**Q5. What is the difference between intermediate and terminal operations?**

Intermediate operations (filter, map, sorted) are lazy — they describe what to do but do nothing yet. They return a Stream. Terminal operations (collect, count, forEach) trigger the pipeline to run and produce a result. A Stream can only have one terminal operation.

---

**Q6. What is method reference syntax (\`::\`) and when do you use it?**

Method reference is shorthand for a lambda that does nothing but call one existing method. \`String::toUpperCase\` is cleaner than \`s -> s.toUpperCase()\`. Use it when the lambda body is just a single method call with the parameter passed directly. There are four types: static, instance (any object), instance (specific object), and constructor.

---

**Q7. What is Optional and why was it introduced?**

Optional\<T\> is a container that may or may not hold a value. It was introduced to make the possibility of absence explicit — instead of silently returning null and crashing with NullPointerException later. It forces the caller to handle the "no value" case deliberately using orElse(), ifPresent(), or map().

---

**Q8. What is the difference between \`map()\` and \`flatMap()\` in Streams?**

\`map()\` transforms each element into one new element — one-to-one. \`flatMap()\` transforms each element into a Stream of elements, then flattens all those streams into one — one-to-many. Use flatMap when each input produces multiple outputs. Example: splitting sentences into words — each sentence becomes a Stream of words, flatMap combines all word streams into one.

---

**Q9. What is \`groupingBy\` and what does it return?**

\`Collectors.groupingBy()\` sorts stream elements into groups based on a key function. It returns \`Map<K, List<T>>\`. Example: \`employees.stream().collect(groupingBy(Employee::getDepartment))\` gives you a Map where each key is a department name and each value is the list of employees in that department.

---

**Q10. What is the difference between \`orElse()\` and \`orElseGet()\` in Optional?**

Both provide a fallback value when Optional is empty. The key difference: \`orElse(value)\` **always evaluates** the argument even if Optional has a value. \`orElseGet(supplier)\` is lazy — it only evaluates the supplier if Optional is empty. For expensive computations (like a database call), always use \`orElseGet\`.

---

**Q11. What is a Record in Java 16?**

A Record is a compact class declaration for immutable data carriers. \`public record Student(String name, int age) {}\` automatically generates a constructor, accessors (\`name()\`, \`age()\`), \`equals()\`, \`hashCode()\`, and \`toString()\`. Use Records wherever you have a class that just holds data with no additional logic.

---

**Q12. What does \`var\` do in Java 10?**

\`var\` lets the compiler infer the type of a local variable from the right-hand side. \`var list = new ArrayList<String>()\` is the same as \`ArrayList<String> list = new ArrayList<String>()\` — the type is still known at compile time. \`var\` cannot be used for fields, method parameters, or return types.

---

**Q13. What is pattern matching for \`instanceof\` (Java 16)?**

It combines the type check and cast into one step. Old style: \`if (obj instanceof String) { String s = (String) obj; ... }\`. New style: \`if (obj instanceof String s) { ... }\`. The variable \`s\` is already a \`String\` inside the if block — no redundant cast needed.

---

**Q14. What is the difference between \`filter()\` and \`takeWhile()\` (Java 9)?**

\`filter()\` checks every element in the stream — it never stops early. \`takeWhile()\` processes elements in order and **stops as soon as the predicate returns false**. For sorted or ordered data where you only want the leading portion that satisfies a condition, \`takeWhile\` is more efficient.

---

**Q15. What is \`reduce()\` in Streams?**

\`reduce()\` combines all elements into a single result using a binary operator. Example: \`numbers.stream().reduce(0, Integer::sum)\` sums all integers. It is like adding items on a receipt one by one until you get a total. The first argument is the identity (starting value); the second is how to combine two elements.

---`,
      },
      {
        id: 'p6-l3-task',
        type: 'task',
        title: '5 Senior-Level Questions — Think Before Reading',
        content: `---

**Senior Q1. When would you NOT use Streams? What are their downsides?**

*Fresher answer:* "Streams are always better than loops." ❌

*Senior answer:* Streams have overhead from lambda allocation and boxing/unboxing primitives. For tight loops over primitive arrays (image processing, scientific computing), a plain for-loop is faster. Streams also make debugging harder — you cannot step through a pipeline the same way. For very short collections (2-3 elements), a stream is overkill. Also, Streams are sequential by default — parallel streams help only when the work is CPU-bound, independent, and large enough to offset the thread coordination cost.

---

**Senior Q2. Explain lazy evaluation in Streams with a concrete production benefit.**

*Fresher answer:* "Streams are lazy." (no further detail) ❌

*Senior answer:* Because intermediate operations are lazy, Java short-circuits them. Example: \`stream.filter(expensive).findFirst()\` — if the first element passes the filter, only ONE element is ever processed. This is critical for infinite streams (\`Stream.iterate()\`) and for pipelines where early exit is common. In production, this means you can write a general filter+findFirst query without worrying that it processes the entire dataset.

---

**Senior Q3. What is the difference between \`parallel().stream()\` and \`stream().parallel()\`? When is parallel useful?**

*Senior answer:* Both produce a parallel stream — they are equivalent. Parallel streams use the ForkJoinPool (default: number of CPU cores). They are useful when: (1) the collection is large (>10k elements), (2) operations are independent (no shared state), (3) per-element work is CPU-intensive. Parallel streams are **not** a free speedup — for small collections or I/O-bound work, thread coordination overhead makes them slower. Never use parallel streams with \`forEach\` on a non-thread-safe collection.

---

**Senior Q4. How would you handle a \`NullPointerException\` deep in a method chain without Optional?**

*Senior answer:* Before Java 8, we used defensive null checks at every step — ugly and verbose. With Optional, you model the possibility of absence in the type signature. But Optional should be used for **return types**, not as fields or parameters. For deeply nested null checks, \`Optional.map().map().orElse()\` chains handle each level. For Java 14+, use the improved NPE message that names the exact variable that was null. In production, also add structured logging with the full context before rethrowing.

---

**Senior Q5. You have 1 million records in a database. Your code does \`.findAll()\` and processes them in a stream. What is wrong and how do you fix it?**

*Senior answer:* \`findAll()\` loads all 1 million records into memory at once — likely causing OutOfMemoryError. The fix is to **stream the data from the database** rather than loading it all. With Spring Data JPA, use \`Stream<T> findAllBy()\` (which returns a database-backed stream with \`@QueryHints\` for scroll cursors) or process in pages using \`Pageable\`. This way, only a batch of records is in memory at any time. Also consider: use database-side filtering (WHERE clause) rather than in-memory filtering — the database is far faster at that.

---`,
      },
      {
        id: 'p6-l3-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `A fresher answers interview questions by stating the definition and an analogy. A senior answers by adding trade-offs, production experience, and edge cases. The gap between junior and senior is not knowledge of features — it is understanding **when not to use them** and **what goes wrong in production**. You now have both: the feature knowledge from phases 1-5, and the production context from phase 6.`,
      },
    ],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'java_course_completed';

export function getLessonsForPhase(phase: number): CourseLesson[] {
  return COURSE_LESSONS.filter((l) => l.phase === phase);
}

export function getLessonById(id: string): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.id === id);
}

export function getNextLesson(currentId: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < COURSE_LESSONS.length - 1 ? COURSE_LESSONS[idx + 1] : undefined;
}

export function getPrevLesson(currentId: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === currentId);
  return idx > 0 ? COURSE_LESSONS[idx - 1] : undefined;
}

export function getCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markLessonComplete(id: string): void {
  const completed = getCompletedLessons();
  completed.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function markLessonIncomplete(id: string): void {
  const completed = getCompletedLessons();
  completed.delete(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function getTotalLessons(): number {
  return COURSE_LESSONS.length;
}

export function getTotalHours(): number {
  return 20;
}
