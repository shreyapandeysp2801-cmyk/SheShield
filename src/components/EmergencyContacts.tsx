import { useState, useEffect, useCallback } from "react";
import { UserPlus, Phone, Trash2, X, Loader2, Contact, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
}

export function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("emergency_contacts")
      .select("id, name, phone, relationship")
      .order("created_at", { ascending: false });

    if (err) {
      setError("Could not load your contacts. Please check your connection.");
    } else {
      setContacts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from("emergency_contacts")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || null,
      });

    if (err) {
      setError("Could not save this contact. Please try again.");
      setSaving(false);
      return;
    }

    setName("");
    setPhone("");
    setRelationship("");
    setShowForm(false);
    setSaving(false);
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("emergency_contacts").delete().eq("id", id);
  };

  return (
    <div className="rounded-3xl bg-ink-800/50 border border-ink-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Contact className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">Emergency Contacts</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="space-y-3 mb-4 animate-slide-up">
          <div>
            <label className="text-xs text-ink-400 font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mom, Sarah..."
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-ink-900/70 border border-ink-600 text-sm text-white placeholder-ink-500 focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-ink-400 font-medium">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555 123 4567"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-ink-900/70 border border-ink-600 text-sm text-white placeholder-ink-500 focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-ink-400 font-medium">Relationship (optional)</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Family, Friend..."
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-ink-900/70 border border-ink-600 text-sm text-white placeholder-ink-500 focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim() || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Save Contact
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 flex items-start gap-2 mb-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {/* Contact list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-6">
          <Contact className="w-10 h-10 text-ink-600 mx-auto mb-2" />
          <p className="text-sm text-ink-400">No contacts yet.</p>
          <p className="text-xs text-ink-500 mt-1">Add trusted people you can call in an emergency.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 group"
            >
              <a
                href={`tel:${contact.phone}`}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center flex-shrink-0 hover:from-brand-500 hover:to-brand-600 transition-all active:scale-95"
              >
                <Phone className="w-5 h-5 text-brand-400 group-hover:text-white transition-colors" />
              </a>
              <a href={`tel:${contact.phone}`} className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{contact.name}</p>
                <p className="text-xs text-ink-400 truncate">
                  {contact.phone}
                  {contact.relationship && <span className="text-ink-600"> · {contact.relationship}</span>}
                </p>
              </a>
              <button
                onClick={() => handleDelete(contact.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
