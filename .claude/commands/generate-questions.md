Generate a new batch of questions for the requested section.

Workflow:

1. Read CLAUDE.md.
2. Read:
   .claude/skills/source-grounding/SKILL.md
3. Read:
   .claude/skills/quiz-content/SKILL.md
4. Read:
   .claude/skills/question-quality/SKILL.md
5. Inspect the corresponding pages of:
   docs/source/TEMA_2.pdf
6. Inspect existing questions for the same topic.
7. Generate new questions.
8. Validate every question.
9. Run duplicate detection.
10. Update question statistics.

Never generate unsupported questions.

Never overwrite valid existing questions unless explicitly requested.