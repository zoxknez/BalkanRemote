// server-only
export function assertAdminToken(req: Request) {
  const token = req.headers.get('x-admin-token');
  if (!token || token !== process.env.ADMIN_INGEST_TOKEN) {
    const e = new Error('Unauthorized');
    // annotate with status for route handlers to use
    (e as unknown as { status?: number }).status = 401;
    throw e;
  }
}
