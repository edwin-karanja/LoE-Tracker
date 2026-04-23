<?php

return [
    'articles' => [
        [
            'id' => 'getting-started',
            'title' => 'Getting Started With the LoE Tracker',
            'summary' => 'A quick walkthrough of the main contributor pages and the monthly reporting flow.',
            'sections' => [
                [
                    'title' => 'Dashboard overview',
                    'content' => [
                        'Use the dashboard to review the current reporting week, check your submission deadline, and update your weekly Level of Effort allocations.',
                        'The deadline card shows whether the current week is still counting down or already overdue. If the pulse remains in draft after the deadline, the reminder banner will appear automatically.',
                    ],
                ],
                [
                    'title' => 'Weekly LoE Tracker',
                    'content' => [
                        'Each project row shows the week columns for the current reporting month. The highlighted week is the one currently selected in the reporting period picker.',
                        'For the selected week, you can adjust values inline using the plus and minus controls or type a percentage directly into the input field.',
                    ],
                ],
            ],
        ],
        [
            'id' => 'saving-and-submitting',
            'title' => 'Saving Changes and Submitting Your Weekly Pulse',
            'summary' => 'Understand the difference between saving a draft and submitting your final weekly pulse.',
            'sections' => [
                [
                    'title' => 'Save changes',
                    'content' => [
                        'Save changes stores your current LoE values as a draft for the selected week. You should use this whenever you are still refining allocations and do not want to finalize the week yet.',
                        'If the page shows an Unsaved changes badge, the current values have not been written to the backend yet.',
                    ],
                ],
                [
                    'title' => 'Submit week’s pulse',
                    'content' => [
                        'Submit week’s pulse finalizes that week as your official record. After submission, the pulse becomes locked unless an administrator authorizes a change.',
                        'If the pulse is overdue and still in draft, review your entries and submit as soon as possible so the weekly record is completed.',
                    ],
                ],
            ],
        ],
        [
            'id' => 'my-allocations',
            'title' => 'Using the My Allocations Page',
            'summary' => 'View your admin-prepared monthly allocation snapshots for the current month and previous months.',
            'sections' => [
                [
                    'title' => 'Monthly snapshots',
                    'content' => [
                        'The My Allocations page is read-only and shows the monthly allocation prepared for you by administrators. It is separate from the weekly pulse editing experience on the dashboard.',
                        'Use the month selector to switch between the current month and previous allocation snapshots. The summary cards show total allocation, availability, and the number of assigned projects for the selected month.',
                    ],
                ],
                [
                    'title' => 'Reading allocation breakdowns',
                    'content' => [
                        'Each row in the allocation table shows the project name, stream, and the percentage allocated for that month.',
                        'If a month does not have a prepared allocation yet, the page will show an empty-state message instead of editable controls.',
                    ],
                ],
            ],
        ],
    ],
];
