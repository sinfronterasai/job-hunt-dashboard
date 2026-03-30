const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API: Get jobs
app.get('/api/jobs', (req, res) => {
  const jobsPath = path.join(__dirname, 'data', 'jobs.json');
  if (fs.existsSync(jobsPath)) {
    const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    res.json(data);
  } else {
    res.json({ jobs: [], total: 0 });
  }
});

// API: Update job status
app.put('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const jobsPath = path.join(__dirname, 'data', 'jobs.json');
  
  if (fs.existsSync(jobsPath)) {
    const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    const jobIndex = data.jobs.findIndex(j => j.id === id);
    
    if (jobIndex >= 0) {
      data.jobs[jobIndex] = { ...data.jobs[jobIndex], ...updates };
      fs.writeFileSync(jobsPath, JSON.stringify(data, null, 2));
      res.json({ success: true, job: data.jobs[jobIndex] });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } else {
    res.status(404).json({ error: 'No jobs data' });
  }
});

// API: Get stats
app.get('/api/stats', (req, res) => {
  const jobsPath = path.join(__dirname, 'data', 'jobs.json');
  if (fs.existsSync(jobsPath)) {
    const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    const stats = {
      total: data.jobs.length,
      new: data.jobs.filter(j => j.status === 'new').length,
      qualified: data.jobs.filter(j => j.status === 'qualified').length,
      applying: data.jobs.filter(j => j.status === 'applying').length,
      applied: data.jobs.filter(j => j.status === 'applied').length,
      interview: data.jobs.filter(j => j.status === 'interview').length,
      offer: data.jobs.filter(j => j.status === 'offer').length,
      closed: data.jobs.filter(j => j.status === 'closed').length
    };
    res.json(stats);
  } else {
    res.json({ total: 0, applied: 0, interview: 0, offer: 0 });
  }
});

app.listen(PORT, () => {
  console.log(`Job Hunt Dashboard running on port ${PORT}`);
});
