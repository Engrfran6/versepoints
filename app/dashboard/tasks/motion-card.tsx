"use client";

import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CheckCircle2, Clock, ExternalLink, Gift, Pause} from "lucide-react";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {StatusButton} from "./status-btn";

type TaskCardProps = {
  task: any;
  isCompleted: boolean;
  isPending: boolean;
  isPaused: boolean;
  isSpecialTask: boolean;
  handleStartTask: (task: any) => void;
  getTaskIcon: (type: string) => React.ReactNode;
};

const MotionCard = motion(Card);

export function TaskCard({
  task,
  isCompleted,
  isPending,
  isPaused,
  isSpecialTask,
  handleStartTask,
  getTaskIcon,
}: TaskCardProps) {
  return (
    <MotionCard
      layout
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -8}}
      transition={{duration: 0.2, ease: "easeOut"}}
      className={cn(
        "group relative overflow-hidden border bg-card/90 backdrop-blur-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-primary/30",
        {
          "opacity-60 bg-green-500/5 border-green-500/20": isCompleted,
          "opacity-60 bg-red-500/5 border-red-500/20": isPaused,
          "opacity-80 bg-yellow-500/5 border-yellow-500/20": isPending,
        }
      )}>
      {/* Status bar */}
      <div
        className={cn("absolute left-0 top-0 h-full w-1", {
          "bg-green-500": isCompleted,
          "bg-red-500": isPaused,
          "bg-yellow-500": isPending,
          "bg-primary": !isCompleted && !isPaused && !isPending,
        })}
      />

      <CardContent className="p-5 sm:p-6">
        <div className="flex gap-3 flex-row items-start justify-between">
          {/* LEFT */}
          <div className="flex gap-4">
            {/* <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl",
                "bg-muted text-foreground/80",
                {
                  "bg-green-500/10 text-green-500": isCompleted,
                  "bg-red-500/10 text-red-500": isPaused,
                  "bg-yellow-500/10 text-yellow-500": isPending,
                }
              )}>
              {getTaskIcon(task.task_type)}
            </div> */}

            <div className="space-y-1">
              <h3 className="flex items-center gap-2 font-semibold leading-tight">
                {task.title}
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                {task.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  <Gift className="h-3 w-3" />+{task.points_reward} VP
                </span>

                <span className="text-xs capitalize text-muted-foreground">{task.task_type}</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 sm:items-center">
            {isCompleted ? (
              <StatusButton icon={CheckCircle2} label="Completed" color="green" />
            ) : isPending ? (
              <StatusButton icon={Clock} label="Pending" color="yellow" />
            ) : isPaused ? (
              <StatusButton icon={Pause} label="Paused" color="red" />
            ) : (
              <Button
                onClick={() => handleStartTask(task)}
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {isSpecialTask ? "Go" : "Start"}
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}
