import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import * as React from "react";

export type AppDialogProps = {
	open: boolean;
	title?: React.ReactNode;
	message?: React.ReactNode;

	// button texts
	confirmText?: string; // default: "OK"
	cancelText?: string; // default: "Cancel"

	// behavior
	showCancel?: boolean; // if false -> alert style
	disableBackdropClose?: boolean; // blocks clicking outside / ESC

	// callbacks
	onConfirm: (props: any) => void;
	onClose: () => void; // called when user cancels or closes
};

export function AppDialog({
	open,
	title,
	message,
	confirmText = "OK",
	cancelText = "Cancel",
	showCancel = false,
	disableBackdropClose = false,
	onConfirm,
	onClose,
}: AppDialogProps) {
	const handleClose = (
		_event: object,
		reason?: "backdropClick" | "escapeKeyDown",
	) => {
		if (
			disableBackdropClose &&
			(reason === "backdropClick" || reason === "escapeKeyDown")
		) {
			return;
		}
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
			{title ? <DialogTitle>{title}</DialogTitle> : null}

			<DialogContent>
				{typeof message === "string" ? (
					<DialogContentText>{message}</DialogContentText>
				) : (
					message
				)}
			</DialogContent>

			<DialogActions>
				{showCancel && (
					<Button onClick={onClose} variant="text">
						{cancelText}
					</Button>
				)}

				<Button onClick={onConfirm} variant="contained" autoFocus>
					{confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
