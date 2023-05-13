import React, { useState, useEffect } from "react";
import { User } from "~/types";

function useFetchData() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [users, setUsers] = useState<User[]>([]);
  const [usersError, setUsersError] = useState<Error | null>(null);

  useEffect(() => {
    setStatus("loading");
    fetch(`/api/users`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
        setStatus("success");
        setUsers(data);
      })
      .catch((err) => {
        console.error(err);

        setUsersError(err);
        setStatus("error");
      });
  }, []);

  return {
    status,
    users,
    usersError,
  };
}
export function Homepage() {
  const { status, users, usersError } = useFetchData();

  if (status === "idle") {
    return <p>Idle</p>;
  }
  if (status === "loading") {
    return <p>Loading...</p>;
  }
  if (status === "error" && usersError) {
    return <p>There was an error fetching the data! {usersError.message}</p>;
  }

  return (
    <div>
      <ul>
        {users.map((user) => {
          return <li key={user.id}>{user.name}</li>;
        })}
      </ul>
    </div>
  );
}
