const mongoose = require('mongoose');
const Project = require('./models/Project');
const sampleProjects = require('./data/sampleProjects');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Seed function
const seedProjects = async () => {
  try {
    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Insert sample projects
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`Added ${createdProjects.length} projects to the database`);

    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProjects();