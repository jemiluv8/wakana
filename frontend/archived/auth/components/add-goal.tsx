"use client";

import { LucidePlus } from "lucide-react";
import { useReducer } from "react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  CATEGORY_OPTIONS,
  EDITOR_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/constants";
import { NEXT_PUBLIC_API_URL } from "@/lib/constants/config";
import { Project } from "@/lib/types";

import { ClickToSelect } from "../../../components/click-to-select";
import { Icons } from "../../../components/icons";
import { Input } from "../../../components/ui/input";
import WMultiSelect from "../../../components/w-multi-select";

// Define the GoalActionType enum
enum GoalActionType {
  RESET = "RESET",
  SET_CODE_MORE = "SET_CODE_MORE",
  SET_LOADING = "SET_LOADING",
  SET_DIALOG_OPEN = "SET_DIALOG_OPEN",
  SET_TARGET_DURATION = "SET_TARGET_DURATION",
  SET_SELECTED_GOAL_OPTION = "SET_SELECTED_GOAL_OPTION",
  SET_TARGET_DURATION_TYPE = "SET_TARGET_DURATION_TYPE",
  SET_TARGET_DURATION_PERIOD = "SET_TARGET_DURATION_PERIOD",
  SET_SELECTED_LANGUAGES = "SET_SELECTED_LANGUAGES",
  SET_SELECTED_EDITORS = "SET_SELECTED_EDITORS",
  SET_SELECTED_CATEGORIES = "SET_SELECTED_CATEGORIES",
  SET_SELECTED_PROJECTS = "SET_SELECTED_PROJECTS",
  SET_HAS_COMPLETED_SECOND_STEP = "SET_HAS_COMPLETED_SECOND_STEP",
}

// Define the GoalState type
type GoalState = {
  codeMore: string;
  loading: boolean;
  dialogOpen: boolean;
  targetDuration: string;
  selectedGoalOption: string;
  targetDurationType: string;
  targetDurationPeriod: string;
  selectedLanguages: string[];
  selectedEditors: string[];
  selectedCategories: string[];
  selectedProjects: string[];
  hasCompletedSecondStep: boolean;
};

const initialState: GoalState = {
  codeMore: "",
  loading: false,
  dialogOpen: false,
  targetDuration: "",
  selectedGoalOption: "",
  targetDurationType: "hrs",
  targetDurationPeriod: "day",
  selectedLanguages: [],
  selectedEditors: [],
  selectedCategories: [],
  selectedProjects: [],
  hasCompletedSecondStep: false,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum GoalOption {
  overall = "overall",
  language = "language",
  editor = "editor",
  category = "category",
  project = "project",
}

type GoalOptions = keyof typeof GoalOption;
export type ConfigurableGoalOptions = Exclude<
  keyof typeof GoalOption,
  "overall"
>;

type GoalOptionItem = {
  label: string;
  value: GoalOptions;
};

function reducer(
  state: GoalState,
  action: { type: GoalActionType; payload: any }
): GoalState {
  switch (action.type) {
    case GoalActionType.RESET:
      return initialState;
    case GoalActionType.SET_CODE_MORE:
      return { ...state, codeMore: action.payload };
    case GoalActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case GoalActionType.SET_DIALOG_OPEN:
      return { ...state, dialogOpen: action.payload };
    case GoalActionType.SET_TARGET_DURATION:
      return { ...state, targetDuration: action.payload };
    case GoalActionType.SET_SELECTED_GOAL_OPTION:
      return { ...state, selectedGoalOption: action.payload };
    case GoalActionType.SET_TARGET_DURATION_TYPE:
      return { ...state, targetDurationType: action.payload };
    case GoalActionType.SET_TARGET_DURATION_PERIOD:
      return { ...state, targetDurationPeriod: action.payload };
    case GoalActionType.SET_SELECTED_LANGUAGES:
      return { ...state, selectedLanguages: action.payload };
    case GoalActionType.SET_SELECTED_EDITORS:
      return { ...state, selectedEditors: action.payload };
    case GoalActionType.SET_SELECTED_CATEGORIES:
      return { ...state, selectedCategories: action.payload };
    case GoalActionType.SET_SELECTED_PROJECTS:
      return { ...state, selectedProjects: action.payload };
    case GoalActionType.SET_HAS_COMPLETED_SECOND_STEP:
      return { ...state, hasCompletedSecondStep: action.payload };
    default:
      return state;
  }
}

export function AddGoalDialog({
  onAddGoal,
  projects,
  token,
}: {
  onAddGoal: (goal: any) => void;
  projects: Project[];
  token: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    codeMore,
    loading,
    dialogOpen,
    targetDuration,
    selectedGoalOption,
    targetDurationType,
    targetDurationPeriod,
    selectedLanguages,
    selectedEditors,
    selectedCategories,
    selectedProjects,
    hasCompletedSecondStep,
  } = state;

  const getDurationSeconds = React.useMemo(() => {
    const duration = parseInt(targetDuration);
    if (targetDurationType === "hrs") {
      return duration * 3600;
    }
    if (targetDurationType === "mins") {
      return duration * 60;
    }
    return duration;
  }, [targetDuration, targetDurationType]);

  const resourceUrl = `${NEXT_PUBLIC_API_URL}/api/v1/users/current/goals`;

  const createGoal = async () => {
    try {
      dispatch({ type: GoalActionType.SET_LOADING, payload: true });
      const response = await fetch(resourceUrl, {
        method: "POST",
        body: JSON.stringify({
          projects: selectedProjects,
          languages: selectedLanguages,
          categories: selectedCategories,
          seconds: getDurationSeconds,
          delta: targetDurationPeriod,
          type: "coding", // if this is hardcoded, what's the use?
        }),
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          token: `${token}`,
        },
      });
      if (!response.ok) {
        toast({
          title: "Failed to create goal",
          variant: "destructive",
        });
      } else {
        const responseJson = await response.json();
        toast({
          title: "Goal Created",
          variant: "success",
        });
        onAddGoal(responseJson.data);
        dispatch({ type: GoalActionType.RESET, payload: true });
      }
    } finally {
      dispatch({ type: GoalActionType.SET_LOADING, payload: false });
    }
  };

  const PROJECT_OPTIONS = React.useMemo(() => {
    return projects.map((project) => {
      return { label: project.name, value: project.id || "" };
    });
  }, [projects]);

  const goalOptions: GoalOptionItem[] = [
    { label: "overall", value: "overall" },
    { label: "in a project...", value: "project" },
    { label: "in a language...", value: "language" },
    { label: "using an editor...", value: "editor" },
    { label: "in a category...", value: "category" },
  ];

  const getProjectsFinalConfigSuffix = () => {
    const config: Record<string, string[]> = {
      projects: selectedProjects,
      categories: selectedCategories,
      languages: selectedLanguages,
      editors: selectedEditors,
    };
    const selectedOption = config[selectedGoalOption];
    return selectedOption ? selectedOption.join(", ") : "";
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) =>
        dispatch({ type: GoalActionType.SET_DIALOG_OPEN, payload: open })
      }
    >
      <DialogTrigger asChild>
        <Button
          onClick={() =>
            dispatch({ type: GoalActionType.SET_DIALOG_OPEN, payload: true })
          }
          variant="outline"
          className="bg-black text-white"
        >
          <LucidePlus className="size-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[625px]">
        <DialogHeader className="text-black">
          <DialogTitle className="text-black">New Goal</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new goal here
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div>
          {!selectedGoalOption && (
            <div className="mb-8 flex items-baseline py-4">
              <h1
                className="text-black"
                style={{ fontSize: "30px", fontWeight: 400 }}
              >
                {"I want to code "}
                <ClickToSelect
                  options={["more", "less"]}
                  onChange={(value: string) =>
                    dispatch({
                      type: GoalActionType.SET_CODE_MORE,
                      payload: value,
                    })
                  }
                  value={codeMore}
                />
              </h1>{" "}
              <span className="font-bold">{" ..."}</span>
            </div>
          )}
          {!selectedGoalOption && (
            <div className="flex flex-col gap-10">
              {goalOptions.map((goalOption, index) => (
                <Button
                  key={index}
                  className="block w-full text-white"
                  variant={"outline"}
                  size={"lg"}
                  style={{
                    borderRadius: "6px",
                    fontSize: "18px",
                    padding: "10px 16px",
                    lineHeight: 1.33,
                  }}
                  onClick={() => {
                    dispatch({
                      type: GoalActionType.SET_SELECTED_GOAL_OPTION,
                      payload: goalOption.value,
                    });
                    if (goalOption.value === "overall") {
                      dispatch({
                        type: GoalActionType.SET_HAS_COMPLETED_SECOND_STEP,
                        payload: true,
                      });
                    }
                  }}
                >
                  {goalOption.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {selectedGoalOption === "language" && !hasCompletedSecondStep && (
          <WMultiSelect
            title="I want to spend more time in languages…"
            options={LANGUAGE_OPTIONS}
            onSelectedOptionsChanged={(options: string[]) =>
              dispatch({
                type: GoalActionType.SET_SELECTED_LANGUAGES,
                payload: options,
              })
            }
            placeholder="Select languages"
          />
        )}
        {selectedGoalOption === "editor" && (
          <WMultiSelect
            options={EDITOR_OPTIONS}
            onSelectedOptionsChanged={(options: string[]) =>
              dispatch({
                type: GoalActionType.SET_SELECTED_EDITORS,
                payload: options,
              })
            }
            title="I want to spend more time in editors..."
            placeholder="Select editors"
          />
        )}
        {selectedGoalOption === "category" && (
          <WMultiSelect
            title="I want to spend more time in categories..."
            options={CATEGORY_OPTIONS}
            onSelectedOptionsChanged={(options: string[]) =>
              dispatch({
                type: GoalActionType.SET_SELECTED_CATEGORIES,
                payload: options,
              })
            }
            placeholder="Select categories"
          />
        )}
        {selectedGoalOption === "project" && (
          <WMultiSelect
            title="I want to spend more time in projects..."
            options={PROJECT_OPTIONS}
            onSelectedOptionsChanged={(options: string[]) =>
              dispatch({
                type: GoalActionType.SET_SELECTED_PROJECTS,
                payload: options,
              })
            }
            placeholder="Select projects"
          />
        )}
        {hasCompletedSecondStep && (
          <div className="mb-8 flex items-baseline py-4">
            <h1
              className="text-black"
              style={{ fontSize: "24px", fontWeight: 400 }}
            >
              {"I want to code at least "}
              <Input
                pattern="^[^eE]+$"
                onChange={(event) =>
                  dispatch({
                    type: GoalActionType.SET_TARGET_DURATION,
                    payload: event.target.value,
                  })
                }
                type="number"
                className="mr-1 inline-block w-16"
              />
              <ClickToSelect
                options={["hrs", "mins", "secs"]}
                onChange={(value: string) =>
                  dispatch({
                    type: GoalActionType.SET_TARGET_DURATION_TYPE,
                    payload: value,
                  })
                }
                value={targetDurationType}
              />
              {" per "}
              <ClickToSelect
                options={["day", "week", "month"]}
                onChange={(value: string) =>
                  dispatch({
                    type: GoalActionType.SET_TARGET_DURATION_PERIOD,
                    payload: value,
                  })
                }
                value={targetDurationPeriod}
              />
              {" in "}
              {selectedGoalOption + (selectedLanguages.length > 1 ? "s " : " ")}
              {getProjectsFinalConfigSuffix()}
            </h1>{" "}
          </div>
        )}
        {!hasCompletedSecondStep && selectedGoalOption && (
          <Button
            className="block w-full"
            variant={"outline"}
            size={"lg"}
            style={{
              borderRadius: "6px",
              fontSize: "18px",
              padding: "10px 16px",
              lineHeight: 1.33,
              color: "white",
            }}
            onClick={() =>
              dispatch({
                type: GoalActionType.SET_HAS_COMPLETED_SECOND_STEP,
                payload: true,
              })
            }
            disabled={
              ![
                selectedLanguages,
                selectedCategories,
                selectedEditors,
                selectedProjects,
              ].some((option) => option.length > 0)
            }
          >
            Continue
          </Button>
        )}
        {hasCompletedSecondStep && (
          <Button
            className="block w-full"
            variant={"outline"}
            size={"lg"}
            style={{
              borderRadius: "6px",
              fontSize: "18px",
              padding: "10px 16px",
              lineHeight: 1.33,
            }}
            onClick={createGoal}
            disabled={!targetDuration || +targetDuration <= 0}
          >
            Finish
            {loading && <Icons.spinner className="mr-2 size-5 animate-spin" />}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
