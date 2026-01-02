// app/tasks/page.tsx (SERVER COMPONENT)
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {TasksContent} from "./tasks-content";

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return <TasksContent userId={user.id} />;
}
