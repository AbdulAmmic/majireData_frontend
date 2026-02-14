"use client";

import { API_BASE_URL } from "@/config";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";

export default function AdminPricingPage() {
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [formData, setFormData] = useState({
        service: "DATA",
        provider_code: "",
        provider_cost_naira: "",
        markup_type: "FLAT",
        markup_value: "",
        active: true
    });

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/admin/prices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPrices(data.data.items);
            }
        } catch (error) {
            console.error("Failed to fetch prices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const url = editingItem
                ? `${API_BASE_URL}/api/admin/prices/${editingItem.id}`
                : `${API_BASE_URL}/api/admin/prices`;

            const method = editingItem ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                alert(editingItem ? "Plan updated" : "Plan created");
                setShowModal(false);
                fetchPrices();
            } else {
                alert(data.message || "Operation failed");
            }
        } catch (error) {
            console.error("Error saving price", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/admin/prices/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Plan deleted");
                fetchPrices();
            } else {
                alert("Failed to delete plan");
            }
        } catch (error) {
            console.error("Error deleting price", error);
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            service: item.service,
            provider_code: item.provider_code,
            provider_cost_naira: item.provider_cost_naira.toString(),
            markup_type: item.markup_type,
            markup_value: item.markup_value.toString(),
            active: item.active
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({
            service: "DATA",
            provider_code: "",
            provider_cost_naira: "",
            markup_type: "FLAT",
            markup_value: "0",
            active: true
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pricing & Plans</h1>
                    <p className="text-gray-500 text-sm">Manage service prices and markups</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Plan
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Provider Code</th>
                                <th className="px-6 py-4">Cost (₦)</th>
                                <th className="px-6 py-4">Markup</th>
                                <th className="px-6 py-4">Selling Price (₦)</th>
                                <th className="px-6 py-4">Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                            ) : prices.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No plans found</td></tr>
                            ) : (
                                prices.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium">{item.service}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{item.provider_code}</td>
                                        <td className="px-6 py-4">₦{item.provider_cost_naira}</td>
                                        <td className="px-6 py-4">
                                            {item.markup_type === "PERCENT" ? `${item.markup_value}%` : `₦${item.markup_value}`}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">₦{item.selling_price_naira}</td>
                                        <td className="px-6 py-4">
                                            {item.active ? (
                                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Active</span>
                                            ) : (
                                                <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingItem ? "Edit Plan" : "New Plan"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                    <select
                                        value={formData.service}
                                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={!!editingItem} // If editing, maybe lock service?
                                    >
                                        <option value="DATA">DATA</option>
                                        <option value="AIRTIME">AIRTIME</option>
                                        <option value="CABLE">CABLE</option>
                                        <option value="ELECTRICITY">ELECTRICITY</option>
                                        <option value="EPIN">EPIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider Code</label>
                                    <input
                                        type="text"
                                        value={formData.provider_code}
                                        onChange={(e) => setFormData({ ...formData, provider_code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g. mtn_1gb"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₦)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.provider_cost_naira}
                                        onChange={(e) => setFormData({ ...formData, provider_cost_naira: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="0.00"
                                        disabled={!!editingItem} // Usually specific to provider
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                                    <select
                                        value={formData.active ? "true" : "false"}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Markup Type</label>
                                    <select
                                        value={formData.markup_type}
                                        onChange={(e) => setFormData({ ...formData, markup_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="FLAT">Flat (₦)</option>
                                        <option value="PERCENT">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Markup Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.markup_value}
                                        onChange={(e) => setFormData({ ...formData, markup_value: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                            >
                                {editingItem ? "Save Changes" : "Create Plan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
