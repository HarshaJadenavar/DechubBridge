export default function Tooltip({ text }: { text: string }) {
  return (
    <span className="tooltip">
      <span className="tooltip-icon">?</span>
      <span className="tooltip-box">{text}</span>
    </span>
  );
}
