using System.IO.Compression;
using System.Text.Json;
using KpopCardTracker.Data;
using KpopCardTracker.Models;
using KpopCardTracker.Services;
using Microsoft.EntityFrameworkCore;

namespace KpopCardTracker.Endpoints;

public static class CardEndpoints
{
    public static void MapCardEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/cards").WithTags("Cards");

        // GET /api/cards?search=&tagIds=1,2&page=1&pageSize=24
        group.MapGet("/", async (
            string? search,
            string? tagIds,
            int page,
            int pageSize,
            AppDbContext db) =>
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize == 0 ? 24 : pageSize, 1, 100);

            var query = db.Cards
                .Include(c => c.CardTags)
                    .ThenInclude(ct => ct.Tag)
                        .ThenInclude(t => t.TagType)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(c =>
                    (c.OfficialCardNumber != null && c.OfficialCardNumber.ToLower().Contains(s)) ||
                    (c.Notes != null && c.Notes.ToLower().Contains(s)) ||
                    c.CardTags.Any(ct => ct.Tag.Name.ToLower().Contains(s)));
            }

            if (!string.IsNullOrWhiteSpace(tagIds))
            {
                var ids = tagIds.Split(',')
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : 0)
                    .Where(id => id > 0)
                    .ToList();

                foreach (var tagId in ids)
                    query = query.Where(c => c.CardTags.Any(ct => ct.TagId == tagId));
            }

            var total = await query.CountAsync();
            var cards = await query
                .OrderBy(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CardSummaryDto(
                    c.Id,
                    c.ImageFileName,
                    c.OfficialCardNumber,
                    c.Notes,
                    c.CreatedAt,
                    c.CardTags.Select(ct => new TagDto(ct.Tag.Id, ct.Tag.Name, ct.Tag.TagTypeId, ct.Tag.TagType.Name)).ToList()
                ))
                .ToListAsync();

            return Results.Ok(new { total, page, pageSize, cards });
        });

        // GET /api/cards/{id}
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var card = await db.Cards
                .Include(c => c.CardTags)
                    .ThenInclude(ct => ct.Tag)
                        .ThenInclude(t => t.TagType)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (card is null) return Results.NotFound();

            return Results.Ok(ToDetailDto(card));
        });

        // POST /api/cards (multipart form: image file + metadata fields)
        group.MapPost("/", async (HttpRequest request, AppDbContext db, ImageService imageService) =>
        {
            if (!request.HasFormContentType)
                return Results.BadRequest("Multipart form required.");

            var form = await request.ReadFormAsync();
            var imageFile = form.Files.GetFile("image");
            if (imageFile is null)
                return Results.BadRequest("Image file is required.");

            string imageFileName;
            try { imageFileName = await imageService.SaveImageAsync(imageFile); }
            catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }

            var card = new Card
            {
                ImageFileName = imageFileName,
                OfficialCardNumber = form["officialCardNumber"].FirstOrDefault(),
                Notes = form["notes"].FirstOrDefault()
            };
            db.Cards.Add(card);

            var tagIdsRaw = form["tagIds"].ToString();
            if (!string.IsNullOrWhiteSpace(tagIdsRaw))
            {
                var tagIds = tagIdsRaw.Split(',')
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : 0)
                    .Where(id => id > 0)
                    .Distinct();

                foreach (var tagId in tagIds)
                {
                    if (await db.Tags.AnyAsync(t => t.Id == tagId))
                        db.CardTags.Add(new CardTag { CardId = card.Id, TagId = tagId });
                }
            }

            await db.SaveChangesAsync();

            var saved = await db.Cards
                .Include(c => c.CardTags).ThenInclude(ct => ct.Tag).ThenInclude(t => t.TagType)
                .FirstAsync(c => c.Id == card.Id);

            return Results.Created($"/api/cards/{card.Id}", ToDetailDto(saved));
        });

        // PUT /api/cards/{id}
        group.MapPut("/{id:guid}", async (Guid id, UpdateCardRequest req, AppDbContext db) =>
        {
            var card = await db.Cards
                .Include(c => c.CardTags)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (card is null) return Results.NotFound();

            card.OfficialCardNumber = req.OfficialCardNumber;
            card.Notes = req.Notes;
            card.UpdatedAt = DateTime.UtcNow;

            // Replace tags
            db.CardTags.RemoveRange(card.CardTags);
            if (req.TagIds is { Count: > 0 })
            {
                foreach (var tagId in req.TagIds.Distinct())
                {
                    if (await db.Tags.AnyAsync(t => t.Id == tagId))
                        db.CardTags.Add(new CardTag { CardId = card.Id, TagId = tagId });
                }
            }

            await db.SaveChangesAsync();

            var saved = await db.Cards
                .Include(c => c.CardTags).ThenInclude(ct => ct.Tag).ThenInclude(t => t.TagType)
                .FirstAsync(c => c.Id == id);

            return Results.Ok(ToDetailDto(saved));
        });

        // DELETE /api/cards/{id}
        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, ImageService imageService) =>
        {
            var card = await db.Cards.FindAsync(id);
            if (card is null) return Results.NotFound();

            imageService.DeleteImage(card.ImageFileName);
            db.Cards.Remove(card);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // POST /api/cards/bulk-import (multipart: images zip + manifest json)
        group.MapPost("/bulk-import", async (HttpRequest request, AppDbContext db, ImageService imageService) =>
        {
            if (!request.HasFormContentType)
                return Results.BadRequest("Multipart form required.");

            var form = await request.ReadFormAsync();
            var zipFile = form.Files.GetFile("images");
            var manifestFile = form.Files.GetFile("manifest");

            if (zipFile is null || manifestFile is null)
                return Results.BadRequest("Both 'images' (zip) and 'manifest' (json) files are required.");

            List<BulkImportEntry> entries;
            try
            {
                await using var manifestStream = manifestFile.OpenReadStream();
                entries = await JsonSerializer.DeserializeAsync<List<BulkImportEntry>>(
                    manifestStream,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                ) ?? [];
            }
            catch
            {
                return Results.BadRequest("Invalid manifest JSON.");
            }

            var results = new List<object>();
            await using var zipStream = zipFile.OpenReadStream();
            using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

            foreach (var entry in entries)
            {
                var zipEntry = archive.GetEntry(entry.ImageFileName)
                    ?? archive.Entries.FirstOrDefault(e => e.Name == entry.ImageFileName);

                if (zipEntry is null)
                {
                    results.Add(new { entry.ImageFileName, success = false, error = "File not found in zip." });
                    continue;
                }

                try
                {
                    await using var entryStream = zipEntry.Open();
                    var bytes = new byte[zipEntry.Length];
                    var read = 0;
                    while (read < bytes.Length)
                        read += await entryStream.ReadAsync(bytes.AsMemory(read));

                    var savedFileName = await imageService.SaveImageFromBytesAsync(bytes, entry.ImageFileName);

                    var card = new Card
                    {
                        ImageFileName = savedFileName,
                        OfficialCardNumber = entry.OfficialCardNumber,
                        Notes = entry.Notes
                    };
                    db.Cards.Add(card);

                    foreach (var tagEntry in entry.Tags ?? [])
                    {
                        var tagType = await db.TagTypes.FirstOrDefaultAsync(tt =>
                            tt.Name.ToLower() == tagEntry.TagType.ToLower());

                        if (tagType is null)
                        {
                            tagType = new TagType { Name = tagEntry.TagType, IsBuiltIn = false };
                            db.TagTypes.Add(tagType);
                            await db.SaveChangesAsync();
                        }

                        var tag = await db.Tags.FirstOrDefaultAsync(t =>
                            t.Name.ToLower() == tagEntry.Name.ToLower() && t.TagTypeId == tagType.Id);

                        if (tag is null)
                        {
                            tag = new Tag { Name = tagEntry.Name, TagTypeId = tagType.Id };
                            db.Tags.Add(tag);
                            await db.SaveChangesAsync();
                        }

                        db.CardTags.Add(new CardTag { CardId = card.Id, TagId = tag.Id });
                    }

                    await db.SaveChangesAsync();
                    results.Add(new { entry.ImageFileName, success = true, cardId = card.Id });
                }
                catch (Exception ex)
                {
                    results.Add(new { entry.ImageFileName, success = false, error = ex.Message });
                }
            }

            return Results.Ok(results);
        });
    }

    private static CardDetailDto ToDetailDto(Card card) => new(
        card.Id,
        card.ImageFileName,
        card.OfficialCardNumber,
        card.Notes,
        card.CreatedAt,
        card.UpdatedAt,
        card.CardTags.Select(ct => new TagDto(ct.Tag.Id, ct.Tag.Name, ct.Tag.TagTypeId, ct.Tag.TagType.Name)).ToList()
    );

    private record TagDto(int Id, string Name, int TagTypeId, string TagTypeName);
    private record CardSummaryDto(Guid Id, string ImageFileName, string? OfficialCardNumber, string? Notes, DateTime CreatedAt, List<TagDto> Tags);
    private record CardDetailDto(Guid Id, string ImageFileName, string? OfficialCardNumber, string? Notes, DateTime CreatedAt, DateTime UpdatedAt, List<TagDto> Tags);
    private record UpdateCardRequest(string? OfficialCardNumber, string? Notes, List<int>? TagIds);

    private record BulkImportEntry(string ImageFileName, string? OfficialCardNumber, string? Notes, List<BulkImportTag>? Tags);
    private record BulkImportTag(string TagType, string Name);
}
