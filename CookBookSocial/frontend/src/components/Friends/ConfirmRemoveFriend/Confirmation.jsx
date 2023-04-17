import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import './Confirmation.css';

function ConfirmationModal({ currID, friendID, friendName, isOpen, onRequestClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const URL_UNFRIEND = `/api/user/unfriend/${currID}/${friendID}`;
      const response = await fetch(URL_UNFRIEND, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        }
      });
      console.log(response)
      if (!response.ok) {
        throw new Error('Failed to delete friend');
      }
      console.log(`Deleting friend ${friendID} for user ${currID}`);
      onRequestClose();
      onConfirm();
    } catch (err) {
      setError(err.message);
    }
    setIsSubmitting(false);
  };


  return (
    <Modal
      ariaHideApp={false}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <h2>Are you sure you want to remove {friendName}?</h2>
      {error && <p className="error">{error}</p>}
      <div className="button-group">
        <button
          disabled={isSubmitting}
          onClick={handleConfirm}
          className="modal-button modal-confirm-button"
        >
          Yes
        </button>
        <button
          disabled={isSubmitting}
          onClick={onRequestClose}
          className="modal-button modal-cancel-button"
        >
          No
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
