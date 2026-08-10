import BlogList from "../../componentes/blog/BlogList";
import PageSection from "../../componentes/layout/PageSection";
import blogEntries from "../../data/blog.json";

function BlogPage() {
  return (
    <PageSection center={false} className="blog-page">
      <BlogList entradas={blogEntries} />
    </PageSection>
  );
}

export default BlogPage;
