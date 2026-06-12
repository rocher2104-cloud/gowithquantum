import { useApp } from "../store/AppStore";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { JobList } from "../components/shared/JobCard";
import { EmptyState } from "../components/shared/EmptyState";

export function Queue() {
  const { jobs } = useApp();
  const needs = jobs.filter((j) => j.status === "needs");
  const rest = jobs.filter((j) => j.status !== "needs");

  return (
    <>
      <PageHeader
        kicker="Process queue"
        title="Queue"
        sub="Everything that's running, waiting, or waiting on you — across all your workspaces."
      />
      {needs.length > 0 && (
        <>
          <SectionRow title="Waiting for you" />
          <JobList jobs={needs} />
        </>
      )}
      <SectionRow title="All processes" />
      {rest.length > 0 ? <JobList jobs={rest} /> : <EmptyState title="Queue is clear" />}
    </>
  );
}
