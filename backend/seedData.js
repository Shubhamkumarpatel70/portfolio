const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Experience = require('./models/Experience');
const connectDB = require('./config/db');

dotenv.config();

// Sample skills data
const skillsData = [
  {
    name: 'HTML5',
    proficiency: 95,
    category: 'frontend',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
  },
  {
    name: 'CSS3',
    proficiency: 90,
    category: 'frontend',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
  },
  {
    name: 'JavaScript',
    proficiency: 85,
    category: 'frontend',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
  },
  {
    name: 'React',
    proficiency: 80,
    category: 'frontend',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
  },
  {
    name: 'Node.js',
    proficiency: 75,
    category: 'backend',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
  },
  {
    name: 'MongoDB',
    proficiency: 70,
    category: 'database',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'
  },
  {
    name: 'Express',
    proficiency: 75,
    category: 'backend',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg'
  }
];

// Sample projects data
const projectsData = [
  {
    title: 'E-commerce Platform',
    description: 'A full-featured e-commerce platform with product management, cart functionality, and payment processing.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    link: 'https://example.com/ecommerce',
    sourceCodeLink: 'https://github.com/yourusername/ecommerce',
    featured: true,
    tags: ['React', 'Node.js', 'MongoDB', 'Express']
  },
  {
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates, notifications, and team features.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    link: 'https://example.com/taskmanager',
    sourceCodeLink: 'https://github.com/yourusername/taskmanager',
    featured: true,
    tags: ['React', 'Firebase', 'Material UI', 'Redux']
  },
  {
    title: 'Weather Dashboard',
    description: 'A weather dashboard that displays current and forecasted weather data for cities around the world.',
    image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    link: 'https://example.com/weather',
    sourceCodeLink: 'https://github.com/yourusername/weather',
    featured: false,
    tags: ['JavaScript', 'API', 'CSS3', 'HTML5']
  }
];

// Sample experience data
const experienceData = [
  {
    role: 'Senior Frontend Developer',
    company: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    startDate: new Date('2021-06-01'),
    endDate: null, // Present
    description: 'Leading the frontend development team in building modern web applications using React and TypeScript.',
    technologies: ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'Jest'],
    companyLogo: 'https://via.placeholder.com/150',
    companyWebsite: 'https://example.com',
    achievements: [
      'Improved application performance by 40% through code optimization',
      'Implemented CI/CD pipeline reducing deployment time by 60%',
      'Mentored 5 junior developers'
    ],
    order: 1
  },
  {
    role: 'Frontend Developer',
    company: 'Digital Solutions LLC',
    location: 'New York, NY',
    startDate: new Date('2019-03-15'),
    endDate: new Date('2021-05-30'),
    description: 'Developed responsive web applications and implemented new features for client projects.',
    technologies: ['JavaScript', 'React', 'CSS3', 'HTML5', 'Node.js'],
    companyLogo: 'https://via.placeholder.com/150',
    companyWebsite: 'https://example.com',
    achievements: [
      'Developed 10+ client websites with 100% on-time delivery',
      'Reduced bug reports by 30% through improved testing practices',
      'Received "Employee of the Quarter" award twice'
    ],
    order: 2
  },
  {
    role: 'Web Developer Intern',
    company: 'StartUp Ventures',
    location: 'Remote',
    startDate: new Date('2018-06-01'),
    endDate: new Date('2019-02-28'),
    description: 'Assisted in developing web applications and learned modern web development practices.',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'jQuery'],
    companyLogo: 'https://via.placeholder.com/150',
    companyWebsite: 'https://example.com',
    achievements: [
      'Developed a responsive landing page that increased conversions by 15%',
      'Created an internal tool that automated daily reporting tasks',
      'Contributed to the company blog with technical articles'
    ],
    order: 3
  }
];

// Seed function
const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Experience.deleteMany({});
    
    // Insert new data
    await Skill.insertMany(skillsData);
    await Project.insertMany(projectsData);
    await Experience.insertMany(experienceData);
    
    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();