# IntelliJ IDEA shortcuts every developer should know

*Work faster in the editor, navigate huge codebases, and refactor safely — mostly without touching the mouse. Shortcuts below use **Windows / Linux** defaults; **macOS** equivalents are shown where they differ.*

*Each table adds a **What it does** column: plain-language meaning and when to reach for that shortcut.*

---

## Why shortcuts matter

IDEs pack hundreds of actions. The ones you use **without thinking** compound into **hours saved** each month: less context switching, fewer mis-clicks, and smoother **flow** when debugging or refactoring. IntelliJ (and Android Studio, which shares the same keymap) rewards muscle memory.

### Find Action — your master key

**Shortcut:** **Ctrl+Shift+A** (Windows/Linux) or **⇧⌘A** (macOS).

**What it does:** Opens **Find Action**: type part of any menu command, refactoring, or setting name. The IDE shows the **assigned shortcut** (if any) and lets you **run** the action immediately — no mouse.

**When to use it:** You forgot a binding, you are on a new machine, or you want to discover whether an action exists (e.g. “reformat”, “optimize imports”, “rename file”). This is your **escape hatch** for everything else in this article.

---

## Search, open, and jump (navigation)

These replace hunting through trees and menus.

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Search Everywhere** | **Shift** (double-tap) | **Shift** (double-tap) | One search box for **classes, files, symbols, actions, and settings**. Best when you are not sure which category you need. |
| **Go to class** | **Ctrl+N** | **⌘O** | Jump to a **Java/Kotlin type** (class, interface, enum) by name. CamelCase initials work (e.g. `AME` → `ArrayListMultimapEntry`). |
| **Go to file** | **Ctrl+Shift+N** | **⌘⇧O** | Open **any file** (resources, XML, Gradle, etc.) by path or name fragment — not limited to types. |
| **Go to symbol** | **Ctrl+Alt+Shift+N** | **⌥⌘O** | Jump to a **method, field, or symbol** by name across the project — useful when many classes share similar names. |
| **Recent files** | **Ctrl+E** | **⌘E** | Popup list of **recently opened files**; pick one to switch. Fast context switching without the Project tree. |
| **Recent locations** | **Ctrl+Shift+E** | **⌘⇧E** | Places you **actually edited**, often with a **preview** — finer-grained than recent files alone. |
| **Navigate back / forward** | **Ctrl+Alt+←** / **→** | **⌘[** / **⌘]** | Moves through **editor navigation history** (like browser Back) after jumps like Go to Declaration — returns you without losing your trail. |
| **Go to line / column** | **Ctrl+G** | **⌘L** | Jump to **line:column** from a stack trace, review comment, or search result. |
| **File structure** | **Ctrl+F12** | **⌘F12** | **Outline** of the current file (methods, fields, inner classes) — jump inside long classes without scrolling. |
| **Type hierarchy** | **Ctrl+H** | **^H** | See **supertypes and subtypes** — understand inheritance and framework base classes. |
| **Call hierarchy** | **Ctrl+Alt+H** | **⌥^H** | See **who calls whom** (callers/callees) — trace control flow and debug “how did we get here?”. |

**Habit to build:** **Double Shift** for almost anything you cannot name yet; **Ctrl+N** / **Ctrl+Shift+N** when you already know the class or file name.

---

## Inside the code (declarations, usages, errors)

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Go to declaration** | **Ctrl+B** or **Ctrl+Click** | **⌘B** or **⌘Click** | Opens the **definition** of the symbol under the cursor (class, method, field, variable). Core “drill down” navigation. |
| **Go to implementation** | **Ctrl+Alt+B** | **⌥⌘B** | From an **interface or abstract** member, jump to **concrete implementations** — essential for DI, strategies, and APIs. |
| **Go to super method / class** | **Ctrl+U** | **⌘U** | Jump **up** to the **overridden** method or superclass — opposite direction from implementation. |
| **Find usages** | **Alt+F7** | **⌥F7** | Lists **every reference** to the symbol in the chosen scope (project, module, …). Use **before rename/delete** to see impact. |
| **Highlight usages in file** | **Ctrl+Shift+F7** | **⌘⇧F7** | Highlights **all occurrences** of the symbol **in the current file** only — quick local rename prep. |
| **Next / previous highlighted usage** | **Ctrl+Alt+Up/Down** | **⌥^Up/Down** | Cycles through **highlighted** matches after **Highlight usages in file**. |
| **Next / previous error** | **F2** / **Shift+F2** | **F2** / **⇧F2** | Jumps to next/previous **error or warning** in the current file (or scope, depending on setup) — cleanup before commit. |
| **Show quick documentation** | **Ctrl+Q** | **F1** or **^J** | **Popup Javadoc** / signature / docs for the symbol under the cursor without opening a browser. |
| **Show parameters** | **Ctrl+P** | **⌘P** | While inside `(...)`, shows **parameter names and types** for the current call — helps with overloaded methods. |

**Habit:** **Alt+F7** before renaming or deleting — you see the blast radius.

---

## Editing and completion

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Basic completion** | **Ctrl+Space** | **^Space** | Standard **code completion** — variables, keywords, class names in context. |
| **Smart completion** | **Ctrl+Shift+Space** | **^⇧Space** | **Type-aware** completion — filters suggestions to what **fits** the expected type (e.g. after `return ` or `=`). |
| **Complete statement** | **Ctrl+Shift+Enter** | **⌘⇧⏎** | Finishes the current construct: adds **`;`**, closing **`}`**, **`)`**, or **`try`/`catch`** scaffolding where possible. |
| **Quick fix / intentions** | **Alt+Enter** | **⌥⏎** | **Context menu** of fixes and intentions: add import, create class/method, invert `if`, static import, suppress inspection, etc. The “make this code correct or better” key. |
| **Expand / shrink selection** | **Ctrl+W** / **Ctrl+Shift+W** | **⌥↑** / **⌥↓** *(may vary)* | Grows or shrinks selection by **syntax blocks** (expression → statement → method → class) instead of character by character. |
| **Duplicate line or block** | **Ctrl+D** | **⌘D** | Copies the **current line or selection** below — handy for similar lines, tests, or log statements. |
| **Delete line** | **Ctrl+Y** | **⌘⌫** | Removes the **entire line** at the caret (or selected lines) in one action. |
| **Move line up / down** | **Shift+Alt+↑/↓** | **⇧⌥↑/↓** | Moves the **statement or line** up/down, respecting blocks — reorder fields, cases, or early returns. |
| **Start new line below / above** | **Shift+Enter** / **Ctrl+Alt+Enter** | **⇧⏎** / **⌥⌘⏎** | Inserts a newline **below or above** without splitting the middle of the current line awkwardly. |
| **Comment line** | **Ctrl+/** | **⌘/** | Toggles **`//`** line comment for the current line or selection. |
| **Comment block** | **Ctrl+Shift+/** | **⌘⌥/** | Toggles **`/* ... */`** block comment around the selection. |
| **Reformat code** | **Ctrl+Alt+L** | **⌥⌘L** | Applies **code style** (indentation, spacing, wraps) to selection or whole file per project settings. |
| **Optimize imports** | **Ctrl+Alt+O** | **^⌥O** | Removes **unused** imports, **sorts** them, and can merge same-package clutter — keeps diffs clean. |

**Habit:** **Alt+Enter** is the “make this better” key — fix imports, invert `if`, create method, static import, everything context-aware.

---

## Refactoring (safe, repeatable)

Refactoring shortcuts invoke **structural** changes the IDE understands (not plain text replace), so **references stay consistent**.

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Rename** | **Shift+F6** | **⇧F6** | Renames the symbol and **all usages** across the project (with previews). Safer than search-replace for code. |
| **Change signature** | **Ctrl+F6** | **⌘F6** | Changes **method parameters, return type, visibility** and updates **call sites** where possible. |
| **Extract method** | **Ctrl+Alt+M** | **⌥⌘M** | Turns the **selected statements** into a new method + a call at the original site — reduces long methods. |
| **Extract variable** | **Ctrl+Alt+V** | **⌥⌘V** | Introduces a **local variable** for the selected expression — improves readability of complex expressions. |
| **Extract field** | **Ctrl+Alt+F** | **⌥⌘F** | Promotes an expression to a **class field** (instance or static, per dialog). |
| **Extract constant** | **Ctrl+Alt+C** | **⌥⌘C** | Creates a **`static final`** (or similar) for a literal or expression used in multiple places. |
| **Extract parameter** | **Ctrl+Alt+P** | **⌥⌘P** | Adds a **new parameter** to the method and threads it through callers for the selected value. |
| **Inline** | **Ctrl+Alt+N** | **⌥⌘N** | **Inlines** a variable, method, or constant — opposite of extract; removes indirection when it hurts clarity. |
| **Surround with** | **Ctrl+Alt+T** | **⌥⌘T** | Wraps selection in **`if`**, **`try/catch`**, **`synchronized`**, **`Runnable`**, etc., from a chooser. |

Always **preview** when the dialog offers it, especially on large projects.

---

## Run, test, and debug

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Run** | **Shift+F10** | **^R** | Runs the **current run configuration** (application, test suite, etc.) shown in the toolbar. |
| **Debug** | **Shift+F9** | **^D** | Same as Run but attaches the **debugger** — stops at breakpoints and lets you inspect state. |
| **Run context** | **Ctrl+Shift+F10** | **^⇧R** | Runs **this test method**, **test class**, or **main** under the cursor when the IDE can infer a runner — fastest loop for unit tests. |
| **Stop** | **Ctrl+F2** | **⌘F2** | **Terminates** the running process or debug session. |
| **Toggle breakpoint** | **Ctrl+F8** | **⌘F8** | Adds/removes a **line breakpoint** on the current line — debugger will pause there. |
| **Step over** | **F8** | **F8** | Executes the **current line** without entering callees — follow logic at your current level. |
| **Step into** | **F7** | **F7** | Enters the **next method call** on the line — follow into implementation. |
| **Smart step into** | **Shift+F7** | **⇧F7** | When a line has **several** calls, **choose which call** to step into — avoids landing in the wrong helper. |
| **Step out** | **Shift+F8** | **⇧F8** | Runs until the **current method returns** — jump out of deep calls you no longer need. |
| **Run to cursor** | **Alt+F9** | **⌥F9** | Runs until the **line where the caret is**, as if there were a temporary breakpoint — quick “get to this line”. |
| **Evaluate expression** | **Alt+F8** | **⌥F8** | While **paused**, evaluate an expression or watch variables in a dialog — inspect state without changing code. |

---

## Find and replace in project

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Find in files** | **Ctrl+Shift+F** | **⌘⇧F** | Search **text or regex** across the project with filters (mask, case, whole words). |
| **Replace in path** | **Ctrl+Shift+R** | **⌘⇧R** | Same as find across files, but with **replace** — use **preview** and **scope** to avoid touching generated code. |
| **Find next / previous in file** | **F3** / **Shift+F3** | **⌘G** / **⌘⇧G** | Repeats **find** within the **current editor** after you have started an in-file search (**Ctrl+F** / **⌘F**). |

Use **scope** (module, directory, custom) in the big find dialog to avoid noisy matches.

---

## Tool windows and focus

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Hide all tool windows** | **Ctrl+Shift+F12** | **⌘⇧F12** | **Maximizes editor** by hiding side/bottom tool windows — distraction-free reading and typing. |
| **Project** | **Alt+1** | **⌘1** | Shows or focuses the **Project** tool window (file tree). |
| **Git / Version Control** | **Alt+9** | **⌘9** | Opens **Version Control** / Git tool window (log, local changes, etc.). |
| **Run** | **Alt+4** | **⌘4** | **Run** tool window — console output of the last run. |
| **Debug** | **Alt+5** | **⌘5** | **Debug** tool window — frames, variables, watches while debugging. |
| **Terminal** | **Alt+F12** | **⌥F12** | Integrated **terminal** at the project root (or configured directory). |
| **Problems / Inspections** | **Alt+6** | **⌘6** | **Problems** view — compiler errors and inspections in one list. |

**Esc** usually returns focus from a tool window **back to the editor**.

---

## Version control (built-in)

| Action | Windows / Linux | macOS | What it does |
|--------|-----------------|-------|--------------|
| **Commit** | **Ctrl+K** | **⌘K** | Opens the **Commit** dialog: stage files, write message, commit (and often push options). |
| **Push** | **Ctrl+Shift+K** | **⌘⇧K** | **Pushes** local commits to the remote — after you have committed. |
| **VCS operations popup** | Alt + backtick (key above Tab) | **^V** | Small **popup** of common VCS actions (update, branches, compare, etc.) without opening full menus. *Binding may differ; use **Find Action** → “VCS Operations Popup”.* |

---

## Live templates and postfix completion

**Live templates** — type an **abbreviation**, then **Tab** to expand into full code.

| Abbreviation | Expands to (typical) | What it does |
|--------------|----------------------|--------------|
| **`sout`** | `System.out.println(...)` | Fast **console print** line; cursor lands inside parentheses. |
| **`soutv`** | Prints a **variable name and value** | Debugging: `println("var = " + var)` style without typing the name twice. |
| **`psvm`** | `public static void main(String[] args) { }` | **Java entry point** skeleton for small programs. |
| **`iter`** | Enhanced **for-each** over iterable/array | Loops over collection or array with correct type in scope. |
| **`ifn` / `inn`** | `if (x == null)` / `if (x != null)` | **Null checks** from the variable under the cursor. |
| **`fori`** | Indexed **`for`** loop | Classic `for (int i = 0; i < n; i++)` pattern when index matters. |

Browse and customize under **Settings → Editor → Live Templates**.

**Postfix completion** — type an **expression first**, then a **dot + keyword**, then Tab; the IDE **wraps** the expression correctly.

| Example | What it does |
|---------|--------------|
| **`expr.var`** | Introduces a **local variable** for `expr` (name in dialog). |
| **`expr.field`** | Introduces a **field** on the class. |
| **`expr.if`** | Wraps in **`if (expr)`** (useful for boolean or nullable checks depending on language). |
| **`expr.return`** | **`return expr;`** |
| **`expr.stream`** | Starts a **Stream** pipeline from `expr` when it is a collection-like value. |
| **`expr.try`** | Wraps in **`try/catch`** for checked exceptions. |

Enable and discover more under **Settings → Editor → General → Postfix Completion**.

---

## Keymap and learning path

1. **Settings → Keymap** — Choose **Windows**, **macOS**, **Eclipse**, **Visual Studio**, etc., so shortcuts **match habits** from another editor; you can still remap individual keys.
2. **Help → Keyboard Shortcuts PDF** (or **Keymap reference** from Help menu, depending on version) — **Printable** overview; circle five shortcuts per week.
3. **Suggested learning order (ROI):**
   - **Search Everywhere** — safety net for everything.
   - **Go to class / file** — 90% of “open that thing” work.
   - **Alt+Enter** — fixes and intentions all day.
   - **Shift+F6** — safe rename everywhere.
   - **Ctrl+Alt+M / V** — extract method / variable to tame messy code.
   - **Run / Debug** — close the loop without the green triangle.
   - **Alt+F7** — know impact before you change APIs.
   - **Recent files** — switch context without the tree.

---

## Closing

You do not need all of these on day one. Pick **five** shortcuts you will use **every hour**, practice until they are automatic, then add the next five. Productivity in IntelliJ is less about knowing *every* binding and more about **never** reaching for the mouse for navigation, quick fixes, and refactorings.

*Bindings can vary slightly by version and keymap — use **Find Action** (**Ctrl+Shift+A** / **⇧⌘A**) to confirm on your machine.*
