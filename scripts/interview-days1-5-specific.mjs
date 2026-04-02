import fs from 'node:fs';

const filePath = 'public/data/phase1.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));

const bank = {
  1: {
    conceptual: [
      ['What is the JDK and what tools does it include?', 'The JDK (Java Development Kit) is the full development bundle: it includes javac (compiler), jar, javadoc, jdb, and the JRE so you can compile and run Java programs.'],
      ['What is the JRE and can you compile Java with only the JRE?', 'The JRE (Java Runtime Environment) contains the JVM and libraries needed to run Java applications. You cannot compile new .java files with JRE alone—you need the JDK for javac.'],
      ['What is the JVM’s role?', 'The JVM loads .class bytecode, verifies it, and executes it on the host OS. It provides memory management (heap, GC) and the execution engine for your program.'],
      ['What is the relationship between .java, .class, and running a program?', 'You write .java source, javac produces .class bytecode, and the java launcher starts the JVM to execute the bytecode for the named class.'],
      ['Why is main() declared public static void main(String[] args)?', 'public so the JVM can call it from outside the class; static so it runs without constructing an object first; void because the JVM does not use a return value; String[] args holds command-line arguments.'],
      ['What does “platform independence” mean for Java?', 'Source compiles to bytecode that any compatible JVM can run, so the same .class can run on Windows, Linux, or macOS without recompiling for each CPU instruction set.'],
      ['How do you check that JDK (not only JRE) is installed correctly?', 'Run javac -version in the terminal. If javac is missing or errors, the JDK is not on PATH or only a JRE was installed.'],
      ['What is JAVA_HOME and why do build tools use it?', 'JAVA_HOME points to the JDK installation root. Maven, Gradle, and IDEs use it to find the compiler and standard libraries consistently across machines.'],
      ['What happens if the public class name does not match the file name?', 'For a public top-level class, the file must be named ClassName.java. A mismatch causes a compile-time error.'],
      ['What is the difference between compiling with javac and running with java?', 'javac translates source to bytecode files; java starts the JVM and loads the class by name (with package-aware classpath).'],
      ['Can two JVM versions behave differently for the same bytecode?', 'Generally bytecode is portable, but behavior can differ if you rely on version-specific APIs, preview features, or different default GC/security settings.'],
      ['What is classpath and when does it matter?', 'Classpath tells the JVM where to find .class files and JARs. Wrong classpath causes ClassNotFoundException even if the code compiled.'],
    ],
    codeBased: [
      ['Show how to print Java version and Java home from code.', 'Use System.getProperty("java.version") and System.getProperty("java.home") and print them in main.'],
      ['Write the minimal HelloWorld class and the exact commands to compile and run it.', 'public class Hello { public static void main(String[] a){ System.out.println("Hello"); } } then javac Hello.java and java Hello.'],
      ['How do command-line arguments appear in Java?', 'They are in the String[] args parameter: args[0] is the first argument after the class name.'],
      ['What error do you get if you run java Hello but the class is in package com.example?', 'You must use the fully qualified name (com.example.Hello) or run from the correct classpath root matching the package directory structure.'],
      ['How would you detect if the program is running on Java 17 or higher?', 'Parse System.getProperty("java.version")—for modern Java it often starts with "17", "21", etc.—or use Runtime.version().feature().'],
      ['What is the output of java -cp . Hello if Hello.class is missing?', 'The JVM throws java.lang.ClassNotFoundException or similar because it cannot load the class.'],
      ['Why might java work but javac fail on the same machine?', 'Only a JRE is installed or PATH points to a JRE bin without javac; install full JDK and put JDK bin before other Java entries on PATH.'],
      ['Write one line that prints all system properties keys containing "java."', 'Use Properties p = System.getProperties(); p.stringPropertyNames().stream().filter(k->k.startsWith("java.")).forEach(System.out::println);'],
    ],
    seniorScenario: [
      ['CI builds with Java 11 but developers use Java 17 locally. What do you standardize?', 'Pin the JDK in the build (toolchains, Gradle JVM, Maven enforcer), align CI image and local dev with the same major version, and fail the build on mismatch.'],
      ['A service fails at startup: "Error: Could not find or load main class". What do you check?', 'Verify the main class name, package declaration, classpath, JAR manifest Main-Class entry, and that you run from the correct working directory.'],
      ['Someone installed JDK but terminal still says javac is not recognized on Windows. What steps?', 'Confirm JDK bin path, add it to user/system PATH, set JAVA_HOME to JDK root, open a new terminal, and ensure no conflicting older java earlier in PATH.'],
      ['You need to run the same JAR on Linux servers with different Java patch levels. What policy?', 'Standardize minimum supported LTS, test on lowest supported patch, document required flags, and use container images with pinned JDK versions.'],
      ['How do you explain JVM vs JDK to a non-technical stakeholder?', 'JDK is the full developer kit to build and run; JVM is only the engine that runs the program once built—like needing a factory (JDK) to make a car part, then an engine (JVM) to run the car.'],
    ],
    wrongAnswers: [
      'JDK and JVM are the same thing.',
      'You can compile .java files using only the JRE.',
      'Java source code runs directly on the CPU without bytecode.',
      'main can be private static void main and the JVM will still start it.',
      'Classpath is only needed for web applications, not console programs.',
    ],
  },
  2: {
    conceptual: [
      ['List Java primitive types and their main use cases.', 'byte/short/int/long for integers (int default choice; long for large counts); float/double for decimals (double default); boolean for flags; char for single characters.'],
      ['What is the difference between int and Integer?', 'int is a primitive stored by value; Integer is an object wrapper that can be null and is used with generics and collections.'],
      ['What is autoboxing? Give an example.', 'Autoboxing converts int to Integer automatically, e.g. Integer x = 5;. Unboxing is int y = x;.'],
      ['Why can int arithmetic overflow silently?', 'Integral types wrap around modulo 2^bits—Integer.MAX_VALUE + 1 becomes Integer.MIN_VALUE without throwing unless you use methods like Math.addExact.'],
      ['When should you use BigDecimal instead of double for money?', 'BigDecimal gives exact decimal arithmetic; double uses binary floating-point and can show 0.1 + 0.2 != 0.3 style errors.'],
      ['What is widening vs narrowing conversion?', 'Widening (e.g. int to long) is safe implicitly; narrowing (long to int) requires explicit cast and may lose high bits.'],
      ['What does the L suffix mean in literals?', '123L is a long literal; without L, integer literals default to int and may overflow at compile time if too large.'],
      ['Can you use == to compare two Integer objects?', '== compares references; two different Integer objects with value 200 may not be ==. Use equals() for value comparison, or compare unboxed ints.'],
      ['What is Unicode and how does char relate?', 'Java char is 16-bit UTF-16 code units; supplementary characters may need two chars (surrogate pairs).'],
      ['What is the default value of an uninitialized instance int field?', '0. Local variables must be assigned before use; fields get default values.'],
      ['Why might you choose short or byte over int?', 'Rarely for space in large arrays or binary protocols; usually int is simpler unless you have measured memory constraints.'],
      ['What is NaN in floating-point and how does == behave with it?', 'NaN means not-a-number; NaN == NaN is false—you must use Float.isNaN or Double.isNaN.'],
    ],
    codeBased: [
      ['Write code that demonstrates int overflow.', 'int x = Integer.MAX_VALUE; System.out.println(x + 1); prints -2147483648.'],
      ['Show widening from int to long without cast.', 'long y = 1_000_000_000 * 3L; or assign int to long variable.'],
      ['Show narrowing cast from long to int with data loss.', 'long big = 3000000000L; int small = (int) big; print both—value truncates to lower 32 bits.'],
      ['Compare double sum 0.1+0.2 vs BigDecimal sum.', 'double prints imprecise; new BigDecimal("0.1").add(new BigDecimal("0.2")) is exact for decimal scale.'],
      ['Parse user input string "42" to int safely.', 'Use Integer.parseInt with try/catch NumberFormatException for invalid input.'],
      ['Create a List<Integer> and add primitives—what happens?', 'Autoboxing: list.add(5) boxes 5 to Integer.'],
      ['When is Integer.valueOf(100) == Integer.valueOf(100) possibly true?', 'Small integers may be cached (-128 to 127); always use equals for value comparison across arbitrary ranges.'],
      ['Write a guard for division by zero for int and for double.', 'For int, check divisor != 0 before divide; for double, dividing by 0.0 yields Infinity or NaN, not exception.'],
    ],
    seniorScenario: [
      ['Counters in analytics hit negative values—suspected overflow. Fix?', 'Move counters to long or AtomicLong, add bounds checks, and alert on anomalous deltas.'],
      ['Payment microservice shows cent mismatches in reports. Likely cause?', 'Floating-point in money paths; migrate to BigDecimal with RoundingMode and explicit scale, audit all arithmetic sites.'],
      ['GC pressure from excessive Integer boxing in hot loop. Mitigation?', 'Use primitive int where possible, IntStream, or specialized collections to reduce allocation.'],
      ['API returns price as double; clients see rounding bugs. Policy?', 'Use BigDecimal in domain layer, serialize as string or scaled long (cents), never raw double for money.'],
      ['How do you document numeric ranges for a public API field?', 'State min/max, unit, overflow behavior, and whether null/zero are allowed—especially for int vs long vs BigDecimal.'],
    ],
    wrongAnswers: [
      'double is the best type for all currency calculations.',
      'Autoboxing means Integer and int are always interchangeable with no performance cost.',
      'Casting long to int never loses data.',
      'Integer.parseInt("abc") returns 0.',
      'char is the same as String with one character.',
    ],
  },
  3: {
    conceptual: [
      ['What is short-circuit evaluation in && and ||?', 'For &&, if the left operand is false, the right is not evaluated. For ||, if the left is true, the right is skipped.'],
      ['Difference between while and do-while?', 'while checks condition before each iteration; do-while checks after, so the body runs at least once.'],
      ['What is the difference between break and continue?', 'break exits the innermost loop or switch; continue skips to the next iteration of the innermost loop.'],
      ['What is wrong with if (x = 5) in Java?', 'Single = is assignment, not comparison; this is a compile error for boolean context unless x is boolean (rare pitfall).'],
      ['How does the ternary operator differ from if-else?', 'It is an expression that returns a value and must be used in a value context; both branches should be type-compatible.'],
      ['What is fall-through in switch (classic style)?', 'Without break, execution continues into the next case label—often a bug if unintended.'],
      ['What are switch expressions (Java 14+) advantages?', 'They can return values, enforce exhaustiveness with enums/sealed types, and reduce boilerplate with arrow labels.'],
      ['Why are labeled break/continue rarely used?', 'They jump out of nested loops but can harm readability; refactoring to methods is often clearer.'],
      ['What is operator precedence risk in a + b * c?', 'Multiplication binds tighter than addition; use parentheses when unsure.'],
      ['How do you avoid off-by-one errors in for loops?', 'Clearly define inclusive/exclusive end, use i < length vs i <= length-1 consistently, and test with 0, 1, and max-size inputs.'],
      ['What does the % operator do for negative numbers?', 'Sign of result follows dividend in Java; be careful in modular arithmetic for indices.'],
      ['When is a switch on String compiled differently than on int?', 'String switch uses hashCode/equals under the hood; null string throws NullPointerException.'],
    ],
    codeBased: [
      ['Write a for-loop that prints only odd numbers from 1 to 20.', 'for (int i=1;i<=20;i+=2) System.out.println(i); or use i%2!=0 inside loop.'],
      ['Show switch expression returning a String grade from int score.', 'return switch(score){ case 90,100 -> "A"; default -> "Other"; }; with ranges handled via if or separate logic.'],
      ['Demonstrate break vs continue in nested loop.', 'Inner continue skips to next inner iteration; labeled break exits outer loop when condition met.'],
      ['Write code that safely divides two ints only if divisor != 0.', 'if (b==0) handle error; else System.out.println(a/b);'],
      ['Use ternary to assign min of two ints.', 'int m = a < b ? a : b;'],
      ['Print FizzBuzz for 1..15 with one loop.', 'if (i%15==0) FizzBuzz; else if (i%3==0) Fizz; else if (i%5==0) Buzz; else number.'],
      ['Show do-while that reads until input is "quit" (pseudo).', 'do { ... } while (!line.equals("quit"));'],
      ['Detect leap year with boolean expression (div by 4, except 100, unless 400).', 'boolean leap = (y%4==0 && y%100!=0) || (y%400==0);'],
    ],
    seniorScenario: [
      ['A pricing rule engine has nested if-else bugs in production. Approach?', 'Extract rules into table-driven or strategy classes, add unit tests per rule branch, and use coverage tools.'],
      ['Infinite loop in worker thread drains CPU. Debugging?', 'Thread dump to see stack, add loop invariants and max-iteration guards, fix termination condition.'],
      ['Feature flags caused wrong branch in multi-tenant billing. Prevention?', 'Centralize flag evaluation, log decision inputs, and add integration tests per tenant scenario.'],
      ['Code review: 8-level nested if in service method. Refactor?', 'Early returns, extract methods, or polymorphism; measure cyclomatic complexity.'],
      ['How do you test complex boolean conditions?', 'Truth table or parameterized tests covering all combinations of predicates.'],
    ],
    wrongAnswers: [
      'continue exits the entire method.',
      'switch without break is always safe in Java.',
      'The condition in while(true) can never cause an infinite loop.',
      'x = 5 and x == 5 mean the same in an if condition.',
      'do-while always runs zero times.',
    ],
  },
  4: {
    conceptual: [
      ['What is the length of an array after int[] a = new int[5]?', 'a.length is 5. Length is fixed at creation and cannot be resized.'],
      ['What is valid index range for an array of length n?', '0 through n-1 inclusive; index n is out of bounds.'],
      ['What is a jagged array in Java?', 'A 2D array where each row can have different lengths—an array of int[] rows.'],
      ['Time complexity to access arr[i]?', 'O(1) random access by index.'],
      ['What does Arrays.sort do for int[] vs Object[]?', 'For primitives, uses tuned dual-pivot quicksort; for objects, uses TimSort and requires Comparable or Comparator.'],
      ['What is System.arraycopy used for?', 'Fast copying between arrays with specified source and destination offsets and length.'],
      ['Why might you prefer Arrays.copyOf over manual loops?', 'It is concise and can resize arrays (truncate or pad with defaults).'],
      ['What is the default value of new int[10] elements?', '0 for each int element.'],
      ['Can you resize an array in place?', 'No—you create a new array and copy elements, or use ArrayList for dynamic sizing.'],
      ['What exception for arr[-1] or arr[arr.length]?', 'ArrayIndexOutOfBoundsException.'],
      ['How does enhanced for (for-each) work with arrays?', 'It uses an index iterator under the hood for arrays; you cannot modify index or remove during iteration like Iterator.'],
      ['What is two-pointer technique used for?', 'Often for sorted array problems: pair sum, palindrome check, removing duplicates in-place.'],
    ],
    codeBased: [
      ['Write code to find maximum element in int[].', 'Track max = arr[0], loop from 1, update if arr[i] > max; handle empty array separately.'],
      ['Reverse an int[] in place.', 'Two pointers from both ends swap until meet.'],
      ['Copy first half of array to new array.', 'Arrays.copyOfRange(arr, 0, arr.length/2).'],
      ['Check if array contains duplicate using a Set.', 'Add elements to HashSet; if add returns false, duplicate exists.'],
      ['Sum all elements with enhanced for.', 'int s=0; for(int x: arr) s+=x;'],
      ['Create 3x3 matrix and print row sums.', 'Nested loops, inner sums each row.'],
      ['Find index of first occurrence of target or -1.', 'Linear search loop with break or return index when found.'],
      ['Sort String[] case-insensitively.', 'Arrays.sort(arr, String.CASE_INSENSITIVE_ORDER).'],
    ],
    seniorScenario: [
      ['Large byte[] allocation causes OOM in service. Mitigation?', 'Stream processing, chunking, or memory-mapped files instead of loading full array.'],
      ['Array-based cache grows unbounded. Fix?', 'Use bounded structures (ring buffer, LRU), eviction policy, and monitor heap.'],
      ['Parallel sort on huge primitive array—when beneficial?', 'Arrays.parallelSort for large arrays on multicore; measure overhead for small arrays.'],
      ['Off-by-one in production batch indexing caused wrong shard. Prevention?', 'Unit tests for boundary indices, assert invariants, and code review for loop bounds.'],
      ['Migrating from array to ArrayList in hot API—risks?', 'Boxing cost, iterator invalidation patterns differ; profile and test regression.'],
    ],
    wrongAnswers: [
      'Array length can be changed after creation with array.resize().',
      'arr[arr.length] is the last valid index.',
      'Arrays.sort works the same for int[] and String[] without any comparator difference.',
      'Enhanced for loop allows removing elements from array during iteration safely.',
      'Two-dimensional arrays in Java are always rectangular.',
    ],
  },
  5: {
    conceptual: [
      ['Why is String immutable in Java?', 'Once created, the character sequence cannot be changed; methods like substring return new String objects.'],
      ['What is the string pool?', 'A JVM cache of string literals so identical literals may share the same instance to save memory.'],
      ['Difference between == and equals for String?', '== compares references; equals compares character content character by character.'],
      ['When should you use StringBuilder?', 'When building strings in loops or many concatenations to avoid creating many intermediate String objects.'],
      ['Difference between StringBuilder and StringBuffer?', 'StringBuilder is not synchronized (faster single-thread); StringBuffer methods are synchronized for thread safety.'],
      ['What does intern() do?', 'Returns the canonical representation from the pool—use sparingly and only when you understand memory implications.'],
      ['What does substring(begin, end) use for end index?', 'The end index is exclusive—substring(0,3) is first three characters.'],
      ['Why can comparing strings with == sometimes appear to work?', 'Literals may be interned and refer to same object; new String("a") == "a" is typically false.'],
      ['What does trim() do?', 'Removes leading and trailing whitespace (Unicode-aware); does not change internal spaces in the middle.'],
      ['How does split work with regex?', 'split takes a regex pattern; escape special chars like "." with "\\." for literal dot.'],
      ['What is StringJoiner or String.join for?', 'Cleaner joining of strings with delimiters without manual concatenation loops.'],
      ['Locale impact on toLowerCase/toUpperCase?', 'Turkish locale has special casing rules; use Locale.ROOT for consistent ASCII-style normalization when needed.'],
    ],
    codeBased: [
      ['Demonstrate == vs equals with literals and new String.', 'String a="hi"; String b=new String("hi"); a==b false, a.equals(b) true.'],
      ['Build a comma-separated string from List<String> efficiently.', 'Use String.join(",", list) or StringBuilder loop with delimiter logic.'],
      ['Count occurrences of substring "ab" in a string.', 'Loop with indexOf from advancing index or use regex sparingly for clarity.'],
      ['Check palindrome ignoring case and spaces.', 'Normalize: replaceAll("\\s","").toLowerCase(), then two pointers from ends.'],
      ['Extract domain from email user@domain.com.', "int at = email.lastIndexOf('@'); substring(at+1) with validation."],
      ['Use StringBuilder to append 1000 times in loop.', 'StringBuilder sb=new StringBuilder(); for(...) sb.append(x);'],
      ['Why does "a"+"b" compile differently in loop vs constant?', 'In loop, repeated concatenation may create many objects unless using StringBuilder.'],
      ['Compare two strings case-insensitively.', 's1.equalsIgnoreCase(s2) or regionMatches.'],
    ],
    seniorScenario: [
      ['Logs allocate huge strings per request causing GC pressure. Fix?', 'Lazy logging APIs, parameterized messages, avoid string concatenation before log level check if expensive.'],
      ['Usernames mismatch due to Unicode normalization (lookalike chars). Approach?', 'Normalize with Normalizer, define allowed charset, and store canonical form.'],
      ['Regex DoS (catastrophic backtracking) on user input. Mitigation?', 'Timeout on regex, possessive quantifiers, simpler parsers, or input length limits.'],
      ['Migrating from String to byte[] for secrets in memory?', 'Use char[] where possible and clear arrays after use; Strings stay in pool and are harder to scrub.'],
      ['International sort order wrong in UI. Cause?', 'Use Collator with appropriate Locale and strength, not raw String.compareTo for user-visible sorting.'],
    ],
    wrongAnswers: [
      'String is mutable—you can change characters in place.',
      '== is the correct way to compare all string contents.',
      'StringBuilder is always slower than using + for concatenation.',
      'substring(0,3) includes index 3 in the result.',
      'split(".") splits on literal dot without escaping.',
    ],
  },
};

for (const day of data.days) {
  if (day.day < 1 || day.day > 5) continue;
  const b = bank[day.day];
  if (!b) continue;
  const section = day.sections.find((s) => s.type === 'interview');
  if (!section) continue;
  section.title = 'Interview Drill';
  section.conceptual = b.conceptual.map(([question, answer]) => ({ question, answer }));
  section.codeBased = b.codeBased.map(([question, answer]) => ({ question, answer }));
  section.seniorScenario = b.seniorScenario.map(([question, answer]) => ({ question, answer }));
  section.wrongAnswers = b.wrongAnswers;
}

fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('Days 1-5 interview bank: topic-specific Q&A applied.');
