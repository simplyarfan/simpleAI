export const healthAPI = {
  check: () => axios.get('https://thesimpleai.vercel.app/health') // Direct call since this doesn't use /api prefix
};
