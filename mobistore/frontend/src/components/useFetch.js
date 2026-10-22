import { useCallback, useEffect, useState } from "react";
import api, { errorText } from "../api.js";

// Small data-loading hook: { data, loading, error, reload }
export default function useFetch(url, params) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const key = url + JSON.stringify(params || {});

  const load = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api.get(url, { params })
      .then((r) => !cancelled && setState({ data: r.data, loading: false, error: "" }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: errorText(e) }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const cancel = load();
    return cancel; // cleanup function
  }, [load]);
  return { ...state, reload: load };
}
