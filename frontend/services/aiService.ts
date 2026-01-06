import { InvestigationCase, AccusationResult } from '../types';
import { detectiveAI } from './geminiService';

export const aiService = {
    generateAccusation: async (caseData: InvestigationCase): Promise<AccusationResult> => {
        try {
            console.log("Requesting AI accusation...");
            // Attempt to get real AI response
            const result = await detectiveAI.generateAccusationJSON(caseData);

            if (validateAccusation(result)) {
                return result;
            } else {
                throw new Error("Invalid AI response structure");
            }
        } catch (error) {
            console.warn("AI generation failed or API key missing, falling back to mock data.", error);
            // Simulate network delay if defaulting to mock immediately
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getMockAccusation();
        }
    }
};

function validateAccusation(data: any): data is AccusationResult {
    return data && data.case_overview && data.killer_reveal && Array.isArray(data.suspects_analysis);
}

function getMockAccusation(): AccusationResult {
    return {
        case_overview: {
            summary: "A tangled web of deception where every party had a secret, but only one had a fatal intent. The surface narrative of a simple dispute masks a cold, calculated elimination. (Mock Data - AI Unavailable)"
        },
        victim_profile: {
            name: "Arthur Thorne",
            background: "The patriarch of the Thorne dynasty. A man who built an empire on ruthlessness, leaving a trail of enemies—and disappointed heirs—in his wake."
        },
        suspects_analysis: [
            {
                suspect_id: "suspect_1",
                name: "Eleanor Thorne",
                initial_suspicion: "As the grieving widow, she stood to inherit the majority of the estate.",
                why_not_guilty: "Her devotion was genuine, and the forensic timeline places her in the garden at the time of the incident."
            },
            {
                suspect_id: "suspect_2",
                name: "Sebastian Thorne",
                initial_suspicion: "The prodigal son, cut off from funds and desperate to cover gambling debts.",
                why_not_guilty: "He lacked the specific knowledge of the security system bypass used by the killer."
            }
        ],
        key_evidence: [
            {
                evidence_id: "clue_1",
                description: "The Muddy Footprints",
                importance: "They led away from the study, but their size did not match the presumed intruder."
            },
            {
                evidence_id: "clue_2",
                description: "The Broken Pocket Watch",
                importance: "Stopped exactly at 9:45 PM, providing a staged time of death that contradicted the medical examiner's report."
            }
        ],
        timeline_reconstruction: [
            {
                time: "21:30",
                event: "The killer enters the study via the servant's passage.",
                implication: "This suggests intimate knowledge of the house layout."
            },
            {
                time: "21:45",
                event: "The struggle occurs. The watch is broken intentionally.",
                implication: "A deliberate attempt to create a false alibi window."
            }
        ],
        motive: {
            description: "Fear of exposure rather than greed. The victim was about to alter his will to cut out the killer, not for money, but to protect the family legacy from scandal."
        },
        method: {
            description: "Poisoned tea identified as 'Nightshade Blend', administered prior to the blunt force trauma to stage a robbery gone wrong."
        },
        killer_reveal: {
            suspect_id: "suspect_3",
            name: "Julian Thorne",
            reveal_line: "It was always the quiet ones who listen most intently at keyholes."
        },
        final_monologue: {
            text: "Justice is a machine that requires all parts to function. Tonight, we have greased its gears with the truth. Julian thought he could outsmart the legacy, but in the end, he became just another footnote in its dark history."
        }
    };
}
