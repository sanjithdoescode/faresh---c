import express from 'express';
import { json } from 'body-parser';
import { router as traceabilityRouter } from '../api/routes/traceability';

const app = express();

app.use(json());
app.use('/api/traceability', traceabilityRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 