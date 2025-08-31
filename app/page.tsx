import IngestButton from 'components/IngestButton';
import AgentForm from '../components/AgentForm';
import Logo from '../components/Logo';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Top bar with logo and ingestion button */}
      <div className="mb-2 flex flex-col items-center">
        <Logo size={80} />
          <div className="w-full flex justify-end mt-4">
          <section className="rounded-lg border bg-white p-2 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                className="cursor-not-allowed rounded-sm border border-gray-300 bg-gray-200 px-5 py-2 text-gray-500"
                disabled
              >
                Click to start Ingestion Process
              </button>
              <IngestButton />
            </div>
          </section>
        </div>
      </div>
      {/* Main card */}
      <div className="rounded-3xl border border-[#D1D9E6] bg-white p-6 shadow-lg">
        <AgentForm />
      </div>
    </main>
  );
}