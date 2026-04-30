export default function Home() {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden bg-mist">
      <div
        aria-hidden
        className="absolute inset-0 bg-mist"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 30% 40%, rgba(138,111,90,0.18), transparent 60%)',
        }}
      />
      <div className="relative z-10 max-w-content mx-auto px-6 pt-[clamp(96px,16vw,220px)] pb-24">
        <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-6">Sweet Pea Photography</p>
        <h1 className="font-serif text-t-48 md:text-t-64 max-w-prose">
          Heirlooms, in modern light.
        </h1>
      </div>
    </section>
  );
}
