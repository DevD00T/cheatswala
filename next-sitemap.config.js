const siteUrl = 'https://www.cheatswala.net/'
const config = {
    siteUrl: process.env.SITE_URL || 'https://www.cheatswala.net',
    generateRobotsTxt: true,
    changefreq: 'daily',
    exclude: ['/404'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: ["/404"],
      },
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [
      `${siteUrl}sitemap-products.xml`,
      `${siteUrl}sitemap-categories.xml`,
    ],
  },
  }
  
 module.exports= config