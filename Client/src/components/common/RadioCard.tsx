export default function RadioCard({ selected, title, text, onClick }: { selected: boolean; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" className={`radio-opt ${selected ? 'selected' : ''}`} onClick={onClick}>
      <h4>{title}</h4>
      <p>{text}</p>
    </button>
  );
}
