import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { NewPostForm } from "./NewPostForm";

export default async function Page() {
  if (!(await getCurrentUser())) redirect("/login");
  return <NewPostForm />;
}
