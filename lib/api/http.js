export const assertMethod = (req, res, allowedMethods = []) => {
  if (allowedMethods.includes(req.method)) {
    return true;
  }

  res.setHeader('Allow', allowedMethods);
  res.status(405).json({ message: 'Method not allowed' });
  return false;
};
