export const metadata = {
  title: "About | Wakana",
  description:
    "Learn about Wakana - an open source, self-hosted alternative to WakaTime for developer time tracking.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">About Wakana</h1>

      <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
        <p>
          The goal of this project is to provide a self-hosted version of
          wakatime.com that is open source and free to use. We rely on the same
          open source plugins and collect the same data that is available from
          the plugins.
        </p>

        <p>
          Unlike some of the open source alternatives, we aim for feature parity
          with wakatime first and foremost. We start with a focus on individual
          features and then proceed towards enterprise/organizational features.
        </p>

        <p>
          The managed version of this website is only available to paying
          customers to help fund the continued work on this project.
        </p>

        <p>
          Work on this project was sped up by the open source project at{" "}
          <a
            href="https://github.com/muety/wakapi"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wakapi
          </a>
          . We are grateful for their work. We wouldn't have built this quickly
          without starting off of that base source code. It was minimal but
          thoughtful and was still packed with a ton of features.
        </p>
      </div>
    </div>
  );
}
