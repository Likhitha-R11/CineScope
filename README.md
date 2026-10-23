# 🎬 CineScope — Smart Movie Recommendation System

CineScope is a movie discovery and recommendation web application that helps users explore movies and discover content based on their interests, preferred languages, genres, and moods.

The project combines a React.js frontend, Flask backend, and MongoDB database to provide an interactive movie browsing experience.

## ✨ Features

- **Movie Discovery:** Browse and explore movies using movie information sourced from TMDB.
- **Personalized Recommendations:** Discover movies using content-based and collaborative filtering approaches.
- **Multilingual Search:** Explore movies across supported languages, including Telugu and Malayalam.
- **Voice and Text Search:** Search for movies using text or voice input.
- **CineBot:** Interact with a rule-based chatbot for movie-related assistance.
- **User Authentication:** Support for user registration, login, and JWT-based authentication.
- **Multiple Profiles:** Organize movie preferences across user profiles.
- **Responsive Interface:** Navigate movie information through an interactive React.js interface.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Python, Flask |
| Database | MongoDB |
| Movie Data | TMDB API |
| Authentication | JSON Web Tokens (JWT) |
| API Communication | REST APIs |
| Recommendation System | Content-based and collaborative filtering |

## 🏗️ System Architecture

```text
              User
               |
               v
      React.js Frontend
               |
          REST API
               |
               v
        Flask Backend
          /       \
         v         v
     MongoDB     TMDB API
         |
         v
  Movie Data & User
     Preferences
```

The React.js frontend communicates with the Flask backend through API endpoints. The backend handles application logic, interacts with MongoDB, and integrates movie data from TMDB as required.

## 🧠 Recommendation System

CineScope uses two recommendation approaches:

- **Content-based filtering:** Recommends movies based on similarities such as genres, languages, and other movie attributes.
- **Collaborative filtering:** Uses available user preference or interaction data to identify movies that may appeal to users with similar interests.

Combining these approaches supports more personalized movie discovery. Recommendation quality depends on the available movie data and user interactions.

## 💻 My Contribution

I contributed to the **frontend development** of CineScope.

My work focused on:

- Developing and improving user-facing components using React.js.
- Building movie browsing and discovery interfaces.
- Integrating frontend components with backend REST APIs.
- Supporting the user experience for movie search and recommendations.

This project helped me gain practical experience in frontend development, API integration, and full-stack application architecture.

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- Python 3.10 or another compatible Python version
- MongoDB
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Likhitha-R11/cinescope.git
cd cinescope
```

### 2. Set up the backend

Navigate to the backend directory used in your project, create a virtual environment, and install the required dependencies.

```bash
python -m venv venv
```

Activate the environment on Windows:

```bash
venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables, including the MongoDB connection and any TMDB API settings used by the application.

Start the Flask backend using the entry point configured in your project.

### 3. Set up the frontend

Open a separate terminal and navigate to the frontend directory.

```bash
npm install
npm start
```

If the project uses Vite instead of Create React App, use `npm run dev` instead. Check `package.json` for the correct command.

### 4. Run the application

Start MongoDB and the Flask backend, then start the React frontend. Open the local URL displayed by the frontend development server.

**Note:** Update the directory names, environment variables, and startup commands above to match the actual repository structure before publishing this README.

## 📚 What I Learned

- Building interactive interfaces using React.js.
- Integrating frontend components with Flask REST APIs.
- Understanding communication between frontend, backend, and database layers.
- Working with movie data and recommendation-system concepts.
- Collaborating on a full-stack application as part of a team project.

## 👥 Project Information

- **Repository:** [CineScope on GitHub](https://github.com/Likhitha-R11/cinescope)
- **Movie data source:** [The Movie Database (TMDB)](https://www.themoviedb.org/)

## 🔮 Future Enhancements

- Improve recommendation quality using richer user interaction data.
- Add advanced filtering and sorting options.
- Enhance accessibility and responsive design.
- Expand movie discovery and personalization features.

---

*Built as a collaborative project to explore movie discovery, recommendation systems, and full-stack web development.*
