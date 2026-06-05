import packageJson from "../package.json";
import { describe, expect, it } from "vitest";
import { APP_VERSION, GITHUB_REPO_URL } from "@/lib/appInfo";

describe("app info", () => {
  it("reads the app version from package.json", () => {
    expect(APP_VERSION).toBe(packageJson.version);
  });

  it("links to the project repository", () => {
    expect(GITHUB_REPO_URL).toBe("https://github.com/jacobrosenfeld/placecard-generator");
  });
});
