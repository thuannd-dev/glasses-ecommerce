using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        private IMediator? _mediator;

        //?? is called null-coalescing operator use to check null
        //if the value of variable in the left operator is null RETURN the value of the right operator.

        //??= is called Null-coalescing assignment operator use to assign desire value if the value of the variable is null
        //if the value varibale of the left operator is null, assign the desire value of the right operator to variable
        protected IMediator Mediator => _mediator
            ??= HttpContext.RequestServices.GetService<IMediator>()
            ?? throw new InvalidOperationException("IMediator Service Is Unavailable.");

        protected ActionResult HandleResult<T>(Result<T> result)
        {
            if (!result.IsSuccess && result.Code == 404) return NotFound();

            // if (!result.IsSuccess && result.Code == 400) return BadRequest(result.Error);

            if(result.IsSuccess && result.Value != null) return Ok(result.Value);

            return BadRequest(result.Error);
        }
    }
}
