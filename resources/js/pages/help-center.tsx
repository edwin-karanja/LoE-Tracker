import type { ComponentProps } from 'react';
import HelpCenterIndex from '@/pages/HelpCenter/index';
import { helpCenter } from '@/routes';

type HelpCenterProps = ComponentProps<typeof HelpCenterIndex>;

export default function HelpCenter(props: HelpCenterProps) {
    return <HelpCenterIndex {...props} />;
}

HelpCenter.layout = {
    breadcrumbs: [
        {
            title: 'Help Center',
            href: helpCenter(),
        },
    ],
};
