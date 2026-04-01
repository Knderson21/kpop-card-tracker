namespace KpopCardTracker.Services;

public class ImageService(IWebHostEnvironment env)
{
    private readonly string _imagesPath = Path.Combine(env.WebRootPath, "images");

    public async Task<string> SaveImageAsync(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExts.Contains(ext))
            throw new InvalidOperationException($"File type '{ext}' is not allowed.");

        Directory.CreateDirectory(_imagesPath);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(_imagesPath, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return fileName;
    }

    public void DeleteImage(string fileName)
    {
        var fullPath = Path.Combine(_imagesPath, fileName);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    public async Task<string> SaveImageFromBytesAsync(byte[] bytes, string originalFileName)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExts.Contains(ext))
            throw new InvalidOperationException($"File type '{ext}' is not allowed.");

        Directory.CreateDirectory(_imagesPath);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(_imagesPath, fileName);

        await File.WriteAllBytesAsync(fullPath, bytes);
        return fileName;
    }
}
