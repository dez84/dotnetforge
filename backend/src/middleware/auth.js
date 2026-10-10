import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.display_name },
    SECRET,
    { expiresIn: '7d' }
  );
}

// Populates req.user when a valid Bearer token is present. Does not reject.
export function attachUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, SECRET);
      req.user = { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      /* invalid/expired token — treated as anonymous */
    }
  }
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
