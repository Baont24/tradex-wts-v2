import * as React from 'react';
import { FallbackProps } from 'react-error-boundary';

export default ({ componentStack, error }: FallbackProps) => {
  return <div>Loading....</div>;
};
