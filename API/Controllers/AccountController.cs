using System;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/account")]
//UserManager have been injected in SignInManager
public class AccountController(SignInManager<User> signInManager) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            DisplayName = registerDto.DisplayName

        };

        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);

        if(result.Succeeded) return Ok();

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(error.Code, error.Description);
        }

        return ValidationProblem();
    }

    //We use this endpoint to test if the user is authenticated or not and get user info
    // And a question will be raise in your mind: why this endpoint is AllowAnonymous?

    //Because if this endpoint is authorized
    //At the first time user come to the application
    //User will get an toast message "Unauthorized" - 401 by middleware
    // because the user is not authenticated yet — they are simply not logged in yet.
    //Although the user has not done anything wrong yet -> bad user experience
    // Using [AllowAnonymous] lets the controller run, so we can manually check
    // if the user is authenticated and return a clean response instead of an error.
    // This avoids showing an unnecessary and confusing error message to the user.
    [AllowAnonymous]
    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        if(User.Identity?.IsAuthenticated == false) return NoContent();
        //passing the authenticated middleware, user has been authenticated - log in
        
        var user = await signInManager.UserManager.GetUserAsync(User);

        if(user == null) return Unauthorized();
        //Passing the authorization middleware
        //user null when user have been deleted, security stamp mismatch, cookie no longer valid, user have been banned, ...
        //So we return Unauthorized instead of returning user info
        return Ok(new
        {
            user.DisplayName,    
            user.Email,
            user.Id,
            user.ImageUrl
        });
    }


    //HTTP standard method for log out is POST because log out is changing server state, resource
    //Just get when don't make side effect on server
    //
    //Beside if you choose GET for log out
    //It will be vulnerable to CSRF attack
    //Ex hacker attach to a link in email or application
    //When user click on the link, user will be log out without their intention
    //For POST method, hacker can't attach <img>, <script>, <iframe>
    // or force user to submit a form from another domain because of CORS policy
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
    }
}