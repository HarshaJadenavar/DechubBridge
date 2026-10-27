// export default function FeatureItem({ icon, tone, title, text }: { icon: string; tone: string; title: string; text: string }) {
//   return (
//     <div className="feature-item">
//       <div className={`feature-icon fi-${tone}`}>{icon}</div>
//       <div className="feature-text">
//         <h4>{title}</h4>
//         <p>{text}</p>
//       </div>
//     </div>
//   );
// }

interface FeatureItemProps {
  icon:  string;
  tone:  'green' | 'blue' | 'purple' | 'amber';
  title: string;
  text:  string;
}

const toneClass: Record<FeatureItemProps['tone'], string> = {
  green:  'fi-green',
  blue:   'fi-blue',
  purple: 'fi-purple',
  amber:  'fi-amber',
};

export default function FeatureItem({ icon, tone, title, text }: FeatureItemProps) {
  return (
    <div className="feature-item">
      <div className={`feature-icon ${toneClass[tone]}`} aria-hidden="true">
        {icon}
      </div>
      <div className="feature-text">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}