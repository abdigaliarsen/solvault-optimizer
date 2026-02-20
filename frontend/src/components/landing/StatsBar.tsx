const stats = [
  { label: "Total Value Locked", value: "$12.4M" },
  { label: "Current APY", value: "8.72%" },
  { label: "Total Users", value: "3,241" },
  { label: "Protocols Integrated", value: "5" },
];

const StatsBar = () => {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 py-10">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold gradient-text">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
