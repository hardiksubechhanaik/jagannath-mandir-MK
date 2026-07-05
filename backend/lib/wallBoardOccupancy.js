import RathWallPhoto from '../models/RathWallPhoto.js';
import { countApprovedSankalps } from './sankalpStore.js';
import { countApprovedDiyas } from './diyaStore.js';

export async function getLiveBoardOccupancy() {
  const photoCount = await RathWallPhoto.countDocuments({ status: 'approved' });
  return photoCount + countApprovedSankalps() + countApprovedDiyas();
}
