import { PrompterDialog } from "../../utils/PrompterDialog";

export namespace Prompter {
    export async function prompt(
        actionLabel: string,
        title: string,
        question: string,
        action: () => void
    ) {
        const selectedOption = await PrompterDialog.prompt(
            [actionLabel, "Cancel"],
            title,
            question
        );

        if (selectedOption !== 0) {
            return;
        }

        action();
    }
}
