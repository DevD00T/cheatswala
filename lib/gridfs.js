import clientPromise from '@/lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';

const GRIDFS_BUCKET_NAME = process.env.GRIDFS_BUCKET_NAME || 'productImages';

export const isValidMediaId = (id) => ObjectId.isValid(id);

const getBucketAndDb = async () => {
  const client = await clientPromise;
  const db = client.db();
  return {
    db,
    bucket: new GridFSBucket(db, { bucketName: GRIDFS_BUCKET_NAME }),
  };
};

export const getMediaFile = async (id) => {
  const { db } = await getBucketAndDb();
  const _id = new ObjectId(id);
  return db.collection(`${GRIDFS_BUCKET_NAME}.files`).findOne({ _id });
};

export const openDownloadStream = async (id) => {
  const { bucket } = await getBucketAndDb();
  return bucket.openDownloadStream(new ObjectId(id));
};
