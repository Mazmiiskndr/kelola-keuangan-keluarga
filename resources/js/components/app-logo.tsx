export default function AppLogo() {
    return (
        <>
            <span className="flex size-10 shrink-0 items-center justify-center group-data-[collapsible=icon]:mr-1 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:pr-2">
                <img src="/favicon.svg" alt="Finanxyra" className="size-full" />
            </span>
            <div className="ml-2 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-1 truncate text-lg leading-none font-semibold text-white">Finanxyra</span>
                <span className="truncate text-xs text-blue-100">Kelola Keuangan Keluarga</span>
            </div>
        </>
    );
}
