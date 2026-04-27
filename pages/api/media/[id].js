import {
  getMediaFile,
  isValidMediaId,
  openDownloadStream,
} from '@/lib/gridfs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id || !isValidMediaId(id)) {
    res.status(400).json({ message: 'Invalid media id.' });
    return;
  }

  const file = await getMediaFile(id);
  if (!file) {
    res.status(404).json({ message: 'File not found.' });
    return;
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
}
