# Credit Recommendation System (End-to-End MLE)

This repository features a complete, decoupled architecture for a Credit Recommendation System. It demonstrates the integration of a Machine Learning Inference Engine with a professional Web Infrastructure, bridging the gap between Data Science modeling and Software Engineering.

## Project Structure

```text
.
├── ml_api/                  # Machine Learning Service (FastAPI)
│   ├── data/                # Raw datasets for inference
│   ├── models/              # Serialized model files (.pkl)
│   ├── server/              # API source code (main.py, models.py)
│   └── requirements.txt     # Python dependencies
├── src/                     # Web Application Service (Node.js)
│   ├── config/              # Database and app configurations
│   ├── data/                # Local data storage
│   ├── public/              # Static assets (CSS)
│   ├── routes/              # Express route handlers
│   ├── views/               # EJS templates for the frontend
│   └── server.js            # Node.js entry point
├── assets/                  # General project assets
├── db_schema.sql            # SQL script for database initialization
├── package.json             # Node.js dependencies and scripts
├── .env                     # Environment variables (Local only)
└── README.md                # Project documentation
``` 

## Tutorial
![System Demonstration](assets\server_ml_api.gif)


## Model Methodology & Parameter Justification

The core of the recommendation engine is based on **Logistic Regression** chosen for its interpretability and efficiency in binary classification.

* **Multi-product Strategy:** The system orchestrates 8 distinct credit products, each utilizing calibrated decision thresholds to optimize approval rates.

The model optimizes the following cost function (Log-Loss with $L_2$ regularization), where the parameter $C$ controls the trade-off between the log-likelihood and the penalty:

$$J, Log Odds (\beta) = C \sum_{i=1}^{n} \log(1 + e^{-y_i ( \beta_0 + \sum_{j=1}^{m} \beta_j x_{ij} )}) + \frac{1}{2} \sum_{j=1}^{m} \beta_j^2$$

* **Hyperparameter Configuration:**
    * **C (Regularization) [0.000009]:** Strong regularization applied to control the magnitude of the Betas (Coefficients), preventing inflation and ensuring the model generalizes well to unseen transactional data.
    * **Solver [LBFGS]:** Selected for its computational efficiency, utilizing second-order derivatives (Hessian approximation) for faster gradient convergence.
    * **Penalty [L2]:** Ridge regression was implemented to handle multicollinearity among features while maintaining all predictors in the model.
    * **Max Iterations [10,000]:** Set high enough to guarantee convergence in complex feature spaces without bottlenecking training time.
    * **Tolerance [0.001]:** Defines the stopping criterion; ensures the optimization process halts only when Beta updates become negligible, avoiding premature convergence.
    * **Class Weights:** Calibrated to handle the intrinsic class imbalance of credit approval labels, preventing bias towards the majority class.
    * **Warm Start [True]:** Optimized for iterative development, allowing the model to reuse coefficients from previous runs to accelerate the convergence of the objective function.
    * **n_jobs [-1]:** Configured for maximum hardware utilization through parallel processing.

## Architecture

The project is structured as a microservices-based application to ensure scalability and separation of concerns:

* **Web Server (Node.js):** Orchestrates the application logic, serves the frontend (HTML/CSS/JS), and manages communication with the ML service.
* **ML Inference API (FastAPI):** A high-performance Python backend that serves the predictive model via a RESTful API, optimized for low-latency inferences.

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/bbucalonserra/web-app-recommendation-system-ml-api.git
cd web-app-recommendation-system-ml-api
```

2. ML Inference Server (FastAPI):
Open a new terminal and navigate to the ml_api folder:

```bash
cd ml_api
python -m venv venv
source venv/Scripts/activate # Windows: venv\bin\activate
pip install -r requirements.txt
uvicorn server.main:app
```

*The ML API will be running at http://localhost:8000.*

3. Web Application Server (Node.js):
From the root directory, run the following commands:

```bash
npm install
npm run build-db
npm run start
```

*The web interface will be available at http://localhost:3000.*

## Tech Stack

### Backend & Machine Learning Engineering and Data Science
* **Data Science:** Binary Classification Problem using Logistic Regression for 8 products.Logistics Regression for 8 producyd
* **Machine Learning:** Python, Scikit-Learn, Pandas.
* **Inference API:** FastAPI, Uvicorn (RESTful Architecture).
* **Server Orchestration:** Node.js, Express.

### Frontend
* **UI/UX:** HTML5, CSS3.
* **Logic:** JavaScript (Vanilla/ES6+).

## Usage Note

Once both servers are running, access the web interface at http://localhost:3000. The frontend sends user data to the Node.js server, which then communicates with the FastAPI endpoint at http://localhost:8000/predict to return the credit recommendation in real-time.

## Project Structure

* /ml-api: FastAPI source code, model serialization (pickle/joblib), and inference logic.
* /web-app: Node.js server, middleware, and static assets (HTML/CSS/JS).
* /research: Jupyter Notebooks containing Exploratory Data Analysis (EDA) and Model Training.