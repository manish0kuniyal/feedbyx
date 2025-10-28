export default function Footer() {
  return (
    <footer className="mt-24 py-10 text-gray-400 text-sm text-center relative z-10  backdrop-blur-xl">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
        <p>© 2025 Feedbyx. All rights reserved.</p>

        <a
          href="mailto:info@feedbyx.com"
          className="px-5 py-2 underline text-white font-medium hover:text-[var(--blue)]  transition"
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
}
