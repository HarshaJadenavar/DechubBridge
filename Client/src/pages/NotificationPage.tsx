interface NotificationPageProps {
  onBack: () => void;
}

export default function NotificationPage({ onBack }: NotificationPageProps) {
  return (
    <div className="notifications-root">
      <header className="notifications-topbar">
        <button type="button" className="notifications-back" onClick={onBack}>
          ← Back to marketplace
        </button>
      </header>
      <main className="notifications-shell">
        <section className="notifications-card">
          <h1>Notifications</h1>
          <p className="notifications-empty">
            You don&apos;t have any notifications yet. When updates arrive, they will appear here.
          </p>
        </section>
      </main>
    </div>
  );
}
