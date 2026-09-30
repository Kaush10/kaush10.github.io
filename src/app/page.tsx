import { UnicornScene } from "@/components/unicorn-scene";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-black">
      <section className="relative h-svh w-full">
        <UnicornScene
          projectId="P9NQwwDyqpdo8M1mJg53"
          label="hey, its kaush"
          className="absolute inset-0"
        />
      </section>
    </main>
  );
}
