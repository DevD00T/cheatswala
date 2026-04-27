import {
  getMediaFile,
  isValidMediaId,
  openDownloadStream,
} from '@/lib/gridfs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id || !isValidMediaId(id)) {
    return res.status(400).json({ message: 'Invalid media id.' });
  }

  const file = await getMediaFile(id);
  if (!file) {
    return res.status(404).json({ message: 'File not found.' });
  }

  res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
  res.setHeader('Content-Length', file.length.toString());
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  const downloadStream = await openDownloadStream(id);
  downloadStream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ message: 'File not found.' });
    } else {
      res.end();
    }
  });

  downloadStream.pipe(res);
  return;
}
