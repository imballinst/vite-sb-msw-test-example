import type { Meta, StoryObj } from "@storybook/react";
import { rest } from "msw";
import { expect } from "@storybook/jest";

import {
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { User } from "~/types";
import { Homepage } from "./Homepage";

const meta: Meta<typeof Homepage> = {
  title: "Homepage",
  component: Homepage,
};

export default meta;
type Story = StoryObj<typeof Homepage>;

// 👇 The mocked data that will be used in the story
const TestData: User[] = Array.from(new Array(6)).map((_, idx) => ({
  id: `${idx + 1}`,
  name: `xdd${idx + 1}`,
}));

export const MockedSuccess: Story = {
  parameters: {
    msw: [
      rest.get(`/api/users`, (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.json(TestData));
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Shows initial loading", async () => {
      await waitFor(
        () => expect(canvas.queryByText(/Loading/)).not.toBeNull(),
        { timeout: 4000 }
      );
    });

    await step("Hides initial loading", async () => {
      await waitFor(() => expect(canvas.queryByText(/Loading/)).toBeNull(), {
        timeout: 4000,
        interval: 1000,
      });
    });

    await step("Shows list of users", async () => {
      expect(await canvas.findByText("xdd1")).not.toBeNull();
      expect(await canvas.findByText("xdd6")).not.toBeNull();
    });
  },
};

export const MockedError: Story = {
  parameters: {
    msw: [
      rest.get(`/api/users`, (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(403));
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Shows initial loading", async () => {
      await waitFor(
        () => expect(canvas.queryByText(/Loading/)).not.toBeNull(),
        {
          timeout: 4000,
          interval: 1000,
        }
      );
    });

    await step("Hides initial loading", async () => {
      await waitFor(() => expect(canvas.queryByText(/Loading/)).toBeNull(), {
        timeout: 4000,
        interval: 1000,
      });
    });

    await step("Shows error instead of list of users", async () => {
      await waitFor(() => expect(canvas.queryByText("xdd1")).toBeNull(), {
        timeout: 4000,
        interval: 1000,
      });
      expect(canvas.queryByText("xdd6")).toBeNull();

      await waitFor(
        () =>
          expect(
            canvas.queryByText(/There was an error fetching the data!/)
          ).not.toBeNull(),
        {
          timeout: 4000,
          interval: 1000,
        }
      );
    });
  },
};
