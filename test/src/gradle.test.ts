import { access, constants } from "fs";
import { join } from "path";
import { cwd } from "process";
import { sync as rmdir } from "rimraf";
import { Signale } from "signale";
import {
  getCommand,
  getTaskToPublish,
  getVersion,
  publishArtifact
} from "../../src/gradle";

jest.mock("signale");

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
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).toBe("");
  }, 10000);
  test("getTaskToPublish() return 'publish' when there is maven-publish-plugin", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-maven-publish-plugin");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).toBe("publish");
  }, 10000);
  test("getTaskToPublish() return 'uploadArchives' when there is available legacy publishing method", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-legacy-publishing");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).toBe("uploadArchives");
  }, 10000);
  test("getTaskToPublish() return 'artifactoryDeploy' when there is available artifactory-plugin", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-artifactory-plugin");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).toBe("artifactoryDeploy");
  }, 10000);

  test("getVersion() returns version defined in build.gradle", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    const version = await getVersion(gradleProject, process.env);
    expect(version).toBe("1.2.3");
  });
  test("getVersion() returns version defined in gradle.properties", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    const version = await getVersion(gradleProject, process.env);
    expect(version).toBe("0.1.2");
  });

  describe("publishArtifact()", () => {
    beforeEach(() => {
      rmdir(join(cwd(), "test/project/with-publish/build"));
    });

    test("runs 'publish' task", async done => {
      expect.assertions(1);
      const gradleProject = join(cwd(), "test/project/with-publish");
      await publishArtifact(gradleProject, process.env, new Signale());
      const file = join(
        gradleProject,
        "build/repo/com/example/project/1.0/project-1.0.jar"
      );
      access(file, constants.F_OK, err => {
        expect(err).toBeNull();
        done();
      });
    });
  });
});
