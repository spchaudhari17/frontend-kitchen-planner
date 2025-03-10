import React from "react";
import { Modal as BootstrapModal } from "react-bootstrap";
import { useColorContext } from "../../context/colorcontext";

const Modal = ({ show, onHide, title, children, footer }) => {
  const { componentColors } = useColorContext();

  // Fetch modal-specific colors or set defaults
  const modalBackgroundColor = componentColors?.Modal?.background || "#ffffff";
  const modalTextColor = componentColors?.Modal?.text || "#000000";

  return (
    <BootstrapModal show={show} onHide={onHide} centered>
      <BootstrapModal.Header
        closeButton
        style={{
          backgroundColor: modalBackgroundColor,
          color: modalTextColor,
        }}
      >
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body
        style={{
          backgroundColor: modalBackgroundColor,
          color: modalTextColor,
        }}
      >
        {children}
      </BootstrapModal.Body>
      {footer && (
        <BootstrapModal.Footer
          style={{
            backgroundColor: modalBackgroundColor,
          }}
        >
          {footer}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default Modal;
