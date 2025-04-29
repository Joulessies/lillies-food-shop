import { Button } from 'react-bootstrap';

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

export const AddToCartButton = ({ label, onClick, variant = 'primary' }) => (
  <Button variant={variant} onClick={onClick} className="add-to-cart-button">
    {label}
  </Button>
)