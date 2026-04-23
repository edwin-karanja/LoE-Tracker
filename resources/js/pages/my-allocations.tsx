import type { ComponentProps } from 'react';
import MyAllocationsIndex from '@/pages/MyAllocations/index';
import { myAllocations } from '@/routes';

type MyAllocationsProps = ComponentProps<typeof MyAllocationsIndex>;

export default function MyAllocations(props: MyAllocationsProps) {
    return <MyAllocationsIndex {...props} />;
}

MyAllocations.layout = {
    breadcrumbs: [
        {
            title: 'My Allocations',
            href: myAllocations(),
        },
    ],
};
