
export default async function handler(req, res) {
    // Check for secret to confirm this is a valid request
    if (req.query.secret !== process.env.INCREMENTAL_STATIC_GENERATION) {
      return res.status(401).json({ message: 'Invalid token' })
    }
     
    try {
      // this should be the actual path not a rewritten path
      // e.g. for "/blog/[slug]" this should be "/blog/post-1"
      const type = req.body.data.__typename;
      if(type==='Post'){
        
        await res.revalidate(`/blog/${req.body.data.slug}`)
        return res.json({ revalidated: true })
      }
    } catch (err) {
      // If there was an error, Next.js will continue
      // to show the last successfully generated page
      console.log(err)
      return res.status(500).send('Error revalidating')
    }
  }