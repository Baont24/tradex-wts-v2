import * as React from 'react';
import { FallbackProps } from 'react-error-boundary';
import Spinner from '../Spinner';

export default ({ componentStack, error }: FallbackProps) => {
  if (error) {
    console.error(error);
  }

  return (
    <div className="d-flex w-100 h-100 justify-content-center align-items-center">
      <Spinner size={30} />
    </div>
  );
};
