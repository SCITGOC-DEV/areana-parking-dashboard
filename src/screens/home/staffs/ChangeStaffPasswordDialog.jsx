import { AppModal } from "../../../components/AppModal";
import { useMutation } from "@apollo/client";
import { ToastType, useToast } from "../../../context/ToastProvider";
import staff from "../../../graphql/queries/staff";
import { useState } from "react";

export const ChangeStaffPasswordDialog = ({
  isOpen,
  onClose,
  onSuccess,
  staffId,
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const { addToast } = useToast();

  const [updateStaffPassword] = useMutation(staff.UPDATE_STAFF_PASSWORD, {
    onCompleted: (data) => {
      const response = data.response;
      if (response.error === 1) {
        addToast(response.message, ToastType.Error);
      } else {
        addToast("Password changed successfully", ToastType.Success);
        onSuccess();
        onClose();
      }
    },
    onError: () => {
      addToast("Failed to change password", ToastType.Error);
    },
  });

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      await updateStaffPassword({ variables: { userId: staffId, newPassword: password, note } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Change Password">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-text-secondary)]">Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-[var(--color-text-secondary)]">Note</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note..."
            className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            disabled={!password || loading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              password && !loading
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed"
            }`}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </AppModal>
  );
};
