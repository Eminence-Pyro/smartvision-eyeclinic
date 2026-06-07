"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const CATEGORIES = ["All","Cataract","Glaucoma","Retina","Eye Health","Surgery","Technology"];

const POSTS = [
  { slug:"phacoemulsification-guide", cat:"Cataract", title:"What to Expect from Phacoemulsification Surgery", excerpt:"Modern cataract surgery is one of the safest procedures in medicine. Here's a complete guide to what happens before, during, and after your procedure.", img:"https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=700&q=80", date:"June 2, 2026", read:"5 min", featured:true },
  { slug:"glaucoma-silent-thief",     cat:"Glaucoma", title:"The Silent Thief: Understanding Glaucoma", excerpt:"Glaucoma causes no pain and no early symptoms. By the time you notice vision loss, significant damage may have already occurred. Early detection saves sight.", img:"https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=700&q=80", date:"May 28, 2026", read:"4 min", featured:false },
  { slug:"5-signs-see-eye-doctor",    cat:"Eye Health", title:"5 Signs You Need to See an Eye Doctor Today", excerpt:"Many people delay seeking eye care until vision is severely affected. Don't wait — these warning signs mean you need to act now.", img:"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80", date:"May 20, 2026", read:"3 min", featured:false },
  { slug:"diabetic-eye-disease",      cat:"Retina",  title:"Diabetic Eye Disease: What Every Diabetic Must Know", excerpt:"Diabetic retinopathy is the leading cause of blindness in working-age adults. Annual eye exams are essential if you have diabetes.", img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&q=80", date:"May 12, 2026", read:"6 min", featured:false },
  { slug:"childrens-eye-health",      cat:"Eye Health", title:"Children's Eye Health: What Parents Need to Know", excerpt:"Undetected vision problems can significantly affect a child's learning and development. Here's how to protect your child's eyesight.", img:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80", date:"May 5, 2026", read:"4 min", featured:false },
  { slug:"smartvision-digital-clinic",cat:"Technology", title:"How SmartVision is Changing Eye Care in Nigeria", excerpt:"We launched SmartVision — Nigeria's first fully digital ophthalmology management platform. Here's what it means for our patients.", img:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80", date:"April 28, 2026", read:"7 min", featured:false },
];

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="relative pt-24 pb-20 bg-[url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1800&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 to-brand-800/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <p className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-3">Knowledge Centre</p>
          <h1 className="font-serif font-black text-5xl text-white mb-4">Eye Health Blog</h1>
          <p className="text-white/70 max-w-xl text-lg">Expert insights on eye conditions, treatments, and protecting your vision for life.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-12">
          {CATEGORIES.map(c => (
            <button key={c} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${c === "All" ? "brand-gradient text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <div className="mb-12 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 card-hover">
            <div className="relative aspect-video lg:aspect-auto overflow-hidden">
              <Image src={featured.img} alt={featured.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="brand-gradient text-white text-xs font-bold px-3 py-1 rounded-full">{featured.cat}</span>
                <span className="text-xs text-gray-400 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Featured</span>
              </div>
              <h2 className="font-serif font-black text-3xl text-gray-900 mb-3 leading-snug">{featured.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-5">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">{featured.date} · {featured.read} read</div>
                <Link href={`/blog/${featured.slug}`} className="brand-gradient text-white rounded-full px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-all">
                  Read Article →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover hover:shadow-xl">
              <div className="relative aspect-video overflow-hidden">
                <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <span className="text-xs font-bold text-brand bg-brand-50 px-3 py-1 rounded-full">{post.cat}</span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 leading-snug group-hover:text-brand transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>{post.date}</span>
                  <span className="text-brand font-semibold group-hover:underline">{post.read} read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
