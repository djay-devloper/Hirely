# Hirely

Hirely is a full-stack recruitment platform designed to connect job seekers with recruiters in a modern hiring workflow. The application allows candidates to browse jobs, search by keyword, filter opportunities, upload a resume, and track their application status. Recruiters can register companies, post jobs, review applicants, and update hiring decisions.

This project is built as a practical MVP for a real-world hiring system using a React + Vite frontend and a Node.js + Express + MongoDB backend. It is structured to be easy to extend with analytics, notifications, recruiter dashboards, and deeper hiring workflows.

## Why Hirely

The goal of this project is to provide a complete job portal experience with:

- candidate-friendly job discovery
- recruiter-side job management
- application tracking and status updates
- resume-based hiring flow
- clean and responsive frontend experience

## Tech stack

### Frontend
- React
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router DOM
- Axios
- Sonner
- Radix UI primitives

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Cookie-based session handling
- Multer for file uploads
- Cloudinary for resume and image storage

## Current features

### Candidate features
- User registration and login
- Role-based authentication for students and recruiters
- Update personal profile information
- Upload and manage a PDF resume
- Search jobs by keyword
- Filter jobs by location, job type, and experience
- View jobs on the home page and browse section
- Open individual job details
- Apply for jobs
- View applied jobs and their current status
- See hiring decisions such as pending, accepted, or rejected

### Recruiter features
- Recruiter-only protected routes
- Company registration and management
- Company details and logo update
- Job posting with structured data
- Review all jobs posted by the recruiter
- View applicant lists for each job
- Open applicant resumes
- Update applicant status to accepted or rejected
- Maintain a complete basic hiring workflow

### Product polish already added
- Case-insensitive search and filter handling
- Standardized values for job type, location, and experience filters
- Limited latest-job fetch on the home page for faster loading
- Toast notifications for validation and success feedback
- Normalized salary display formatting
- Professional footer and branding updates

## Application flow

### Candidate journey
1. Candidate signs up or logs in.
2. Candidate updates profile and uploads a PDF resume.
3. Candidate searches jobs or uses filters to find suitable roles.
4. Candidate opens a job description and applies.
5. Candidate can view application status from the profile screen.

### Recruiter journey
1. Recruiter logs in.
2. Recruiter creates or manages a company profile.
3. Recruiter posts jobs with structured details.
4. Candidates apply to jobs.
5. Recruiter reviews applicants and resumes.
6. Recruiter updates the applicant status.
7. Candidate sees the updated status in their dashboard.

## Project structure

```bash
Hirely/
├── BACKEND/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── index.js
│   └── package.json
├── FRONTEND/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
├── .gitignore
└── .DS_Store
```

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- MongoDB running locally or available via a connection string
- Cloudinary account credentials for resumes and images

## Environment variables

### Backend
Create a `.env` file inside the `BACKEND` folder:

```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
PORT=8000
```

### Frontend
Create a `.env` file inside the `FRONTEND` folder if needed:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If the frontend environment variable is not set, the application falls back to the default value:

```env
http://localhost:8000
```

## Getting started

### 1. Install backend dependencies

```bash
cd BACKEND
npm install
```

### 2. Install frontend dependencies

```bash
cd FRONTEND
npm install
```

### 3. Start the backend

```bash
cd BACKEND
npm run dev
```

### 4. Start the frontend

```bash
cd FRONTEND
npm run dev -- --host 0.0.0.0
```

### 5. Open the app

Visit:

```bash
http://localhost:5173
```

## Backend API overview

### User routes
- `POST /api/v1/user/register` — register a user
- `POST /api/v1/user/login` — login a user
- `GET /api/v1/user/logout` — logout a user
- `POST /api/v1/user/profile/update` — update profile and resume

### Company routes
- `POST /api/v1/company/register` — register company
- `GET /api/v1/company/get` — get companies for logged-in recruiter
- `GET /api/v1/company/get/:id` — get company by ID
- `PUT /api/v1/company/update/:id` — update company details

### Job routes
- `POST /api/v1/job/post` — create a new job
- `GET /api/v1/job/get` — get all jobs with optional keyword and limit filters
- `GET /api/v1/job/getadminjobs` — get recruiter-created jobs
- `GET /api/v1/job/get/:id` — get job by ID

### Application routes
- `GET /api/v1/application/apply/:id` — apply to a job
- `GET /api/v1/application/get` — get candidate applied jobs
- `GET /api/v1/application/:id/applicants` — get all applicants for a job
- `POST /api/v1/application/status/:id/update` — update applicant status

## Current project status

Hirely is currently a functional MVP that covers the full core hiring cycle:

- authentication and roles
- company creation
- job posting
- search and filtering
- resume upload
- job applications
- applicant review
- status management

It is not yet a full-scale production system, but it is a complete and realistic prototype for a job portal workflow.

## Improvements already completed

The following issues were addressed in the current version of the project:

- real application status visibility on job cards and detail pages
- case-insensitive filtering and search logic
- standardized recruiter form values to reduce mismatch
- optimized home page loading with latest-job fetch limit
- PDF-only resume validation
- improved toast notifications and UI messaging
- professional footer and brand polish

## Recommended next improvements

These remain the strongest opportunities for future growth:

### High priority
- add pagination for job lists and browse pages
- improve empty states and loading indicators
- add applicant sorting and filtering in recruiter dashboards
- introduce resume preview support

### Medium priority
- add email notifications for application updates
- add recruiter notifications for new candidate applications
- add analytics and hiring metrics dashboard
- strengthen backend validation and role-based safeguards

### Long-term vision
- AI-based candidate matching
- interview scheduling and communication modules
- multi-company hiring dashboards
- cloud deployment with monitoring and production-grade scaling

## License

This project is intended for educational and portfolio use unless a formal license is added later.

## Final note

Hirely is a strong full-stack job portal MVP that demonstrates a realistic hiring workflow from job discovery to applicant evaluation. With the current features and polish already in place, it is a solid foundation for a more advanced recruitment product.

### Short-term goals
- Improve status consistency in all job-related screens
- Add pagination for browse and search results
- Improve recruiter form validation and field consistency
- Improve loading time for the home page

### Mid-term goals
- Add recruiter analytics dashboard
- Add applicant filtering and sorting
- Add resume preview and better document management
- Introduce real-time updates for application status changes

### Long-term goals
- Add AI-powered job matching and candidate recommendations
- Add interview scheduling workflows
- Expand into multi-company and multi-team hiring management
- Deploy with cloud hosting, monitoring, and scaling support

## Notes for contributors

This project is a strong portfolio and learning project, and it also works well as a foundation for a real-world hiring platform. Future work can focus on performance optimization, product polish, recruiter tooling, and production-level reliability.

## License

This project is currently intended for educational and portfolio use. Add a formal license if you plan to distribute or commercialize it.

## Final note

Hirely currently implements the essential lifecycle of a job portal: job discovery, profile management, application submission, recruiter review, and hiring decisions. It is a functional MVP with a real user flow and a solid base for future enhancements.
