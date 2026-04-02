/**
 * Topic-specific Code tab snippets — Days 1–45.
 * Each level: { description, code, output }
 */

function block(pkg, body) {
  return `package ${pkg};\n\n${body}`;
}

export const SNIPPETS_PART1 = {
  1: {
    basic: {
      description:
        'Minimal entry point: prints a message and echoes command-line arguments so you see how args flow into main.',
      code: block(
        'arch.day1',
        `public class Day1Basic {
    public static void main(String[] args) {
        System.out.println("Java setup check");
        System.out.println("main args count: " + args.length);
        for (int i = 0; i < args.length; i++) {
            System.out.println("arg[" + i + "] = " + args[i]);
        }
    }
}`,
      ),
      output: 'Java setup check\nmain args count: 0\n',
    },
    intermediate: {
      description:
        'JDK vs JRE vs JVM: use switch expressions to print what each layer is responsible for.',
      code: block(
        'arch.day1',
        `import java.util.List;

public class Day1Intermediate {
    public static void main(String[] args) {
        List<String> components = List.of("JDK", "JRE", "JVM");
        for (String c : components) {
            switch (c) {
                case "JDK" -> System.out.println("JDK: compiler (javac), tools, includes JRE");
                case "JRE" -> System.out.println("JRE: JVM + libraries to run bytecode");
                case "JVM" -> System.out.println("JVM: loads and executes .class bytecode");
                default -> System.out.println("Unknown");
            }
        }
    }
}`,
      ),
      output:
        'JDK: compiler (javac), tools, includes JRE\nJRE: JVM + libraries to run bytecode\nJVM: loads and executes .class bytecode\n',
    },
    advanced: {
      description:
        'Runtime diagnostics: read java.version, java.home, and OS so you can debug “wrong Java on PATH” issues.',
      code: block(
        'arch.day1',
        `import java.util.Map;

public class Day1Advanced {
    public static void main(String[] args) {
        Map<String, String> diagnostics = Map.of(
            "java.version", System.getProperty("java.version"),
            "java.vendor", System.getProperty("java.vendor"),
            "java.home", System.getProperty("java.home"),
            "os.name", System.getProperty("os.name")
        );
        diagnostics.forEach((k, v) -> System.out.println(k + " = " + v));
        System.out.println("If javac is missing, install JDK and fix PATH / JAVA_HOME.");
    }
}`,
      ),
      output: '(Exact lines depend on your machine; keys include java.version, java.home, etc.)\n',
    },
  },

  2: {
    basic: {
      description:
        'Declare primitives (int, long, double, boolean, char) and print them — core of Java’s type system.',
      code: block(
        'arch.day2',
        `public class Day2Basic {
    public static void main(String[] args) {
        int age = 24;
        long users = 3_000_000_000L;
        double price = 19.99;
        boolean active = true;
        char grade = 'A';
        System.out.println("age = " + age);
        System.out.println("users = " + users);
        System.out.println("price = " + price);
        System.out.println("active = " + active);
        System.out.println("grade = " + grade);
    }
}`,
      ),
      output: 'age = 24\nusers = 3000000000\nprice = 19.99\nactive = true\ngrade = A\n',
    },
    intermediate: {
      description:
        'Autoboxing/unboxing, narrowing cast, and silent int overflow — common interview talking points.',
      code: block(
        'arch.day2',
        `public class Day2Intermediate {
    public static void main(String[] args) {
        Integer boxed = 50;
        int unboxed = boxed;
        long amount = 1000L;
        int narrowed = (int) amount;
        System.out.println("boxed = " + boxed + ", unboxed = " + unboxed);
        System.out.println("narrowed = " + narrowed);
        int max = Integer.MAX_VALUE;
        System.out.println("overflow demo = " + (max + 1));
    }
}`,
      ),
      output: 'boxed = 50, unboxed = 50\nnarrowed = 1000\noverflow demo = -2147483648\n',
    },
    advanced: {
      description:
        'Compare double vs BigDecimal for decimals; use long when values exceed int range.',
      code: block(
        'arch.day2',
        `import java.math.BigDecimal;

public class Day2Advanced {
    public static void main(String[] args) {
        double wrong = 0.1 + 0.2;
        BigDecimal safe = new BigDecimal("0.1").add(new BigDecimal("0.2"));
        System.out.println("double result = " + wrong);
        System.out.println("BigDecimal result = " + safe);
        long impressions = 5_000_000_000L;
        if (impressions > Integer.MAX_VALUE) {
            System.out.println("Use long here — int would overflow.");
        }
    }
}`,
      ),
      output:
        'double result = 0.30000000000000004\nBigDecimal result = 0.3\nUse long here — int would overflow.\n',
    },
  },

  3: {
    basic: {
      description:
        'if / else-if ladder: classify a numeric score into bands (same pattern as many business rules).',
      code: block(
        'arch.day3',
        `public class Day3Basic {
    public static void main(String[] args) {
        int score = 72;
        if (score >= 80) {
            System.out.println("Excellent");
        } else if (score >= 60) {
            System.out.println("Good");
        } else {
            System.out.println("Need improvement");
        }
    }
}`,
      ),
      output: 'Good\n',
    },
    intermediate: {
      description:
        'for-loop with continue (skip evens) and break (stop early) — control flow in one place.',
      code: block(
        'arch.day3',
        `public class Day3Intermediate {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;
            System.out.println("Odd number: " + i);
            if (i == 7) break;
        }
    }
}`,
      ),
      output: 'Odd number: 1\nOdd number: 3\nOdd number: 5\nOdd number: 7\n',
    },
    advanced: {
      description:
        'Compound boolean guards: age + ID checks with early returns (readable validation style).',
      code: block(
        'arch.day3',
        `public class Day3Advanced {
    static String classify(int age, boolean hasId) {
        if (age < 0) return "INVALID";
        if (age >= 18 && hasId) return "ALLOW";
        if (age >= 18) return "ID_REQUIRED";
        return "DENY";
    }

    public static void main(String[] args) {
        System.out.println(classify(20, true));
        System.out.println(classify(20, false));
        System.out.println(classify(15, true));
    }
}`,
      ),
      output: 'ALLOW\nID_REQUIRED\nDENY\n',
    },
  },

  4: {
    basic: {
      description:
        'Fixed-size int array: length, indexing, and Arrays.sort — foundation for collections later.',
      code: block(
        'arch.day4',
        `import java.util.Arrays;

public class Day4Basic {
    public static void main(String[] args) {
        int[] nums = {4, 2, 9, 1, 5};
        System.out.println("length = " + nums.length);
        System.out.println("first = " + nums[0]);
        Arrays.sort(nums);
        System.out.println("sorted = " + Arrays.toString(nums));
    }
}`,
      ),
      output: 'length = 5\nfirst = 4\nsorted = [1, 2, 4, 5, 9]\n',
    },
    intermediate: {
      description:
        'Two-pointer in-place reverse — classic array technique used in interviews.',
      code: block(
        'arch.day4',
        `import java.util.Arrays;

public class Day4Intermediate {
    static void reverse(int[] a) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int t = a[l];
            a[l] = a[r];
            a[r] = t;
            l++;
            r--;
        }
    }

    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        reverse(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      ),
      output: '[50, 40, 30, 20, 10]\n',
    },
    advanced: {
      description:
        'Kadane-style maximum subarray sum — O(n) scan over an int[] (arrays + algorithm).',
      code: block(
        'arch.day4',
        `public class Day4Advanced {
    static int maxSubarray(int[] nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println("max sum = " + maxSubarray(nums));
    }
}`,
      ),
      output: 'max sum = 6\n',
    },
  },

  5: {
    basic: {
      description:
        'String API: length, substring, replace — immutability (each call returns a new String).',
      code: block(
        'arch.day5',
        `public class Day5Basic {
    public static void main(String[] args) {
        String name = "Java Mastery";
        System.out.println(name.length());
        System.out.println(name.substring(0, 4));
        System.out.println(name.replace("Mastery", "Interview"));
    }
}`,
      ),
      output: '12\nJava \nJava Interview\n',
    },
    intermediate: {
      description:
        '== vs equals: literals may share the pool; new String(...) is a different object.',
      code: block(
        'arch.day5',
        `public class Day5Intermediate {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(c));
    }
}`,
      ),
      output: 'true\nfalse\ntrue\n',
    },
    advanced: {
      description:
        'StringBuilder in a loop: normalize tags (trim + lower) and join — avoids O(n²) concatenation.',
      code: block(
        'arch.day5',
        `public class Day5Advanced {
    static String joinTags(String[] tags) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < tags.length; i++) {
            sb.append(tags[i].trim().toLowerCase());
            if (i != tags.length - 1) sb.append(", ");
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String[] tags = {" Java ", " OOP ", " Streams "};
        System.out.println(joinTags(tags));
    }
}`,
      ),
      output: 'java, oop, streams\n',
    },
  },
};
