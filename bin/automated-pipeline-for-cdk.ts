#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AutomatedPipelineForCdkStack } from "../lib/automated-pipeline-for-cdk-stack";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipelineActions from "aws-cdk-lib/aws-codepipeline-actions";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";

const app = new cdk.App();

const pipelineStack = new cdk.Stack(app, "PipelineStack", {});

// const pipeline = new CodePipeline(pipelineStack, "pipeline", {
//   synth: new ShellStep("synth", {
//     input: CodePipelineSource.gitHub("codepipeline-integrtion", "main", {
//       authentication: cdk.SecretValue.secretsManager(
//         "github/codepipeline/demo/token",
//         {
//           jsonField: "github-codepipeline-test-token",
//         }
//       ),
//     }),
//     commands: ["yarn install", "yarn cdk synth"],
//   }),
// });

const pipeline = new codepipeline.Pipeline(pipelineStack, "pipeline", {
  pipelineName: "TestPipeline",
});

const sourceOutput = new codepipeline.Artifact();
const devStack = new AutomatedPipelineForCdkStack(app, "DevStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: "718517280342", region: "eu-central-1" },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

const prodStack = new AutomatedPipelineForCdkStack(app, "ProdStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: "718517280342", region: "eu-central-1" },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

pipeline.addStage({
  stageName: "github-source",
  actions: [
    new codepipelineActions.GitHubSourceAction({
      actionName: "DemoCodePipelineIntegration",
      branch: "main",
      oauthToken: cdk.SecretValue.secretsManager(
        "github/codepipeline/demo/token",
        {
          jsonField: "github-codepipeline-test-token",
        }
      ),
      output: sourceOutput,
      owner: "Flojolomo",
      repo: "codepipeline-integrtion",
    }),
  ],
});

pipeline.addStage({
  stageName: "Dev",
  actions: [
    new codepipelineActions.CloudFormationCreateUpdateStackAction({
      actionName: "DeployDevStack",
      stackName: "DevStack",
      templatePath: sourceOutput.atPath(devStack.templateFile),
      adminPermissions: true,
    }),
  ],
});
