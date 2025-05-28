const { exec } = require('child_process');
const path = require('path');

function analyzeSentiment(text) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../python/analyzer.py');
    const command = `python3 ${scriptPath} "${text}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('감정 분석 실패:', error);
        return reject(error);
      }
      const sentiment = stdout.trim();
      resolve(sentiment); // 'positive' | 'negative' | 'neutral'
    });
  });
}

module.exports = analyzeSentiment;