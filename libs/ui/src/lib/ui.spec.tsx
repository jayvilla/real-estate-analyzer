import { render } from '@testing-library/react';

import RealEstateAnalyzerUi from './ui';

describe('RealEstateAnalyzerUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RealEstateAnalyzerUi />);
    expect(baseElement).toBeTruthy();
  });
});
