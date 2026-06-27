function RecommendationCard({ title, description }) {
  return (
    <li className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
      <p className="text-sm font-semibold text-cyan-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </li>
  );
}

export default RecommendationCard;