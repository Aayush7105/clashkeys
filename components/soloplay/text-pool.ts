export const WORDS_TEXT_POOL = [
  "the quick brown fox jumps over the lazy dog",
  "success is not final failure is not fatal it is the courage to continue that counts",
  "programming is the art of telling another human what he wants the computer to do",
  "in the middle of every difficulty lies opportunity",
  "move fast and break things unless you are breaking things you are not moving fast enough",
  "the only way to do great work is to love what you do",
  "focus is a matter of deciding what things you are not going to do",
  "your time is limited so dont waste it living someone elses life",
  "growth begins the moment you take responsibility for your choices and stop blaming circumstances because while you cannot always control what happens to you you can always control how you respond and what actions you decide to take next",
  "confidence does not come from always being right it comes from being willing to learn adjust and keep moving forward even after making mistakes that once felt embarrassing",
  "every expert was once a beginner who decided not to quit when confusion made learning feel overwhelming and frustrating",
  "small improvements repeated daily create massive results over time because success is rarely about dramatic breakthroughs and more often about showing up when you do not feel like it",
  "discipline is choosing what you want most over what you want right now even when motivation fades and distractions seem more exciting than the long term rewards you are quietly building through consistent effort",
  "success leaves clues in the routines and discipline of those who consistently achieve meaningful results if you wait until you feel ready you may wait forever because readiness often arrives after you take the first step",
  "clear goals turn scattered effort into focused action making each hour more productive and intentional mistakes are feedback not failure when you use them to refine your strategy instead of questioning your worth"
];

export const PUNCTUATION_TEXT_POOL = [
  "A developer's growth depends on today's effort, not yesterday's excuses, and when progress feels slow - do you quit, or do you adjust your plan and keep moving forward despite doubt and distraction, because improvement isn't magic, it's repetition and deliberate practice every single day.",

  "Success isn't built in a day, it's built in small steps, and each step's importance grows over time - so when motivation disappears and comfort looks tempting, do you choose discipline, or do you choose delay, knowing that tomorrow's results depend entirely on today's decisions.",

  "Your focus's strength determines your output, and in a world full of noise, notifications, and endless scrolling, can you protect your attention, or will you let minor distractions steal hours from your goals - hours you will never recover once they're gone.",

  "A programmer's mindset requires patience, curiosity, and resilience, and when a bug refuses to disappear after hours of debugging, do you panic, or do you slow down, review the logic, and test each assumption - because every problem's solution hides behind careful thinking.",

  "Confidence grows from preparation, not luck, and preparation's foundation is consistency, so when others ask why you're practicing again and again, do you feel embarrassed, or do you remember that mastery isn't random - it's built through repeated effort and honest self correction.",

  "Time's value increases as deadlines approach, and when the clock's ticking faster than expected, do you freeze under pressure, or do you prioritize, eliminate distractions, and execute with clarity - because stress isn't the enemy, poor planning is.",

  "Discipline isn't harsh, it's protective, and your future self's success depends on today's controlled actions, so when comfort's voice whispers that you deserve a break before you've earned it, do you listen, or do you choose long term growth over short term relief - knowing habits shape destiny.",

  "Every skill's improvement follows a pattern, practice, mistake, adjustment, repetition, and when frustration builds after repeated errors, do you blame your ability, or do you refine your process and continue - understanding that progress isn't visible until consistency compounds over weeks and months."
];

export const NUMBERS_TEXT_POOL = [
  "version 2.4.1 shipped on 2026-03-02 after 17 review comments",
  "pay 19.99 now and save 25% before 11:59 pm tonight",
  "team alpha scored 84 points while team beta finished at 79",
  "meeting starts at 09:30 and ends at 10:45 in room 12",
  "daily target is 7500 steps and 2 liters of water",
  "cpu usage hit 91% for 3 minutes during load test 07",
  "invoice #1048 includes 6 items totaling 482.50 dollars",
  "backup runs every 6 hours with a 30-day retention policy",
];

export const QUOTE_TEXT_POOL = [
  "Do what you can, with what you have, where you are.",
  "The best way out is always through.",
  "Action is the foundational key to all success.",
  "If you are going through hell, keep going.",
  "Simplicity is the ultimate sophistication.",
];

export const CODE_TEXT_POOL = [
  "const score = points + bonus;",
  "if (isReady) { startTest(); }",
  "for (let i = 0; i < items.length; i++) { total += items[i]; }",
  "function greet(name) { return `hello ${name}`; }",
  "await fetch('/api/room?mode=code');",
  "socket.emit('start-test', { mode: 'code', duration: 30 });",
  "type Player = { id: string; wpm: number };",
  "const isValid = value !== null && value !== undefined;",
];

// Backward-compatible alias used by multiplayer constants.
export const SOLO_TEXT_POOL = WORDS_TEXT_POOL;
