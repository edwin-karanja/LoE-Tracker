import { router } from '@inertiajs/react';
import { AlertTriangle, LockKeyhole, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    submit as submitWeeklyPulse,
    update as updateWeeklyPulse,
} from '@/routes/weekly-pulses';

type AllocationRow = {
    projectId: number;
};

type WeeklyPulse = {
    id: number;
    status: string;
};

type SubmitWeeklyPulseDialogProps = {
    allocationRows: AllocationRow[];
    canSubmit: boolean;
    editableAllocations: Record<number, number>;
    hasUnsavedChanges: boolean;
    weeklyPulse: WeeklyPulse;
};

export function SubmitWeeklyPulseDialog({
    allocationRows,
    canSubmit,
    editableAllocations,
    hasUnsavedChanges,
    weeklyPulse,
}: SubmitWeeklyPulseDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buildPulseItemsPayload = () => ({
        items: allocationRows.map((row) => ({
            allocation_percent: editableAllocations[row.projectId] ?? 0,
            project_id: row.projectId,
        })),
    });

    const handleOpen = () => {
        if (!canSubmit) {
            return;
        }

        setIsOpen(true);
    };

    const handleConfirm = () => {
        setIsSubmitting(true);

        if (hasUnsavedChanges) {
            router.visit(updateWeeklyPulse(weeklyPulse.id), {
                data: buildPulseItemsPayload(),
                preserveScroll: true,
                onSuccess: () => {
                    router.visit(submitWeeklyPulse(weeklyPulse.id), {
                        preserveScroll: true,
                        onFinish: () => {
                            setIsSubmitting(false);
                            setIsOpen(false);
                        },
                    });
                },
                onError: () => {
                    setIsSubmitting(false);
                },
                onCancel: () => {
                    setIsSubmitting(false);
                },
            });

            return;
        }

        router.visit(submitWeeklyPulse(weeklyPulse.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setIsOpen(false);
            },
        });
    };

    return (
        <>
            <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleOpen}
                disabled={!canSubmit || isSubmitting}
            >
                <Send className="size-4" />
                Submit week&apos;s pulse
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0 shadow-xl sm:max-w-xl">
                    <div className="relative">
                        <DialogHeader className="gap-4 px-7 pt-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                                        <LockKeyhole className="size-6 text-slate-700" />
                                    </div>
                                    <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                                        Submit weekly pulse?
                                    </DialogTitle>
                                </div>
                                <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.24em] text-slate-700 uppercase">
                                    Final step
                                </div>
                            </div>
                            <div className="space-y-2">
                                <DialogDescription className="max-w-lg text-sm leading-6 text-slate-600">
                                    Once submitted, these LoE values become part
                                    of the official weekly record and can only
                                    be changed with administrator authorization.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="px-7 py-6">
                            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="size-5 text-amber-700" />
                                    <p className="text-sm font-semibold tracking-[0.18em] text-amber-900 uppercase">
                                        Submission notice
                                    </p>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-700">
                                    Review your values carefully before
                                    continuing. If you still need to refine the
                                    allocation, keep this pulse in draft and
                                    save it instead.
                                </p>
                                {hasUnsavedChanges ? (
                                    <p className="mt-3 text-sm font-medium text-amber-900">
                                        Unsaved changes will be saved
                                        automatically before submission.
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <DialogFooter className="border-t border-slate-200 bg-slate-50 px-7 py-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                            >
                                Keep as draft
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Submitting...'
                                    : 'Confirm submission'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
