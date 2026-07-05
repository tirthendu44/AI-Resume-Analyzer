import { useNavigate } from "react-router-dom";

function JobList({ jobs = [] }) {
  const navigate = useNavigate();
console.log("Jobs array:", jobs);
  return (
    <>
      {jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="jobCard">
            <h3>{job.title}</h3>
            <p>{job.company}</p>
            <p>{job.description}</p>
            <button onClick={() => navigate(`/job/${job.id}`)}>Check Match</button>
          </div>
        ))
      )}
    </>
  );
}
export default JobList;