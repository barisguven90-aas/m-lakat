'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function PHProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        posthog.init('phc_UpNMqG48PLZz1uRuxuhs0aHwsVeMgBjY8hlPEIvIwjS', {
            api_host: 'https://us.i.posthog.com',
            capture_pageview: false // Disable manual pageview to handle it via router
        });
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', {
                $current_url: url,
            });
        }
    }, [pathname, searchParams]);

    return null;
}
