import {join} from "path";
import {cwd} from "process";
import {getCommand, getTaskToPublish} from "../../src/gradle";

describe("Test for gradle handling", () => {
  test("getCommand() return 'gradle' when there is no gradle wrapper", async () => {
    expect.assertions(1);
    const command = await getCommand(cwd());
    expect(command).toBe("gradle");
  });
  test("getCommand() can find the wrapper script", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/without-plugin");
    const command = await getCommand(gradleProject);
    expect(command).toBe("./gradlew");
  });

  test("getTaskToPublish() return empty string when there is no task to publish", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/without-plugin");
    const task = await getTaskToPublish(gradleProject, process.env);
    expect(task).toBe("");
  });
  test("getTaskToPublish() return 'publish' when there is maven-publish-plugin", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-maven-publish-plugin");
    const task = await getTaskToPublish(gradleProject, process.env);
    expect(task).toBe("publish");
  });
  test("getTaskToPublish() return 'uploadArchives' when there is available legacy publishing method", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-legacy-publishing");
    const task = await getTaskToPublish(gradleProject, process.env);
    expect(task).toBe("uploadArchives");
  });
});