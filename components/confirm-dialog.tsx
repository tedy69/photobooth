"use client";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
export default function ConfirmDialog({
  message,
  onConfirm,
  onClose,
}: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { copy } = useLanguage();
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-message"
      onCancel={onClose}
      onClose={onClose}
    >
      <p id="confirm-message">{message}</p>
      <div className="action-row">
        <button type="button" onClick={onClose} autoFocus>
          {copy.cancel}
        </button>
        <button
          className="primary"
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {copy.confirm}
        </button>
      </div>
    </dialog>
  );
}
