import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

export function useInventory(onExpired) {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const savingRef = useRef(false),
    current = useRef(null),
    loadSequence = useRef(0);
  const update = (value) => {
    current.current = value;
    setSnapshot(value);
  };
  const reload = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError('');
    try {
      const next = await api.load();
      if (sequence === loadSequence.current) update(next);
    } catch (e) {
      if (sequence === loadSequence.current) {
        if (e.status === 401) onExpired();
        setError(e.message);
      }
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, [onExpired]);
  useEffect(() => {
    void reload();
  }, [reload]);
  async function commit(transform) {
    if (savingRef.current || !current.current) throw Error('Aguarde a operação atual.');
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      const previous = current.current;
      const next = transform(previous.data);
      update(await api.save(next, previous.revision));
    } catch (e) {
      if (e.status === 401) onExpired();
      if (e.status === 409) {
        try {
          update(await api.load());
        } catch (reloadError) {
          if (reloadError.status === 401) onExpired();
        }
      }
      setError(e.message);
      throw e;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  return {
    data: snapshot?.data,
    revision: snapshot?.revision,
    loading,
    saving,
    error,
    reload,
    commit,
  };
}

