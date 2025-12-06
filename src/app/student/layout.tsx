import { SidebarProvider } from "@/components/providers/SidebarContext";
import StudentLayoutWrapper from "@/components/student/StudentLayoutWrapper";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <StudentLayoutWrapper>{children}</StudentLayoutWrapper>
        </SidebarProvider>
    );
}
