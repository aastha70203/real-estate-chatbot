Real Estate Analysis Chatbot — Full Stack (React + Django)

A full-stack web application that analyzes real-estate localities from an uploaded Excel/CSV file and generates a natural-language summary, price and demand trend charts, and filtered data tables. This project was built as part of the SigmaValue Full Stack Developer Assignment.

Features

Excel/CSV Upload
Upload any dataset containing locality, year, pricing, demand, and other real estate metrics. Backend automatically parses and detects relevant columns.

Natural Language Query Support
Examples:

“Give me analysis of Wakad”

“Compare Ambegaon Budruk and Aundh demand trends”

“Show price growth for Akurdi over the last 3 years”

Analytics Engine

Filters dataset based on locality or comparison query

Produces year-wise price and demand trends

Generates a summary of top rows and overall growth

Supports single or multi-locality analysis

Visual Charts
Displays price and demand trend charts. Supports comparison charts for multiple areas. Built using React Chart.js.

Filtered Table View
Shows matching rows in a clean, formatted table with download support.

Data Download
Users can download filtered CSV and dataset schema.

Optional LLM Mode
Toggle LLM mode to produce improved summaries (supports real API or mocked output).

Tech Stack
Frontend

React.js

Bootstrap

React Chart.js

Axios

Backend

Django

Django REST Framework

Pandas

OpenPyXL

Project Structure
real-estate-chatbot/
│
├── backend/
│   ├── analysis/
│   │   ├── utils.py
│   │   ├── views.py
│   │   ├── urls.py
│   ├── backend_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   └── uploads/
│
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   │   ├── SummarySection.js
    │   │   ├── ChartPanel.js
    │   │   ├── ResultsPanel.js
    │   │   ├── QueryBar.js
    │   ├── styles/theme.css
    └── public/

Installation and Setup
Backend (Django)

Clone the repository:

git clone <your-repo-url>
cd real-estate-chatbot/backend


Create virtual environment:

python -m venv venv


Activate environment (Windows):

venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


Run backend server:

python manage.py runserver


Backend runs at:

http://localhost:8000

Frontend (React)

Navigate to frontend folder:

cd ../frontend


Install dependencies:

npm install


Start development server:

npm start


Frontend runs at:

http://localhost:3000

API Endpoints

Upload File:

POST /api/upload/


Analyze Query:

GET /api/analyze/?query=<your-text>&use_llm=false


Schema:

GET /api/schema/


Download Filtered CSV:

GET /api/download/?query=<your-text>

Sample Queries

Analyze Wakad

Show price growth for Akurdi over the last 3 years

Compare Ambegaon Budruk and Aundh demand trends