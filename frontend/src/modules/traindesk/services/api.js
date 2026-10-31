import { api } from '../../../services/api.js';

export const fetchTrainers = async () => {
  return await api.getTrainers();
};

export const fetchDashboardSchedule = async (trainerId, dayOffset = 0, date = null) => {
  return await api.getDashboardSchedule(trainerId, dayOffset, date);
};

export const fetchHeatmapSchedule = async (trainerId) => {
  return await api.getHeatmapSchedule(trainerId);
};

export const fetchSessionAttendees = async (sessionId) => {
  return await api.getSessionAttendees(sessionId);
};

export default {
  fetchTrainers,
  fetchDashboardSchedule,
  fetchHeatmapSchedule,
  fetchSessionAttendees,
};

