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
source venv/bin/activate  # Windows: venv\Scripts\activate
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

### Backend & MLE
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