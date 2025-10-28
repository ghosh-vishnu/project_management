# Project Management System

Complete futuristic project management solution with AI-powered features, resume parsing, and smart auto-fill capabilities.

## 📁 Project Structure

```
project_management/
├── backend/              # Django Backend API
│   └── project_management/
│       ├── manage.py
│       ├── project_management/
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── ...
│       └── apps/         # Django apps (projects, tasks, etc.)
│
├── frontend/             # Frontend Application (React/Vue/Angular)
│
├── venv/                 # Python Virtual Environment
│
├── Project_Management_System.pdf    # Project Documentation
└── Project_Status_and_Trend_Tracker.xlsx  # Progress Tracking
```

## 🚀 Quick Start

### Backend Setup

```bash
# Activate virtual environment
cd d:\Project_Ved\project_management
.\venv\Scripts\activate

# Navigate to backend
cd backend\project_management

# Run migrations (if not done)
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will run on: **http://127.0.0.1:8000**

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Install additional packages (if needed)
npm install recharts framer-motion

# Run development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### Install Resume Parser Dependencies

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Install Python packages
pip install pdfplumber python-docx docx2txt spacy

# Download spaCy English model
python -m spacy download en_core_web_sm

# Install all dependencies from requirements.txt
pip install -r backend/requirements.txt
```

## 📊 Project Modules

### Completed ✅

#### Authentication & Security
- ✅ User Login with JWT Authentication
- ✅ Password Reset Functionality
- ✅ Role-based Access Control
- ✅ Secure Token Management

#### Employee Management
- ✅ Employee CRUD Operations
- ✅ Employee List & Details
- ✅ Resume Parser (PDF/DOCX) with Auto-fill
- ✅ PAN Card Validation with Auto-uppercase
- ✅ Smart PIN Code-based City/State Auto-fill
- ✅ Address Suggestions Dropdown with Real-time Filtering
- ✅ Match-based Dropdown System
- ✅ Department & Designation Management

#### Dashboard & Analytics
- ✅ Futuristic Dashboard with Charts (Recharts)
- ✅ Summary Cards with Animated Counters
- ✅ Project Progress Visualization
- ✅ Performance Metrics
- ✅ AI Insights Box
- ✅ Glassmorphism UI Design

#### UI/UX Features
- ✅ Futuristic Login Page
- ✅ Advanced Alert System (Error/Success)
- ✅ Responsive Top Bar with Search
- ✅ Modern Sidebar Navigation
- ✅ Smooth Animations & Transitions
- ✅ Dark Theme with Neon Effects

### In Progress 🔄
- Project Status Management
- Task Management
- Sprint Management

### Not Started 📋
- Lead & Deal Management
- Finance & Invoicing
- Advanced Reporting & Analytics
- Documentation Module

## ⚡ Key Features

### 🤖 Resume Parser
- **Smart Extraction**: Automatically extracts Name, Email, Contact, Gender, PAN, Aadhaar, DOB, Father's Name from PDF/DOCX
- **5-Strategy Name Detection**: Context-based, Position-based, ALL CAPS, spaCy NER, Email context
- **Multi-format Support**: PDF, DOCX, DOC files
- **Confidence Scores**: Each extracted field has accuracy score (0-1)
- **Auto-fill Integration**: Seamlessly populates employee form fields

### 🆔 PAN Card Validation
- **Real-time Validation**: Validates Indian PAN format (AAAAA9999A)
- **Auto-uppercase**: Converts lowercase to uppercase automatically
- **Pattern Matching**: Enforces exact 10-character format
- **Visual Feedback**: Shows error messages for invalid PAN

### 📍 Smart Address Auto-fill
- **PIN Code Integration**: Enter 6-digit PIN code to auto-fill City & State
- **India Post API**: Uses official India Post database
- **Address Suggestions**: Shows multiple village/locality options
- **Real-time Filtering**: Dropdown filters as you type
- **Match-based Display**: Shows dropdown only when text matches
- **Manual Control**: Click "Show Suggestions" to see all options
- **Clean UX**: Click × to close, or click outside

### 🎨 Futuristic UI/UX
- **Glassmorphism Design**: Modern blurred backgrounds with borders
- **Neon Effects**: Blue, cyan, purple gradient accents
- **Smooth Animations**: Framer Motion powered transitions
- **Dark Theme**: Professional dark color scheme
- **Responsive**: Works on all screen sizes
- **Loading States**: Beautiful spinners and progress indicators

## 🔗 Important Links

- **Excel Tracker**: `Project_Status_and_Trend_Tracker.xlsx`
- **Backend Admin**: http://127.0.0.1:8000/admin/
- **API**: http://127.0.0.1:8000/api/
- **Resume Parser API**: http://127.0.0.1:8000/api/peoples/parse-resume/

## 📝 API Documentation

### Employee APIs

#### Parse Resume
```http
POST /api/peoples/parse-resume/
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'resume' file field

Response: {
  "EmployeeName": "Vishnu Kumar",
  "FathersName": "Rajesh Kumar",
  "Email": "vishnu@example.com",
  "ContactNumber": "+91-9876543210",
  "AlternateContact": "9876500000",
  "Gender": "Male",
  "PAN": "ABCDE1234F",
  "Aadhaar": "123456789012",
  "DOB": "12/03/1999",
  "confidences": {...}
}
```

#### Employee CRUD
```http
GET    /api/peoples/employees/           # List all employees
GET    /api/peoples/employees/:id/       # Get employee details
POST   /api/peoples/employee/            # Create new employee
PUT    /api/peoples/employees/:id/       # Update employee
DELETE /api/peoples/employees/:id/       # Delete employee
```

## 📝 Development

### Backend (Django)
- Framework: Django 5.2.6 + Django REST Framework
- Database: PostgreSQL
- All modules in `backend/project_management/`
- Resume parser in `backend/project_management/employee/resume_parser.py`
- PAN validator in `backend/project_management/employee/pan_validator.py`

### Frontend (React)
- Framework: React 18+ with Vite
- UI Components in `frontend/src/components/`
- Pages in `frontend/src/pages/`
- Styling: Tailwind CSS + Material-UI

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2.6 + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Libraries**:
  - `pdfplumber` - PDF text extraction
  - `python-docx` - DOCX file handling
  - `docx2txt` - Alternative DOCX parsing
  - `spacy` - NLP for entity recognition
  - `cors-headers` - CORS handling
  - `Pillow` - Image processing

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Forms**: React Hook Form
- **Routing**: React Router
- **Charts**: Recharts
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

### AI & Features
- **Resume Parser**: Python-based with Regex + NLP
- **PAN Validator**: Real-time validation with auto-uppercase
- **Address API**: India Post API for PIN code lookup
- **Smart Auto-fill**: Context-aware form population

## 💡 Usage Examples

### Resume Parser
1. Navigate to **Add Employee** page
2. Click **"Upload Resume to Auto-Fill"** button
3. Select PDF or DOCX file
4. Wait for parsing (2-5 seconds)
5. Form fields auto-populate with extracted data

### PAN Validation
1. Type PAN number in the field
2. Automatically converts to uppercase
3. Real-time validation shows errors if invalid
4. Only accepts format: ABCDE1234F

### Address Auto-fill
1. Enter 6-digit PIN code (e.g., 812006)
2. City & State auto-fill
3. Click **"Show Suggestions"** for village options
4. Type to filter suggestions
5. Click any village to auto-fill address

## 📦 Dependencies

### Python (Backend)
```txt
Django==5.2.6
djangorestframework==3.16.1
pdfplumber==0.11.4
python-docx==1.1.2
docx2txt==0.8
spacy==3.8.1
psycopg[binary]==3.2.5
django-cors-headers==4.7.0
Pillow==11.0.0
```

### Node.js (Frontend)
```json
{
  "react": "^18.x",
  "react-router": "^6.x",
  "react-hook-form": "^7.x",
  "@mui/material": "^5.x",
  "axios": "^1.x",
  "recharts": "^2.x",
  "framer-motion": "^11.x",
  "tailwindcss": "^3.x"
}
```

## 🎯 Testing

### Test Resume Parser
```bash
# Upload a resume PDF/DOCX through the UI
# Or use the API directly with curl:
curl -X POST http://localhost:8000/api/peoples/parse-resume/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@path/to/resume.pdf"
```

### Test PIN Code API
```bash
curl https://api.postalpincode.in/pincode/812006
```

## 📚 Additional Documentation

- **Resume Parser Guide**: See `RESUME_PARSER_GUIDE.md`
- **Improvements Log**: See `RESUME_PARSER_IMPROVEMENTS.md`
- **PAN Validator**: See `backend/project_management/employee/pan_validator.py`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For questions or issues:
- Check documentation files in project root
- Review API documentation above
- Open an issue on GitHub

---

**Built with ❤️ using Django, React, and AI/ML technologies**

