export default function SuccessStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="next-step">
      <div className="ns-num">{number}</div>
      <div className="ns-text">
        <strong>{title}</strong>
        {text}
      </div>
    </div>
  );
}
