import { getServerSideSitemapLegacy } from "next-sitemap";
import { Product } from "@/models/Product";
import mongooseConnect from "@/lib/mongoose";

const siteUrl = 'https://www.cheatswala.net/'
export const getServerSideProps = async (ctx) => {
    await mongooseConnect();
    const products = (await Product.find({}).select('-keyList -secret')) || [];
    
  const newsSitemaps = products.map((item) => ({
    loc: `${siteUrl}product/${item.slug}`,
    lastmod: new Date(item.updatedAt || item.createdAt).toISOString(),
    changefreq:'daily',
    priority:'0.7'
  }));

  const fields = [...newsSitemaps];

  return getServerSideSitemapLegacy(ctx, fields);
};

export default function Site() {}