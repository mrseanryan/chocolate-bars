import { PrompterDialog } from "../../utils/PrompterDialog";

export namespace ConfirmationDialog {
    export async function show(title: string, message: string, action: () => void) {
        await PrompterDialog.prompt(["OK"], title, message);

        action();
    }
}
