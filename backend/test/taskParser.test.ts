import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTaskInputWithAi } from '../src/utils/taskParser.js';

type Case = {
  input: string;
  expectedTitle: string;
  expectedCategory: 'Finance' | 'Personal' | 'Work' | 'Contact' | 'General';
  expectedHour?: number;
  expectedMinute?: number;
  expectTomorrow?: boolean;
  expectOneHourAhead?: boolean;
};

const cases: Case[] = [
    {
      input: 'Remind me to pay electricity bill tomorrow at 4 PM',
      expectedTitle: 'pay electricity bill',
      expectedCategory: 'Finance',
      expectedHour: 16,
      expectedMinute: 0,
      expectTomorrow: true,
    },
    {
      input: 'Call client at 10 am',
      expectedTitle: 'Call client',
      expectedCategory: 'Contact',
      expectedHour: 10,
      expectedMinute: 0,
    },
    {
      input: 'Deploy release tomorrow at 09:30',
      expectedTitle: 'Deploy release',
      expectedCategory: 'Work',
      expectedHour: 9,
      expectedMinute: 30,
      expectTomorrow: true,
    },
    {
      input: 'Buy groceries tomorrow at 7 pm',
      expectedTitle: 'Buy groceries',
      expectedCategory: 'Personal',
      expectedHour: 19,
      expectedMinute: 0,
      expectTomorrow: true,
    },
    {
      input: 'Plan quarterly goals',
      expectedTitle: 'Plan quarterly goals',
      expectedCategory: 'General',
      expectedMinute: 0,
      expectOneHourAhead: true,
    },
    {
      input: 'Email vendor invoice at 18:45',
      expectedTitle: 'Email vendor invoice',
      expectedCategory: 'Finance',
      expectedHour: 18,
      expectedMinute: 45,
    },
    {
      input: 'Gym session tomorrow at 6 am',
      expectedTitle: 'Gym session',
      expectedCategory: 'Personal',
      expectedHour: 6,
      expectedMinute: 0,
      expectTomorrow: true,
    },
    {
      input: 'Review bug fixes at 11:15 am',
      expectedTitle: 'Review bug fixes',
      expectedCategory: 'Work',
      expectedHour: 11,
      expectedMinute: 15,
    },
    {
      input: 'Pay tax',
      expectedTitle: 'Pay tax',
      expectedCategory: 'Finance',
      expectedMinute: 0,
      expectOneHourAhead: true,
    },
    {
      input: 'Meet family tomorrow',
      expectedTitle: 'Meet family',
      expectedCategory: 'Contact',
      expectTomorrow: true,
      expectedMinute: 0,
      expectOneHourAhead: true,
    },
  ];

for (const testCase of cases) {
  test(`parses command: ${testCase.input}`, async () => {
    const before = new Date();
    const parsed = await parseTaskInputWithAi(testCase.input);
    const now = new Date();
    const due = parsed.dueDate;

    assert.equal(parsed.title, testCase.expectedTitle);
    assert.equal(parsed.category, testCase.expectedCategory);

    if (typeof testCase.expectedHour === 'number') {
      assert.equal(due.getHours(), testCase.expectedHour);
    }
    if (typeof testCase.expectedMinute === 'number') {
      assert.equal(due.getMinutes(), testCase.expectedMinute);
    }

    if (testCase.expectTomorrow) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      assert.equal(due.getDate(), tomorrow.getDate());
    }

    if (testCase.expectOneHourAhead) {
      if (typeof testCase.expectedHour !== 'number') {
        const expected = new Date(now);
        expected.setHours(now.getHours() + 1, 0, 0, 0);
        assert.equal(due.getMinutes(), 0);
        assert.equal(due.getHours(), expected.getHours());
        if (!testCase.expectTomorrow) {
          assert.ok(due.getTime() >= before.getTime());
          assert.ok(due.getTime() <= now.getTime() + 2 * 60 * 60 * 1000);
        }
      }
    }
  });
}
