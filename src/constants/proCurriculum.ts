import type {
  CodeNotebook,
  ProLesson,
  ProPath,
  ProPathId,
  ProRole,
  ProWeek,
  ProjectSpec,
} from '../types/pro.types'

const ALL_ROLES: ProRole[] = [
  'ai-engineer',
  'ml-engineer',
  'genai-engineer',
  'data-scientist',
  'mlops-engineer',
  'ai-researcher',
  'ai-product-manager',
  'ai-ethics-officer',
  'domain-ml-specialist',
  'ai-leader-non-technical',
]

const LEADER_ROLES: ProRole[] = ['ai-leader-non-technical', 'ai-product-manager', 'ai-ethics-officer']

function slugify(title: string, pathId: ProPathId, week: number, li: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${pathId}-w${week}-${base || `l${li}`}`
}

function lessonBody(title: string, angle: string): string {
  return `## ${title}

This lesson focuses on **${angle}** with patterns that map directly to job interviews and production work in 2026. You should leave with vocabulary, a small artifact, and a story you can tell without slides.

Spend time reproducing examples locally and note where things break—those details differentiate strong candidates from tutorial followers.`
}

function mkProject(
  pathId: ProPathId,
  week: number,
  lessonIndex: number,
  title: string,
  deliverables: string[],
  tools: string[],
  hours: number,
  difficulty: ProjectSpec['difficulty'],
  opts?: { id?: string; description?: string }
): ProjectSpec {
  return {
    id: opts?.id ?? `${pathId}-w${week}-l${lessonIndex}-proj`,
    title,
    description: opts?.description ?? lessonBody(title, 'portfolio-ready deliverables'),
    deliverables,
    tools,
    estimatedHours: hours,
    difficulty,
  }
}

type LDef = {
  title: string
  minutes: number
  format: ProLesson['format']
  tools: string[]
  tags: string[]
  job: string
  /** Full markdown lesson body; Java-developer pivot framing when omitted uses a short generic scaffold */
  content?: string
  prereq?: string[]
  project?: ProjectSpec
  iq?: string[]
  salary?: string
  paper?: string
  /** shorthand mapped to ProLesson.codeNotebook */
  notebook?: CodeNotebook
}

function mkLesson(pathId: ProPathId, week: number, idx: number, d: LDef): ProLesson {
  const id = `${pathId}-w${week}-l${idx}`
  const slug = slugify(d.title, pathId, week, idx)
  const hasProject = !!d.project
  return {
    id,
    title: d.title,
    slug,
    pathId,
    weekNumber: week,
    durationMinutes: d.minutes,
    format: d.format,
    prerequisites: d.prereq ?? [],
    content: d.content ?? lessonBody(d.title, d.tags[0] ?? d.title),
    tools: d.tools,
    jobRelevance: d.job,
    keyConceptTags: d.tags,
    hasProject,
    projectSpec: d.project,
    interviewQuestions: d.iq,
    estimatedSalaryImpact: d.salary,
    paperUrl: d.paper,
    codeNotebook: d.notebook,
  }
}

function week(pathId: ProPathId, weekNum: number, title: string, defs: LDef[]): ProWeek {
  return {
    weekNumber: weekNum,
    title,
    lessons: defs.map((def, i) => mkLesson(pathId, weekNum, i + 1, def)),
  }
}

function buildPythonForAiPath(): ProPath {
  return {
    id: 'python-for-ai',
    title: 'Python for AI (Java Dev Edition)',
    tagline: 'From JVM habits to idiomatic Python for ML, LLMs, and FastAPI services',
    description:
      'Hands-on Python for Java/Spring developers: numerics, data frames, typed APIs with Pydantic, calling LLM providers, async I/O, and Docker — with explicit analogies to beans, controllers, and Maven-style isolation.',
    prerequisite: 'None — but Java experience accelerates this path',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 4,
    color: '#6366f1',
    icon: '🐍',
    tools: ['Python 3.12', 'conda', 'NumPy', 'Pandas', 'FastAPI', 'Pydantic', 'Docker'],
    jobDemandScore: 92,
    weeks: [
      week('python-for-ai', 1, 'Python That Actually Matters (for Java Devs)', [
        {
          title: 'Python for Java Developers — The Mental Model Shift',
          minutes: 35,
          format: 'concept',
          tools: ['Python 3.12'],
          tags: ['duck-typing', 'GIL', 'dataclasses', 'type hints', 'PEP 8'],
          job: 'Every AI/ML team expects Python fluency — Java background is a bonus for system design',
          iq: [
            "You come from Java. What's the biggest gotcha in Python for someone with your background?",
            'How would you implement a Java interface in Python?',
            'What is the Python GIL and how does it affect concurrent AI workloads?',
          ],
          content: `## Python for Java Developers — The Mental Model Shift

Java rewards **explicit types, interfaces, and compilation**. Python rewards **readable, small units of work** and trusts you to add types gradually with hints.

Duck typing means "call the method if it exists"—no \`implements\` clause. **None** plays the null role but is a real object; there are no checked exceptions—errors surface at runtime like unchecked \`RuntimeException\`. The **GIL** serialises bytecode execution in the standard interpreter; for CPU-heavy loops you lean on NumPy/C extensions or multiprocessing—think "synchronized bottleneck on the interpreter" rather than fine-grained Java locks.

A Spring \`@Service\` often becomes a **plain module of functions** plus a few \`@dataclass\` records for DTOs—wiring is explicit imports instead of a component scan.`,
        },
        {
          title: 'Virtual Environments — Like Maven Profiles but Better',
          minutes: 25,
          format: 'hands-on',
          tools: ['Python 3.12', 'conda', 'pip', 'venv'],
          tags: ['venv', 'conda', 'pip', 'reproducibility'],
          job: 'Reproducible environments are table stakes for ML interviews and CI',
          iq: [
            "What's the difference between conda and pip? When do you use each?",
            'How do you reproduce a Python environment exactly — for Docker deployment?',
          ],
          content: `## Virtual Environments — Like Maven Profiles but Better

**venv** isolates site-packages the way a Maven reactor keeps dependency trees per module—except the boundary is the interpreter, not the classpath. **conda** adds compiled scientific stacks (MKL, CUDA hooks) similar to pulling platform-specific BOMs.

\`requirements.txt\` ≈ a pinned **Gradle lockfile**; \`pyproject.toml\` ≈ **pom.xml + plugin definitions**. Installing into the system Python is like polluting a shared corporate Nexus cache—avoid it.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Create an isolated env before touching GPU or LLM SDKs.',
              },
              {
                type: 'code',
                language: 'bash',
                content:
                  '# Create and activate env\nconda create -n aienv python=3.12\nconda activate aienv\npip install numpy pandas fastapi',
              },
              {
                type: 'code',
                language: 'bash',
                content: "# Check what's installed — like 'mvn dependency:tree'\npip list\npip show numpy",
              },
            ],
          },
        },
        {
          title: 'NumPy — The Engine Behind Every ML Library',
          minutes: 45,
          format: 'hands-on',
          tools: ['NumPy', 'Python 3.12'],
          tags: ['arrays', 'broadcasting', 'vectorization'],
          job: 'Vectorised numerics underpin every framework tensor',
          salary: 'NumPy fluency is the baseline expectation for all ML/AI roles',
          iq: [
            'What is broadcasting in NumPy? Give a practical example.',
            'Why are NumPy operations faster than Python for loops?',
          ],
          content: `## NumPy — The Engine Behind Every ML Library

**ndarray** feels like primitive Java arrays plus operator overloads implemented in C. **Broadcasting** applies shapes the way Java Streams \`map\` over collections—except the loop runs inside compiled code.

Matrix multiply (\`@\`) is the same operation every neural layer uses; boolean masking resembles SQL \`WHERE\` clauses executed on contiguous memory.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Arrays, broadcasting, and matmul mirror tensor cores in PyTorch later.',
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "import numpy as np\n# Like int[][] in Java\nmatrix = np.array([[1,2,3],[4,5,6]])\nprint(matrix.shape)  # (2, 3)",
              },
              {
                type: 'code',
                language: 'python',
                content: '# Broadcasting — no for loops needed\na = np.array([1, 2, 3])\nprint(a * 2)  # [2, 4, 6] — vectorized',
              },
              {
                type: 'code',
                language: 'python',
                content:
                  '# Dot product — core of neural networks\nA = np.random.randn(3, 4)\nB = np.random.randn(4, 5)\nC = A @ B  # matrix multiply\nprint(C.shape)  # (3, 5)',
              },
            ],
          },
        },
        {
          title: 'Pandas — Your New ORM for Data',
          minutes: 50,
          format: 'hands-on',
          tools: ['Pandas', 'Python 3.12'],
          tags: ['dataframes', 'ETL', 'joins'],
          job: 'Tabular manipulation dominates real ML pipelines',
          iq: [
            'How do you handle missing values in a DataFrame?',
            'What is the difference between apply() and vectorized operations?',
          ],
          content: `## Pandas — Your New ORM for Data

A **DataFrame** is an in-memory table with named columns—imagine a \`List<Map<String,Object>>\` that also understands **groupby** (\`GROUP BY\`) and **merge** (\`JOIN\`). Method chaining reads like a fluent repository API.

For Java devs: think **JPA projections + Criteria API**, but interactive and vectorised for analytics.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Load CSV, inspect dtypes, aggregate like SQL.',
              },
              {
                type: 'code',
                language: 'python',
                content: "import pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.head())\nprint(df.dtypes)",
              },
              {
                type: 'code',
                language: 'python',
                content: "# Like SQL GROUP BY + COUNT\ndf.groupby('department')['salary'].mean()",
              },
              {
                type: 'code',
                language: 'python',
                content: "# Like SQL JOIN\nmerged = df.merge(dept_df, on='dept_id', how='left')",
              },
            ],
          },
        },
        {
          title: 'Type Hints + Pydantic — Bringing Java Type Safety to Python',
          minutes: 40,
          format: 'hands-on',
          tools: ['pydantic', 'mypy', 'Python 3.12'],
          tags: ['pydantic', 'validation', 'schemas'],
          job: 'LLM IO contracts mirror Spring DTO validation',
          iq: [
            "How does Pydantic compare to Java's Bean Validation (@Valid)?",
            'Why is Pydantic used in LLM applications specifically?',
          ],
          content: `## Type Hints + Pydantic — Bringing Java Type Safety to Python

**Pydantic** combines Java records, Bean Validation, and Jackson into one model: declare fields, defaults, and validators; parsing raises \`ValidationError\` with structured detail.

FastAPI uses these models exactly like \`@RequestBody\` DTOs—ideal for LLM request/response JSON you must trust.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Model LLM payloads with strict schemas.',
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "from pydantic import BaseModel\nfrom typing import Optional\n\n# Like a Java record with @Valid\nclass ChatRequest(BaseModel):\n    message: str\n    model: str = 'claude-sonnet-4-5'\n    temperature: float = 0.7\n    max_tokens: Optional[int] = None",
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "# Validation is automatic — like Spring @Valid\ntry:\n    req = ChatRequest(message='hello', temperature=2.5)\nexcept ValueError as e:\n    print(e)  # temperature out of bounds",
              },
            ],
          },
        },
      ]),
      week('python-for-ai', 2, 'Data Science for Java Developers', [
        {
          title: 'Statistics That Actually Show Up in ML Interviews',
          minutes: 40,
          format: 'concept',
          tools: ['NumPy', 'SciPy'],
          tags: ['distributions', 'hypothesis-testing', 'metrics'],
          job: 'Metrics questions filter senior ML loops',
          iq: [
            'What is the difference between variance and standard deviation?',
            'You have two datasets. How do you test if they are significantly different?',
            'What is p-value in plain English? What does p < 0.05 mean?',
          ],
          content: `## Statistics That Actually Show Up in ML Interviews

Java curricula rarely dwell on **p-values, z-scores, or correlation traps**, yet interviewers expect you to connect model metrics to statistical meaning.

Treat this like learning **JVM GC logs** for the first time—unfamiliar notation, huge payoff when debugging models in production.`,
        },
        {
          title: 'Matplotlib + Seaborn — Visualise Before You Model',
          minutes: 35,
          format: 'hands-on',
          tools: ['matplotlib', 'seaborn', 'pandas'],
          tags: ['EDA', 'plots'],
          job: 'Visual stories sell analyses to non-ML stakeholders',
          content: `## Matplotlib + Seaborn — Visualise Before You Model

Plotting is your debugger for data: histograms expose skew, boxplots highlight outliers, heatmaps show correlation structure.

If you rely only on aggregate metrics you will miss the same class of issues as reading only **INFO logs** without tracing.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Line charts, histograms, heatmaps, pair plots.',
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\ndf = pd.read_csv('sample.csv')\nsns.lineplot(data=df, x='date', y='revenue')\nplt.show()",
              },
              {
                type: 'code',
                language: 'python',
                content: "sns.histplot(df['amount'], kde=True)\nplt.show()",
              },
              {
                type: 'code',
                language: 'python',
                content: 'sns.heatmap(df.corr(numeric_only=True), annot=True)\nplt.show()',
              },
            ],
          },
        },
        {
          title: 'EDA — How Seniors Approach a New Dataset',
          minutes: 55,
          format: 'hands-on',
          tools: ['pandas', 'seaborn', 'matplotlib', 'scipy'],
          tags: ['EDA', 'data-quality'],
          job: 'EDA narratives separate staff engineers from tutorial graduates',
          project: mkProject(
            'python-for-ai',
            2,
            3,
            'EDA on a Real Dataset',
            [
              'Jupyter notebook with minimum 8 insights',
              'Correlation heatmap with interpretation in plain English',
              'Identify 3 data quality issues and fix them',
              'One-paragraph summary written as if briefing a non-technical stakeholder',
            ],
            ['pandas', 'seaborn', 'matplotlib', 'scipy'],
            6,
            'beginner',
            {
              id: 'python-for-ai-w2-eda',
              description:
                'Pick any public dataset (Kaggle, Hugging Face, data.gov). Perform a full exploratory analysis as you would a production readiness review.',
            }
          ),
          content: `## EDA — How Seniors Approach a New Dataset

Start with **schema contracts**: dtypes, null rates, cardinalities—like reading Hibernate mappings before optimising queries. Visualise early, document assumptions, and separate **data bugs** from **model limitations**.

This project mirrors a sprint zero spike you might run before green-lighting a Spring feature.`,
        },
        {
          title: 'Feature Engineering — The Most Underrated Skill',
          minutes: 45,
          format: 'hands-on',
          tools: ['pandas', 'scikit-learn'],
          tags: ['encoding', 'scaling', 'leakage'],
          job: 'Great features beat fancy estimators in most enterprise wins',
          iq: [
            'What is one-hot encoding? When would you NOT use it?',
            'What is the difference between normalisation and standardisation?',
            'What is target leakage and how do you prevent it?',
          ],
          content: `## Feature Engineering — The Most Underrated Skill

Encoding, scaling, and time-aware splits are where **Java-style discipline** (immutable transformations, explicit pipelines) pays off. Target leakage is analogous to accidentally training on **future events already stored in your warehouse fact table**.

Build transformations you could imagine unit testing the way you test mappers between DTOs.`,
        },
      ]),
      week('python-for-ai', 3, 'Build Real Backends (FastAPI for Spring Boot Devs)', [
        {
          title: 'FastAPI — Spring Boot in 10% of the Code',
          minutes: 50,
          format: 'hands-on',
          tools: ['FastAPI', 'Pydantic', 'uvicorn', 'httpx'],
          tags: ['APIs', 'async', 'DI'],
          job: 'LLM features ship behind HTTP services you will own',
          iq: [
            "How does FastAPI's dependency injection compare to Spring's @Autowired?",
            'What is the difference between async def and def in FastAPI? When does it matter?',
          ],
          content: `## FastAPI — Spring Boot in 10% of the Code

Routes map to \`@RestController\` methods; Pydantic models replace \`@RequestBody\` DTOs; \`Depends()\` mirrors constructor injection; **uvicorn** is your embedded Netty/Tomcat.

You still need middleware, auth, and observability—just with less XML and annotation magic.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Minimal service with typed request bodies.',
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass PredictRequest(BaseModel):\n    text: str\n    model: str = 'gpt-4o'\n\n@app.post('/predict')\nasync def predict(req: PredictRequest):\n    # Like @PostMapping + @RequestBody\n    return {'result': f'Processed: {req.text}'}",
              },
              {
                type: 'code',
                language: 'bash',
                content:
                  '# Run with: uvicorn main:app --reload\n# Like: java -jar app.jar --spring.devtools.restart.enabled=true\n# Swagger UI auto-generated at http://localhost:8000/docs',
              },
            ],
          },
        },
        {
          title: 'Calling LLM APIs — OpenAI, Claude, Hugging Face',
          minutes: 45,
          format: 'hands-on',
          tools: ['anthropic', 'openai', 'httpx', 'python-dotenv'],
          tags: ['LLM clients', 'streaming', 'retries'],
          job: 'Provider SDKs are typed HTTP facades—treat them like Feign with SLAs',
          iq: [
            'How do you handle rate limiting when calling LLM APIs in production?',
            'What is token-based pricing? How do you optimise cost?',
          ],
          content: `## Calling LLM APIs — OpenAI, Claude, Hugging Face

Anthropic/OpenAI SDKs wrap HTTPS JSON—architecturally similar to **Spring WebClient** or **OpenFeign**. Streaming uses chunked responses analogous to **WebFlux SSE**.

Configure retries, backoff, and circuit breakers the way you would for any critical downstream microservice.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Invoke Claude with env-based keys and optional streaming.',
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "import anthropic\n\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env\n\nmessage = client.messages.create(\n    model='claude-sonnet-4-5',\n    max_tokens=1024,\n    messages=[{'role': 'user', 'content': 'Explain RAG to a Java developer'}]\n)\nprint(message.content[0].text)",
              },
              {
                type: 'code',
                language: 'python',
                content:
                  "# Streaming — like SSE in Spring WebFlux\nwith client.messages.stream(\n    model='claude-sonnet-4-5',\n    max_tokens=1024,\n    messages=[{'role': 'user', 'content': 'Hello'}]\n) as stream:\n    for text in stream.text_stream:\n        print(text, end='', flush=True)",
              },
            ],
          },
        },
        {
          title: 'Docker for AI/ML Engineers (Java Dev Shortcut)',
          minutes: 40,
          format: 'hands-on',
          tools: ['Docker', 'docker-compose'],
          tags: ['containers', 'images'],
          job: 'Containers remain the packaging unit for models and APIs',
          content: `## Docker for AI/ML Engineers (Java Dev Shortcut)

You already know multi-stage builds from Spring; ML images add **CUDA layers** and multi-GB wheels. Cache \`pip install\` layers like you cache Maven dependency downloads.

GPU passthrough is the equivalent of binding **JNI-heavy** accelerators into the runtime.`,
          notebook: {
            cells: [
              {
                type: 'markdown',
                language: 'markdown',
                content: 'Slim API image pattern for FastAI services.',
              },
              {
                type: 'code',
                language: 'dockerfile',
                content:
                  '# Dockerfile for a FastAPI AI service\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]',
              },
            ],
          },
        },
        {
          title: 'Async Python — Non-Blocking LLM Calls',
          minutes: 35,
          format: 'hands-on',
          tools: ['asyncio', 'httpx', 'Python 3.12'],
          tags: ['async-await', 'concurrency'],
          job: 'Streaming UX depends on non-blocking orchestration',
          content: `## Async Python — Non-Blocking LLM Calls

\`asyncio\` mirrors **CompletableFuture** chains and Project Reactor mentally—\`await\` marks suspension points without blocking threads.

Production LLM gateways multiplex provider calls the same way Netty handles many sockets with few threads.`,
        },
      ]),
      week('python-for-ai', 4, 'Capstone: End-to-End AI Backend', [
        {
          title: 'Capstone Kickoff — From Spring Service to FastAPI Brain',
          minutes: 40,
          format: 'concept',
          tools: ['Markdown', 'draw.io'],
          tags: ['architecture', 'planning'],
          job: 'Interviewers want diagrams tying user stories to components',
          content: `## Capstone Kickoff — From Spring Service to FastAPI Brain

Sketch endpoints (\`/chat\`, \`/summarise\`, \`/extract\`), data contracts, and failure modes before coding—same ritual as a **Spring REST design review**.

Identify where streaming matters, where JSON schema matters, and which secrets belong in environment variables vs Vault.`,
        },
        {
          title: 'Capstone — Java-to-AI Migration Project',
          minutes: 120,
          format: 'project',
          tools: ['FastAPI', 'Pydantic', 'anthropic', 'Docker', 'uvicorn'],
          tags: ['capstone', 'portfolio'],
          job: 'A credible AI backend differentiates pivoting Java engineers',
          project: mkProject(
            'python-for-ai',
            4,
            2,
            'Build a FastAPI AI Backend',
            [
              'FastAPI app with /chat, /summarise, /extract endpoints',
              'Pydantic models for all request/response schemas',
              'Integration with Claude or OpenAI API',
              'Streaming support on /chat endpoint',
              'Docker container + docker-compose.yml',
              'README comparing the FastAPI architecture to an equivalent Spring Boot structure',
            ],
            ['FastAPI', 'Pydantic', 'anthropic', 'Docker', 'uvicorn'],
            12,
            'beginner',
            {
              id: 'python-for-ai-w4-capstone',
              description:
                'Migrate a simple Java Spring REST service concept to a Python FastAPI AI-powered service with the same operational rigor you expect in enterprise Java.',
            }
          ),
          content: `## Capstone — Java-to-AI Migration Project

Ship a service you could demo to a hiring manager: typed routes, provider integration, streaming, and container packaging. Tie every decision back to a **Spring counterpart** in your README.`,
        },
        {
          title: 'Hardening Checklist — Logs, Secrets, and Rollback',
          minutes: 35,
          format: 'concept',
          tools: ['Docker', 'Git'],
          tags: ['observability', 'security'],
          job: 'Production LLM apps fail on rate limits, malformed JSON, and partial streams',
          content: `## Hardening Checklist — Logs, Secrets, and Rollback

Mirror Java ops habits: structured logs, redacted secrets, health checks, graceful shutdown, and documented rollback. Add **token usage metrics** because they are your new CPU profile.`,
        },
      ]),
    ],
  }
}

const pyTools = ['Python', 'pip', 'venv']
const mlTools = ['Python', 'scikit-learn', 'pandas']
const dlTools = ['PyTorch', 'Python', 'CUDA']
const llmTools = ['Python', 'OpenAI API', 'LangChain']

export const PRO_CURRICULUM: ProPath[] = [
  buildPythonForAiPath(),
  {
    id: 'ml-fundamentals',
    title: 'ML Fundamentals',
    tagline: 'Classical ML that still pays the bills',
    description:
      'Supervised and unsupervised learning, evaluation, and the path to a production-ready mindset.',
    prerequisite: 'python-for-ai or solid Python',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 6,
    color: '#8b5cf6',
    icon: '🧠',
    tools: ['scikit-learn', 'XGBoost', 'LightGBM', 'MLflow', 'Optuna', 'SHAP'],
    jobDemandScore: 88,
    weeks: [
      week('ml-fundamentals', 1, 'ML Theory', [
        {
          title: 'ML Mindset',
          minutes: 30,
          format: 'concept',
          tools: mlTools,
          tags: ['supervised', 'unsupervised'],
          job: 'Framing problems correctly is half the senior interview.',
        },
        {
          title: 'Train/Val/Test (data leakage)',
          minutes: 45,
          format: 'concept',
          tools: mlTools,
          tags: ['splitting', 'leakage'],
          job: 'Leakage questions are filter questions at top companies.',
          iq: [
            'Give an example of temporal leakage in a credit model.',
            'Why is a random split unsafe for time series?',
          ],
        },
        {
          title: 'Bias-Variance Tradeoff',
          minutes: 40,
          format: 'concept',
          tools: mlTools,
          tags: ['bias', 'variance'],
          job: 'You should connect this to regularization and model choice.',
        },
        {
          title: 'Evaluation Metrics',
          minutes: 50,
          format: 'hands-on',
          tools: mlTools,
          tags: ['precision', 'recall', 'AUC'],
          job: 'Pick metrics that align with business costs, not accuracy alone.',
          salary: 'Metric fluency supports senior ML engineer compensation bands.',
        },
      ]),
      week('ml-fundamentals', 2, 'Regression', [
        {
          title: 'Linear Regression Production Grade',
          minutes: 50,
          format: 'hands-on',
          tools: mlTools,
          tags: ['linear models', 'regularization'],
          job: 'Baselines must be strong before deep learning.',
        },
        {
          title: 'Logistic Regression',
          minutes: 45,
          format: 'hands-on',
          tools: mlTools,
          tags: ['classification', 'calibration'],
          job: 'Calibration matters when probabilities drive decisions.',
        },
        {
          title: 'Mini-Project Loan Default',
          minutes: 75,
          format: 'project',
          tools: mlTools,
          tags: ['classification', 'project'],
          job: 'End-to-end tabular project is a common take-home pattern.',
          project: mkProject(
            'ml-fundamentals',
            2,
            3,
            'Loan Default Mini-Project',
            ['EDA notebook', 'Train/val split with justification', 'Model + metric report', 'Simple API or batch scorer'],
            ['scikit-learn', 'pandas'],
            10,
            'intermediate'
          ),
        },
      ]),
      week('ml-fundamentals', 3, 'Tree Models', [
        {
          title: 'Decision Trees',
          minutes: 40,
          format: 'concept',
          tools: mlTools,
          tags: ['trees', 'splits'],
          job: 'Tree intuition underpins GBDT systems in industry.',
        },
        {
          title: 'Random Forests',
          minutes: 45,
          format: 'hands-on',
          tools: mlTools,
          tags: ['ensembles', 'bagging'],
          job: 'Still a competitive baseline on structured data.',
        },
        {
          title: 'XGBoost & LightGBM',
          minutes: 55,
          format: 'hands-on',
          tools: ['XGBoost', 'LightGBM', 'pandas'],
          tags: ['boosting', 'tabular'],
          job: 'Kaggle-grade models appear in fraud and ranking teams.',
        },
        {
          title: 'Feature Engineering for Trees',
          minutes: 45,
          format: 'hands-on',
          tools: mlTools,
          tags: ['categorical', 'target encoding caution'],
          job: 'Avoid leakage when encoding high-cardinality fields.',
        },
      ]),
      week('ml-fundamentals', 4, 'Unsupervised', [
        {
          title: 'Clustering',
          minutes: 45,
          format: 'hands-on',
          tools: mlTools,
          tags: ['k-means', 'evaluation'],
          job: 'Unsupervised work needs extra care on interpretation.',
        },
        {
          title: 'Dimensionality Reduction (PCA/UMAP)',
          minutes: 50,
          format: 'concept',
          tools: mlTools,
          tags: ['PCA', 'UMAP'],
          job: 'Useful for visualization and compression pipelines.',
        },
        {
          title: 'Anomaly Detection',
          minutes: 50,
          format: 'hands-on',
          tools: mlTools,
          tags: ['anomaly', 'precision at k'],
          job: 'Security and ops teams interview on this constantly.',
        },
      ]),
      week('ml-fundamentals', 5, 'Deployment', [
        {
          title: 'Model Serialization',
          minutes: 35,
          format: 'hands-on',
          tools: ['joblib', 'ONNX'],
          tags: ['serialization', 'compat'],
          job: 'Version skew between train and serve breaks services quietly.',
        },
        {
          title: 'Production ML API',
          minutes: 55,
          format: 'hands-on',
          tools: ['FastAPI', 'scikit-learn'],
          tags: ['serving', 'latency'],
          job: 'Latency budgets and batching show up in system design rounds.',
        },
        {
          title: 'MLflow',
          minutes: 50,
          format: 'hands-on',
          tools: ['MLflow', 'Python'],
          tags: ['tracking', 'registry'],
          job: 'Experiment tracking is expected in mature ML teams.',
          salary: 'MLOps tooling depth supports higher ML engineer offers.',
        },
      ]),
      week('ml-fundamentals', 6, 'Capstone + Interview', [
        {
          title: 'Capstone Project (full pipeline)',
          minutes: 90,
          format: 'project',
          tools: [...mlTools, 'MLflow', 'FastAPI'],
          tags: ['capstone', 'pipeline'],
          job: 'Demonstrate you can own problem → metric → deploy narrative.',
          project: mkProject(
            'ml-fundamentals',
            6,
            1,
            'Full ML Pipeline Capstone',
            ['Problem statement + metric', 'Feature pipeline', 'Trained model + MLflow runs', 'Served prediction API'],
            ['scikit-learn', 'MLflow', 'FastAPI'],
            18,
            'advanced'
          ),
        },
        {
          title: '30 ML Interview Questions',
          minutes: 60,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['interview', 'drill'],
          job: 'Practice crisp answers with examples and tradeoffs.',
          iq: [
            'Explain ROC vs PR curves and when you prefer each.',
            'How would you diagnose data drift in production?',
            'What is calibration and why does it matter?',
            'Describe how you would handle class imbalance.',
            'When would you not use deep learning?',
          ],
        },
        {
          title: 'Mock Interview Debrief',
          minutes: 35,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['debrief', 'STAR'],
          job: 'Record yourself; tighten stories to two minutes each.',
        },
      ]),
    ],
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    tagline: 'Neural networks from perceptrons to modern stacks',
    description:
      'PyTorch-first journey through CNNs, sequences, transformers, and generative models with interview depth.',
    prerequisite: 'ml-fundamentals',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 8,
    color: '#ec4899',
    icon: '⚡',
    tools: ['PyTorch', 'torchvision', 'HuggingFace Transformers', 'WandB', 'PEFT', 'bitsandbytes'],
    jobDemandScore: 85,
    weeks: [
      week('deep-learning', 1, 'Neural Networks from First Principles', [
        { title: 'The Perceptron', minutes: 35, format: 'concept', tools: dlTools, tags: ['perceptron', 'linear'], job: 'Foundational story for deep dives.' },
        { title: 'Backpropagation', minutes: 50, format: 'concept', tools: dlTools, tags: ['gradients', 'graphs'], job: 'You must explain it without memorized symbols only.' },
        { title: 'PyTorch Fundamentals', minutes: 55, format: 'hands-on', tools: dlTools, tags: ['tensors', 'autograd'], job: 'Autograd mental model is interview core.' },
        { title: 'Activation Functions', minutes: 35, format: 'concept', tools: dlTools, tags: ['relu', 'gelu'], job: 'Know why nonlinearity matters and dead ReLU failure.' },
        { title: 'Loss Functions & Optimizers', minutes: 45, format: 'concept', tools: dlTools, tags: ['adam', 'sgd'], job: 'Optimizer choice interacts with batch size and noise.', salary: 'DL depth unlocks applied research and ML engineer bands.' },
      ]),
      week('deep-learning', 2, 'CNNs', [
        { title: 'Convolution Intuition', minutes: 40, format: 'concept', tools: dlTools, tags: ['conv', 'kernels'], job: 'Spatial inductive bias is a design talking point.' },
        { title: 'ResNet & Modern Architectures', minutes: 50, format: 'concept', tools: dlTools, tags: ['resnet', 'skip connections'], job: 'Skip connections fix optimization pathologies.' },
        { title: 'Transfer Learning', minutes: 55, format: 'hands-on', tools: dlTools, tags: ['fine-tuning', 'frozen backbone'], job: 'Most CV production starts from a pretrained backbone.' },
        {
          title: 'CV Capstone Project',
          minutes: 85,
          format: 'project',
          tools: dlTools,
          tags: ['CV', 'project'],
          job: 'Ship a classifier or detector you can demo.',
          project: mkProject('deep-learning', 2, 4, 'CV Capstone', ['Dataset + augmentations', 'Training curves', 'Eval report', 'Gradio or FastAPI demo'], ['PyTorch', 'torchvision'], 14, 'intermediate'),
        },
      ]),
      week('deep-learning', 3, 'RNNs & Sequences', [
        { title: 'RNN Architecture', minutes: 40, format: 'concept', tools: dlTools, tags: ['RNN', 'sequences'], job: 'Understand vanishing gradients narrative.' },
        { title: 'LSTMs & GRUs', minutes: 45, format: 'concept', tools: dlTools, tags: ['LSTM', 'GRU'], job: 'Still relevant for some time-series stacks.' },
        { title: 'Time Series with DL', minutes: 55, format: 'hands-on', tools: dlTools, tags: ['forecasting'], job: 'Contrast DL vs classical baselines honestly.' },
      ]),
      week('deep-learning', 4, 'Transformers', [
        { title: 'Attention Mechanism', minutes: 50, format: 'concept', tools: dlTools, tags: ['attention', 'QKV'], job: 'Be able to draw QKV on a whiteboard.' },
        {
          title: 'Transformer Architecture (paper review)',
          minutes: 60,
          format: 'paper-review',
          tools: dlTools,
          tags: ['transformer', 'paper'],
          job: 'Attention is all you need is still a live interview topic.',
          paper: 'https://arxiv.org/abs/1706.03762',
        },
        { title: 'BERT vs GPT', minutes: 45, format: 'concept', tools: dlTools, tags: ['BERT', 'GPT'], job: 'Encoder-only vs decoder-only drives system design.' },
        { title: 'Vision Transformers (ViT)', minutes: 45, format: 'concept', tools: dlTools, tags: ['ViT', 'patches'], job: 'Patch tokenization story mirrors NLP tokenization.' },
      ]),
      week('deep-learning', 5, 'Training Large Models', [
        { title: 'Efficient Training (fp16/bf16)', minutes: 45, format: 'hands-on', tools: dlTools, tags: ['mixed precision'], job: 'Memory and throughput tradeoffs are real on the job.' },
        { title: 'Regularization Techniques', minutes: 40, format: 'concept', tools: dlTools, tags: ['dropout', 'weight decay'], job: 'Connect regularization to generalization evidence.' },
        { title: 'Hyperparameter Tuning at Scale', minutes: 50, format: 'concept', tools: ['W&B', 'PyTorch'], tags: ['sweep', 'schedules'], job: 'Show you can run disciplined experiments.', salary: 'Training-at-scale literacy supports large-model teams.' },
      ]),
      week('deep-learning', 6, 'Generative Models', [
        { title: 'Autoencoders & VAEs', minutes: 45, format: 'concept', tools: dlTools, tags: ['VAE', 'latent'], job: 'Latent space intuition carries into diffusion era.' },
        { title: 'GANs', minutes: 45, format: 'concept', tools: dlTools, tags: ['GAN', 'adversarial'], job: 'Training instability is a classic discussion.' },
        { title: 'Diffusion Models (Stable Diffusion)', minutes: 55, format: 'concept', tools: dlTools, tags: ['diffusion', 'noise'], job: 'Forward/reverse process framing impresses interviewers.' },
      ]),
      week('deep-learning', 7, 'NLP with Deep Learning', [
        { title: 'Tokenization', minutes: 40, format: 'concept', tools: llmTools, tags: ['BPE', 'tokens'], job: 'Token boundaries affect cost and safety.' },
        { title: 'Fine-tune BERT for Classification', minutes: 60, format: 'hands-on', tools: ['Hugging Face', 'PyTorch'], tags: ['fine-tuning', 'classification'], job: 'Classic onsite exercise still appears.' },
        { title: 'LoRA & QLoRA Efficient Fine-Tuning', minutes: 55, format: 'hands-on', tools: ['PEFT', 'PyTorch'], tags: ['LoRA', 'adapters'], job: 'Parameter-efficient tuning is default in 2026 stacks.' },
      ]),
      week('deep-learning', 8, 'Capstone', [
        {
          title: 'DL Capstone Project',
          minutes: 90,
          format: 'project',
          tools: dlTools,
          tags: ['capstone'],
          job: 'One strong project beats ten half-finished notebooks.',
          project: mkProject('deep-learning', 8, 1, 'DL Capstone', ['Novel dataset or task', 'Baseline + DL model', 'Ablation or error analysis', 'Demo'], ['PyTorch'], 20, 'advanced'),
        },
        {
          title: 'DL Interview Prep (25 questions)',
          minutes: 55,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['interview'],
          job: 'Tie every answer to something you built.',
          iq: [
            'Explain batch norm vs layer norm.',
            'What is gradient clipping and when do you use it?',
            'How does mixed precision training work?',
            'Describe transformer complexity vs RNN.',
            'What is catastrophic forgetting?',
          ],
        },
        {
          title: 'Capstone Retrospective & Error Analysis',
          minutes: 40,
          format: 'concept',
          tools: dlTools,
          tags: ['retrospective', 'errors'],
          job: 'Interviewers love a honest failure story with metrics.',
        },
      ]),
    ],
  },
  {
    id: 'llm-engineering',
    title: 'LLM Engineering',
    tagline: 'Ship reliable LLM-powered software',
    description: 'Prompting, app architecture, memory, RAG, fine-tuning, and interview-ready narratives.',
    prerequisite: 'python-for-ai (required)',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 6,
    color: '#06b6d4',
    icon: '💬',
    tools: ['Anthropic API', 'OpenAI API', 'LangChain', 'LangSmith', 'Ollama', 'instructor', 'Pydantic'],
    jobDemandScore: 96,
    weeks: [
      week('llm-engineering', 1, 'LLM Foundations', [
        { title: 'What Is an LLM Actually', minutes: 35, format: 'concept', tools: llmTools, tags: ['LLM', 'pretraining'], job: 'Clarify pretraining vs inference vs fine-tuning.' },
        { title: 'The 2026 LLM Landscape', minutes: 40, format: 'concept', tools: llmTools, tags: ['vendors', 'open models'], job: 'Vendor awareness signals seniority.' },
        { title: 'Prompt Engineering Playbook', minutes: 45, format: 'hands-on', tools: llmTools, tags: ['prompting'], job: 'Structured prompts reduce variance and cost.' },
        { title: 'Advanced Prompting Patterns', minutes: 50, format: 'hands-on', tools: llmTools, tags: ['CoT', 'JSON'], job: 'Patterns map to production guardrails.' },
        { title: 'Tokenization and Cost Engineering', minutes: 45, format: 'concept', tools: llmTools, tags: ['tokens', 'cost'], job: 'Finance and PM interviews ask about unit economics.', salary: 'Cost-aware LLM design is a differentiator for senior AI engineers.' },
      ]),
      week('llm-engineering', 2, 'Building LLM Applications', [
        { title: 'LLM App Architecture', minutes: 45, format: 'concept', tools: llmTools, tags: ['routing', 'fallbacks'], job: 'Resilience patterns are system design staples.' },
        { title: 'LangChain LCEL', minutes: 55, format: 'hands-on', tools: ['LangChain', 'Python'], tags: ['LCEL', 'chains'], job: 'Composable pipelines mirror real services.' },
        { title: 'Structured Outputs (instructor/Pydantic)', minutes: 50, format: 'hands-on', tools: ['Pydantic', 'Python'], tags: ['schema', 'validation'], job: 'Typed outputs enable downstream automation.' },
        { title: 'Local LLMs (Ollama)', minutes: 45, format: 'hands-on', tools: ['Ollama', 'llama.cpp'], tags: ['local', 'privacy'], job: 'Offline and air-gapped stories matter for enterprise.' },
      ]),
      week('llm-engineering', 3, 'Memory and State', [
        { title: 'Conversation Memory', minutes: 40, format: 'concept', tools: llmTools, tags: ['memory', 'summaries'], job: 'Long contexts are expensive—summarize intelligently.' },
        { title: 'Vector Embeddings', minutes: 45, format: 'concept', tools: llmTools, tags: ['embeddings'], job: 'Embedding choice impacts retrieval quality.' },
        { title: 'Vector Databases', minutes: 45, format: 'hands-on', tools: ['Chroma', 'pgvector'], tags: ['ANN', 'metadata'], job: 'Metadata filters are production necessities.' },
        {
          title: 'Mini-Project Semantic Search Engine',
          minutes: 75,
          format: 'project',
          tools: ['OpenAI', 'Chroma', 'FastAPI'],
          tags: ['RAG-lite', 'project'],
          job: 'Search UX + relevance is a portfolio classic.',
          project: mkProject('llm-engineering', 3, 4, 'Semantic Search Engine', ['Embed corpus', 'Similarity search API', 'Basic UI or curl docs', 'Eval notes'], ['FastAPI', 'Chroma'], 10, 'intermediate'),
        },
      ]),
      week('llm-engineering', 4, 'RAG', [
        { title: 'RAG Architecture', minutes: 45, format: 'concept', tools: llmTools, tags: ['RAG', 'retrieval'], job: 'Know when RAG beats fine-tuning.' },
        { title: 'Document Processing & Chunking', minutes: 50, format: 'hands-on', tools: llmTools, tags: ['chunking', 'parsing'], job: 'Chunk boundaries can make or break answers.' },
        { title: 'Advanced RAG (hybrid search/reranking/HyDE)', minutes: 55, format: 'concept', tools: llmTools, tags: ['hybrid', 'rerank'], job: 'Advanced RAG is a staff-level talking point.' },
        { title: 'RAG Evaluation (RAGAS)', minutes: 45, format: 'hands-on', tools: ['RAGAS', 'Python'], tags: ['evals', 'metrics'], job: 'Without evals, RAG regresses silently.' },
        {
          title: 'Capstone RAG App',
          minutes: 85,
          format: 'project',
          tools: llmTools,
          tags: ['RAG', 'capstone'],
          job: 'This project anchors many AI engineer interviews.',
          project: mkProject('llm-engineering', 4, 5, 'Capstone RAG App', ['Ingest + chunk pipeline', 'Retrieval + generation', 'Citation UX', 'Eval harness'], ['LangChain', 'FastAPI', 'vector DB'], 16, 'advanced'),
        },
      ]),
      week('llm-engineering', 5, 'Fine-Tuning', [
        { title: 'When to Fine-Tune Decision Framework', minutes: 40, format: 'concept', tools: llmTools, tags: ['fine-tuning', 'RAG'], job: 'Show you can defend the build vs buy decision.' },
        { title: 'Instruction Tuning', minutes: 45, format: 'concept', tools: llmTools, tags: ['SFT', 'datasets'], job: 'Data quality dominates architecture hype.' },
        { title: 'LoRA Fine-Tuning in Practice', minutes: 60, format: 'hands-on', tools: ['PEFT', 'PyTorch'], tags: ['LoRA'], job: 'LoRA is the default fine-tune path in industry.' },
        { title: 'RLHF & Alignment Conceptual', minutes: 40, format: 'concept', tools: llmTools, tags: ['RLHF', 'DPO'], job: 'High-level alignment vocabulary matters.' },
        {
          title: 'Domain-Specific Fine-Tuned Model Project',
          minutes: 80,
          format: 'project',
          tools: llmTools,
          tags: ['fine-tune', 'project'],
          job: 'Domain adaptation stories win niche roles.',
          project: mkProject('llm-engineering', 5, 5, 'Domain Fine-Tune', ['Curate instruction dataset', 'Train LoRA adapter', 'Compare before/after prompts', 'Document safety checks'], ['Hugging Face', 'PEFT'], 14, 'advanced'),
          salary: 'Fine-tuning portfolio pieces support top AI engineer compensation.',
        },
      ]),
      week('llm-engineering', 6, 'Interview Prep', [
        {
          title: 'LLM System Design Drills',
          minutes: 45,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['system design', 'LLM'],
          job: 'Whiteboard latency, cost, and safety for a generic assistant API.',
          iq: ['Sketch caching, routing, and fallback models for an LLM API.'],
        },
        {
          title: 'RAG Failure Modes Roundtable',
          minutes: 40,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['RAG', 'debugging'],
          job: 'List top five RAG failures and mitigations you have actually used.',
        },
        {
          title: '35 LLM Engineer Interview Questions',
          minutes: 60,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['interview'],
          job: 'Drill crisp stories tied to systems you built.',
          iq: [
            'How do you reduce hallucinations in a RAG system?',
            'What is temperature and how does it affect sampling?',
            'Explain embedding vs generative retrieval tradeoffs.',
            'How would you add observability to an LLM service?',
            'When would you cache LLM responses?',
          ],
        },
        {
          title: 'Offer-Ready Narrative Workshop',
          minutes: 35,
          format: 'concept',
          tools: ['notes'],
          tags: ['career', 'story'],
          job: 'Tie each project to business impact and your specific contributions.',
        },
      ]),
    ],
  },
  {
    id: 'genai-and-rag',
    title: 'GenAI & RAG Systems',
    tagline: 'Production-grade generative stacks',
    description: 'Multimodal apps, graph RAG, multi-tenant patterns, and full-stack GenAI products.',
    prerequisite: 'llm-engineering',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 8,
    color: '#10b981',
    icon: '🚀',
    tools: ['LangChain', 'LlamaIndex', 'LangGraph', 'Neo4j', 'FastAPI', 'Streamlit', 'Gradio', 'Chroma', 'Pinecone'],
    jobDemandScore: 94,
    weeks: [
      week('genai-and-rag', 1, 'GenAI App Architecture', [
        { title: 'The GenAI Stack 2026', minutes: 45, format: 'concept', tools: llmTools, tags: ['stack', 'components'], job: 'Map components to ownership in a team.', salary: 'GenAI systems design supports staff-level interviews.' },
        { title: 'Multimodal Applications', minutes: 50, format: 'hands-on', tools: llmTools, tags: ['vision', 'audio'], job: 'Multimodal UX constraints differ from text-only.' },
        { title: 'Streaming UX', minutes: 45, format: 'hands-on', tools: ['SSE', 'FastAPI'], tags: ['streaming', 'UX'], job: 'Perceived latency wins deals.' },
      ]),
      week('genai-and-rag', 2, 'Graph RAG', [
        { title: 'Knowledge Graphs for RAG', minutes: 50, format: 'concept', tools: ['Neo4j', 'Python'], tags: ['graph', 'RAG'], job: 'Graph retrieval answers multi-hop questions better.' },
        { title: 'Agentic RAG Dynamic Retrieval', minutes: 55, format: 'concept', tools: llmTools, tags: ['agents', 'tools'], job: 'Dynamic retrieval reduces wasted context.' },
        { title: 'RAG at Scale Production Challenges', minutes: 45, format: 'concept', tools: llmTools, tags: ['scale', 'SLOs'], job: 'Latency, freshness, and tenancy dominate scale talks.' },
      ]),
      week('genai-and-rag', 3, 'Advanced RAG II', [
        { title: 'LlamaIndex Deep Dive', minutes: 55, format: 'hands-on', tools: ['LlamaIndex', 'Python'], tags: ['indexing', 'query engines'], job: 'LlamaIndex patterns appear in GenAI engineer loops.' },
        { title: 'Evaluation Frameworks', minutes: 45, format: 'hands-on', tools: ['RAGAS', 'Python'], tags: ['evals'], job: 'Eval harnesses are product requirements now.' },
        { title: 'Multi-tenant RAG Architecture', minutes: 50, format: 'concept', tools: llmTools, tags: ['multi-tenant', 'ACL'], job: 'Isolation mistakes are security incidents.' },
      ]),
      week('genai-and-rag', 4, 'Full-Stack Chat App (project)', [
        {
          title: 'Chat UX Patterns & Safety UX',
          minutes: 35,
          format: 'concept',
          tools: ['React', 'FastAPI'],
          tags: ['UX', 'safety'],
          job: 'Streaming, citations, and undo flows separate polished apps from demos.',
        },
        {
          title: 'Auth, Tenancy, and Rate Limits',
          minutes: 40,
          format: 'hands-on',
          tools: ['FastAPI', 'JWT'],
          tags: ['auth', 'limits'],
          job: 'Multi-tenant chat without guardrails is a liability.',
        },
        {
          title: 'Full-Stack Chat App',
          minutes: 90,
          format: 'project',
          tools: ['React', 'FastAPI', 'OpenAI'],
          tags: ['full-stack', 'chat'],
          job: 'End-to-end chat apps are the default portfolio shape.',
          project: mkProject('genai-and-rag', 4, 3, 'Full-Stack Chat App', ['Auth stub or real auth', 'Streaming chat UI', 'Conversation persistence', 'Deployment notes'], ['FastAPI', 'React'], 20, 'advanced'),
        },
        {
          title: 'Chat App Observability',
          minutes: 35,
          format: 'hands-on',
          tools: ['OpenTelemetry', 'Python'],
          tags: ['logs', 'traces'],
          job: 'Trace LLM calls with user/session IDs for support and tuning.',
        },
      ]),
      week('genai-and-rag', 5, 'Document Intelligence App (project)', [
        {
          title: 'PDF Parsing & Layout Challenges',
          minutes: 40,
          format: 'concept',
          tools: ['PyMuPDF'],
          tags: ['parsing', 'layout'],
          job: 'Tables and headers break naive chunking—plan for them.',
        },
        {
          title: 'Human-in-the-Loop for Doc QA',
          minutes: 35,
          format: 'concept',
          tools: llmTools,
          tags: ['HITL', 'review'],
          job: 'Legal and compliance buyers expect review queues.',
        },
        {
          title: 'Document Intelligence App',
          minutes: 90,
          format: 'project',
          tools: ['PyMuPDF', 'LangChain', 'FastAPI'],
          tags: ['documents', 'OCR'],
          job: 'Doc AI is a huge enterprise use case.',
          project: mkProject('genai-and-rag', 5, 3, 'Document Intelligence', ['Upload + parse pipeline', 'Chunk + retrieve + answer', 'Human review queue stub', 'Logging'], ['FastAPI', 'vector DB'], 18, 'advanced'),
        },
        {
          title: 'Doc Pipeline Evaluation',
          minutes: 40,
          format: 'hands-on',
          tools: ['Python', 'RAGAS'],
          tags: ['evals', 'docs'],
          job: 'Measure citation correctness separately from fluency.',
        },
      ]),
      week('genai-and-rag', 6, 'Code Generation & Review App', [
        {
          title: 'Static Analysis + LLM Hybrids',
          minutes: 35,
          format: 'concept',
          tools: ['Python'],
          tags: ['lint', 'LLM'],
          job: 'Combine deterministic checks with LLM explanations for trust.',
        },
        {
          title: 'Patch Safety & Secret Scanning',
          minutes: 35,
          format: 'hands-on',
          tools: ['regex', 'FastAPI'],
          tags: ['security', 'secrets'],
          job: 'Never let an LLM suggest a patch that leaks keys.',
        },
        {
          title: 'Code Generation & Review App',
          minutes: 85,
          format: 'project',
          tools: ['OpenAI', 'FastAPI'],
          tags: ['code', 'review'],
          job: 'Developer productivity tools are hot hiring areas.',
          project: mkProject('genai-and-rag', 6, 3, 'Code Review Assistant', ['Diff ingestion', 'LLM review prompts', 'Safety filters', 'Export patch suggestions'], ['FastAPI', 'Python'], 16, 'intermediate'),
        },
        {
          title: 'Developer Experience Metrics',
          minutes: 30,
          format: 'concept',
          tools: ['Sheets'],
          tags: ['metrics', 'DX'],
          job: 'Measure time-to-merge or defect rate when pitching ROI.',
        },
      ]),
      week('genai-and-rag', 7, 'Production Patterns', [
        { title: 'LLM Gateway', minutes: 45, format: 'concept', tools: llmTools, tags: ['gateway', 'routing'], job: 'Centralized routing enables policy enforcement.' },
        { title: 'Caching Strategies', minutes: 40, format: 'concept', tools: llmTools, tags: ['cache', 'semantic cache'], job: 'Semantic caching cuts cost dramatically.' },
        { title: 'Cost Optimization', minutes: 40, format: 'concept', tools: llmTools, tags: ['budgets', 'routing'], job: 'Show you can run finance-aware GenAI.', salary: 'Cost optimization stories map to senior GenAI offers.' },
      ]),
      week('genai-and-rag', 8, 'Capstone Full GenAI Product', [
        {
          title: 'Go-to-Market Story for GenAI Products',
          minutes: 35,
          format: 'concept',
          tools: ['Slides'],
          tags: ['GTM', 'positioning'],
          job: 'Practice a 3-minute pitch: user, wedge, moat, and risk.',
        },
        {
          title: 'Capstone Full GenAI Product',
          minutes: 90,
          format: 'project',
          tools: llmTools,
          tags: ['capstone'],
          job: 'One polished product narrative beats scattered demos.',
          project: mkProject('genai-and-rag', 8, 2, 'Full GenAI Product', ['PRD + user stories', 'Core RAG/agent flow', 'Eval + monitoring hooks', 'Demo video or deployed link'], ['LangChain', 'FastAPI', 'vector DB'], 24, 'advanced'),
        },
        {
          title: 'Launch Readiness & Runbooks',
          minutes: 40,
          format: 'hands-on',
          tools: ['Notion'],
          tags: ['runbook', 'SRE'],
          job: 'Incident runbooks impress hiring managers who shipped before.',
        },
        {
          title: 'Investor or Exec Demo Dry Run',
          minutes: 35,
          format: 'interview-prep',
          tools: ['Slides'],
          tags: ['demo', 'exec'],
          job: 'Exec demos need fewer features and clearer risk talk.',
          iq: ['How would you explain retrieval failure to a non-technical exec?'],
        },
      ]),
    ],
  },
  {
    id: 'agentic-ai',
    title: 'Agentic AI',
    tagline: 'Agents, graphs, and production autonomy',
    description: 'ReAct, LangGraph, multi-agent systems, MCP, and reliability patterns.',
    prerequisite: 'llm-engineering (required)',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 6,
    color: '#f59e0b',
    icon: '🤖',
    tools: ['LangGraph', 'CrewAI', 'AutoGen', 'MCP', 'LangChain', 'FastAPI', 'Redis'],
    jobDemandScore: 97,
    weeks: [
      week('agentic-ai', 1, 'What Are AI Agents?', [
        { title: 'Agent Architecture Overview', minutes: 40, format: 'concept', tools: llmTools, tags: ['agents', 'planning'], job: 'Define agents vs workflows vs automations clearly.' },
        { title: 'ReAct Pattern', minutes: 45, format: 'hands-on', tools: llmTools, tags: ['ReAct', 'tools'], job: 'ReAct is still a baseline pattern in 2026.' },
        { title: 'Tool Use & Function Calling', minutes: 50, format: 'hands-on', tools: llmTools, tags: ['tools', 'JSON schema'], job: 'Schema design is half the battle.' },
        { title: 'Memory Systems for Agents', minutes: 45, format: 'concept', tools: llmTools, tags: ['memory', 'state'], job: 'Long-horizon tasks need explicit memory design.' },
      ]),
      week('agentic-ai', 2, 'LangGraph', [
        { title: 'Stateful Agents with LangGraph', minutes: 55, format: 'hands-on', tools: ['LangGraph', 'Python'], tags: ['graphs', 'state machines'], job: 'Graphs beat loose chains for reliability.' },
        { title: 'Multi-Agent Graphs', minutes: 50, format: 'hands-on', tools: ['LangGraph'], tags: ['multi-agent'], job: 'Coordination failures are common—plan for them.' },
        { title: 'Human-in-the-Loop Patterns', minutes: 45, format: 'concept', tools: llmTools, tags: ['HITL', 'approval'], job: 'Enterprise buyers demand human gates.', salary: 'Agentic systems skills are premium in 2026 hiring.' },
      ]),
      week('agentic-ai', 3, 'CrewAI & Multi-Agent Systems', [
        { title: 'CrewAI Setup', minutes: 45, format: 'hands-on', tools: ['CrewAI', 'Python'], tags: ['crews', 'roles'], job: 'Role prompts must be tight to avoid thrash.' },
        { title: 'Role-Based Agent Teams', minutes: 50, format: 'hands-on', tools: ['CrewAI'], tags: ['roles', 'tasks'], job: 'Task decomposition mirrors eng team workflows.' },
        { title: 'Agent Communication Patterns', minutes: 40, format: 'concept', tools: llmTools, tags: ['messaging', 'contracts'], job: 'Contracts between agents reduce silent failures.' },
      ]),
      week('agentic-ai', 4, 'MCP & Agent Protocols', [
        { title: 'Model Context Protocol (MCP)', minutes: 45, format: 'concept', tools: ['MCP'], tags: ['protocol', 'tools'], job: 'MCP is becoming a standard integration story.' },
        { title: 'Building MCP Servers', minutes: 55, format: 'hands-on', tools: ['MCP', 'TypeScript'], tags: ['servers', 'stdio'], job: 'Show you can expose internal systems safely.' },
        { title: 'Connecting Agents to Real Systems', minutes: 45, format: 'hands-on', tools: llmTools, tags: ['integrations'], job: 'Idempotency and audit logs are non-negotiable.' },
      ]),
      week('agentic-ai', 5, 'Production Agents', [
        { title: 'Agent Evaluation', minutes: 45, format: 'concept', tools: llmTools, tags: ['evals', 'traces'], job: 'Agents need task-success metrics, not vibes.' },
        { title: 'Reliability & Failure Modes', minutes: 45, format: 'concept', tools: llmTools, tags: ['failures', 'retries'], job: 'Discuss loops, tool errors, and escalation.' },
        { title: 'Production Deployment Patterns', minutes: 50, format: 'concept', tools: ['Kubernetes', 'Docker'], tags: ['deploy', 'SLOs'], job: 'Reliability SLOs for agents are emerging practice.' },
      ]),
      week('agentic-ai', 6, 'Capstone & Interview', [
        {
          title: 'Agentic AI Capstone Project',
          minutes: 90,
          format: 'project',
          tools: ['LangGraph', 'FastAPI'],
          tags: ['capstone'],
          job: 'Ship an agent that uses tools with guardrails.',
          project: mkProject('agentic-ai', 6, 1, 'Agentic Capstone', ['Tool integrations', 'Graph or crew orchestration', 'Tracing', 'Safety checks'], ['LangGraph', 'FastAPI'], 20, 'advanced'),
        },
        {
          title: '30 Agentic AI Interview Questions',
          minutes: 55,
          format: 'interview-prep',
          tools: ['notes'],
          tags: ['interview'],
          job: 'Tie answers to traces and evals you actually ran.',
          iq: [
            'How do you prevent infinite tool loops?',
            'What is the difference between a workflow and an agent?',
            'How would you add approvals to a sensitive tool?',
            'Describe your observability stack for agents.',
            'When would you avoid agents entirely?',
          ],
        },
        {
          title: 'Agent Tracing Lab',
          minutes: 40,
          format: 'hands-on',
          tools: ['LangSmith', 'Python'],
          tags: ['tracing', 'debug'],
          job: 'Export a trace that shows a failed tool call and recovery.',
        },
      ]),
    ],
  },
  {
    id: 'mlops-and-deployment',
    title: 'MLOps & Deployment',
    tagline: 'Reliable ML in production',
    description: 'CI/CD for ML, registries, Kubernetes, monitoring, and cloud ML platforms.',
    prerequisite: 'ml-fundamentals',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 6,
    color: '#ef4444',
    icon: '⚙️',
    tools: ['MLflow', 'DVC', 'Docker', 'Kubernetes', 'Airflow', 'Grafana', 'Terraform', 'GitHub Actions'],
    jobDemandScore: 83,
    weeks: [
      week('mlops-and-deployment', 1, 'MLOps Foundations', [
        { title: 'ML System Design', minutes: 45, format: 'concept', tools: ['diagrams'], tags: ['design', 'SLOs'], job: 'ML system design rounds are common for senior roles.' },
        { title: 'CI/CD for ML', minutes: 50, format: 'hands-on', tools: ['GitHub Actions', 'Python'], tags: ['CI', 'tests'], job: 'Tests for data and models are different from app tests.' },
        { title: 'Data Versioning (DVC)', minutes: 45, format: 'hands-on', tools: ['DVC', 'S3'], tags: ['data', 'versioning'], job: 'Reproducible datasets underpin auditability.' },
      ]),
      week('mlops-and-deployment', 2, 'Experiment Tracking & Model Registry', [
        { title: 'MLflow Mastery', minutes: 55, format: 'hands-on', tools: ['MLflow'], tags: ['tracking', 'artifacts'], job: 'Artifact lineage is compliance-friendly.' },
        { title: 'Model Registry', minutes: 45, format: 'hands-on', tools: ['MLflow'], tags: ['registry', 'promotion'], job: 'Promotion gates reduce production surprises.' },
        { title: 'A/B Testing Models', minutes: 45, format: 'concept', tools: ['stats'], tags: ['A/B', 'experiments'], job: 'Causal caution: avoid peeking and Simpson traps.', salary: 'MLOps + experimentation fluency supports strong TC.' },
      ]),
      week('mlops-and-deployment', 3, 'Containerization & Kubernetes', [
        { title: 'Docker for ML', minutes: 45, format: 'hands-on', tools: ['Docker'], tags: ['images', 'layers'], job: 'Slim images and fast builds matter at scale.' },
        { title: 'Kubernetes for Inference', minutes: 55, format: 'concept', tools: ['Kubernetes'], tags: ['deployments', 'HPA'], job: 'Autoscaling inference is cost-sensitive.' },
        { title: 'Helm Charts', minutes: 40, format: 'hands-on', tools: ['Helm', 'Kubernetes'], tags: ['helm', 'templating'], job: 'Helm is still the packaging default in many orgs.' },
      ]),
      week('mlops-and-deployment', 4, 'Monitoring & Observability', [
        { title: 'Model Drift Detection', minutes: 45, format: 'concept', tools: ['Prometheus', 'Python'], tags: ['drift', 'PSI'], job: 'Define drift vs business impact, not just stats.' },
        { title: 'Data Drift', minutes: 45, format: 'concept', tools: ['Python'], tags: ['data drift', 'schema'], job: 'Schema drift breaks silent consumers.' },
        { title: 'Alerting Systems', minutes: 40, format: 'concept', tools: ['PagerDuty', 'Grafana'], tags: ['alerts', 'SLOs'], job: 'Alert fatigue is a real production problem.' },
      ]),
      week('mlops-and-deployment', 5, 'Cloud ML Platforms', [
        { title: 'AWS SageMaker', minutes: 50, format: 'concept', tools: ['SageMaker'], tags: ['AWS', 'training'], job: 'Know managed tradeoffs vs DIY.' },
        { title: 'GCP Vertex AI', minutes: 50, format: 'concept', tools: ['Vertex'], tags: ['GCP', 'pipelines'], job: 'Vertex pipelines integrate with BigQuery ecosystems.' },
        { title: 'Azure ML', minutes: 45, format: 'concept', tools: ['Azure ML'], tags: ['Azure', 'enterprise'], job: 'Enterprise buyers often anchor on Azure.' },
      ]),
      week('mlops-and-deployment', 6, 'Capstone MLOps Pipeline', [
        {
          title: 'SLOs for ML Services',
          minutes: 35,
          format: 'concept',
          tools: ['slides'],
          tags: ['SLO', 'error budget'],
          job: 'Define latency and freshness SLOs before wiring alerts.',
        },
        {
          title: 'Rollback & Canary Strategies',
          minutes: 40,
          format: 'concept',
          tools: ['Kubernetes'],
          tags: ['canary', 'rollback'],
          job: 'Model rollbacks are harder than app rollbacks—plan dual artifacts.',
        },
        {
          title: 'Capstone MLOps Pipeline',
          minutes: 90,
          format: 'project',
          tools: ['MLflow', 'Docker', 'Kubernetes'],
          tags: ['capstone'],
          job: 'A pipeline story wins MLOps interviews.',
          project: mkProject(
            'mlops-and-deployment',
            6,
            3,
            'MLOps Capstone',
            ['Train + track experiment', 'Build + push container', 'Deploy to k8s or managed endpoint', 'Monitoring hooks'],
            ['MLflow', 'Docker', 'GitHub Actions'],
            22,
            'advanced'
          ),
          salary: 'End-to-end MLOps portfolios map to strong offers.',
        },
        {
          title: 'Postmortem Template for Model Incidents',
          minutes: 35,
          format: 'hands-on',
          tools: ['Notion'],
          tags: ['postmortem', 'culture'],
          job: 'Blameless postmortems signal senior reliability maturity.',
        },
      ]),
    ],
  },
  {
    id: 'ai-for-leaders',
    title: 'AI for Leaders',
    tagline: 'Strategy without drowning in jargon',
    description: 'Demystify AI for executives, govern responsibly, and measure ROI.',
    prerequisite: 'None — no coding required',
    targetRoles: LEADER_ROLES,
    estimatedWeeks: 4,
    color: '#64748b',
    icon: '📊',
    tools: ['No-code AI tools', 'ChatGPT', 'Claude', 'Notion AI', 'GitHub Copilot (overview)'],
    jobDemandScore: 79,
    weeks: [
      week('ai-for-leaders', 1, 'AI Demystified for Leaders', [
        { title: 'How AI Actually Works (no math)', minutes: 40, format: 'concept', tools: ['slides'], tags: ['intuition', 'data'], job: 'Translate capability to business outcomes.' },
        { title: 'LLMs Without the Jargon', minutes: 40, format: 'concept', tools: ['slides'], tags: ['LLM', 'limits'], job: 'Set realistic expectations on hallucinations.' },
        { title: 'AI vs Automation vs Robotics', minutes: 35, format: 'concept', tools: ['slides'], tags: ['definitions'], job: 'Clarify scope to avoid wasted initiatives.' },
        { title: 'The 2026 AI Landscape', minutes: 40, format: 'concept', tools: ['slides'], tags: ['vendors', 'trends'], job: 'Vendor maps help boards and committees.', salary: 'AI-literate leaders command premium packages.' },
      ]),
      week('ai-for-leaders', 2, 'AI Strategy & Governance', [
        { title: 'Building an AI Strategy', minutes: 45, format: 'concept', tools: ['Notion'], tags: ['strategy', 'portfolio'], job: 'Portfolio thinking beats random pilots.' },
        { title: 'AI Risk Framework', minutes: 45, format: 'concept', tools: ['Notion'], tags: ['risk', 'controls'], job: 'Risk framing is now a board topic.' },
        { title: 'Data Governance', minutes: 40, format: 'concept', tools: ['slides'], tags: ['data', 'privacy'], job: 'Data rights and retention gate many AI programs.' },
        { title: 'AI Ethics & Responsible AI', minutes: 40, format: 'concept', tools: ['slides'], tags: ['ethics', 'fairness'], job: 'Responsible AI is procurement and PR, not only ML.', salary: 'Governance fluency supports director+ AI roles.' },
      ]),
      week('ai-for-leaders', 3, 'AI Project Management', [
        { title: 'Scoping AI Projects', minutes: 45, format: 'concept', tools: ['Notion'], tags: ['scope', 'MVP'], job: 'Tight MVPs reduce science-project traps.' },
        { title: 'Managing AI Teams', minutes: 40, format: 'concept', tools: ['slides'], tags: ['teams', 'roles'], job: 'Hybrid research/product teams need different cadences.' },
        { title: 'Vendor Selection', minutes: 45, format: 'concept', tools: ['slides'], tags: ['vendors', 'RFP'], job: 'Security reviews and SLAs dominate vendor picks.' },
        { title: 'ROI Measurement for AI', minutes: 40, format: 'concept', tools: ['Sheets'], tags: ['ROI', 'metrics'], job: 'Tie AI metrics to revenue or cost, not demos.' },
      ]),
      week('ai-for-leaders', 4, 'Capstone — AI Roadmap Presentation', [
        {
          title: 'Executive Storyline for AI Roadmaps',
          minutes: 35,
          format: 'concept',
          tools: ['Slides'],
          tags: ['narrative', 'exec'],
          job: 'Lead with outcomes and risks, not model names.',
        },
        {
          title: 'Stakeholder Alignment Workshop',
          minutes: 40,
          format: 'hands-on',
          tools: ['Notion'],
          tags: ['stakeholders', 'RACI'],
          job: 'RACI clarity prevents AI projects from stalling in legal.',
        },
        {
          title: 'Build a 6-month AI Roadmap (capstone deck)',
          minutes: 90,
          format: 'project',
          tools: ['Slides', 'Notion'],
          tags: ['roadmap', 'capstone'],
          job: 'A roadmap deck is a credible leadership artifact.',
          project: mkProject(
            'ai-for-leaders',
            4,
            3,
            "Build Your Organisation's 6-Month AI Roadmap",
            [
              '6-month AI initiative roadmap (slide deck)',
              '3 prioritised use cases with feasibility assessment',
              'Risk register for each initiative',
              'Team + skill requirements',
              'Success metrics and KPIs',
            ],
            ['Notion', 'Slides'],
            8,
            'beginner',
            {
              id: 'ai-for-leaders-w4-capstone',
              description:
                'Synthesise governance, ROI, and sequencing into a board-ready narrative without writing production ML code.',
            }
          ),
        },
        {
          title: 'Roadmap Dry Run & Q&A',
          minutes: 35,
          format: 'interview-prep',
          tools: ['Slides'],
          tags: ['presentation', 'Q&A'],
          job: 'Practice sharp answers on budget, headcount, and failure modes.',
          iq: ['How do you sequence pilots when the board wants GenAI now?'],
        },
      ]),
    ],
  },
  {
    id: 'domain-specialization',
    title: 'Domain Specialization',
    tagline: 'Vertical AI with compliance in mind',
    description: 'Healthcare, finance, legal, retail, manufacturing, and a vertical capstone.',
    prerequisite: 'ml-fundamentals OR llm-engineering',
    targetRoles: ALL_ROLES,
    estimatedWeeks: 6,
    color: '#0ea5e9',
    icon: '🏥',
    tools: ['domain-specific libraries', 'LangChain', 'FastAPI', 'HuggingFace'],
    jobDemandScore: 81,
    weeks: [
      week('domain-specialization', 1, 'Healthcare AI', [
        { title: 'Medical Imaging AI', minutes: 45, format: 'concept', tools: ['PyTorch'], tags: ['imaging', 'DICOM'], job: 'Clinical workflows differ from Kaggle CV.' },
        { title: 'Clinical NLP', minutes: 45, format: 'concept', tools: llmTools, tags: ['NLP', 'EHR'], job: 'De-identification and bias are central.' },
        { title: 'FDA Regulations for AI', minutes: 40, format: 'concept', tools: ['docs'], tags: ['FDA', 'SaMD'], job: 'Regulated ML requires documentation discipline.' },
        { title: 'HIPAA Compliance in AI Systems', minutes: 45, format: 'concept', tools: ['docs'], tags: ['HIPAA', 'PHI'], job: 'PHI boundaries shape architecture.', salary: 'Healthcare AI roles pay compliance premiums.' },
      ]),
      week('domain-specialization', 2, 'Finance AI', [
        { title: 'Fraud Detection Systems', minutes: 50, format: 'concept', tools: mlTools, tags: ['fraud', 'rules+ML'], job: 'Hybrid systems dominate production fraud stacks.' },
        { title: 'Algorithmic Trading Basics', minutes: 40, format: 'concept', tools: ['Python'], tags: ['markets', 'latency'], job: 'Latency and market structure matter more than models.' },
        { title: 'Credit Scoring Models', minutes: 45, format: 'concept', tools: mlTools, tags: ['credit', 'fair lending'], job: 'Fair lending scrutiny is intense.' },
        { title: 'Regulatory Compliance', minutes: 40, format: 'concept', tools: ['docs'], tags: ['compliance', 'audit'], job: 'Model risk management is a career path.', salary: 'Finance ML combines high base and variable.' },
      ]),
      week('domain-specialization', 3, 'Legal AI', [
        { title: 'Contract Analysis with LLMs', minutes: 45, format: 'hands-on', tools: llmTools, tags: ['contracts', 'RAG'], job: 'Citation and traceability are mandatory.' },
        { title: 'Legal Research Automation', minutes: 40, format: 'concept', tools: llmTools, tags: ['research', 'RAG'], job: 'Privilege and confidentiality constrain design.' },
        { title: 'AI in E-Discovery', minutes: 40, format: 'concept', tools: ['docs'], tags: ['ediscovery'], job: 'Precision/recall tradeoffs map to legal risk.' },
        { title: 'Hallucination Risk in Legal Contexts', minutes: 40, format: 'concept', tools: llmTools, tags: ['hallucinations', 'HITL'], job: 'Human review is often non-optional.' },
      ]),
      week('domain-specialization', 4, 'Retail & E-commerce AI', [
        { title: 'Recommendation Systems', minutes: 50, format: 'concept', tools: mlTools, tags: ['recsys', 'embeddings'], job: 'Cold start and diversity are product questions.' },
        { title: 'Demand Forecasting', minutes: 45, format: 'hands-on', tools: mlTools, tags: ['forecasting'], job: 'Seasonality and promotions dominate error.' },
        { title: 'Customer Segmentation', minutes: 40, format: 'hands-on', tools: mlTools, tags: ['clustering'], job: 'Segments must be actionable for marketing.' },
        { title: 'Visual Search', minutes: 45, format: 'concept', tools: dlTools, tags: ['CV', 'search'], job: 'Multimodal retrieval UX is subtle.' },
      ]),
      week('domain-specialization', 5, 'AI in Manufacturing', [
        { title: 'Predictive Maintenance', minutes: 45, format: 'concept', tools: mlTools, tags: ['IoT', 'sensors'], job: 'Sensor drift breaks naive models.' },
        { title: 'Computer Vision for Quality Control', minutes: 50, format: 'hands-on', tools: dlTools, tags: ['defect', 'CV'], job: 'Edge deployment constraints are real.' },
        { title: 'Supply Chain Optimization', minutes: 40, format: 'concept', tools: ['Python'], tags: ['optimization'], job: 'OR + ML hybrids are common.' },
      ]),
      week('domain-specialization', 6, 'Capstone — Vertical AI App', [
        {
          title: 'Vertical Discovery Interviews',
          minutes: 35,
          format: 'concept',
          tools: ['Notion'],
          tags: ['discovery', 'users'],
          job: 'Synthetic requirements miss domain nuance—talk to practitioners.',
        },
        {
          title: 'Compliance Sign-off Checklist',
          minutes: 40,
          format: 'hands-on',
          tools: ['Sheets'],
          tags: ['compliance', 'checklist'],
          job: 'Document data flows before engineering starts.',
        },
        {
          title: 'Vertical AI App',
          minutes: 90,
          format: 'project',
          tools: [...llmTools, 'FastAPI'],
          tags: ['vertical', 'capstone'],
          job: 'Pick one vertical and go deep on constraints.',
          project: mkProject(
            'domain-specialization',
            6,
            3,
            'Vertical AI Capstone',
            ['Problem in a regulated or high-stakes domain', 'Compliance notes', 'RAG or ML core', 'Evaluation + monitoring plan'],
            ['FastAPI', 'Python'],
            20,
            'advanced'
          ),
        },
        {
          title: 'Vertical Case Study Write-Up',
          minutes: 35,
          format: 'hands-on',
          tools: ['Markdown'],
          tags: ['case study', 'portfolio'],
          job: 'Publish a concise case study recruiters can skim.',
        },
      ]),
    ],
  },
]

function assertCurriculumIntegrity(paths: ProPath[]) {
  for (const p of paths) {
    if (p.weeks.length !== p.estimatedWeeks) {
      throw new Error(`Path ${p.id}: weeks.length ${p.weeks.length} !== estimatedWeeks ${p.estimatedWeeks}`)
    }
    for (const w of p.weeks) {
      if (w.lessons.length < 3 || w.lessons.length > 5) {
        throw new Error(`Path ${p.id} week ${w.weekNumber}: expected 3-5 lessons, got ${w.lessons.length}`)
      }
    }
  }
}

assertCurriculumIntegrity(PRO_CURRICULUM)

const lessonById = new Map<string, ProLesson>()
for (const p of PRO_CURRICULUM) {
  for (const w of p.weeks) {
    for (const l of w.lessons) {
      if (lessonById.has(l.id)) throw new Error(`Duplicate lesson id ${l.id}`)
      lessonById.set(l.id, l)
    }
  }
}

export function findProLesson(lessonId: string): ProLesson | null {
  return lessonById.get(lessonId) ?? null
}

export function getProPath(pathId: ProPathId): ProPath | undefined {
  return PRO_CURRICULUM.find((p) => p.id === pathId)
}

export function getAllProLessons(): ProLesson[] {
  return Array.from(lessonById.values())
}

export function findProjectSpecById(
  projectId: string
): { pathId: ProPathId; lesson: ProLesson; spec: ProjectSpec } | null {
  for (const p of PRO_CURRICULUM) {
    for (const w of p.weeks) {
      for (const l of w.lessons) {
        if (l.projectSpec?.id === projectId) {
          return { pathId: p.id, lesson: l, spec: l.projectSpec }
        }
      }
    }
  }
  return null
}
