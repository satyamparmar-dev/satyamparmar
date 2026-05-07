import type { GlossaryTermContent } from './glossary-ai-content';

const deepLinks = [
  {
    label: 'Hugging Face NLP Course',
    url: 'https://huggingface.co/learn/nlp-course',
  },
  {
    label: 'Google ML Crash Course',
    url: 'https://developers.google.com/machine-learning/crash-course',
  },
];

export const deepLearningGlossaryContent: Record<string, GlossaryTermContent> = {
  Layer: {
    oneLineSummary: 'A layer is one processing stage in a neural network.',
    simpleExplanation:
      'Think of a layer like one filter step in a factory line. Each layer transforms input a little, then passes it to the next stage. This matters because stacked layers let models learn complex patterns.',
    practiceNote:
      'Teams tune number and type of layers based on task complexity and latency budget.',
    realLifeParagraph:
      'Image and language models use many layers to gradually build meaning from raw input.',
    learnMoreLinks: deepLinks,
  },
  'Hidden Layer': {
    oneLineSummary: 'A hidden layer is an internal layer between input and output.',
    simpleExplanation:
      'Hidden layers are where real feature learning happens. They convert raw signals into richer intermediate representations. This matters because model intelligence emerges from these internal transformations.',
    practiceNote:
      'Too many hidden layers can overfit without enough data or regularization.',
    realLifeParagraph:
      'Speech recognition models rely on hidden layers to convert audio frames into language-ready features.',
    learnMoreLinks: deepLinks,
  },
  'Input Layer': {
    oneLineSummary: 'The input layer is where raw features enter the network.',
    simpleExplanation:
      'Input layer is the model’s front door. It receives values like pixels, token IDs, or sensor readings. This matters because wrong input formatting breaks everything downstream.',
    practiceNote:
      'Production systems enforce input schema validation before inference.',
    realLifeParagraph:
      'OCR tools pass image pixels through input layers before text extraction.',
    learnMoreLinks: deepLinks,
  },
  'Output Layer': {
    oneLineSummary: 'The output layer produces the final prediction.',
    simpleExplanation:
      'Output layer is the model’s final answer stage. It maps internal learned features to task outputs like classes, probabilities, or generated tokens. This matters because output design must match business goals.',
    practiceNote:
      'Output activation and loss must be aligned, such as softmax with multi-class classification.',
    realLifeParagraph:
      'Fraud models output risk probabilities, while language models output next-token distributions.',
    learnMoreLinks: deepLinks,
  },
  Perceptron: {
    oneLineSummary: 'A perceptron is the simplest single-neuron linear classifier.',
    simpleExplanation:
      'Think of perceptron as one decision gate. It combines inputs and decides a class using a threshold. This matters because it is the historical building block of deeper networks.',
    codeBlock: `import numpy as np  # We import numpy for simple math
x = np.array([1.0, 2.0])  # These are two input features
w = np.array([0.4, 0.6])  # These are learned weights
b = -0.5  # This is the bias term
score = np.dot(x, w) + b  # This computes linear score
pred = 1 if score > 0 else 0  # This applies a threshold to classify
print(pred)  # This prints the final class`,
    codeOutro:
      'What you just saw: one neuron turns weighted input into a yes/no decision.',
    realLifeParagraph:
      'Perceptron concepts still appear in modern network neurons at massive scale.',
    learnMoreLinks: deepLinks,
  },
  MLP: {
    oneLineSummary: 'MLP is a multilayer perceptron with fully connected layers.',
    simpleExplanation:
      'An MLP is like stacking many perceptrons into a deeper decision system. Each layer refines the signal before final output. This matters because MLPs are a common baseline for tabular and small feature tasks.',
    practiceNote:
      'Regularization and normalization are important for stable MLP training.',
    realLifeParagraph:
      'Credit scoring and churn prediction pipelines often benchmark against MLP models.',
    learnMoreLinks: deepLinks,
  },
  'Weight Initialization': {
    oneLineSummary: 'Weight initialization sets starting parameter values before training.',
    simpleExplanation:
      'Starting weights are like initial balance points before learning begins. Good initialization helps gradients flow and speeds convergence. This matters because bad starts can stall learning.',
    practiceNote:
      'Xavier and He initialization are common defaults for deep networks.',
    realLifeParagraph:
      'Large training runs can fail early if initialization is poorly chosen.',
    learnMoreLinks: deepLinks,
  },
  'Batch Normalization': {
    oneLineSummary: 'Batch normalization normalizes layer activations during training.',
    simpleExplanation:
      'Think of batch norm as keeping signal levels in a healthy range. It stabilizes training and often allows faster learning rates. This matters because deep models can otherwise train slowly or unstably.',
    practiceNote:
      'Teams carefully handle train vs eval mode because batch norm behavior differs.',
    realLifeParagraph:
      'Vision models in production frequently use batch normalization blocks.',
    learnMoreLinks: deepLinks,
  },
  'Skip Connection': {
    oneLineSummary: 'A skip connection adds shortcut paths across layers.',
    simpleExplanation:
      'A skip connection is like using an express lane in traffic. It lets information and gradients bypass some layers directly. This matters because it helps very deep networks train without degrading.',
    practiceNote:
      'Residual shortcuts are essential when depth increases substantially.',
    realLifeParagraph:
      'Modern image classifiers and many transformer variants use skip-style residual links.',
    learnMoreLinks: deepLinks,
  },
  ResNet: {
    oneLineSummary: 'ResNet is a deep architecture built around residual skip connections.',
    simpleExplanation:
      'ResNet solves the problem of deep networks getting harder to train. It learns residual corrections instead of full transformations at every block. This matters because it enabled much deeper vision models.',
    practiceNote:
      'Pretrained ResNet backbones are widely reused through transfer learning.',
    realLifeParagraph:
      'Manufacturing defect detection and medical imaging systems still use ResNet families.',
    learnMoreLinks: deepLinks,
  },
  Autoencoder: {
    oneLineSummary: 'An autoencoder compresses input and then reconstructs it.',
    simpleExplanation:
      'Think of autoencoder as zip and unzip for data. The encoder makes a compact code, and the decoder rebuilds the original input. This matters for compression, denoising, and representation learning.',
    practiceNote:
      'Reconstruction error can be used for anomaly detection in production.',
    realLifeParagraph:
      'Autoencoders are used in fault detection where normal patterns are reconstructed well.',
    learnMoreLinks: deepLinks,
  },
  'Latent Space': {
    oneLineSummary: 'Latent space is the compact hidden representation learned by a model.',
    simpleExplanation:
      'Latent space is like a compressed map of meaning. Similar items end up close together in this internal space. This matters because it powers clustering, generation, and semantic retrieval.',
    practiceNote:
      'Teams inspect latent vectors for drift and representation collapse.',
    realLifeParagraph:
      'Image search and recommendation systems often compare items in latent space.',
    learnMoreLinks: deepLinks,
  },
  Encoder: {
    oneLineSummary: 'An encoder converts raw input into useful hidden representations.',
    simpleExplanation:
      'Encoder acts like a translator from raw data to machine-friendly features. It captures structure and context in vector form. This matters because downstream modules depend on encoder quality.',
    practiceNote:
      'Encoders are often pretrained and reused across multiple tasks.',
    realLifeParagraph:
      'Search, classification, and retrieval systems heavily rely on encoder components.',
    learnMoreLinks: deepLinks,
  },
  Decoder: {
    oneLineSummary: 'A decoder turns hidden representations into output sequences or values.',
    simpleExplanation:
      'If encoder is understanding, decoder is expression. It reads compressed context and generates final outputs such as text tokens. This matters in translation, summarization, and generative tasks.',
    practiceNote:
      'Decoding strategy (greedy, sampling, beam) changes output quality and style.',
    realLifeParagraph:
      'Chat assistants use decoder stacks to generate fluent responses token by token.',
    learnMoreLinks: deepLinks,
  },
  GAN: {
    oneLineSummary: 'GAN uses two networks competing to generate realistic data.',
    simpleExplanation:
      'GAN has a generator and a discriminator in a game. Generator creates samples, discriminator tries to spot fakes, and both improve over time. This matters for realistic synthetic content generation.',
    practiceNote:
      'GAN training can be unstable and requires careful balancing.',
    realLifeParagraph:
      'GANs have been used for image synthesis, style transfer, and data augmentation.',
    learnMoreLinks: deepLinks,
  },
  'Diffusion Model': {
    oneLineSummary: 'A diffusion model learns to remove noise step-by-step to generate data.',
    simpleExplanation:
      'Imagine sculpting by gradually cleaning static noise into a clear picture. Diffusion models reverse a noising process to create realistic outputs. This matters because they produce high-quality generative results.',
    practiceNote:
      'Inference can be slow, so teams use distillation or fewer denoising steps.',
    realLifeParagraph:
      'Many modern text-to-image systems are built on diffusion techniques.',
    learnMoreLinks: deepLinks,
  },
  VAE: {
    oneLineSummary: 'VAE is a probabilistic autoencoder for smooth latent generation.',
    simpleExplanation:
      'A VAE learns not one fixed code, but a probability distribution in latent space. This allows sampling new points and generating varied outputs. This matters for controllable and smooth generative behavior.',
    practiceNote:
      'VAEs balance reconstruction quality with latent regularization via KL divergence.',
    realLifeParagraph:
      'VAEs are used in representation learning and anomaly detection workflows.',
    learnMoreLinks: deepLinks,
  },
  'Attention Mechanism': {
    oneLineSummary: 'Attention helps models focus on the most relevant parts of input.',
    simpleExplanation:
      'Attention is like highlighting important words in a paragraph while answering a question. It assigns dynamic importance scores to input elements. This matters because it improves context understanding in sequences.',
    practiceNote:
      'Attention weights are useful for diagnostics, though not perfect explanations.',
    realLifeParagraph:
      'Translation and summarization quality improved significantly with attention-based models.',
    learnMoreLinks: deepLinks,
  },
  'Self-Attention': {
    oneLineSummary: 'Self-attention lets tokens attend to other tokens in the same sequence.',
    simpleExplanation:
      'Each token asks, "Which other tokens should I pay attention to?" This builds context-aware representations for every position. This matters because it captures long-range dependencies better than older sequence models.',
    codeBlock: `import numpy as np  # We import numpy for matrix math
X = np.array([[1.0, 0.0], [0.0, 1.0]])  # These are token vectors
scores = X @ X.T  # This computes similarity scores between tokens
weights = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)  # This normalizes to attention weights
context = weights @ X  # This creates context-aware token vectors
print(np.round(context, 2))  # This prints updated representations`,
    codeOutro:
      'What you just saw: each token mixed information from other tokens based on similarity.',
    realLifeParagraph:
      'Self-attention is a core mechanism inside modern LLMs like GPT-style architectures.',
    learnMoreLinks: deepLinks,
  },
  'Multi-Head Attention': {
    oneLineSummary: 'Multi-head attention runs several attention views in parallel.',
    simpleExplanation:
      'Think of multiple readers each focusing on different sentence relationships. Each head learns a distinct pattern, and outputs are combined. This matters because one attention view is often too limited.',
    practiceNote:
      'Head count and dimension are tuned for quality, memory, and latency tradeoffs.',
    realLifeParagraph:
      'Transformer models in search and chat use multi-head attention throughout their stacks.',
    learnMoreLinks: deepLinks,
  },
  'Positional Encoding': {
    oneLineSummary: 'Positional encoding gives transformers information about token order.',
    simpleExplanation:
      'Transformers read all tokens together, so they need extra signals for order. Positional encoding adds this order information to token embeddings. This matters because meaning changes with word sequence.',
    codeBlock: `import numpy as np  # We import numpy to build sinusoidal positions
seq_len, dim = 4, 6  # These define token count and embedding size
pos = np.arange(seq_len)[:, None]  # This creates position indexes
i = np.arange(dim)[None, :]  # This creates dimension indexes
angles = pos / np.power(10000, (2 * (i // 2)) / dim)  # This computes angle rates
pe = np.where(i % 2 == 0, np.sin(angles), np.cos(angles))  # This applies sin/cos encoding
print(np.round(pe, 3))  # This prints positional encoding matrix`,
    codeOutro:
      'What you just saw: numeric patterns encode position so token order is preserved.',
    realLifeParagraph:
      'All transformer-based text systems rely on positional signals to understand sentence structure.',
    learnMoreLinks: deepLinks,
  },
};
