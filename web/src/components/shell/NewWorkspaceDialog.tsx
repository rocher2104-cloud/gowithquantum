import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
} from "@fluentui/react-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppStore";

export function NewWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addWorkspace } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const create = () => {
    addWorkspace(name);
    setName("");
    onOpenChange(false);
    navigate("/solve");
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => onOpenChange(d.open)}>
      <DialogSurface style={{ maxWidth: 440 }}>
        <DialogBody>
          <DialogTitle>New workspace</DialogTitle>
          <DialogContent>
            <p style={{ marginTop: 0, color: "var(--colorNeutralForeground2)" }}>
              Workspaces keep your files, problems, and outputs together as one source of truth.
            </p>
            <Field>
              <Input
                value={name}
                placeholder="e.g. Materials Science"
                onChange={(_, d) => setName(d.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                autoFocus
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={create}>
              Create workspace
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
