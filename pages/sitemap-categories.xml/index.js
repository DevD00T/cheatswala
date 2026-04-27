import { getServerSideSitemapLegacy } from "next-sitemap";

import mongooseConnect from "@/lib/mongoose";
import { Category } from "@/models/Category";

const siteUrl = 'https://www.cheatswala.net/'
export const getServerSideProps = async (ctx) => {
    await mongooseConnect();
    const categories = (await Category.find({})) || [];
    
  const newsSitemaps = categories.map((item) => ({
    loc: `${siteUrl}category/${item.name}`,
    lastmod: new Date(item.updatedAt || item.createdAt).toISOString(),
    changefreq:'daily',
    priority:'0.7'
  }));

  const fields = [...newsSitemaps];

  return getServerSideSitemapLegacy(ctx, fields);
};

export default function Site() {}