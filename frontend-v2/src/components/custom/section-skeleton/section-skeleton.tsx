import styles from "./shimmer.module.css";

export function StatsSkeleton() {
  return (
    <div className="flex gap-2 h-6">
      {/* First group - 2 sections */}
      <div className={`flex-1 h-6 chart-box ${styles.shimmer}`}></div>
      <div className={`flex-1 h-6 chart-box ${styles.shimmer}`}></div>

      {/* Divider space */}
      <div className="w-2"></div>

      {/* Second group - 2 sections */}
      <div className={`flex-1 h-6 chart-box ${styles.shimmer}`}></div>
      <div className={`flex-1 h-6 chart-box ${styles.shimmer}`}></div>
    </div>
  );
}

export function TopChartsSkeleton() {
  return (
    <section className="charts-grid-top">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`chart-box min-h-52 ${styles.shimmer}`}></div>
      ))}
    </section>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="my-5 space-y-5">
      <div className="charts-grid">
        <div
          className={`chart-box ${styles.shimmer}`}
          style={{ maxHeight: "195px" }}
        ></div>
        <div
          className={`chart-box ${styles.shimmer}`}
          style={{ maxHeight: "195px" }}
        ></div>
      </div>

      <div className="charts-grid">
        <div
          className={`chart-box ${styles.shimmer}`}
          style={{ maxHeight: "195px" }}
        ></div>
        <div
          className={`chart-box ${styles.shimmer}`}
          style={{ maxHeight: "195px" }}
        ></div>
      </div>

      <div className="charts-grid">
        <div className={`chart-box ${styles.shimmer}`}></div>
        <div className={`chart-box ${styles.shimmer}`}></div>
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="my-5">
      <div className="flex items-baseline gap-1 align-middle mb-4">
        <h1 className="text-2xl opacity-30">Projects</h1>
      </div>
      <div className="w-full">
        <div className="three-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`project-card ${styles.shimmer}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GoalsSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`chart-box min-h-32 ${styles.shimmer}`}></div>
        ))}
      </div>
    </div>
  );
}

export function InvoicesSkeleton() {
  return (
    <div className="w-full">
      <div className={`h-96 rounded-lg ${styles.shimmer}`}></div>
    </div>
  );
}

export function PluginStatusSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`h-32 rounded-lg ${styles.shimmer}`}></div>
      ))}
    </div>
  );
}
