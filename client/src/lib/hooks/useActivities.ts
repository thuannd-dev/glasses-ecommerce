import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";
import type { FieldValues } from "react-hook-form";
import { useAccount } from "./useAccount";

export const useActivities = (id?: string) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAccount();
  const location = useLocation();

  //Doc of isPending: Will be pending if there's no cached data and no query attempt was finished yet.
  //That means isPending will be true although don't go to api to fetch data yet
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await agent.get<Activity[]>("/activities");
      return response.data;
    },
    enabled: !id && location.pathname === "/activities" && !!currentUser,
    //select is a option can be used to transform or select a part of the data returned
    // by the query function. It affects the returned data value, but does not affect what gets stored in the query cache.
    select: (data) => {
      return data.map((activity) => {
        return {
          ...activity,
          isHost: activity.hostId === currentUser?.id,
          isGoing: activity.attendees.some((x) => x.id === currentUser?.id),
        };
      });
    },
  });

  const { data: activity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["activities", id],
    queryFn: async () => {
      const respone = await agent.get<Activity>(`activities/${id}`);
      return respone.data;
    },
    enabled: !!id && !!currentUser,
    //select is a option can be used to transform or select a part of the data returned
    // by the query function. It affects the returned data value, but does not affect what gets stored in the query cache.
    select: (data) => {
      return {
        ...data,
        isHost: data.hostId === currentUser?.id,
        isGoing: data.attendees.some((x) => x.id === currentUser?.id),
      };
    },
  });

  const updateActivity = useMutation({
    mutationFn: async (activity: Activity) => {
      await agent.put(`/activities/${activity.id}`, activity);
    },
    onSuccess: async (_data, mutatedActivity) => {
      await queryClient.invalidateQueries({
        queryKey: ["activities", mutatedActivity.id],
      });
    },
  });

  const createActivity = useMutation({
    mutationFn: async (activity: FieldValues) => {
      const response = await agent.post("/activities", activity);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/activities/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async (id: string) => {
      await agent.post(`/activities/${id}/attend`);
    },
    //onSuccess?: ((data: void, variables: string, context: unknown) => unknown)
    //data is the result of mutationFn(if mutationFn has return value - no return is void)
    //variables is the same as the parameter of mutationFn
    // onSuccess: async () => {
    //   await queryClient.invalidateQueries({
    //     queryKey: ["activities", id],
    //   });
    // },

    //Optimistic Updates
    // When mutate is called:
    onMutate: async (activityId: string) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["activities", activityId] });

      // Snapshot the previous value
      const prevActivity = queryClient.getQueryData<Activity>([
        "activities",
        activityId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<Activity>(
        ["activities", activityId],
        (oldActivity) => {
          if (!oldActivity || !currentUser) return oldActivity;

          const isHost = oldActivity.hostId === currentUser.id;
          const isAttending = oldActivity.attendees.some(
            (x) => x.id === currentUser.id,
          );

          return {
            ...oldActivity,
            isCancelled: isHost
              ? !oldActivity.isCancelled
              : oldActivity.isCancelled,
            attendees: isAttending
              ? isHost
                ? oldActivity.attendees
                : oldActivity.attendees.filter((x) => x.id !== currentUser.id)
              : [
                  ...oldActivity.attendees,
                  {
                    id: currentUser.id,
                    displayName: currentUser.displayName,
                    imageUrl: currentUser.imageUrl,
                  },
                ],
          };
        },
      );

      // Return a context with the previous
      return { prevActivity };
    },
    // If the mutation fails, use the context we returned above
    onError: (error, activityId, context) => {
      console.log(error);
      if (context?.prevActivity) {
        queryClient.setQueryData(
          ["activities", activityId],
          context.prevActivity,
        );
      }
    },
    // Always refetch after error or success:
    onSettled: (activityId) => {
      queryClient.invalidateQueries({ queryKey: ["activities", activityId] });
    },
  });

  return {
    activities,
    isLoading,
    updateActivity,
    createActivity,
    deleteActivity,
    activity,
    isLoadingActivity,
    updateAttendance,
  };
};
