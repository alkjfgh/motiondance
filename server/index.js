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
  console.log('Saving motion');
  const poseData = req.body.poseData;

  fs.readdir(path.join(__dirname, 'public/motion'), (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading file list');
    }

    const motionFiles = files.filter(file => file.startsWith('motion_') && file.endsWith('.json'));

    const lastIndex = motionFiles.reduce((maxIndex, file) => {
      const match = file.match(/motion_(\d+)\.json/);
      if (match) {
        const index = parseInt(match[1], 10);
        return Math.max(maxIndex, index);
      }
      return maxIndex;
    }, -1);

    const newFileName = `motion_${lastIndex + 1}.json`;

    fs.writeFile(path.join(__dirname, 'public/motion', newFileName), JSON.stringify(poseData), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error saving motion data');
      } else {
        res.json({ message: 'Motion data saved successfully', fileName: newFileName });
      }
    });
  });
});

app.get('/motion-files', (req, res) => {
  fs.readdir(path.join(__dirname, 'public/motion'), (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading file list');
    }

    const motionFiles = files.filter(file => file.startsWith('motion_') && file.endsWith('.json'));
    res.json(motionFiles);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
