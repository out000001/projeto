import PropTypes from 'prop-types';
export default function TrackingProgress({label, value, detail}) {
  const bounded = Math.max(0, Math.min(100, value));
  return <div>
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm leading-relaxed">
      <span className="font-semibold">{label}</span>
      <span className="tabular-nums text-on-surface-variant">{detail}</span>
    </div>
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={bounded} aria-valuetext={detail} className="h-2 overflow-hidden rounded-full bg-surface-container-high">
      <div className="h-full rounded-full bg-primary" style={{width: `${bounded}%`}} />
    </div>
  </div>;
}
TrackingProgress.propTypes = {label: PropTypes.string.isRequired, value: PropTypes.number.isRequired, detail: PropTypes.string.isRequired};
