import { Router as ExpressRouter } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const expressRouter = ExpressRouter();

expressRouter.post('/register', requireAuth, OrganizationController.registerOrganization);
expressRouter.get('/me', requireAuth, OrganizationController.getMyOrganization);
expressRouter.get('/applications', requireAuth, OrganizationController.getApplications);
expressRouter.post('/challenges', requireAuth, OrganizationController.createChallenge);

export default expressRouter;
