export type GlossaryTermContent = {
  oneLineSummary: string;
  simpleExplanation: string;
  codeBlock?: string;
  codeIntro?: string;
  codeOutro?: string;
  practiceNote?: string;
  realLifeParagraph: string;
  learnMoreLinks: Array<{ label: string; url: string }>;
};

const coreLinks = [
  {
    label: 'Google ML Crash Course',
    url: 'https://developers.google.com/machine-learning/crash-course',
  },
  {
    label: 'OpenAI Docs Introduction',
    url: 'https://platform.openai.com/docs/introduction',
  },
];

export const aiGlossaryContent: Record<string, GlossaryTermContent> = {
  'Artificial Intelligence': {
    oneLineSummary: 'AI means teaching computers to do tasks that normally need human intelligence.',
    simpleExplanation:
      'Think of AI like training a smart assistant, not building a magic brain. AI is a broad field where we build systems that can recognize patterns, make decisions, or generate content from data. It matters because it helps automate repetitive thinking work and supports faster decisions.',
    practiceNote:
      'In practice, teams define one business task first, then choose the smallest AI approach that solves that task safely.',
    realLifeParagraph:
      'You see this in ChatGPT writing drafts, Google Maps predicting traffic, and Netflix choosing what to recommend next.',
    learnMoreLinks: coreLinks,
  },
  Algorithm: {
    oneLineSummary: 'An algorithm is a step-by-step recipe a computer follows.',
    simpleExplanation:
      'Imagine a cooking recipe where each step must be clear and ordered. An algorithm is exactly that, but for problem-solving in software and AI systems. It matters because even strong data cannot fix a poor recipe.',
    practiceNote:
      'Teams compare algorithms based on speed, accuracy, and how well they scale in production.',
    realLifeParagraph:
      'Spotify recommendations, spam filters, and route optimization in ride-sharing apps all rely on algorithm choices.',
    learnMoreLinks: coreLinks,
  },
  Model: {
    oneLineSummary: 'A model is the learned function that turns inputs into predictions.',
    simpleExplanation:
      'Think of a model like a student who has practiced many examples. After training, the model maps new input to an output, such as classifying email or generating text. It matters because the model is the core engine delivering AI behavior.',
    practiceNote:
      'Production teams version models, evaluate them on test sets, and roll them out gradually.',
    realLifeParagraph:
      'Face unlock, fraud scoring, and chat assistants are all powered by models under the hood.',
    learnMoreLinks: coreLinks,
  },
  Training: {
    oneLineSummary: 'Training is when a model learns patterns from data.',
    simpleExplanation:
      'Training is like practice sessions before the final match. The model sees many examples, compares its guesses to correct answers, and updates itself repeatedly. It matters because better training data and setup usually drive better real-world accuracy.',
    practiceNote:
      'Teams track training runs, data versions, and hyperparameters so results are reproducible.',
    realLifeParagraph:
      'When recommendation quality improves over months, that usually comes from better training pipelines.',
    learnMoreLinks: coreLinks,
  },
  Inference: {
    oneLineSummary: 'Inference is using a trained model to make predictions on new data.',
    simpleExplanation:
      'If training is studying, inference is exam day. The model receives unseen input and returns an output quickly, usually in milliseconds or seconds. It matters because user experience depends on inference speed, cost, and reliability.',
    practiceNote:
      'Teams optimize inference with caching, batching, and smaller model variants to meet latency budgets.',
    realLifeParagraph:
      'Autocomplete, ad ranking, and real-time fraud checks all run inference continuously.',
    learnMoreLinks: coreLinks,
  },
  Parameters: {
    oneLineSummary: 'Parameters are internal values a model learns during training.',
    simpleExplanation:
      'Think of parameters as tiny memory slots that store what the model learned. During training, these values are adjusted to reduce mistakes. It matters because parameter quality directly controls prediction quality.',
    practiceNote:
      'Teams monitor parameter count because it affects memory usage, speed, and infrastructure cost.',
    realLifeParagraph:
      'Modern language models with billions of parameters can write fluent text and summarize large documents.',
    learnMoreLinks: coreLinks,
  },
  Weights: {
    oneLineSummary: 'Weights decide how strongly each input influences the model output.',
    simpleExplanation:
      'Imagine voting where some voters have more influence than others. Weights are those influence values in neural models, learned from data. It matters because wrong weight patterns lead to wrong predictions.',
    practiceNote:
      'Engineers inspect weight updates and gradients to debug unstable training.',
    realLifeParagraph:
      'Image recognition models learn weights that detect edges, textures, and objects across layers.',
    learnMoreLinks: coreLinks,
  },
  Bias: {
    oneLineSummary: 'Bias adds an adjustable offset so a neuron can shift its decision boundary.',
    simpleExplanation:
      'Think of bias like moving a threshold knob left or right. It helps the model fit data more flexibly even when all inputs are zero. It matters because without bias, many models become too rigid.',
    practiceNote:
      'Bias terms are trained together with weights and can improve fit with little extra cost.',
    realLifeParagraph:
      'Speech and text models both rely on bias values to fine-tune decision boundaries.',
    learnMoreLinks: coreLinks,
  },
  Neuron: {
    oneLineSummary: 'A neuron is a small compute unit that combines inputs and applies an activation rule.',
    simpleExplanation:
      'A neuron is like a mini decision cell that asks, "How strong is this signal?" It multiplies inputs, sums them, and passes the result through an activation function. It matters because neural networks are built from these basic units.',
    practiceNote:
      'In deep learning, millions of neurons collaborate to learn complex patterns from raw data.',
    realLifeParagraph:
      'Neurons are the building blocks behind voice assistants, image tagging, and machine translation.',
    learnMoreLinks: coreLinks,
  },
  'Neural Network': {
    oneLineSummary: 'A neural network is a layered set of neurons that learns complex patterns.',
    simpleExplanation:
      'Think of a factory line where each station refines information before passing it on. A neural network does this with layers, transforming raw input into useful representations. It matters because it can model relationships that simpler methods miss.',
    practiceNote:
      'Teams select network depth and width based on data size, complexity, and latency targets.',
    realLifeParagraph:
      'OCR apps, language translation, and recommendation systems commonly use neural networks.',
    learnMoreLinks: coreLinks,
  },
  'Deep Learning': {
    oneLineSummary: 'Deep learning uses neural networks with many layers to learn rich representations.',
    simpleExplanation:
      'Imagine learning a concept in levels: letters, words, sentences, and meaning. Deep learning stacks many layers so each level learns a deeper abstraction from data. It matters because it powers state-of-the-art results in language, vision, and speech.',
    practiceNote:
      'Successful deep learning projects depend as much on data quality and evaluation as on architecture.',
    realLifeParagraph:
      'Chatbots, medical image analysis, and autonomous driving perception rely heavily on deep learning.',
    learnMoreLinks: coreLinks,
  },
  'Supervised Learning': {
    oneLineSummary: 'Supervised learning trains on labeled examples with known correct answers.',
    simpleExplanation:
      'This is like studying with an answer key. The model sees input-output pairs and learns to map input to the right label. It matters because it is highly effective when good labeled data is available.',
    practiceNote:
      'Teams spend major effort on label quality checks because noisy labels hurt model trust.',
    realLifeParagraph:
      'Email spam detection and defect classification on factory images are classic supervised tasks.',
    learnMoreLinks: coreLinks,
  },
  'Unsupervised Learning': {
    oneLineSummary: 'Unsupervised learning finds structure in data without labeled answers.',
    simpleExplanation:
      'Think of sorting a mixed box of photos by similarity without any tags. Unsupervised methods detect clusters or hidden patterns on their own. It matters when labeling is expensive or unavailable.',
    practiceNote:
      'Teams often use unsupervised methods for segmentation and anomaly discovery before supervised modeling.',
    realLifeParagraph:
      'Customer segmentation and topic discovery in support tickets often start with unsupervised learning.',
    learnMoreLinks: coreLinks,
  },
  'Reinforcement Learning': {
    oneLineSummary: 'Reinforcement learning teaches an agent by reward-driven trial and error.',
    simpleExplanation:
      'It is like training a game player by giving points for good moves. The agent acts, gets rewards or penalties, and learns a strategy that maximizes long-term reward. It matters for sequential decision problems.',
    practiceNote:
      'Production RL needs strong safety constraints because exploration can produce risky actions.',
    realLifeParagraph:
      'Game AI, ad bidding strategies, and robotics control often use reinforcement learning methods.',
    learnMoreLinks: coreLinks,
  },
  'Agent (AI)': {
    oneLineSummary: 'An AI agent is the part that observes, decides, and acts.',
    simpleExplanation:
      'Think of an agent as the player in a game. It receives the current situation, chooses an action, and learns from outcomes. It matters because all autonomous behavior flows through agent decisions.',
    practiceNote:
      'Teams define strict action boundaries so agents cannot perform unsafe operations.',
    realLifeParagraph:
      'Virtual assistants and automation bots are examples of agents interacting with tools and users.',
    learnMoreLinks: coreLinks,
  },
  Environment: {
    oneLineSummary: 'The environment is the world the agent interacts with.',
    simpleExplanation:
      'If the agent is the player, the environment is the game board. It provides observations, reacts to actions, and returns rewards. It matters because environment design controls what the agent can learn.',
    practiceNote:
      'Engineers often simulate environments first before deploying policies to real systems.',
    realLifeParagraph:
      'In robotics, the environment includes sensors, physical space, and constraints like safety zones.',
    learnMoreLinks: coreLinks,
  },
  Reward: {
    oneLineSummary: 'Reward is a feedback signal that tells an agent how good an action was.',
    simpleExplanation:
      'Reward is like points in a game scoreboard. Positive reward encourages behavior, while negative reward discourages it. It matters because poorly designed rewards can teach the wrong behavior.',
    practiceNote:
      'Teams iterate reward design carefully to avoid shortcuts that look good in metrics but fail in reality.',
    realLifeParagraph:
      'Recommendation systems may use reward signals like watch time, clicks, and long-term retention.',
    learnMoreLinks: coreLinks,
  },
  Overfitting: {
    oneLineSummary: 'Overfitting means the model memorizes training data and fails on new data.',
    simpleExplanation:
      'It is like a student who memorizes past exam answers but cannot solve new questions. The model appears great during training but performs poorly in real use. It matters because business impact depends on generalization, not training scores.',
    practiceNote:
      'Regularization, dropout, more data, and early stopping are common defenses against overfitting.',
    realLifeParagraph:
      'A fraud model that performs well in lab tests but misses new fraud patterns in production is overfitting.',
    learnMoreLinks: coreLinks,
  },
  Underfitting: {
    oneLineSummary: 'Underfitting means the model is too simple to capture real patterns.',
    simpleExplanation:
      'This is like trying to explain a complex movie plot with one sentence. The model performs poorly on training and test data because it lacks enough capacity. It matters because no amount of tuning can fix a model that is fundamentally too simple.',
    practiceNote:
      'Teams address underfitting by using richer features, bigger models, or longer training.',
    realLifeParagraph:
      'If a recommendation engine gives generic suggestions to everyone, it is often underfitting.',
    learnMoreLinks: coreLinks,
  },
  Generalization: {
    oneLineSummary: 'Generalization is a model’s ability to work well on unseen real-world data.',
    simpleExplanation:
      'A good learner can solve new problems, not just repeated examples. Generalization means your model transfers learning from training data to fresh cases. It matters because production traffic is always different from your training set.',
    practiceNote:
      'Teams monitor drift and retrain models to maintain generalization over time.',
    realLifeParagraph:
      'Search ranking models must generalize to new queries every day, not only historical query logs.',
    learnMoreLinks: coreLinks,
  },
  Benchmark: {
    oneLineSummary: 'A benchmark is a standard test used to compare models fairly.',
    simpleExplanation:
      'Think of a benchmark as the same exam for all students. It provides shared tasks and metrics so comparisons are meaningful. It matters because team decisions need objective evidence, not demo impressions.',
    practiceNote:
      'Good teams combine public benchmarks with private business-specific evaluations.',
    realLifeParagraph:
      'LLM providers often publish benchmark scores, but companies still run internal benchmarks before rollout.',
    learnMoreLinks: coreLinks,
  },
  Hyperparameter: {
    oneLineSummary: 'A hyperparameter is a training setting chosen before learning starts.',
    simpleExplanation:
      'Hyperparameters are like oven settings before baking. They include choices like learning rate, batch size, and number of epochs. It matters because these settings strongly affect model quality and training stability.',
    practiceNote:
      'Teams track hyperparameter experiments to avoid repeating failed configurations.',
    realLifeParagraph:
      'Model training platforms expose hyperparameters so data scientists can tune for better outcomes.',
    learnMoreLinks: coreLinks,
  },
  'Gradient Descent': {
    oneLineSummary: 'Gradient descent is an optimization method that reduces model error step by step.',
    simpleExplanation:
      'Imagine walking downhill in fog by always stepping in the steepest downward direction. Gradient descent computes how parameters should move to reduce loss. It matters because most modern model training depends on this process.',
    codeBlock: `import numpy as np  # We use numpy for simple math operations
x = np.array([1.0, 2.0, 3.0])  # These are sample input values
y = np.array([2.0, 4.0, 6.0])  # These are target outputs we want to match
w = 0.0  # This is our model weight, starting from zero
lr = 0.1  # This is the learning rate, or step size
for _ in range(20):  # We repeat updates for multiple training steps
    y_pred = w * x  # The model predicts output using current weight
    grad = (-2 * x * (y - y_pred)).mean()  # This computes gradient of loss
    w = w - lr * grad  # This moves weight in direction that lowers loss
print(round(w, 3))  # This shows the learned weight near 2.0`,
    codeOutro:
      'What you just saw: the model repeatedly checks error and nudges weight values until predictions get closer to the target.',
    realLifeParagraph:
      'The same core idea drives training in recommendation models, ranking systems, and neural networks behind chat apps.',
    learnMoreLinks: coreLinks,
  },
  Backpropagation: {
    oneLineSummary: 'Backpropagation sends prediction error backward through layers to update weights.',
    simpleExplanation:
      'Think of a teacher marking where each step in your math solution went wrong. Backpropagation traces output error back through each layer and computes needed corrections. It matters because deep networks cannot learn efficiently without it.',
    practiceNote:
      'Automatic differentiation frameworks handle backprop, but engineers still inspect gradients for exploding or vanishing behavior.',
    realLifeParagraph:
      'Large language models and vision models are trained with backpropagation at massive scale.',
    learnMoreLinks: coreLinks,
  },
  'Loss Function': {
    oneLineSummary: 'A loss function measures how wrong model predictions are.',
    simpleExplanation:
      'Loss is like a scoreboard for mistakes. Lower loss means predictions are closer to correct targets. It matters because training optimization is literally trying to minimize this value.',
    codeBlock: `import numpy as np  # We import numpy for array math
y_true = np.array([1.0, 0.0, 1.0])  # These are true labels
y_pred = np.array([0.8, 0.2, 0.4])  # These are model predictions
errors = y_true - y_pred  # This computes prediction errors
squared = errors ** 2  # This squares each error to remove negatives
mse = squared.mean()  # This averages errors into one loss value
print(round(mse, 4))  # This prints mean squared error`,
    codeOutro:
      'What you just saw: one number summarizes model error, so training can decide whether it is improving.',
    realLifeParagraph:
      'Teams track loss curves during training to detect instability, overfitting, or bad data issues early.',
    learnMoreLinks: coreLinks,
  },
  'Activation Function': {
    oneLineSummary: 'An activation function adds non-linearity so networks can learn complex patterns.',
    simpleExplanation:
      'Imagine a gate that decides how much signal can pass through. Activation functions apply that gate-like behavior at each neuron output. It matters because without non-linearity, deep networks collapse into simple linear behavior.',
    codeBlock: `import numpy as np  # We use numpy for simple vector math
x = np.array([-2.0, -0.5, 0.0, 1.2])  # These are raw neuron outputs
relu = np.maximum(0, x)  # ReLU keeps positives and drops negatives
sigmoid = 1 / (1 + np.exp(-x))  # Sigmoid maps values between 0 and 1
print('ReLU:', relu)  # This prints ReLU-transformed values
print('Sigmoid:', np.round(sigmoid, 3))  # This prints sigmoid outputs`,
    codeOutro:
      'What you just saw: different activation choices shape how signals flow and what patterns the model can represent.',
    realLifeParagraph:
      'Activation functions are core to neural networks in speech assistants, image classifiers, and text generators.',
    learnMoreLinks: coreLinks,
  },
  Epoch: {
    oneLineSummary: 'An epoch is one full pass through the training dataset.',
    simpleExplanation:
      'If your dataset is a textbook, one epoch means reading the whole book once. Models usually need many epochs to learn stable patterns. It matters because too few can underfit and too many can overfit.',
    practiceNote:
      'Teams use validation curves and early stopping to choose a healthy epoch count.',
    realLifeParagraph:
      'Training dashboards commonly show model performance by epoch to help decide when to stop.',
    learnMoreLinks: coreLinks,
  },
  Batch: {
    oneLineSummary: 'A batch is a small group of samples processed together in one training step.',
    simpleExplanation:
      'Instead of learning from all data at once, the model learns from mini packets. Each batch gives one gradient update and keeps memory use manageable. It matters because batch behavior affects speed and stability.',
    practiceNote:
      'Engineers adjust batching strategy based on GPU memory and training throughput targets.',
    realLifeParagraph:
      'Large-scale training jobs process millions of samples as batches across distributed workers.',
    learnMoreLinks: coreLinks,
  },
  'Batch Size': {
    oneLineSummary: 'Batch size is the number of samples inside each training batch.',
    simpleExplanation:
      'Batch size is like class size in a lesson. Small batches learn noisily but can generalize better, while large batches are efficient but may need tuning. It matters because it impacts memory use, convergence, and wall-clock time.',
    practiceNote:
      'Teams often increase batch size gradually as infrastructure and optimization settings mature.',
    realLifeParagraph:
      'Production ML teams tune batch size carefully to balance cloud costs with training speed.',
    learnMoreLinks: coreLinks,
  },
  'Learning Rate': {
    oneLineSummary: 'Learning rate controls how large each optimization step is.',
    simpleExplanation:
      'Think of this as stride length while walking downhill. Too large can overshoot the best solution, and too small can make training painfully slow. It matters because it is one of the most sensitive hyperparameters.',
    practiceNote:
      'Schedulers are commonly used to start higher and reduce learning rate as training progresses.',
    realLifeParagraph:
      'Model training failures in real projects are often fixed first by adjusting learning rate strategy.',
    learnMoreLinks: coreLinks,
  },
  Optimizer: {
    oneLineSummary: 'An optimizer defines how parameters are updated during training.',
    simpleExplanation:
      'If gradients show direction, the optimizer decides the exact move. Different optimizers like SGD and Adam trade off speed, stability, and memory. It matters because the right optimizer can make training far more reliable.',
    practiceNote:
      'Teams often start with Adam for quick progress, then benchmark alternatives for final quality.',
    realLifeParagraph:
      'From recommendation engines to language models, optimizer choice influences training success.',
    learnMoreLinks: coreLinks,
  },
  Regularization: {
    oneLineSummary: 'Regularization reduces overfitting by constraining model complexity.',
    simpleExplanation:
      'Think of regularization as guardrails that stop the model from memorizing noise. Methods like L1, L2, and dropout push models toward simpler, more robust behavior. It matters because generalization is the real goal.',
    practiceNote:
      'Regularization strength is tuned against validation performance, not training score alone.',
    realLifeParagraph:
      'Credit risk and medical models rely on regularization to stay stable across changing data.',
    learnMoreLinks: coreLinks,
  },
  Dropout: {
    oneLineSummary: 'Dropout randomly disables neurons during training to improve robustness.',
    simpleExplanation:
      'It is like practicing with some team members temporarily absent so everyone learns flexibility. Dropout forces the network to avoid depending on one narrow path. It matters because this reduces overfitting in many deep networks.',
    practiceNote:
      'Dropout is applied during training and turned off during inference.',
    realLifeParagraph:
      'Deep models in text and vision pipelines often use dropout as part of regularization strategy.',
    learnMoreLinks: coreLinks,
  },
  CNN: {
    oneLineSummary: 'CNNs are neural networks specialized for image-like grid data.',
    simpleExplanation:
      'A CNN scans small windows across an image to detect local patterns like edges and textures. Deeper layers combine these patterns into object-level understanding. It matters because CNNs are efficient and strong for visual tasks.',
    practiceNote:
      'Transfer learning with pre-trained CNN backbones is common when labeled image data is limited.',
    realLifeParagraph:
      'Face recognition, defect detection, and medical imaging diagnostics frequently use CNN architectures.',
    learnMoreLinks: coreLinks,
  },
  RNN: {
    oneLineSummary: 'RNNs process sequence data by carrying memory across time steps.',
    simpleExplanation:
      'Think of reading a sentence word by word while remembering what came before. RNNs keep a hidden state that captures past context. It matters for ordered data like text, logs, and time-series.',
    practiceNote:
      'Modern systems often use transformers, but RNN ideas are still foundational for sequence learning.',
    realLifeParagraph:
      'Earlier generation translation and speech systems widely used RNN-based architectures.',
    learnMoreLinks: coreLinks,
  },
  'Transfer Learning': {
    oneLineSummary: 'Transfer learning reuses a pre-trained model and adapts it for a new task.',
    simpleExplanation:
      'It is like hiring someone already experienced and then teaching your company specifics. You start from learned general knowledge and fine-tune on smaller task data. It matters because it saves time, compute, and labeled data.',
    practiceNote:
      'Teams freeze some layers first, then unfreeze gradually if domain shift is large.',
    realLifeParagraph:
      'Custom support classifiers and niche document models are often built with transfer learning.',
    learnMoreLinks: coreLinks,
  },
  'Evaluation Metric': {
    oneLineSummary: 'An evaluation metric is the score used to judge model performance.',
    simpleExplanation:
      'Metrics are like report-card criteria for model quality. Different tasks need different metrics, such as accuracy for balanced classes or recall for high-risk detection. It matters because the wrong metric can optimize the wrong business outcome.',
    practiceNote:
      'Mature teams align metrics with product impact and monitor them after deployment.',
    realLifeParagraph:
      'Fraud detection teams may prioritize recall, while ad ranking teams may optimize precision and revenue lift.',
    learnMoreLinks: coreLinks,
  },
};
