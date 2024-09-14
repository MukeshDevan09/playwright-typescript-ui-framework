# Playwright Typescript UI automation framework


## ui-automation-core

- `pageFixture.ts`: This file encompasses a collection of custom fixture methods designed to facilitate interactions with the browser and manage page objects.

    `pageFixture.ts` :
    - Define methods to set up page fixtures before tests.
    - Streamline interactions with the browser and page objects.

    Utilize the `hooks` and `pageFixture` components to manage the flow and context of your tests efficiently, ensuring that each test starts in the desired state and completes with necessary cleanup.

## Utilities

The `utilities` directory provides utility functions and helpers.

- `allureReporter.ts`: Integration with the Allure reporting framework.
- `logUtils.ts`: Logging utilities.
- `visualTestintgUtils.ts`: To test the visual integrity of the application

## Configuration Files

Configuration and setup files for the project.

- `.eslintrc.json`: ESLint configuration for code linting.
- `.gitignore`: List of files and directories to be ignored by Git.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project metadata and dependencies.
- `package-lock.json`: Lock file for precise dependency versioning.