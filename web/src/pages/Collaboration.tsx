import { useState } from "react";
import {
  Avatar, Badge, Button, Dialog, DialogActions, DialogBody,
  DialogContent, DialogSurface, DialogTitle, DialogTrigger,
  Divider, Dropdown, Field, Option, Switch, Text, Textarea,
  makeStyles, tokens,
} from "@fluentui/react-components";
import { PersonAddRegular, DismissRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { useApp } from "../store/AppStore";
import { timeAgo } from "../lib/time";
import type { AccessLevel, TeamRole } from "../data/models";
import { TEAM_MEMBERS, COMMENTS } from "../data/mock";

const ROLE_COLORS: Record<TeamRole, "brand" | "success" | "informative" | "warning"> = {
  owner: "brand",
  researcher: "informative",
  engineer: "success",
  viewer: "warning",
};

const CROSS_FUNC_TEMPLATES = [
  {
    key: "hardware",
    title: "Hardware Team Sync",
    desc: "Structured update for the hardware team: circuit requirements, error mitigation needs, and qubit connectivity constraints.",
    body: `**Quantum Circuit Requirements**
Algorithm: QAOA (p=3)
Logical qubits: 12
Required 2Q gate fidelity: ≥99.5%
Circuit depth: 28 layers (after transpilation, SABRE routing, opt=3)
Preferred backend: IBM Heron r2

**Error Mitigation Needs**
ZNE with scale factors [1, 2, 3] — requires ~3× more shots.
Estimated shots: 4,096 × 3 = 12,288.

**Open Questions**
- What is the current T1/T2 average for the 12-qubit ring?
- Any scheduled calibration windows this week?`,
  },
  {
    key: "classical",
    title: "Classical Expert Benchmark Share",
    desc: "Side-by-side comparison of quantum vs classical results suitable for a classical algorithms expert.",
    body: `**Benchmark Comparison: QAOA vs Classical Solvers**
Problem: CVRP N=40 nodes, K=5 trucks

| Method            | Approx. Ratio | Time   |
|-------------------|---------------|--------|
| MILP (OR-Tools)   | 94.0%         | 1.1s   |
| Sim. Annealing    | 88.1%         | 0.3s   |
| Random Greedy     | 71.4%         | 0.02s  |
| QAOA p=3 (sim)    | 89.2%         | 42s    |
| QAOA p=3 (hw)     | 81.4%         | 6.2s   |

At N=40, MILP remains superior. Quantum advantage projected at N>120 based on scaling analysis.`,
  },
  {
    key: "business",
    title: "Business Unit Translation",
    desc: "Plain-language summary for stakeholders without a quantum background.",
    body: `**Quantum Experiment Result — Plain Language Summary**

We ran a quantum computer on your 40-stop, 5-truck delivery routing problem.

**What we found**
The quantum approach found a route plan roughly as good as our best classical optimizer, cutting total travel distance by about 18% vs your current baseline.

**Is quantum better than classical today?**
Not yet at this problem size. Our classical solver is still slightly better and much faster. The quantum result is meaningful as proof of concept.

**When will quantum be better?**
Our estimates suggest quantum computers will outperform classical methods for this type of problem around 2031, when hardware improves and the problem is larger (120+ stops).

**Next step recommended**
Continue monitoring hardware progress. No operational change needed yet. Budget for a follow-up in 2028.`,
  },
];

const useStyles = makeStyles({
  section: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
    marginBottom: "20px",
  },
  sectionHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  td: { padding: "10px 14px", fontSize: "13px" },
  commentList: {
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  comment: {
    display: "flex",
    gap: "10px",
  },
  commentBody: {
    flex: 1,
    background: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    padding: "10px 12px",
  },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    padding: "14px 16px",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  templateCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

export function Collaboration() {
  const s = useStyles();
  const { addTeamMember, updateMemberAccess, addComment } = useApp();
  const [teamMembers, setTeamMembers] = useState(TEAM_MEMBERS);
  const [comments, setComments] = useState(COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("researcher");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleAccessChange = (memberId: string, access: AccessLevel) => {
    updateMemberAccess(memberId, access);
    setTeamMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, access } : m));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment("j-1", "You", newComment);
    setComments((prev) => [...prev, {
      id: `c-local-${Date.now()}`,
      jobId: "j-1",
      authorId: "current-user",
      authorName: "You",
      body: newComment,
      createdAt: new Date().toISOString(),
    }]);
    setNewComment("");
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    addTeamMember({
      workspaceId: "log",
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      access: "read-only",
      notifyOnCompletion: true,
      notifyOnHITL: false,
      avatarInitials: inviteEmail[0].toUpperCase(),
    });
    setTeamMembers((prev) => [...prev, {
      id: `tm-local-${Date.now()}`,
      workspaceId: "log",
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      access: "read-only" as AccessLevel,
      notifyOnCompletion: true,
      notifyOnHITL: false,
      avatarInitials: inviteEmail[0].toUpperCase(),
      joinedAt: "just now",
    }]);
    setInviteEmail("");
    setInviteOpen(false);
  };

  const activeTemplateData = CROSS_FUNC_TEMPLATES.find((t) => t.key === activeTemplate);

  return (
    <>
      <PageHeader
        kicker="Step 9 · Publish"
        title="Collaboration"
        sub="Manage the team, review comments, and share results with hardware teams, classical experts, and business stakeholders."
      />

      {/* Section 1: Team Members */}
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <Text weight="semibold" size={300}>Team Members</Text>
          <Dialog open={inviteOpen} onOpenChange={(_, d) => setInviteOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
              <Button size="small" appearance="primary" icon={<PersonAddRegular />}>Invite member</Button>
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Invite team member</DialogTitle>
                <DialogContent>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                    <Field label="Email address">
                      <Textarea rows={1} value={inviteEmail} onChange={(_, d) => setInviteEmail(d.value)} placeholder="name@company.com" />
                    </Field>
                    <Field label="Role">
                      <Dropdown value={inviteRole} onOptionSelect={(_, d) => setInviteRole((d.optionValue ?? inviteRole) as TeamRole)}>
                        <Option value="owner">Owner</Option>
                        <Option value="researcher">Researcher</Option>
                        <Option value="engineer">Engineer</Option>
                        <Option value="viewer">Viewer</Option>
                      </Dropdown>
                    </Field>
                  </div>
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button appearance="primary" onClick={handleInvite}>Send invite</Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </div>

        <table className={s.teamTable}>
          <thead>
            <tr style={{ background: tokens.colorNeutralBackground2, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
              {["Member", "Role", "Access", "Notify on done", "Notify on HITL", ""].map((h) => (
                <th key={h} style={{ padding: "7px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: tokens.colorNeutralForeground3, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke1}` }}>
                <td className={s.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={28} name={member.name} initials={member.avatarInitials} color="colorful" />
                    <div>
                      <Text size={200} weight="semibold">{member.name}</Text>
                      <Text size={100} style={{ display: "block", color: tokens.colorNeutralForeground3 }}>{member.email}</Text>
                    </div>
                  </div>
                </td>
                <td className={s.td}>
                  <Badge appearance="tint" color={ROLE_COLORS[member.role]} size="small">{member.role}</Badge>
                </td>
                <td className={s.td} style={{ minWidth: 160 }}>
                  <Dropdown size="small" value={member.access}
                    onOptionSelect={(_, d) => handleAccessChange(member.id, (d.optionValue ?? member.access) as AccessLevel)}>
                    <Option value="full">Full</Option>
                    <Option value="read-write">Read-write</Option>
                    <Option value="read-only">Read-only</Option>
                  </Dropdown>
                </td>
                <td className={s.td}>
                  <Switch
                    checked={member.notifyOnCompletion}
                    onChange={(_, d) => setTeamMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, notifyOnCompletion: d.checked } : m))}
                  />
                </td>
                <td className={s.td}>
                  <Switch
                    checked={member.notifyOnHITL}
                    onChange={(_, d) => setTeamMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, notifyOnHITL: d.checked } : m))}
                  />
                </td>
                <td className={s.td}>
                  <Button size="small" appearance="subtle" icon={<DismissRegular />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Comment threads */}
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <Text weight="semibold" size={300}>Comment Thread — QAOA Routing Run</Text>
          <Badge appearance="tint" color="informative" size="small">{comments.length} comments</Badge>
        </div>

        <div className={s.commentList}>
          {comments.map((c) => (
            <div key={c.id} className={s.comment}>
              <Avatar size={28} name={c.authorName} color="colorful" />
              <div className={s.commentBody}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text size={200} weight="semibold">{c.authorName}</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3, fontFamily: tokens.fontFamilyMonospace }}>{timeAgo(c.createdAt)}</Text>
                </div>
                <Text size={200}>{c.body}</Text>
              </div>
            </div>
          ))}

          <Divider />

          <div style={{ display: "flex", gap: 10 }}>
            <Avatar size={28} name="You" color="colorful" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Textarea
                rows={2}
                value={newComment}
                onChange={(_, d) => setNewComment(d.value)}
                placeholder="Add a comment..."
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button size="small" appearance="primary" disabled={!newComment.trim()} onClick={handleAddComment}>
                  Add comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cross-functional templates */}
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <Text weight="semibold" size={300}>Cross-Functional Report Templates</Text>
        </div>
        <div className={s.templateGrid}>
          {CROSS_FUNC_TEMPLATES.map((t) => (
            <div key={t.key} className={s.templateCard}>
              <Text weight="semibold" size={200}>{t.title}</Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3, lineHeight: 1.6 }}>{t.desc}</Text>
              <Button size="small" appearance="secondary" onClick={() => setActiveTemplate(t.key)}>
                Generate from current results
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Template preview dialog */}
      <Dialog open={!!activeTemplate} onOpenChange={(_, d) => !d.open && setActiveTemplate(null)}>
        <DialogSurface style={{ maxWidth: 640 }}>
          <DialogBody>
            <DialogTitle>{activeTemplateData?.title ?? ""}</DialogTitle>
            <DialogContent>
              <pre style={{ fontFamily: tokens.fontFamilyBase, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", marginTop: 12 }}>
                {activeTemplateData?.body ?? ""}
              </pre>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setActiveTemplate(null)}>Close</Button>
              <Button appearance="primary">Copy to clipboard</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
