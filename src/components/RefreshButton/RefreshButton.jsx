import React, { useState } from 'react';
import { Button } from '../../component-library';
import { invalidatePageCache, emitCacheInvalidation } from '../../cache';

const RefreshButton = ({ pageName, onRefresh, label = 'Refresh' }) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);

      if (pageName) {
        invalidatePageCache(pageName);
        emitCacheInvalidation([pageName]);
      }

      if (typeof onRefresh === 'function') {
        await onRefresh();
      }

      // allow UI to settle after refresh event
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      console.error('[RefreshButton] refresh failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleRefresh} isLoading={loading}>
      {label}
    </Button>
  );
};

export default RefreshButton;
