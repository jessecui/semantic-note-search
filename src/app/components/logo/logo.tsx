import Image from "next/image";
import React from "react";

import "./logo.css";

const Logo = () => {
  return (
    <>
      <Image
        className="light-only"
        src="/notesearch-logo.png"
        alt="NoteSearch Logo"
        width={163}
        height={30}
        priority
      />
      <Image
        className="dark-only"
        src="/notesearch-logo-dark.png"
        alt="NoteSearch Logo"
        width={163}
        height={30}
        priority
      />
    </>
  );
};

export default Logo;
