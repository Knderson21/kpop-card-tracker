using KpopCardTracker.Data;
using KpopCardTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace KpopCardTracker.Endpoints;

public static class TagTypeEndpoints
{
    public static void MapTagTypeEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tag-types").WithTags("TagTypes");

        group.MapGet("/", async (AppDbContext db) =>
        {
            var tagTypes = await db.TagTypes
                .OrderBy(t => t.IsBuiltIn ? 0 : 1)
                .ThenBy(t => t.Name)
                .Select(t => new { t.Id, t.Name, t.IsBuiltIn })
                .ToListAsync();
            return Results.Ok(tagTypes);
        });

        group.MapPost("/", async (CreateTagTypeRequest req, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.BadRequest("Name is required.");

            var exists = await db.TagTypes.AnyAsync(t => t.Name == req.Name.Trim());
            if (exists)
                return Results.Conflict("Tag type already exists.");

            var tagType = new TagType { Name = req.Name.Trim(), IsBuiltIn = false };
            db.TagTypes.Add(tagType);
            await db.SaveChangesAsync();
            return Results.Created($"/api/tag-types/{tagType.Id}", new { tagType.Id, tagType.Name, tagType.IsBuiltIn });
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var tagType = await db.TagTypes.FindAsync(id);
            if (tagType is null) return Results.NotFound();
            if (tagType.IsBuiltIn) return Results.BadRequest("Cannot delete built-in tag types.");

            var hasTags = await db.Tags.AnyAsync(t => t.TagTypeId == id);
            if (hasTags) return Results.BadRequest("Cannot delete tag type that has tags assigned to it.");

            db.TagTypes.Remove(tagType);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private record CreateTagTypeRequest(string Name);
}
