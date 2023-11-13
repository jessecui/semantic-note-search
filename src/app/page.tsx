import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Image
        src="/crux-logo.png"
        alt="Crux Logo"
        width={100}
        height={33}
        priority
      />
      <h1>Turn your ideas into publishable content.</h1>
      <p>
        Crux is an app designed to organize your ideas in a simple and smart
        way, helping you create better content faster
      </p>
      <a href="/dashboard">Get started</a>
    </main>
  );
}
