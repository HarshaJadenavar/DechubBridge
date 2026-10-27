import type { MarketplaceCheckoutSelection, MarketplaceOrderDraft } from '../api/marketplace.api';
import UserMenu from '../components/common/UserMenu';

interface MarketplacePaymentPageProps {
  selection: MarketplaceCheckoutSelection | null;
  orderDraft: MarketplaceOrderDraft | null;
  isAuthenticated: boolean;
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  onNotifications: () => void;
  onLogin: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MarketplacePaymentPage({
  selection,
  orderDraft,
  isAuthenticated,
  userName,
  onBack,
  onLogout,
  onNotifications,
  onLogin,
}: MarketplacePaymentPageProps) {
  if (!selection || !orderDraft) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[780px] rounded-[28px] border border-[#e5e7eb] bg-white p-8 shadow-[0_24px_64px_rgba(17,24,39,0.08)]">
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#111827]">Payment details unavailable</h1>
          <p className="mt-3 text-[16px] leading-7 text-[#5b6472]">
            Your draft summary is missing. Please return to the consultation form and submit it again.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-[#111827] px-5 text-[15px] font-semibold text-white transition hover:bg-[#1f2937]"
          >
            Back to consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),transparent_28%),linear-gradient(180deg,#f8f6ff_0%,#ffffff_54%)]">
      <header className="border-b border-[#eceff3] bg-white/88 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[42px] items-center rounded-[12px] border border-[#dfe3e8] bg-white px-4 text-[13px] font-bold text-[#111827] transition hover:border-[#c8d0d9]"
          >
            ← Back to consultation
          </button>
          <div className="flex items-center gap-3 text-[14px] font-semibold text-[#4b5563]">
            {isAuthenticated ? (
              <UserMenu userName={userName} onLogout={onLogout} onNotifications={onNotifications} />
            ) : (
              <>
                <span>Guest company</span>
                <button type="button" className="mpc-login-button" onClick={onLogin}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-[1120px] gap-6 lg:grid-cols-[minmax(0,1.3fr)_380px]">
          <section className="rounded-[30px] border border-[#e9e5f8] bg-white p-7 shadow-[0_24px_64px_rgba(124,58,237,0.08)] md:p-9">
            <div className="inline-flex rounded-full bg-[#f4f1ff] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.18em] text-[#5b21b6]">
              Order draft ready
            </div>
            <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.04em] text-[#111827] md:text-[46px]">
              Payment page
            </h1>
            <p className="mt-3 max-w-[640px] text-[16px] leading-7 text-[#5b6472]">
              We&apos;ve saved your consultation brief and package selection. This page is ready for payment gateway integration and already carries the exact draft payload created from the form.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-[#eceff4] bg-[#fafbff] p-5">
                <div className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#7c8796]">Draft ID</div>
                <div className="mt-2 text-[20px] font-semibold text-[#111827]">{orderDraft.orderNumber}</div>
              </div>
              <div className="rounded-[20px] border border-[#eceff4] bg-[#fafbff] p-5">
                <div className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#7c8796]">Payment status</div>
                <div className="mt-2 text-[20px] font-semibold text-[#111827]">Pending</div>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#eceff4] bg-white p-6">
              <h2 className="text-[20px] font-semibold text-[#111827]">Project brief</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-[13px] font-semibold text-[#7c8796]">Company name</div>
                  <div className="mt-1 text-[16px] text-[#243447]">{orderDraft.clientDetails.companyName}</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#7c8796]">Company website</div>
                  <div className="mt-1 text-[16px] text-[#243447]">{orderDraft.clientDetails.companyWebsite}</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#7c8796]">Project type</div>
                  <div className="mt-1 text-[16px] text-[#243447]">{orderDraft.clientDetails.projectType}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[13px] font-semibold text-[#7c8796]">Project description</div>
                  <p className="mt-2 text-[16px] leading-7 text-[#243447]">{orderDraft.clientDetails.projectDescription}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[30px] border border-[#e9e5f8] bg-white p-7 shadow-[0_24px_64px_rgba(124,58,237,0.08)]">
            <div className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#7c8796]">Selected package</div>
            <div className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-[#111827]">{selection.package.name}</div>
            <div className="mt-1 text-[34px] font-semibold tracking-[-0.05em] text-[#111827]">
              {formatCurrency(selection.package.price, selection.currency)}
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[#5b6472]">{selection.package.description}</p>

            <div className="mt-5 flex flex-wrap gap-2 text-[13px] font-semibold text-[#6b7280]">
              <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-[#5b21b6]">{selection.package.deliveryDays} day delivery</span>
              <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-[#5b21b6]">{selection.package.revisions} revisions</span>
            </div>

            <div className="mt-6 rounded-[20px] border border-[#eceff4] bg-[#fafbff] p-5">
              <div className="text-[14px] font-semibold text-[#111827]">Freelancer</div>
              <div className="mt-2 text-[18px] font-semibold text-[#243447]">{selection.workerName}</div>
              <div className="text-[15px] text-[#5b6472]">{selection.workerRole}</div>
            </div>

            <div className="mt-6 rounded-[20px] border border-dashed border-[#d7dcea] bg-[#fbfcfe] p-5">
              <div className="text-[14px] font-semibold text-[#111827]">API-ready payment handoff</div>
              <p className="mt-2 text-[14px] leading-6 text-[#5b6472]">
                Use this draft ID to attach Stripe Checkout, Razorpay, or any custom payment intent flow without changing the consultation form contract.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
