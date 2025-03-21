# Grade Tracker

<div align="center">
  <img src="public/grade-tracker-logo.png" alt="Grade Tracker Logo" width="200">
  <h3>A modern, intuitive grade management application for students</h3>

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

## ✨ Features

- 📚 **Subject Management**: Create and organize your academic subjects
- 📊 **Grade Tracking**: Record grades with different types and weights
- 📈 **Visual Analytics**: View your grade history and trends with interactive charts
- 🔄 **Cloud Sync**: Optional synchronization across multiple devices
- 🔒 **Data Privacy**: End-to-end encryption for your sensitive grade data
- 🌓 **Dark/Light Mode**: Choose your preferred theme
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📸 Screenshots

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="Dashboard" width="80%">
  <p><em>Dashboard with subject overview</em></p>
  
  <img src="public/screenshots/subject-detail.png" alt="Subject Detail" width="80%">
  <p><em>Subject detail with grade history</em></p>
  
  <img src="public/screenshots/analytics.png" alt="Analytics" width="80%">
  <p><em>Analytics dashboard with performance insights</em></p>
</div>

## 🛠️ Technologies

- **Frontend**: React, Next.js, TypeScript
- **UI Components**: Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **Data Visualization**: Custom charting components
- **Backend/Cloud**: Appwrite
- **Deployment**: Docker, containerized application
- **Storage**: Local storage with cloud sync capabilities
- **Security**: End-to-end encryption for sensitive data

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- pnpm package manager
- Docker (optional, for containerized deployment)

## Important: Installing Dependencies

Before running the application, make sure to install all required dependencies:

```bash
pnpm install
# or
npm install
```

If you encounter a "Module not found: Can't resolve 'swr'" error, it means the SWR package is missing.
Install it with:

```bash
pnpm add swr
# or
npm install swr
```

This package is crucial for efficient data fetching and caching in the application.

### Local Development

1. Clone the repository

```bash
git clone https://github.com/Nefnief-tech/grade-tracker.git
cd grade-tracker
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Then edit the `.env` file with your Appwrite credentials:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
```

4. Run the development server

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

When using Docker, you'll need to provide environment variables for Appwrite integration:

1. Copy the `.env.docker` file to `.env` and update with your Appwrite credentials:

```bash
cp .env.docker .env
# Edit .env with your Appwrite details
```

2. Build and run using Docker Compose:

```bash
docker-compose up -d
```

3. Access the application at [http://localhost:8080](http://localhost:8080)

### Troubleshooting Docker Deployment

If you encounter connection issues with Appwrite, check:

1. Make sure your Appwrite server is accessible from the Docker container
2. Verify all environment variables are correctly set in the `.env` file
3. Ensure your Appwrite endpoint URL is complete with `https://` protocol

#### Local-only Mode

If you're having persistent issues with Appwrite connectivity, you can run the application in local-only mode:

```bash
# Option 1: Set environment variable in .env file
echo "NEXT_PUBLIC_FORCE_LOCAL_MODE=true" >> .env
docker-compose up -d

# Option 2: Use the provided script
./run-local-mode.sh
```

In local-only mode:

- All data is stored within the Docker container volume
- Cloud synchronization features are disabled
- User registration/login will not connect to Appwrite

## 🧠 How It Works

### Grade Calculation

- The application calculates weighted averages for grades
- Tests are weighted at 2.0x by default
- Regular assignments are weighted at 1.0x
- Grade scale: 1 (best) to 6 (worst)

### Data Storage

- All data is stored locally by default
- Optional cloud synchronization when logged in
- End-to-end encryption protects your grade data

### Cloud Synchronization

1. Create an account with your email
2. Enable cloud sync in settings
3. Your data will automatically sync across devices

## 📖 Usage Guide

### Adding Subjects

1. Navigate to the dashboard
2. Use the "Add New Subject" form
3. Enter a subject name and click "Add Subject"

### Recording Grades

1. Open a subject page
2. Use the "Add New Grade" form
3. Enter the grade value, type, and date
4. Click "Add Grade"

### Analyzing Performance

1. View the grade history charts for each subject
2. Check your overall performance on the analysis page
3. Monitor trends in your academic performance over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component system
- [Appwrite](https://appwrite.io/) - Backend as a Service
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons

## 📬 Contact

Project Link: [https://github.com/Nefnief-tech/grade-tracker](https://github.com/Nefnief-tech/grade-tracker)

---

<div align="center">
  <p>Made with ❤️ for students everywhere</p>
</div>
