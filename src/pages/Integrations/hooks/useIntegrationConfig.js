import { useState, useEffect, useCallback } from "react";

const useIntegrationConfig = (apiFn) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFn();
            const item = Array.isArray(res.data)
                ? res.data[0]
                : res.data?.results?.[0];
            setConfig(item || null);
        } catch {
            setConfig(null);
        } finally {
            setLoading(false);
        }
    }, [apiFn]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { config, setConfig, loading, refetch };
};

export default useIntegrationConfig;