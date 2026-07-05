import { type SearchResultGroup } from '@/types/finance';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

export function useGlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // If query is too short, clear results
        if (query.trim().length < MIN_QUERY_LENGTH) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        debounceRef.current = setTimeout(async () => {
            // Abort previous request
            if (abortRef.current) {
                abortRef.current.abort();
            }

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch(
                    `/search/suggestions?q=${encodeURIComponent(query.trim())}`,
                    { signal: controller.signal },
                );

                if (!response.ok) throw new Error('Search failed');

                const data = await response.json();
                setResults(data.groups ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setResults([]);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const clear = useCallback(() => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
        if (abortRef.current) {
            abortRef.current.abort();
        }
    }, []);

    const totalResults = results.reduce((sum, group) => sum + group.results.length, 0);

    return {
        query,
        setQuery,
        results,
        isLoading,
        isOpen,
        setIsOpen,
        isEmpty: !isLoading && query.trim().length >= MIN_QUERY_LENGTH && totalResults === 0,
        totalResults,
        clear,
    };
}
