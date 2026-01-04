import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import routes from './routes.mjs';
import authRoutes from './routes/auth.mjs';
import horsesRoutes from './routes/horses.mjs';
import ownersRoutes from './routes/owners.mjs';
import stallsRoutes from './routes/stalls.mjs';
import vetsRoutes from './routes/vets.mjs';
import farriersRoutes from './routes/farriers.mjs';
import activitiesRoutes from './routes/activities.mjs';
import usersRoutes from './routes/users.mjs';
import boardingRoutes from './routes/boarding.mjs';
import haIntegrationRoutes from './routes/ha-integration.mjs';
import horseListsRoutes from './routes/horse-lists.mjs';
import farmsRoutes from './routes/farms.mjs';
import yardsRoutes from './routes/yards.mjs';
import floorplansRoutes from './routes/floorplans.mjs';
import mediaRoutes from './routes/media.mjs';
import { dbReady } from './database.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/horses', horsesRoutes);
app.use('/api/owners', ownersRoutes);
app.use('/api/stalls', stallsRoutes);
app.use('/api/vets', vetsRoutes);
app.use('/api/farriers', farriersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/boarding', boardingRoutes);
app.use('/api/ha-integration', haIntegrationRoutes);
app.use('/api/horse-lists', horseListsRoutes);
app.use('/api/farms', farmsRoutes);
app.use('/api/yards', yardsRoutes);
app.use('/api/floorplans', floorplansRoutes);
app.use('/api/horses', mediaRoutes);

app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Wait for database initialization before starting server
dbReady.then(() => {
  console.log('Database initialized successfully');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
