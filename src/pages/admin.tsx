import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

const AdminPage: React.FC<PageProps> = () => {
  React.useEffect(() => {
    const existingScript = document.getElementById("decap-cms-script")

    if (existingScript) {
      return
    }

    const script = document.createElement("script")
    script.id = "decap-cms-script"
    script.src = "https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"
    script.async = true

    document.body.appendChild(script)
  }, [])

  return <main>Decap CMS wird geladen…</main>
}

export default AdminPage

export const Head: HeadFC = () => (
  <>
    <html lang="de" />
    <title>Rathausgalerien CMS</title>
    <meta name="robots" content="noindex" />
  </>
)
