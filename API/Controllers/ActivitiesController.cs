using System;
using Application.Activities.Queries;
using Application.Activities.Commands;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Activities.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

public class ActivitiesController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<ActivityDto>>> GetActivities()
    {
        return await Mediator.Send(new GetActivityList.Query());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityDto>> GetActivityDetail(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetActivityDetails.Query { Id = id }));
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateActivity(CreateActivityDto activityDto)
    {
        return HandleResult(await Mediator.Send(new CreateActivity.Command { ActivityDto = activityDto }));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> EditActivity(Guid id, EditActivityDto activity)
    {
        activity.Id = id;
        //await Mediator.Send(new EditActivity.Command { Activity = activity }) return value type Result Unit
        //You can also leave with type of controller is Task<ActionResult<Unit>> but user will get a body with {} -empty object
        //This can't give valuable for user. => just return Task<ActionResult>
        return HandleResult(await Mediator.Send(new EditActivity.Command { ActivityDto = activity }));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> DeleteActivity(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeleteActivity.Command { Id = id }));
    }

    /// <summary>
    /// Allows an authenticated user to join or leave an activity.
    /// If the current user is the activity host, the underlying UpdateAttendance
    /// command will not remove the host from the activity; instead, it toggles
    /// the activity's cancellation status (IsCancelled).
    /// </summary>
    [HttpPost("{id}/attend")]
    public async Task<ActionResult> Attend(Guid id)
    {
        return HandleResult(await Mediator.Send(new UpdateAttendance.Command {Id = id}));
    }

}
