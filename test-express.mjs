import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('ok'));
app.listen(4000, () => {
    console.log('express ok');
    process.exit(0);
});
