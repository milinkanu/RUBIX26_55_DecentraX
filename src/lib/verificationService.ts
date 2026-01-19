
export const calculateVerificationScore = (
    itemData: any,
    claimAnswers: { question: string; answer: string }[]
): { score: number; details: { question: string; answer: string; isCorrect: boolean }[] } => {
    let correctAnswers = 0;
    const totalQuestions = claimAnswers.length;
    const details = [];

    // 1. Evaluate Custom Questions (50% weight)
    const finderQuestions = itemData.questions || [];

    // Create a map for quick lookup if needed, but for now we iterate to match text
    // Assuming the questions array matches, OR we match by question text

    // We expect the claimant to send answers correlated to the questions
    // Let's iterate through the provided answers and match them with finder's questions

    for (const ans of claimAnswers) {
        // Find corresponding question in finder's set
        const matchingQuestion = finderQuestions.find((q: any) => q.question === ans.question);

        let isCorrect = false;

        if (matchingQuestion) {
            // Simple robust comparison
            const expected = matchingQuestion.answer.toLowerCase().trim();
            const provided = ans.answer.toLowerCase().trim();

            if (expected === provided || provided.includes(expected)) {
                isCorrect = true;
                correctAnswers++;
            }
        }

        details.push({
            question: ans.question,
            answer: ans.answer,
            isCorrect
        });
    }

    // Calculate base score from questions
    let score = 0;
    if (finderQuestions.length > 0) {
        score += (correctAnswers / finderQuestions.length) * 50;
    } else {
        // If no custom questions, we rely on other factors or give neutral score
        score += 20;
    }

    // 2. Metadata Matching (Additional Points)

    // For now, we simulate "Metadata Match" since we don't have claimant's "Lost Report" to compare against.
    // In a full system, we would compare the "Lost Report" location vs "Found Item" location.

    // Simple heuristic: Length of answers. Longer, descriptive answers usually indicate more knowledge
    // (Simulating "Keyword Similarity" from user prompt)
    const avgAnswerLength = claimAnswers.reduce((acc, curr) => acc + curr.answer.length, 0) / (totalQuestions || 1);
    if (avgAnswerLength > 10) score += 10;
    if (avgAnswerLength > 20) score += 10;

    // Cap at 100
    score = Math.min(Math.round(score), 100);

    return { score, details };
};
