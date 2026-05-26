type Order = {
  code: string;
  phone: string;
  total_cents: number;
  status: string;
  created_at: string;
};

type Item = {
  name: string;
  qty: number;
  price_cents: number;
};

export function TicketView({
  order,
  items,
}: {
  order: Order;
  items: Item[];
}) {
  const isPaid = order.status === "paid";

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div
          className={`px-6 py-10 text-center border-b border-neutral-200 ${
            isPaid ? "bg-emerald-50/60" : "bg-amber-50/40"
          }`}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 font-medium">
            Pickup code
          </p>
          <p
            className={`font-mono text-5xl font-semibold tracking-[0.2em] mt-3 ${
              isPaid ? "text-emerald-800" : "text-neutral-900"
            }`}
          >
            {order.code}
          </p>
          <div
            className={`mt-6 inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1 ${
              isPaid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPaid ? "bg-green-600" : "bg-amber-500"
              }`}
            />
            {isPaid ? "Paid" : "Waiting for payment"}
          </div>
        </div>

        <div className="px-6 py-5">
          <h3 className="text-xs uppercase tracking-wider font-medium text-neutral-500 mb-3">
            Items
          </h3>
          <ul className="space-y-2 text-sm">
            {items.map((i, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="text-neutral-700">
                  <span className="text-neutral-900 font-medium">{i.qty}×</span>{" "}
                  {i.name}
                </span>
                <span className="tabular-nums text-neutral-900">
                  NLe {((i.price_cents * i.qty) / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-semibold tabular-nums">
              NLe {(order.total_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 text-center">
          <p className="text-xs text-neutral-600">
            Show this code at the kitchen counter.
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">{order.phone}</p>
        </div>
      </div>
    </div>
  );
}
