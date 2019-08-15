import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import PasswordResetController from './app/controllers/PasswordResetController';
import SessionController from './app/controllers/SessionController';
import PasswordController from './app/controllers/PasswordController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizingController from './app/controllers/OrganizingController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.put('/reset/:token', PasswordResetController.update);
routes.post('/reset', PasswordResetController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.put('/users/password', PasswordController.update);

routes.get('/files', FileController.index);
routes.post('/files', upload.single('file'), FileController.store);

routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.post('/meetups/:meetup_id/subscriptions', SubscriptionController.store);
routes.delete(
  '/meetups/:meetup_id/subscriptions',
  SubscriptionController.delete
);

routes.get('/organizing', OrganizingController.index);

export default routes;
