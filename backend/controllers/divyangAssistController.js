import asyncHandler from 'express-async-handler';
import {
  createDivyangRequest,
  dismissDivyangRequest,
  listPendingDivyangRequests,
} from '../lib/divyangAssistStore.js';
import { isValidIndianMobile, sanitizeIndianMobileDigits } from '../lib/validators.js';

export const submitDivyangRequest = asyncHandler(async (req, res) => {
  const phone = sanitizeIndianMobileDigits(req.body?.phone);
  if (!isValidIndianMobile(phone)) {
    res.status(400);
    throw new Error('Enter a valid 10-digit mobile number starting with 5, 6, 7, 8, or 9');
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
