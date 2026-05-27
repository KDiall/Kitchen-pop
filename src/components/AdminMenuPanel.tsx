"use client";

import { useState, useEffect } from "react";

type MenuItem = {
  id: string;
  name: string;
  price_cents: number;
  available: boolean;
};

type PastDish = { name: string; price_cents: number };

type Props = {
  initialMenuId: string | null;
  initialCutoffAt: string | null;
  initialItems: MenuItem[];
};

function localTimeStr(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isoToCutoffInput(isoStr: string) {
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function cutoffIsoFromTime(hhmm: string) {
  const today = new Date().toISOString().slice(0, 10);
  return new Date(`${today}T${hhmm}:00`).toISOString();
}

export function AdminMenuPanel({ initialMenuId, initialCutoffAt, initialItems }: Props) {
  const [menuId, setMenuId] = useState<string | null>(initialMenuId);
  const [cutoffAt, setCutoffAt] = useState<string | null>(initialCutoffAt);
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  const [cutoffInput, setCutoffInput] = useState("23:59");
  const [editingCutoff, setEditingCutoff] = useState(false);
  const [savingCutoff, setSavingCutoff] = useState(false);

  const [publishing, setPublishing] = useState(false);

  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [pastDishes, setPastDishes] = useState<PastDish[]>([]);
  const [addingPast, setAddingPast] = useState<string | null>(null);

  const isExpired = cutoffAt ? new Date() >= new Date(cutoffAt) : false;

  useEffect(() => {
    if (initialCutoffAt) setCutoffInput(isoToCutoffInput(initialCutoffAt));
    fetch("/api/admin/past-items")
      .then((r) => r.json())
      .then((d) => { if (d.items) setPastDishes(d.items); })
      .catch(() => {});
  }, [initialCutoffAt]);

  const openMenu = async () => {
    setPublishing(true);
    const res = await fetch("/api/admin/publish-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cutoffIso: cutoffIsoFromTime(cutoffInput) }),
    });
    const data = await res.json();
    if (data.ok) {
      setMenuId(data.menuId);
      setCutoffAt(data.cutoffAt);
    }
    setPublishing(false);
  };

  const saveCutoff = async () => {
    if (!menuId) return;
    setSavingCutoff(true);
    const cutoffIso = cutoffIsoFromTime(cutoffInput);
    await fetch("/api/admin/publish-menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, cutoffIso }),
    });
    setCutoffAt(cutoffIso);
    setSavingCutoff(false);
    setEditingCutoff(false);
  };

  const doAddItem = async (name: string, price_cents: number) => {
    const res = await fetch("/api/admin/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu_id: menuId, name, price_cents }),
    });
    const data = await res.json();
    if (data.item) setItems((p) => [...p, data.item]);
    return data.item ?? null;
  };

  const addItem = async () => {
    setAddError("");
    if (!addName.trim()) { setAddError("Enter a dish name."); return; }
    const parsed = parseFloat(addPrice);
    if (!addPrice || isNaN(parsed) || parsed <= 0) { setAddError("Enter a valid price."); return; }
    setAdding(true);
    const item = await doAddItem(addName.trim(), Math.round(parsed * 100));
    if (!item) setAddError("Failed to add. Try again.");
    else { setAddName(""); setAddPrice(""); }
    setAdding(false);
  };

  const addFromPast = async (dish: PastDish) => {
    if (!menuId) return;
    if (items.some((i) => i.name === dish.name)) return;
    setAddingPast(dish.name);
    await doAddItem(dish.name, dish.price_cents);
    setAddingPast(null);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice((item.price_cents / 100).toFixed(2));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const parsed = parseFloat(editPrice);
    if (!editName.trim() || isNaN(parsed) || parsed <= 0) return;
    setSaving(true);
    await fetch(`/api/admin/menu-items/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), price_cents: Math.round(parsed * 100) }),
    });
    setItems((p) =>
      p.map((i) =>
        i.id === editingId
          ? { ...i, name: editName.trim(), price_cents: Math.round(parsed * 100) }
          : i
      )
    );
    setSaving(false);
    setEditingId(null);
  };

  const toggleAvailable = async (item: MenuItem) => {
    setTogglingId(item.id);
    await fetch(`/api/admin/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    setItems((p) => p.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)));
    setTogglingId(null);
  };

  const deleteItem = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((i) => i.id !== id));
    setDeletingId(null);
  };

  const availablePast = pastDishes.filter((d) => !items.some((i) => i.name === d.name));

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Today&apos;s menu</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {menuId
              ? items.length === 0
                ? "Menu is live — add dishes below so customers can order."
                : `${items.filter((i) => i.available).length} of ${items.length} dishes visible to customers.`
              : "No menu yet for today — open service to start."}
          </p>
        </div>

        {menuId ? (
          <div className="shrink-0 text-right">
            {isExpired ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
                ⚠ Ordering closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1.5 rounded-full">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                Live · Orders open
              </span>
            )}
            <div className="mt-1.5 text-xs text-stone-500">
              {editingCutoff ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-stone-400">Cutoff:</span>
                  <input
                    type="time"
                    value={cutoffInput}
                    onChange={(e) => setCutoffInput(e.target.value)}
                    className="border border-stone-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300"
                  />
                  <button
                    onClick={saveCutoff}
                    disabled={savingCutoff}
                    className="text-orange-700 font-semibold hover:text-orange-800 disabled:opacity-60"
                  >
                    {savingCutoff ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditingCutoff(false)} className="text-stone-400 hover:text-stone-600">
                    Cancel
                  </button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  Cutoff: {cutoffAt ? localTimeStr(cutoffAt) : "—"}
                  <button
                    onClick={() => setEditingCutoff(true)}
                    className="text-orange-700 hover:text-orange-800 font-medium"
                  >
                    Change
                  </button>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">Orders close at</label>
              <input
                type="time"
                value={cutoffInput}
                onChange={(e) => setCutoffInput(e.target.value)}
                className="border border-stone-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <button
              onClick={openMenu}
              disabled={publishing}
              className="text-sm rounded-md px-5 py-2 font-medium bg-orange-700 text-white hover:bg-orange-800 shadow-sm transition-all disabled:opacity-60"
            >
              {publishing ? "Opening…" : "Open today's service"}
            </button>
          </div>
        )}
      </div>

      {menuId && (
        <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">

          {/* Past dishes quick-add */}
          {availablePast.length > 0 && (
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-400 font-semibold mb-2.5">
                From your menu history — click to add instantly
              </p>
              <div className="flex flex-wrap gap-2">
                {availablePast.map((dish) => (
                  <button
                    key={dish.name}
                    onClick={() => addFromPast(dish)}
                    disabled={addingPast === dish.name}
                    className="inline-flex items-center gap-1.5 text-xs rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {addingPast === dish.name ? (
                      <span className="opacity-60">Adding…</span>
                    ) : (
                      <>
                        <span>+ {dish.name}</span>
                        <span className="text-stone-400 tabular-nums">NLe {(dish.price_cents / 100).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current items list */}
          {items.length > 0 && (
            <ul className="divide-y divide-stone-100">
              {items.map((item) =>
                editingId === item.id ? (
                  <li key={item.id} className="px-5 py-3 bg-orange-50/40">
                    <div className="flex items-center gap-3">
                      <input
                        className="flex-1 text-sm border border-stone-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      />
                      <div className="flex items-center gap-1.5 border border-stone-300 rounded-md px-3 py-1.5 bg-white">
                        <span className="text-[11px] text-stone-400 font-semibold uppercase">NLe</span>
                        <input
                          className="w-20 text-sm focus:outline-none tabular-nums"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        />
                      </div>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="text-sm px-3 py-1.5 rounded-md bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-sm text-stone-400 hover:text-stone-600 px-1">
                        Cancel
                      </button>
                    </div>
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${item.available ? "" : "opacity-50"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                      <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                        NLe {(item.price_cents / 100).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAvailable(item)}
                      disabled={togglingId === item.id}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 transition-all ${
                        item.available
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-500 ring-stone-200 hover:bg-stone-200"
                      }`}
                    >
                      {item.available ? "Visible" : "Hidden"}
                    </button>
                    <button onClick={() => startEdit(item)} className="text-xs text-stone-400 hover:text-orange-700 font-medium px-2 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={deletingId === item.id}
                      className="text-xs text-stone-400 hover:text-red-600 font-medium px-2 transition-colors disabled:opacity-50"
                    >
                      {deletingId === item.id ? "…" : "Delete"}
                    </button>
                  </li>
                )
              )}
            </ul>
          )}

          {/* Add new dish */}
          <div className={`px-5 py-4 ${items.length > 0 ? "border-t border-stone-100 bg-stone-50/60" : ""}`}>
            <p className="text-[11px] uppercase tracking-[0.15em] text-stone-400 font-semibold mb-3">
              Add new dish
            </p>
            <div className="flex items-start gap-3">
              <input
                className="flex-1 text-sm border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white placeholder-stone-400"
                placeholder="Dish name"
                value={addName}
                onChange={(e) => { setAddName(e.target.value); setAddError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
              <div className="flex items-center gap-1.5 border border-stone-200 rounded-md px-3 py-2 bg-white">
                <span className="text-[11px] text-stone-400 font-semibold uppercase shrink-0">NLe</span>
                <input
                  className="w-20 text-sm focus:outline-none tabular-nums placeholder-stone-400"
                  placeholder="0.00"
                  value={addPrice}
                  onChange={(e) => { setAddPrice(e.target.value); setAddError(""); }}
                  type="number"
                  min="0"
                  step="0.01"
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
              </div>
              <button
                onClick={addItem}
                disabled={adding}
                className="text-sm rounded-md px-4 py-2 font-medium bg-orange-700 text-white hover:bg-orange-800 shadow-sm transition-all disabled:opacity-60 shrink-0"
              >
                {adding ? "Adding…" : "+ Add"}
              </button>
            </div>
            {addError && <p className="text-xs text-red-600 mt-2">{addError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
