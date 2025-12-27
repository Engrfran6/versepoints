import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import TasksTable from "./task-table";
import {AdminTasksVerification} from "@/components/admin/admin-tasks-verification";
import {supabaseAdmin} from "@/lib/supabase/admin";

export default async function AdminTasksPage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const {data: admin} = await supabase.from("users").select("is_admin").eq("id", user.id).single();

  if (!admin?.is_admin) redirect("/dashboard");

  const {data: tasks} = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", {ascending: false});

  const {data: submissions} = await supabaseAdmin
    .from("task_submissions")
    .select(
      `
      *,
      users:user_id(id, username, email),
      tasks:task_id(id, title, description, points_reward, platform, task_type)
    `
    )
    .order("created_at", {ascending: false});

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Management</h1>
        <p className="text-muted-foreground">Manage tasks and verify user submissions</p>
      </div>

      <Tabs defaultValue="manage">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="manage">Manage Tasks</TabsTrigger>
          <TabsTrigger value="verify">Verify Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <TasksTable tasks={tasks ?? []} />
        </TabsContent>

        <TabsContent value="verify">
          <AdminTasksVerification submissions={submissions ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
