export const setAuthSession = (req, user) => {
  req.session.user = {
    id: user.id,
    role: user.role,
    email: user.email,
  };
};