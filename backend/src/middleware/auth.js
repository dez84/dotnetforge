import jwt from 'jsonwebtoken';

// Read lazily so tests (and late-loaded .env files) can set JWT_SECRET first.
const getSecret = () => process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.display_name },
    getSecret(),
    { expiresIn: '7d' }
  );
}

// Populates req.user when a valid Bearer token is present. Does not reject.
export function attachUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, getSecret());
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
