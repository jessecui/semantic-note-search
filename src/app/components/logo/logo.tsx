import Image from "next/image";
import React from "react";

import "./logo.css";

const Logo = () => {
  return (
    <>
      <Image
        className="light-only"
        src="/crux-logo.png"
        alt="Crux Logo"
        width={90}
        height={30}
        priority
      />
      <Image
        className="dark-only"
        src="/crux-logo-dark.png"
        alt="Crux Logo"
        width={90}
        height={30}
        priority
      />
    </>
  );
};

export default Logo;
