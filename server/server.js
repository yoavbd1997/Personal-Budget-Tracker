const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); // To handle JSON payloads

// MongoDB Connection
mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

// Updated Budget Schema
const budgetSchema = new mongoose.Schema({
    username: String,
    name: String,
    cost: Number, 
    category: String, 
    description: String, 
    createdAt: { type: Date, default: Date.now } 
});

const User = mongoose.model('User', userSchema);
const Budget = mongoose.model('Budget', budgetSchema);

app.get("/home", (req, res) => {
    res.json({ msg: "hello" });
});

app.get('/getUsers', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

app.post('/user', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});
app.get('/budget/:id', async (req, res) => {
    try {
      const budgetId = req.params.id;
      const budget = await Budget.findById(budgetId);
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      res.status(200).json(budget);
    } catch (error) {
      console.error('Error fetching budget details:', error);
      res.status(500).json({ message: 'Error fetching budget details', error });
    }
  });
  
// Get budgets for a specific user
app.get('/budgets', async (req, res) => {
    const { username } = req.query; // Use query parameters for username

    try {
        const budgets = await Budget.find({ username });
        res.status(200).json(budgets); 
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving budgets' });
    }
});

// POST /budget - Create a new budget with category and description
app.post('/budget', async (req, res) => {
    try {
        const { username, name, cost, category, description } = req.body; // Include cost
        const newBudget = new Budget({ username, name, cost, category, description });
        await newBudget.save();
        res.status(201).json({ message: 'Budget created successfully', budget: newBudget });
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ message: 'Error creating budget', error });
    }
});

// Update a budget (optional)
app.put('/budget/:id', async (req, res) => {
    const { id } = req.params;
    const { name, cost, category, description } = req.body; // Include fields to update

    try {
        const updatedBudget = await Budget.findByIdAndUpdate(
            id,
            { name, cost, category, description },
            { new: true } // Return the updated document
        );

        if (!updatedBudget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget updated successfully', budget: updatedBudget });
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ message: 'Error updating budget', error });
    }
});

// Delete a budget (optional)
app.delete('/budget/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBudget = await Budget.findByIdAndDelete(id);

        if (!deletedBudget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Error deleting budget', error });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
