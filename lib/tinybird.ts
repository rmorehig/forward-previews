async function getPreviewWorkspaceToken() {
  const userToken = process.env.TB_USER_TOKEN;

  if (!userToken) {
    throw new Error("TB_USER_TOKEN is not set");
  }

  const response = await fetch(process.env.TB_HOST + "/v0/user/workspaces", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const data = (await response.json()) as {
    workspaces: { name: string; token: string }[];
  };
  return data.workspaces.find(
    (workspace) => workspace.name === `tb_${process.env.VERCEL_GIT_COMMIT_SHA}`
  )?.token;
}

export async function tinybirdEventsClient(data: {
  timestamp: string;
  session_id: string;
  event_type: string;
  page_url: string;
  referrer: string;
  user_agent: string;
  country: string;
  city: string;
  device_type: string;
  os: string;
  browser: string;
  duration: number;
  client_timestamp: string;
}) {
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  let workspaceToken = process.env.TB_TOKEN;

  if (!workspaceToken) {
    throw new Error("TB_TOKEN is not set");
  }

  if (isVercelPreview) {
    workspaceToken = await getPreviewWorkspaceToken();
    if (!workspaceToken) {
      throw new Error("Preview workspace not found");
    }
  }

  return fetch(process.env.TB_HOST + "/v0/events?name=analytics_events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${workspaceToken}`,
    },
    body: JSON.stringify(data),
  });
}
