const logoSrc = "/images/brntpnt.jpg";

function AppLogo({ className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <img
        alt="TheBurntPeanut Bingo logo"
        className="size-24 rounded-full border-2 border-yellow-300 object-cover shadow-lg shadow-black/30 sm:size-28"
        src={logoSrc}
      />
      <h1 className="text-3xl font-bold sm:text-4xl">
        TheBurntPeanut Bingo
      </h1>
    </div>
  );
}

export default AppLogo;
