# Core concepts

## What is an LLM?

A **large language model** predicts the next token (word fragment) given prior context. At inference time it samples from a distribution over tokens, which produces fluent text. It does not "look things up" in a database unless you connect tools or retrieval.

## Tokens and context windows

- Text is split into **tokens** (not always whole words). Pricing and limits are often token-based.
- The **context window** is how much input the model can attend to at once. Long prompts, retrieved documents, and chat history all consume context.

## Training vs inference

| Phase | What happens |
| --- | --- |
| Pre-training | Next-token prediction on large text; learns language and broad knowledge |
| Alignment (RLHF, DPO, etc.) | Shapes behavior to be helpful, safe, and follow instructions |
| Inference | Your prompt runs through the model; weights are usually fixed |

## Hallucinations

Models can generate plausible but false statements. Mitigations include **grounding** (cite sources), **RAG**, **tool use**, **evals**, and **human review** for high-stakes outputs.

## Why this matters for Java engineers

You will integrate LLMs behind APIs, handle streaming, manage prompts, wire **RAG** to your data stores, and observe latency and cost. Interviewers often ask how you would design a safe, observable GenAI feature in a Spring Boot or microservices stack.
