import ModeToggle from './ModeToggle';

export default function Header() {
  return (
    <header className="bg-brand-primary shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight truncate tracking-tight">
              Simulador de Crédito Habitação
            </h1>
            <p className="text-white/45 text-[11px] hidden md:block tracking-wide">
              Simulação meramente indicativa
            </p>
          </div>
        </div>

        <ModeToggle />
      </div>
    </header>
  );
}
