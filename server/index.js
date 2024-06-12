const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/save-motion', (req, res) => {
  const poseData = req.body.poseData;
  fs.writeFile('public/motion.json', JSON.stringify(poseData), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving motion data');
    } else {
      res.send('Motion data saved successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
