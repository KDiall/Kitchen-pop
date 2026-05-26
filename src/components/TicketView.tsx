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
    <main className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Pickup code
          </p>
          <p className="font-mono text-4xl font-bold tracking-widest mt-2">
            {order.code}
          </p>
        </div>
        <div
          className={`mt-4 text-center text-sm rounded-lg py-2 ${
            isPaid
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isPaid ? "Paid — see you at pickup" : "Waiting for payment…"}
        </div>
        <ul className="mt-5 space-y-1 text-sm">
          {items.map((i, idx) => (
            <li key={idx} className="flex justify-between">
              <span>
                {i.qty}× {i.name}
              </span>
              <span>
                NLe {((i.price_cents * i.qty) / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-3 border-t flex justify-between font-semibold">
          <span>Total</span>
          <span>NLe {(order.total_cents / 100).toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Show this code at pickup.
        </p>
      </div>
    </main>
  );
}
