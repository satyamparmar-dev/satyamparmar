import type { ProRoleDefinition } from '../types/pro.types'

export const PRO_ROLES: ProRoleDefinition[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    description:
      'Builds production AI systems — APIs, RAG pipelines, agent orchestration. The most in-demand role in 2026.',
    salaryRange: '$140k–$220k USD / ₹22–45 LPA',
    demandLevel: 'Very High',
    requiredPaths: ['llm-engineering', 'genai-and-rag', 'agentic-ai'],
    keySkills: ['LangChain', 'RAG', 'LangGraph', 'FastAPI', 'Vector DBs', 'Prompt Engineering'],
    topCompanies: ['Anthropic', 'OpenAI', 'Google DeepMind', 'Microsoft'],
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    description:
      'Builds, trains, and deploys machine learning models at scale. Heavy on Python, PyTorch, and MLOps.',
    salaryRange: '$130k–$210k USD / ₹18–38 LPA',
    demandLevel: 'Very High',
    requiredPaths: ['ml-fundamentals', 'deep-learning', 'mlops-and-deployment'],
    keySkills: ['PyTorch', 'scikit-learn', 'MLflow', 'Docker', 'Kubernetes', 'XGBoost'],
    topCompanies: ['Google', 'Apple', 'Netflix', 'Uber', 'LinkedIn'],
  },
  {
    id: 'genai-engineer',
    title: 'GenAI Engineer',
    description:
      'Specializes in building generative AI applications — chatbots, RAG systems, multimodal apps, AI agents.',
    salaryRange: '$145k–$230k USD / ₹24–50 LPA',
    demandLevel: 'Very High',
    requiredPaths: ['llm-engineering', 'genai-and-rag', 'agentic-ai'],
    keySkills: ['LangChain', 'LangGraph', 'RAG', 'Fine-tuning', 'Streamlit', 'LlamaIndex'],
    topCompanies: ['Databricks', 'Cohere', 'Scale AI', 'AI startups'],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description:
      'Analyses data and builds predictive models to drive business decisions. Statistics + ML + storytelling.',
    salaryRange: '$115k–$180k USD / ₹15–32 LPA',
    demandLevel: 'High',
    requiredPaths: ['python-for-ai', 'ml-fundamentals', 'domain-specialization'],
    keySkills: ['Pandas', 'scikit-learn', 'SQL', 'Statistics', 'Tableau', 'XGBoost'],
    topCompanies: ['Amazon', 'Walmart', 'Flipkart', 'HDFC', 'Accenture'],
  },
  {
    id: 'mlops-engineer',
    title: 'MLOps Engineer',
    description:
      'Productionizes ML models — CI/CD pipelines, model registries, monitoring, infrastructure. Closest to a Java DevOps role.',
    salaryRange: '$125k–$200k USD / ₹20–40 LPA',
    demandLevel: 'High',
    requiredPaths: ['ml-fundamentals', 'mlops-and-deployment', 'deep-learning'],
    keySkills: ['MLflow', 'Kubeflow', 'Docker', 'Kubernetes', 'Airflow', 'Terraform'],
    topCompanies: ['Databricks', 'Weights & Biases', 'AWS', 'GCP', 'Snowflake'],
  },
  {
    id: 'ai-researcher',
    title: 'AI Researcher',
    description:
      'Pushes the frontier — new architectures, training techniques, alignment research. Requires strong math.',
    salaryRange: '$150k–$350k USD / ₹30–80 LPA',
    demandLevel: 'Medium',
    requiredPaths: ['ml-fundamentals', 'deep-learning', 'llm-engineering'],
    keySkills: ['PyTorch', 'Math (Linear Algebra + Calculus)', 'Research writing', 'CUDA', 'Transformers'],
    topCompanies: ['Anthropic', 'OpenAI', 'DeepMind', 'FAIR (Meta)', 'IIT research labs'],
  },
  {
    id: 'ai-product-manager',
    title: 'AI Product Manager',
    description:
      'Defines what to build in AI products — balancing technical feasibility, user needs, and business outcomes.',
    salaryRange: '$130k–$200k USD / ₹22–42 LPA',
    demandLevel: 'High',
    requiredPaths: ['ai-for-leaders', 'llm-engineering', 'genai-and-rag'],
    keySkills: ['AI literacy', 'Product strategy', 'Prompt engineering', 'RAG concepts', 'Metrics'],
    topCompanies: ['Google', 'Microsoft', 'Salesforce', 'HubSpot', 'Zoho'],
  },
  {
    id: 'ai-ethics-officer',
    title: 'AI Ethics & Safety Officer',
    description:
      'Ensures AI systems are safe, fair, and compliant. Growing role driven by EU AI Act + enterprise governance.',
    salaryRange: '$110k–$170k USD / ₹18–35 LPA',
    demandLevel: 'Medium',
    requiredPaths: ['ai-for-leaders', 'ml-fundamentals'],
    keySkills: ['AI governance', 'Bias detection', 'EU AI Act', 'Fairness metrics', 'Red-teaming'],
    topCompanies: ['Microsoft', 'IBM', 'Accenture', 'KPMG', 'Large banks'],
  },
  {
    id: 'domain-ml-specialist',
    title: 'Domain ML Specialist',
    description:
      'Applies ML to a specific vertical — healthcare, finance, legal. Combines domain expertise with ML skills.',
    salaryRange: '$120k–$190k USD / ₹20–40 LPA',
    demandLevel: 'High',
    requiredPaths: ['ml-fundamentals', 'llm-engineering', 'domain-specialization'],
    keySkills: ['Domain knowledge', 'Feature engineering', 'Regulatory compliance', 'RAG', 'Fine-tuning'],
    topCompanies: ['Philips Healthcare', 'JP Morgan', 'LexisNexis', 'Zebra Medical', 'Zepto'],
  },
  {
    id: 'ai-leader-non-technical',
    title: 'AI Leader / Head of AI',
    description:
      'Leads AI strategy, teams, and initiatives at an organisational level. No coding required but deep AI literacy is essential.',
    salaryRange: '$150k–$280k USD / ₹35–80 LPA',
    demandLevel: 'High',
    requiredPaths: ['ai-for-leaders'],
    keySkills: ['AI strategy', 'Team building', 'Governance', 'ROI frameworks', 'Vendor evaluation'],
    topCompanies: ['TCS', 'Infosys', 'Wipro', 'McKinsey', 'BCG', 'Fortune 500 firms'],
  },
]

/** Optional model answers for interview prep; keyed by lesson id + question index for stability */
export const PRO_INTERVIEW_MODEL_ANSWERS: Record<string, string> = {}

export function getProInterviewAnswer(lessonId: string, questionIndex: number, question: string): string {
  const key = `${lessonId}::${questionIndex}`
  if (PRO_INTERVIEW_MODEL_ANSWERS[key]) return PRO_INTERVIEW_MODEL_ANSWERS[key]
  if (PRO_INTERVIEW_MODEL_ANSWERS[question]) return PRO_INTERVIEW_MODEL_ANSWERS[question]
  return (
    'Give a clear definition, walk through a concrete example (ideally from work or a known system), then mention tradeoffs, metrics, and failure modes interviewers care about in 2026.'
  )
}
