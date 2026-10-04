import { asyncHandler } from '../middlewares/async-handler.js';
import { prisma } from '../config/db.js';
import { getStore } from '../services/store.service.js';

export class OrganizationController {
  static registerOrganization = asyncHandler(async (request, response) => {
    const data = request.body;
    const userId = request.user.id;

    try {
      // 1. Create Organization
      const org = await prisma.organization.create({
        data: {
          name: data.orgName,
          type: data.orgType,
          country: data.country,
          state: data.state,
          city: data.city,
          officialEmail: data.officialEmail,
          website: data.website,
          description: data.description,
          verificationStatus: 'UNDER_REVIEW',
          // Create verification request
          verifications: {
            create: {
              repName: data.repName,
              repDesignation: data.repDesignation,
              repEmail: data.repEmail,
              repPhone: data.repPhone,
              documentUrls: data.documents || [],
              status: 'PENDING'
            }
          },
          // Assign user as OWNER
          members: {
            create: {
              userId: userId,
              role: 'OWNER'
            }
          }
        }
      });

      // Update User role
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'ORGANIZATION_ADMIN' }
      });

      response.status(201).json({ status: 'success', data: org });
    } catch (err) {
      // Fallback for offline mode
      console.warn("Prisma error, falling back to memory store for Organization", err);
      
      const orgId = `org_${Date.now()}`;
      const mockOrg = {
        id: orgId,
        name: data.orgName,
        type: data.orgType,
        country: data.country,
        state: data.state,
        city: data.city,
        officialEmail: data.officialEmail,
        website: data.website,
        description: data.description,
        verificationStatus: 'UNDER_REVIEW',
      };
      
      const store = getStore();
      store.organizations = store.organizations || new Map();
      store.organizations.set(orgId, mockOrg);
      
      store.organizationMembers = store.organizationMembers || new Map();
      store.organizationMembers.set(`${orgId}_${userId}`, {
        id: `mem_${Date.now()}`,
        organizationId: orgId,
        userId: userId,
        role: 'OWNER'
      });

      response.status(201).json({ status: 'success', data: mockOrg });
    }
  });

  static getMyOrganization = asyncHandler(async (request, response) => {
    const userId = request.user.id;
    
    try {
      const member = await prisma.organizationMember.findFirst({
        where: { userId },
        include: { organization: true }
      });
      
      if (!member) {
        return response.status(404).json({ status: 'error', message: 'No organization found' });
      }
      
      response.status(200).json({ status: 'success', data: member.organization });
    } catch (err) {
      const store = getStore();
      if (store.organizationMembers) {
        const memEntry = Array.from(store.organizationMembers.values()).find(m => m.userId === userId);
        if (memEntry) {
          const org = store.organizations.get(memEntry.organizationId);
          return response.status(200).json({ status: 'success', data: org });
        }
      }
      // Demo fallback
      if (request.user.role === 'ORGANIZATION') {
        response.status(200).json({ status: 'success', data: {
          id: 'org-demo-1',
          name: 'Stanford University Innovation Center',
          type: 'University',
          country: 'United States',
          verificationStatus: 'VERIFIED', // Make it verified for demo purposes
          verifiedAt: new Date().toISOString()
        }});
      } else {
        response.status(404).json({ status: 'error', message: 'No organization found' });
      }
    }
  });

  static getApplications = asyncHandler(async (request, response) => {
    // Stub for now, can return mock applications
    response.status(200).json({
      status: 'success',
      data: [
        { id: 'app-1', applicantName: 'Alex Rivera', challengeTitle: 'AI Climate Carbon Verification System', matchScore: '98%', status: 'PENDING' },
        { id: 'app-2', applicantName: 'Sarah Jenkins', challengeTitle: 'Smart Healthcare IoT Diagnostics', matchScore: '95%', status: 'PENDING' },
        { id: 'app-3', applicantName: 'Aiden Patel', challengeTitle: 'Autonomous Drone Fleet Optimization', matchScore: '91%', status: 'PENDING' },
      ]
    });
  });

  static createChallenge = asyncHandler(async (request, response) => {
    // Stub
    response.status(201).json({ status: 'success', message: 'Challenge created (Demo mode)' });
  });
}
