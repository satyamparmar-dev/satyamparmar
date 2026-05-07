import type { GlossaryTermContent } from './glossary-ai-content';

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

export const mlGlossaryContent: Record<string, GlossaryTermContent> = {
  Feature: {
    oneLineSummary: 'A feature is an input clue the model uses to make a prediction.',
    simpleExplanation:
      'Think of features like signals a doctor checks before diagnosis. In ML, features are measurable inputs such as age, clicks, or purchase count. This matters because better features usually produce better models.',
    practiceNote:
      'Teams spend large effort selecting clean, useful features before trying complex models.',
    realLifeParagraph:
      'Netflix recommendations use features like watch history, device type, and time of day.',
    learnMoreLinks: coreLinks,
  },
  Label: {
    oneLineSummary: 'A label is the correct answer the model is trying to learn.',
    simpleExplanation:
      'A label is like the answer key in practice tests. The model compares its guess to this known value during training. This matters because poor labels create poor learning.',
    practiceNote:
      'Teams run label audits and quality checks before model training begins.',
    realLifeParagraph:
      'Spam filters use labels like spam or not-spam to learn email classification.',
    learnMoreLinks: coreLinks,
  },
  Dataset: {
    oneLineSummary: 'A dataset is the full collection of records used in ML work.',
    simpleExplanation:
      'Think of a dataset as your full study book. It contains rows of examples and columns of features, and often includes labels. This matters because data quality limits model quality.',
    practiceNote:
      'Production teams version datasets so training results can be reproduced later.',
    realLifeParagraph:
      'E-commerce datasets include product views, cart actions, and order outcomes.',
    learnMoreLinks: coreLinks,
  },
  'Training Set': {
    oneLineSummary: 'The training set is the data split used to teach the model.',
    simpleExplanation:
      'This is the part of data the model studies directly. It learns parameter values from this split by minimizing error. This matters because training examples shape what the model can learn.',
    practiceNote:
      'Teams ensure the training set is representative of real production traffic.',
    realLifeParagraph:
      'A fraud model trains on past transactions marked as fraud or genuine.',
    learnMoreLinks: coreLinks,
  },
  'Validation Set': {
    oneLineSummary: 'The validation set is used to tune settings during development.',
    simpleExplanation:
      'Think of validation as mock tests while preparing for finals. You do not train on it; you use it to choose hyperparameters and compare model versions. This matters because it prevents overfitting to training data.',
    practiceNote:
      'Early stopping decisions are usually made with validation metrics.',
    realLifeParagraph:
      'Recommendation teams use validation performance to choose model depth and learning rate.',
    learnMoreLinks: coreLinks,
  },
  'Test Set': {
    oneLineSummary: 'The test set is a final untouched split for honest evaluation.',
    simpleExplanation:
      'The test set is like the final exam. You only use it after model decisions are complete. This matters because it gives the best estimate of real-world performance.',
    practiceNote:
      'Mature teams lock the test set and avoid repeated peeking.',
    realLifeParagraph:
      'Before launch, teams report test scores to product and risk stakeholders.',
    learnMoreLinks: coreLinks,
  },
  'Data Preprocessing': {
    oneLineSummary: 'Data preprocessing cleans and formats raw data for modeling.',
    simpleExplanation:
      'Raw data is often messy, like notes from many different people. Preprocessing fixes missing values, types, and inconsistencies before training. This matters because models fail on dirty inputs.',
    practiceNote:
      'Teams productionize preprocessing to keep training and inference logic identical.',
    realLifeParagraph:
      'Customer-support text pipelines remove noise and normalize fields before classification.',
    learnMoreLinks: coreLinks,
  },
  'Feature Engineering': {
    oneLineSummary: 'Feature engineering creates better inputs from raw fields.',
    simpleExplanation:
      'It is like turning raw ingredients into a useful meal base. You combine or transform raw columns into signals that capture business patterns. This matters because smart features can beat bigger models.',
    practiceNote:
      'Teams create feature stores to reuse engineered features across projects.',
    realLifeParagraph:
      'In churn models, recency-frequency-monetary style features are commonly engineered.',
    learnMoreLinks: coreLinks,
  },
  'Feature Scaling': {
    oneLineSummary: 'Feature scaling adjusts numeric ranges so features are comparable.',
    simpleExplanation:
      'Imagine one feature is in rupees and another is in percentages. Without scaling, large-range features can dominate learning unfairly. This matters for stable optimization.',
    practiceNote:
      'Distance-based models and gradient methods often require scaling to work well.',
    realLifeParagraph:
      'Credit scoring systems scale financial features before training logistic models.',
    learnMoreLinks: coreLinks,
  },
  Normalization: {
    oneLineSummary: 'Normalization rescales values to a fixed range, often 0 to 1.',
    simpleExplanation:
      'Normalization is like converting different units to the same ruler. It compresses values into a bounded range, which helps many algorithms. This matters for numerical stability and fair feature influence.',
    practiceNote:
      'Teams fit normalization on training data and reuse the same parameters in inference.',
    realLifeParagraph:
      'Image pipelines normalize pixel values before feeding them into models.',
    learnMoreLinks: coreLinks,
  },
  Standardization: {
    oneLineSummary: 'Standardization rescales data to mean 0 and standard deviation 1.',
    simpleExplanation:
      'Think of this as centering and resizing data around normal units. It helps optimization by making features similarly distributed. This matters when models assume roughly standardized inputs.',
    practiceNote:
      'Train-time mean and std are stored and applied consistently at inference.',
    realLifeParagraph:
      'SVM and linear models are often much better after standardization.',
    learnMoreLinks: coreLinks,
  },
  'One-Hot Encoding': {
    oneLineSummary: 'One-hot encoding converts categories into binary indicator columns.',
    simpleExplanation:
      'A model cannot directly read text categories like city names. One-hot encoding creates one column per category and marks the active one as 1. This matters for using categorical variables in many algorithms.',
    codeBlock: `import pandas as pd  # We use pandas for simple table operations
df = pd.DataFrame({'city': ['Delhi', 'Mumbai', 'Delhi']})  # This is sample category data
encoded = pd.get_dummies(df, columns=['city'])  # This converts categories to binary columns
print(encoded)  # This shows one-hot encoded output`,
    codeOutro:
      'What you just saw: one text column became multiple yes/no columns a model can read.',
    realLifeParagraph:
      'Retail models one-hot encode store type, payment mode, and region categories.',
    learnMoreLinks: coreLinks,
  },
  Regression: {
    oneLineSummary: 'Regression predicts continuous numeric values.',
    simpleExplanation:
      'Regression is like estimating house price, not choosing a category. It learns relationships to output numbers such as sales, demand, or delivery time. This matters when business targets are numeric.',
    practiceNote:
      'Teams choose loss and metrics carefully because outliers can distort regression training.',
    realLifeParagraph:
      'Forecasting monthly revenue or delivery ETA are common regression tasks.',
    learnMoreLinks: coreLinks,
  },
  Classification: {
    oneLineSummary: 'Classification predicts one class label from predefined options.',
    simpleExplanation:
      'This is like sorting mail into bins: urgent, normal, or spam. The model learns boundaries between classes from labeled examples. This matters for decision workflows.',
    practiceNote:
      'Class imbalance handling is often necessary in real-world classification datasets.',
    realLifeParagraph:
      'Fraud detection, medical diagnosis support, and sentiment detection are classification problems.',
    learnMoreLinks: coreLinks,
  },
  Clustering: {
    oneLineSummary: 'Clustering groups similar items without using labels.',
    simpleExplanation:
      'Imagine grouping songs by style without genre tags. Clustering finds natural groups from feature similarity. This matters for exploration and segmentation.',
    practiceNote:
      'Teams validate cluster usefulness with business interpretation, not just math scores.',
    realLifeParagraph:
      'Marketing teams cluster customers into behavioral segments for personalized campaigns.',
    learnMoreLinks: coreLinks,
  },
  'Dimensionality Reduction': {
    oneLineSummary: 'Dimensionality reduction compresses features while keeping key information.',
    simpleExplanation:
      'Think of it as summarizing a long book into a short but useful version. It reduces many features into fewer components to simplify learning or visualization. This matters for speed and noise reduction.',
    practiceNote:
      'Teams use dimensionality reduction before clustering or visualization dashboards.',
    realLifeParagraph:
      'High-dimensional text and sensor datasets often use reduction techniques for analysis.',
    learnMoreLinks: coreLinks,
  },
  'Linear Regression': {
    oneLineSummary: 'Linear regression fits a straight-line relationship for numeric prediction.',
    simpleExplanation:
      'It is the simplest regression baseline. The model combines inputs with weights to predict a number. This matters because it is fast, interpretable, and a good first benchmark.',
    codeBlock: `from sklearn.linear_model import LinearRegression  # We import a basic regression model
X = [[1], [2], [3], [4]]  # These are input feature values
y = [2, 4, 6, 8]  # These are target values
model = LinearRegression()  # We create the model object
model.fit(X, y)  # We train the model on examples
pred = model.predict([[5]])  # We predict output for a new input
print(round(pred[0], 2))  # This prints predicted value near 10`,
    codeOutro:
      'What you just saw: a straight-line model learned a simple numeric pattern from examples.',
    realLifeParagraph:
      'Teams use linear regression for pricing baselines and quick business forecasts.',
    learnMoreLinks: coreLinks,
  },
  'Logistic Regression': {
    oneLineSummary: 'Logistic regression predicts class probability, often for binary classification.',
    simpleExplanation:
      'Despite its name, this is a classification model. It outputs a probability between 0 and 1 and then applies a threshold for class decision. This matters because it is stable and interpretable.',
    practiceNote:
      'Threshold tuning is key when false positives and false negatives have different costs.',
    realLifeParagraph:
      'Credit default and churn prediction often start with logistic regression baselines.',
    learnMoreLinks: coreLinks,
  },
  'Decision Tree': {
    oneLineSummary: 'A decision tree makes predictions through yes/no split rules.',
    simpleExplanation:
      'Think of it like a flowchart questionnaire. At each node, the model asks one condition and routes to the next branch. This matters because it is easy to explain to non-technical teams.',
    practiceNote:
      'Depth limits and pruning prevent trees from memorizing noisy data.',
    realLifeParagraph:
      'Loan approval and operational triage systems often use tree-based logic.',
    learnMoreLinks: coreLinks,
  },
  'Random Forest': {
    oneLineSummary: 'Random forest combines many decision trees and averages their outputs.',
    simpleExplanation:
      'Instead of trusting one tree, random forest takes a committee vote. Multiple trees reduce variance and improve robustness. This matters because it performs well with minimal tuning.',
    practiceNote:
      'Feature importance from random forests helps teams understand key drivers quickly.',
    realLifeParagraph:
      'Insurance risk and tabular business prediction tasks frequently use random forests.',
    learnMoreLinks: coreLinks,
  },
  SVM: {
    oneLineSummary: 'SVM finds a boundary that best separates classes.',
    simpleExplanation:
      'Imagine drawing a line that leaves the widest safe gap between two groups. SVM chooses a separating boundary with maximum margin. This matters for strong classification on medium-sized datasets.',
    practiceNote:
      'Kernel choice is important when class boundaries are non-linear.',
    realLifeParagraph:
      'Text classification and bioinformatics tasks have historically used SVMs effectively.',
    learnMoreLinks: coreLinks,
  },
  KNN: {
    oneLineSummary: 'KNN predicts using the labels of nearest known examples.',
    simpleExplanation:
      'KNN is like asking your closest neighbors how to decide. It finds the nearest data points and uses majority vote or average. This matters as a simple, intuitive baseline.',
    practiceNote:
      'KNN requires feature scaling and efficient indexing for large datasets.',
    realLifeParagraph:
      'Basic recommendation and pattern matching tools often start with KNN logic.',
    learnMoreLinks: coreLinks,
  },
  'K-Means': {
    oneLineSummary: 'K-Means clustering groups points around K learned centers.',
    simpleExplanation:
      'Think of placing K magnets and assigning each point to the closest magnet. The centers move repeatedly until clusters stabilize. This matters for unsupervised segmentation.',
    codeBlock: `from sklearn.cluster import KMeans  # We import K-Means clustering
X = [[1, 1], [1.2, 0.8], [4, 4], [4.2, 3.9]]  # These are sample data points
model = KMeans(n_clusters=2, random_state=0, n_init='auto')  # We request 2 clusters
labels = model.fit_predict(X)  # We train and get cluster IDs
print(labels)  # This prints cluster assignment for each point`,
    codeOutro:
      'What you just saw: similar points were grouped together without any labels.',
    realLifeParagraph:
      'Retail teams use K-Means for customer segmentation and campaign targeting.',
    learnMoreLinks: coreLinks,
  },
  PCA: {
    oneLineSummary: 'PCA reduces dimensions by projecting data to principal components.',
    simpleExplanation:
      'PCA finds new axes that capture the most variation in data. It keeps important structure while using fewer dimensions. This matters for faster models and cleaner visualization.',
    practiceNote:
      'Teams inspect explained variance to decide how many PCA components to keep.',
    realLifeParagraph:
      'Fraud analytics and gene-expression analysis often use PCA before downstream modeling.',
    learnMoreLinks: coreLinks,
  },
  'Cross-Validation': {
    oneLineSummary: 'Cross-validation rotates data splits to estimate performance reliably.',
    simpleExplanation:
      'Instead of one train-test split, cross-validation repeats evaluation across several folds. This gives a more stable score estimate. This matters when datasets are limited.',
    practiceNote:
      'Model selection workflows often rank candidates by average cross-validation score.',
    realLifeParagraph:
      'Data science teams use cross-validation to avoid over-optimistic one-split results.',
    learnMoreLinks: coreLinks,
  },
  Accuracy: {
    oneLineSummary: 'Accuracy is the percentage of correct predictions overall.',
    simpleExplanation:
      'Accuracy is easy to understand: how many answers were right out of all answers. It works well for balanced classes. This matters because it can be misleading for rare-event problems.',
    practiceNote:
      'Teams pair accuracy with precision and recall on imbalanced datasets.',
    realLifeParagraph:
      'For balanced document classification tasks, accuracy is often a primary dashboard metric.',
    learnMoreLinks: coreLinks,
  },
  Precision: {
    oneLineSummary: 'Precision tells how many predicted positives were actually positive.',
    simpleExplanation:
      'Precision answers: "When we say yes, how often are we right?" It is important when false alarms are costly. This matters in workflows where trust in positive alerts is critical.',
    practiceNote:
      'Threshold tuning is used to increase precision when alert fatigue is high.',
    realLifeParagraph:
      'Security alert systems often optimize precision to reduce unnecessary investigations.',
    learnMoreLinks: coreLinks,
  },
  Recall: {
    oneLineSummary: 'Recall tells how many true positives the model successfully found.',
    simpleExplanation:
      'Recall answers: "Out of all real positives, how many did we catch?" It is important when missing a true case is costly. This matters in safety-critical detection tasks.',
    practiceNote:
      'Teams often prioritize recall in fraud, abuse, and medical screening pipelines.',
    realLifeParagraph:
      'Fraud systems target high recall so dangerous cases are not missed.',
    learnMoreLinks: coreLinks,
  },
  'F1 Score': {
    oneLineSummary: 'F1 score balances precision and recall in one number.',
    simpleExplanation:
      'F1 is useful when you need both fewer false alarms and fewer misses. It combines precision and recall using harmonic mean. This matters for imbalanced binary tasks.',
    practiceNote:
      'Teams use F1 for model ranking when both error types hurt business outcomes.',
    realLifeParagraph:
      'Moderation classifiers often report F1 to balance user safety and false blocks.',
    learnMoreLinks: coreLinks,
  },
  'AUC-ROC': {
    oneLineSummary: 'AUC-ROC measures ranking quality across all classification thresholds.',
    simpleExplanation:
      'AUC checks how well the model ranks positives above negatives overall. It is threshold-independent and helpful during early model comparison. This matters for robust evaluation.',
    practiceNote:
      'Teams use AUC alongside business-threshold metrics for deployment decisions.',
    realLifeParagraph:
      'Credit scoring systems commonly monitor AUC while selecting candidate models.',
    learnMoreLinks: coreLinks,
  },
  'Confusion Matrix': {
    oneLineSummary: 'A confusion matrix shows true and false predictions by class outcome.',
    simpleExplanation:
      'Think of it as an error map. It breaks predictions into true positives, false positives, true negatives, and false negatives. This matters because it shows exactly where a model fails.',
    codeBlock: `from sklearn.metrics import confusion_matrix  # We import confusion matrix utility
y_true = [1, 0, 1, 0]  # These are actual labels
y_pred = [1, 1, 0, 0]  # These are model predictions
cm = confusion_matrix(y_true, y_pred)  # This builds the confusion matrix
print(cm)  # This prints TN, FP, FN, TP counts`,
    codeOutro:
      'What you just saw: one table that clearly shows both kinds of classification mistakes.',
    realLifeParagraph:
      'Operational teams review confusion matrices to decide threshold and policy adjustments.',
    learnMoreLinks: coreLinks,
  },
  'Bias-Variance Tradeoff': {
    oneLineSummary: 'The bias-variance tradeoff balances underfitting and overfitting.',
    simpleExplanation:
      'High bias means too simple, and high variance means too sensitive to noise. Good modeling finds a middle point that generalizes well. This matters for stable performance on unseen data.',
    practiceNote:
      'Teams tune model complexity and regularization to control this tradeoff.',
    realLifeParagraph:
      'Recommendation systems constantly balance flexibility against stability as user behavior shifts.',
    learnMoreLinks: coreLinks,
  },
  'Data Augmentation': {
    oneLineSummary: 'Data augmentation creates additional training examples by safe transformations.',
    simpleExplanation:
      'It is like practicing with varied examples so you learn the concept, not one pattern. Augmentation increases diversity without collecting entirely new data. This matters when labeled data is limited.',
    practiceNote:
      'Transformations must preserve label meaning or model quality can drop quickly.',
    realLifeParagraph:
      'Image models use flips and crops, while NLP may use paraphrasing strategies.',
    learnMoreLinks: coreLinks,
  },
  'ML Pipeline': {
    oneLineSummary: 'An ML pipeline is the full workflow from raw data to predictions.',
    simpleExplanation:
      'Think of a pipeline as a factory process with clear stages. It includes ingestion, preprocessing, training, evaluation, deployment, and monitoring. This matters for repeatability and reliability.',
    practiceNote:
      'Mature teams automate pipelines with versioning, CI checks, and rollback paths.',
    realLifeParagraph:
      'Production recommendation platforms run daily pipeline jobs to refresh models safely.',
    learnMoreLinks: coreLinks,
  },
  'Hyperparameter Tuning': {
    oneLineSummary: 'Hyperparameter tuning searches for settings that improve model performance.',
    simpleExplanation:
      'Tuning is like adjusting instrument settings to get the best sound. You test combinations of learning rate, depth, and regularization to find good outcomes. This matters because defaults are rarely optimal.',
    practiceNote:
      'Teams use controlled experiments and tracking tools to compare tuning runs.',
    realLifeParagraph:
      'Ad ranking teams tune models regularly as traffic and objectives evolve.',
    learnMoreLinks: coreLinks,
  },
  'Grid Search': {
    oneLineSummary: 'Grid search tries all predefined hyperparameter combinations.',
    simpleExplanation:
      'Grid search is a systematic checklist approach. You define candidate values and evaluate each combination. This matters because it is simple, reproducible, and a strong baseline.',
    codeBlock: `from sklearn.model_selection import GridSearchCV  # We import grid search tool
from sklearn.svm import SVC  # We import a classifier model
X = [[0, 0], [1, 1], [1, 0], [0, 1]]  # These are training features
y = [0, 1, 1, 0]  # These are labels
params = {'C': [0.1, 1], 'kernel': ['linear', 'rbf']}  # These are parameter options
search = GridSearchCV(SVC(), params, cv=2)  # We set up grid search with 2-fold CV
search.fit(X, y)  # We run all parameter combinations
print(search.best_params_)  # This prints the best settings found`,
    codeOutro:
      'What you just saw: the model tested multiple settings and returned the best configuration.',
    realLifeParagraph:
      'Teams often start with grid search, then move to smarter search when parameter space grows.',
    learnMoreLinks: coreLinks,
  },
};
