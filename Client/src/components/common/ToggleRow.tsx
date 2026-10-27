export default function ToggleRow({ title, text, checked, onChange, last = false }: { title: string; text: string; checked: boolean; onChange: (checked: boolean) => void; last?: boolean }) {
  return (
    <div className={`toggle-wrap ${last ? 'last' : ''}`}>
      <div className="toggle-info">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
    </div>
  );
}
