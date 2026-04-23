using System;
using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipleExtensions
{
    public static string GetUsername(this ClaimsPrincipal user)
    {
        var username = user.FindFirstValue(ClaimTypes.Name);

        if(username == null)
            throw new Exception("cannot get username from token");
        
        return username;
    }

    public static int GetUserId(this ClaimsPrincipal user)
    {
        // var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier));

        // if(userId == null)
        //     throw new Exception("cannot get username from token");
        
        // return userId;

        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new Exception("Cannot get username from token"));

        return userId;
    }
}
