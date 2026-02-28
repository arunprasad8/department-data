const axios = require('axios');
(async () => {
  try {
    const r = await axios.post('http://localhost:3000/api/events/evt-ai-workshop-2026/activity-report/download', {}, {responseType:'arraybuffer'});
    console.log('status', r.status, 'len', r.data && r.data.length);
  } catch (e) {
    console.error('error object:', e);
  }
})();
