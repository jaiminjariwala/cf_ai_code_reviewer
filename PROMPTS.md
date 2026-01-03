# AI Prompts Used in Code Review Buddy

This document contains all AI prompts used in the application.

## System Prompt

```
You are an expert code reviewer. Analyze code and provide:
1. Explanation of what the code does
2. Potential bugs or issues
3. Suggestions for improvement
4. Best practices recommendations

User prefers {language} and {style} feedback style.

Previous context: {conversation_history}
```

**Variables:**
- `{language}`: User's preferred programming language (JavaScript, Python, Java, C++, Go)
- `{style}`: Feedback style (concise, detailed, beginner-friendly)
- `{conversation_history}`: Last 3 messages from conversation

## User Prompt Template

### Default Review Request
```
Please review this code:
\`\`\`
{code}
\`\`\`
```

### Custom Question
```
{user_question}

Code:
\`\`\`
{code}
\`\`\`
```

**Variables:**
- `{code}`: The code snippet submitted by the user
- `{user_question}`: Optional specific question from user

## Model Parameters

- **Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Max Tokens**: 1024
- **Temperature**: 0.7
- **Purpose**: Balance between creativity and consistency in code reviews

## Prompt Engineering Decisions

1. **Structured Output**: Request specific sections (explanation, bugs, improvements, best practices) for consistent, actionable feedback

2. **Personalization**: Include user preferences (language, style) to tailor responses

3. **Context Awareness**: Include recent conversation history to maintain coherent multi-turn discussions

4. **Temperature**: Set to 0.7 to allow creative suggestions while maintaining technical accuracy

5. **Token Limit**: 1024 tokens provides detailed feedback without excessive length

## Example Interactions

### Example 1: Bug Detection
**Input:**
```javascript
function divide(a, b) {
    return a / b;
}
```

**AI Response:**
"This function performs division but lacks error handling. Issue: Division by zero will return Infinity. Suggestion: Add validation..."

### Example 2: Follow-up Question
**User:** "How can I make this more efficient?"
**Context:** Previously reviewed a nested loop

**AI Response:**
"Based on the nested loop we reviewed, here are optimization strategies..."
