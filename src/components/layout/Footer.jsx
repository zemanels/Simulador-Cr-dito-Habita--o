export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-12 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400 text-center sm:text-left max-w-2xl leading-relaxed">
          Simulação meramente indicativa. Os valores são estimativas e não constituem proposta vinculativa.
        </p>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs text-gray-300">Aviso BdP n.º 4/2017</span>
        </div>
      </div>
    </footer>
  );
}
