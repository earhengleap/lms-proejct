import Image from "next/image";

export const Logo = () => {
  return (
    <div className="items-center gap-x-2 hidden lg:flex hover:opacity-75 transition-opacity">
      <Image height={100} width={100} alt="logo" src={"/main-logo.png"} />
      {/* <div className="leading-tight">
        <p className="font-semibold text-base text-sky-700">
          Learn language with Pheasa
        </p>
        <p className="text-xs text-muted-foreground">
          Build your language skills
        </p>
      </div> */}
    </div>
  );
};
