import { Button } from 'react-bootstrap';

export const SearchButton = ({ openSearch }) => (
  <Button variant="outline-success" onClick={openSearch}>
    🔍 Search
  </Button>
);

export const CustomButton = ({ label, onClick, variant = 'primary' }) => (
  <Button variant={variant} onClick={onClick}>
    {label}
  </Button>
);

export const OrderButton = ({ label, onClick, variant = 'primary' }) => (
  <Button variant="outline-success" onClick={onClick}>
    {label}
  </Button>
);