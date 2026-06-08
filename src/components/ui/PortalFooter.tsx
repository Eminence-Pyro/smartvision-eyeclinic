export default function PortalFooter() {
  return (
    <footer className="mt-auto py-5 px-6 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Anya Specialist Eye Clinic · SmartVision Platform</p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a href="/" className="hover:text-brand transition-colors">Public Website</a>
          <a href="/contact" className="hover:text-brand transition-colors">Contact</a>
          <span className="text-gray-200 hidden sm:inline">|</span>
          <span className="text-gray-300">Support: admin@anya.com</span>
        </div>
      </div>
    </footer>
  );
}
