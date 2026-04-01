using KpopCardTracker.Data;
using KpopCardTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace KpopCardTracker.Endpoints;

public static class TagEndpoints
{
    public static void MapTagEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tags").WithTags("Tags");

        group.MapGet("/", async (int? tagTypeId, AppDbContext db) =>
        {
            var query = db.Tags.Include(t => t.TagType).AsQueryable();
            if (tagTypeId.HasValue)
                query = query.Where(t => t.TagTypeId == tagTypeId.Value);

            var tags = await query
                .OrderBy(t => t.TagType.Name)
                .ThenBy(t => t.Name)
                .Select(t => new { t.Id, t.Name, t.TagTypeId, TagTypeName = t.TagType.Name })
                .ToListAsync();

            return Results.Ok(tags);
        });

        group.MapPost("/", async (CreateTagRequest req, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.BadRequest("Name is required.");

            var tagTypeExists = await db.TagTypes.AnyAsync(t => t.Id == req.TagTypeId);
            if (!tagTypeExists)
                return Results.BadRequest("Invalid TagTypeId.");

            var exists = await db.Tags.AnyAsync(t => t.Name == req.Name.Trim() && t.TagTypeId == req.TagTypeId);
            if (exists)
                return Results.Conflict("Tag already exists for this tag type.");

            var tag = new Tag { Name = req.Name.Trim(), TagTypeId = req.TagTypeId };
            db.Tags.Add(tag);
            await db.SaveChangesAsync();

            var tagType = await db.TagTypes.FindAsync(req.TagTypeId);
            return Results.Created($"/api/tags/{tag.Id}", new { tag.Id, tag.Name, tag.TagTypeId, TagTypeName = tagType!.Name });
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var tag = await db.Tags.FindAsync(id);
            if (tag is null) return Results.NotFound();

            db.Tags.Remove(tag);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private record CreateTagRequest(string Name, int TagTypeId);
}
