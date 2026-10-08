import CameraIcon from "@/components/icons/CameraIcon";
import VisualSearchTrigger from "@/components/search/VisualSearchTrigger";

/**
 * @param {{
 *   onVisualFileSelect: (file: File) => void,
 * }} props
 */
export default function HeroBanner({
  onVisualFileSelect,
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <div className="relative min-h-[380px] w-full overflow-hidden rounded-3xl bg-[#231f20] shadow-2xl shadow-rose-200/50 sm:min-h-[430px]">
        <img
          src="/marketplace-hero.jpg"
          alt="Friends enjoying a fashion shopping trip"
          className="absolute inset-0 h-full w-full object-cover object-center sm:object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#211c1d] via-[#211c1d]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="relative z-10 flex min-h-[380px] max-w-2xl flex-col justify-center px-7 py-10 text-white sm:min-h-[430px] sm:px-12 lg:px-16">
          <span className="w-fit rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
            The style event
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            More style.
            <span className="block text-[#ffb2c2]">Better finds.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base">
            Fresh fashion, everyday prices, and visual search that helps you find
            the look you already have in mind.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#2b2422] transition hover:bg-[#ffedf1]"
            >
              Shop new arrivals
            </a>
            <VisualSearchTrigger
              onSelect={onVisualFileSelect}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <CameraIcon className="h-4 w-4" />
              Find it with a photo
            </VisualSearchTrigger>
          </div>
          <div className="mt-8 flex items-center gap-5 text-xs font-semibold text-white/75">
            <span>New drops weekly</span>
            <span className="h-1 w-1 rounded-full bg-white/60" />
            <span>100+ catalog pieces</span>
          </div>
        </div>
      </div>
    </section>
  );
}
