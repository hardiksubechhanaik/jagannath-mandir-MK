import asyncHandler from 'express-async-handler';
import {
  createDivyangRequest,
  dismissDivyangRequest,
  listPendingDivyangRequests,
} from '../lib/divyangAssistStore.js';

export const submitDivyangRequest = asyncHandler(async (req, res) => {
  const phone = String(req.body?.phone ?? '').trim();
  if (phone.length < 6) {
    res.status(400);
    throw new Error('Please enter a valid phone number');
  }

  const request = createDivyangRequest(phone);
  res.status(201).json({ message: 'Assistance request submitted', request });
});

export const listVolunteerDivyangRequests = asyncHandler(async (_req, res) => {
  res.json({ requests: listPendingDivyangRequests() });
});

export const dismissVolunteerDivyangRequest = asyncHandler(async (req, res) => {
  const result = dismissDivyangRequest(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error('Request not found');
  }
  res.json({ message: 'Request marked as assisted', request: result });
});
