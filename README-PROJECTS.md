# Projects Component Documentation

## Overview
The Projects component has been enhanced to display both featured and all projects from your portfolio. It now includes:

- Toggle buttons to switch between "Featured Projects" and "All Projects" views
- Improved card design with a dedicated footer section for action buttons
- Two main action buttons: "View Project" and "Source Code"
- Support for case study links when available
- Responsive design that works on all screen sizes

## Backend Changes

### Project Model Updates
The Project model has been updated to include additional fields:
- `sourceCodeLink`: Link to the project's source code repository
- `demoLink`: Link to a live demo of the project
- `caseStudyLink`: Link to a case study or detailed write-up
- `tags`: Array of technology tags used in the project

### Sample Data
A sample data file has been created at `backend/data/sampleProjects.js` with example projects.

### Database Seeding
A script has been added at `backend/seedProjects.js` to populate your database with sample projects.

To seed your database with sample projects:
```
cd portfolio-mern/backend
node seedProjects.js
```

## Frontend Features

### Toggle Between Views
- Users can switch between viewing only featured projects or all projects
- The toggle is available both at the top of the component and at the bottom

### Project Cards
Each project card includes:
- Project image (if available)
- Title and description
- Technology tags
- Action buttons:
  - "View Project" button (links to the main project)
  - "Source Code" button (links to the repository)
  - "Case Study" button (if a case study link is provided)

### Responsive Design
- Cards adjust from 3 columns on large screens to 1 column on mobile
- Button layout adapts to available space

## How to Use

1. Make sure your backend is running and connected to MongoDB
2. If you want to use the sample data, run the seed script
3. The Projects component will automatically fetch and display your projects
4. Featured projects (where `featured: true`) will be shown by default
5. Users can click "View All Projects" to see all projects

## Customization

You can customize the appearance by modifying the Tailwind CSS classes in the component.