import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'base', 'sauce', 'cheese', 'veggie', 'meat'];
const CAT_ICONS = { base: '🫓', sauce: '🍅', cheese: '🧀', veggie: '🥦', meat: '🍗' };

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [restockAll, setRestockAll] = useState(false);

  const fetchInventory = useCallback(() => {
    const params = category !== 'all' ? `?category=${category}` : '';
    return api.get(`/inventory${params}`)
      .then(res => { setItems(res.data.items); setSummary(res.data.summary); })
      .catch(console.error);
  }, [category]);

  useEffect(() => {
    setLoading(true);
    fetchInventory().finally(() => setLoading(false));
  }, [fetchInventory]);

  const startEdit = (item) => {
    setEditItem(item._id);
    setEditForm({ quantity: item.quantity, threshold: item.threshold, price: item.price, description: item.description });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/inventory/${editItem}`, editForm);
      toast.success('Item updated!');
      setEditItem(null);
      fetchInventory();
    } catch {
      toast.error('Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const quickRestock = async (id, amount = 50) => {
    try {
      await api.post('/inventory/restock', { items: [{ id, quantity: amount }] });
      toast.success(`Restocked +${amount} units`);
      fetchInventory();
    } catch {
      toast.error('Restock failed');
    }
  };

  const restockAllLow = async () => {
    const lowItems = items.filter(i => i.quantity <= i.threshold);
    if (lowItems.length === 0) return toast.success('No low stock items!');
    setRestockAll(true);
    try {
      await api.post('/inventory/restock', { items: lowItems.map(i => ({ id: i._id, quantity: 100 })) });
      toast.success(`Restocked ${lowItems.length} items (+100 each)`);
      fetchInventory();
    } catch {
      toast.error('Restock failed');
    } finally {
      setRestockAll(false);
    }
  };

  const getStockColor = (item) => {
    if (item.quantity === 0) return 'var(--red)';
    if (item.quantity <= item.threshold) return 'var(--gold)';
    return 'var(--green)';
  };

  const getStockLabel = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.threshold) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>Inventory Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track and manage all pizza ingredients</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={restockAllLow} className="btn btn-secondary" disabled={restockAll} style={{ fontSize: 13 }}>
              {restockAll ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📦 Restock Low Items'}
            </button>
            <button onClick={fetchInventory} className="btn btn-secondary" style={{ fontSize: 13 }}>🔄 Refresh</button>
          </div>
        </div>

        {/* Summary stats */}
        {summary && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '16px 24px', flex: 1, minWidth: 140 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Total Items</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{summary.total}</p>
            </div>
            <div className="card" style={{ padding: '16px 24px', flex: 1, minWidth: 140 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Low Stock</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{summary.lowStock}</p>
            </div>
            <div className="card" style={{ padding: '16px 24px', flex: 1, minWidth: 140 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Out of Stock</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--red)' }}>{summary.outOfStock}</p>
            </div>
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: 13, textTransform: 'capitalize' }}>
              {cat === 'all' ? '📋 All' : `${CAT_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Group by category */}
            {(category === 'all' ? ['base', 'sauce', 'cheese', 'veggie', 'meat'] : [category]).map(cat => {
              const catItems = items.filter(i => i.category === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 style={{ fontSize: 16, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {CAT_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}s
                    <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{catItems.length}</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {catItems.map(item => (
                      <div key={item._id} className="card" style={{ padding: '16px 20px' }}>
                        {editItem === item._id ? (
                          // Edit form
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                              <span style={{ fontSize: 24 }}>{item.image}</span>
                              <h4>{item.name}</h4>
                            </div>
                            <div className="grid-4" style={{ gap: 12, marginBottom: 16 }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Quantity</label>
                                <input type="number" className="form-input" value={editForm.quantity}
                                  onChange={e => setEditForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Threshold</label>
                                <input type="number" className="form-input" value={editForm.threshold}
                                  onChange={e => setEditForm(f => ({ ...f, threshold: parseInt(e.target.value) || 0 }))} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Price (₹)</label>
                                <input type="number" className="form-input" value={editForm.price}
                                  onChange={e => setEditForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Description</label>
                                <input className="form-input" value={editForm.description}
                                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-primary" onClick={saveEdit} disabled={saving} style={{ fontSize: 13 }}>
                                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '💾 Save'}
                              </button>
                              <button className="btn btn-secondary" onClick={() => setEditItem(null)} style={{ fontSize: 13 }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          // Display row
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                              <span style={{ fontSize: 28 }}>{item.image}</span>
                              <div>
                                <p style={{ fontWeight: 600, marginBottom: 2 }}>{item.name}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.description}</p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                              {/* Stock bar */}
                              <div style={{ minWidth: 120 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ color: getStockColor(item), fontWeight: 700, fontSize: 16 }}>{item.quantity}</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/{item.threshold} min</span>
                                </div>
                                <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
                                  <div style={{
                                    height: '100%', borderRadius: 2,
                                    width: `${Math.min(100, (item.quantity / Math.max(item.quantity, 100)) * 100)}%`,
                                    background: getStockColor(item), transition: 'width 0.3s'
                                  }} />
                                </div>
                                <p style={{ color: getStockColor(item), fontSize: 10, marginTop: 2 }}>{getStockLabel(item)}</p>
                              </div>

                              <div style={{ textAlign: 'right', minWidth: 60 }}>
                                <p style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{item.price}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>per unit</p>
                              </div>

                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => quickRestock(item._id, 50)} className="btn btn-success"
                                  style={{ padding: '6px 12px', fontSize: 12 }}>+50</button>
                                <button onClick={() => startEdit(item)} className="btn btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: 12 }}>✏️ Edit</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
