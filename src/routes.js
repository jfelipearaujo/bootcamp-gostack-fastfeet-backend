import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import PackageController from './app/controllers/PackageController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';

import validateSessionStore from './app/validators/SessionStore';

import validateDeliverymanStore from './app/validators/DeliverymanStore';
import validateDeliverymanUpdate from './app/validators/DeliverymanUpdate';

import validatePackageStore from './app/validators/PackageStore';
import validatePackageUpdate from './app/validators/PackageUpdate';

import validateRecipientStore from './app/validators/RecipientStore';
import validateRecipientUpdate from './app/validators/RecipientUpdate';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', validateUserStore, UserController.store);
routes.post('/sessions', validateSessionStore, SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveryController.index);
routes.post('/deliveryman/:id/deliveries', DeliveryController.start);
routes.put('/deliveryman/:id/deliveries', DeliveryController.finish);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/delivery/:deliveryId/problems', DeliveryProblemController.store);
routes.get(
  '/delivery/:deliveryId/problems',
  DeliveryProblemController.delivery
);

routes.use(authMiddleware);

routes.put('/users', validateUserUpdate, UserController.update);
routes.get('/users', UserController.index);
routes.delete('/users', UserController.delete);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', validateRecipientStore, RecipientController.store);
routes.put(
  '/recipients/:id',
  validateRecipientUpdate,
  RecipientController.update
);
routes.delete('/recipients/:id', RecipientController.delete);

routes.get('/deliveryman', DeliverymanController.index);
routes.post(
  '/deliveryman',
  validateDeliverymanStore,
  DeliverymanController.store
);
routes.put(
  '/deliveryman/:id',
  validateDeliverymanUpdate,
  DeliverymanController.update
);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

routes.get('/packages', PackageController.index);
routes.post('/packages', validatePackageStore, PackageController.store);
routes.put('/packages/:id', validatePackageUpdate, PackageController.update);
routes.delete('/packages/:id', PackageController.delete);

routes.get('/delivery/problems', DeliveryProblemController.index);
routes.delete(
  '/problem/:deliveryProblemId/cancel-delivery',
  DeliveryProblemController.delete
);

export default routes;
