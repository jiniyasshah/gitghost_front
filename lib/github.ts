// This file is kept for potential future GitHub API interactions
// but currently not used since we're not fetching repositories

export async function verifyGitHubToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to verify GitHub token:", error);
    return false;
  }
}
