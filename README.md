
Real Estate Analysis Chatbot — Full Stack (React + Django)

A full-stack web application that analyzes real-estate localities from an uploaded Excel/CSV file and generates a natural-language summary, price and demand trend charts, and filtered data tables. This project was built as part of the SigmaValue Full Stack Developer Assignment.

Features
1.Excel/CSV Upload

2.Upload any dataset containing locality, year, pricing, demand, and other real estate metrics.

3.The backend automatically parses and detects relevant columns.

4.Natural Language Query Support

5. Ask questions in plain English.

Examples:

1."Give me analysis of Wakad"

2."Compare Ambegaon Budruk and Aundh demand trends"

3."Show price growth for Akurdi over the last 3 years"

Analytics Engine

1.Filters dataset based on locality or comparison query.

2.Produces year-wise price and demand trends.

3.Generates a summary of top rows and overall growth.

4.Supports single or multi-locality analysis.

5.Visual Charts

6.Displays price and demand trend charts.

7.Supports comparison charts for multiple areas.

8.Built using React Chart.js.

9.Filtered Table View

10.Shows matching rows in a clean, formatted table with download support.

11.Data Download

12.Users can download the filtered CSV and dataset schema.

13.Optional LLM Mode

14.Toggle LLM mode to produce improved summaries (supports real API or mocked output).

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
    │   ├── styles/
    │   │   └── theme.css
    └── public/

Installation and Setup

1. Backend (Django)
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
The backend runs at: http://localhost:8000

2. Frontend (React)
Navigate to frontend folder:



cd ../frontend
Install dependencies:


npm install
Start development server:


npm start
The frontend runs at: http://localhost:3000

API Endpoints

Upload File:

POST /api/upload/

Analyze Query:

GET /api/analyze/?query=<text>&use_llm=false

Schema:

GET /api/schema/

Download Filtered CSV:

GET /api/download/?query=<text>

Sample Queries

1."Analyze Wakad"

2."Show price growth for Akurdi over the last 3 years"

3."Compare Ambegaon Budruk and Aundh demand trends"